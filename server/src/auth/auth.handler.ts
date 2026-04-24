import Socket from "../socket/socket.js";
import constants from "../config/constants.js";
import config from "../config/config.js";
import utils from "../shared/utils.js";
import logger from "../config/logger.js";
import type { Store, SessionData } from "../store/store.js";

const pairCodeRegex = /^[A-Z2-9]{6}$/;
const maxFieldLength = 64;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxFieldLength;
}

async function handleAuth(ws: WebSocket, msg: Record<string, unknown>, store: Store): Promise<boolean> {
  const t = utils.now();
  const meta = Socket.metadata(ws);

  if (msg.type === constants.auth.hostRegister) {
    if (meta.role === constants.role.remote) {
      Socket.terminate(ws);
      logger.fatal("Remote trying to register as host");
      return true;
    }

    const existingHostToken = msg.token as string | undefined;
    const info = msg.platformInfo as { os: string; browser: string; extensionVersion: string };
    if (!info || !isNonEmptyString(info.os) || !isNonEmptyString(info.browser) || !isNonEmptyString(info.extensionVersion)) {
      Socket.terminate(ws);
      logger.debug("Host register missing or invalid platformInfo");
      return true;
    }
    let session: SessionData | undefined;
    let sessionId: string | undefined;
    let hostToken: string | undefined;
    if (existingHostToken) {
      const result = await store.getSessionByHostToken(existingHostToken);
      if (result) {
        sessionId = result.sessionId;
        session = result.session;
        const existingHost = store.getHostSocket(sessionId);
        if (existingHost && existingHost !== ws) {
          Socket.close(existingHost, 4000, "Session superseded");
          logger.debug(`Closed ghost host for ${sessionId}`);
        }
        store.setHost(sessionId, meta.socketId);
        hostToken = existingHostToken;
      }
    }

    if (!session) {
      sessionId = utils.generateUUID();
      hostToken = utils.generateUUID();
      session = { hostOS: info.os, hostBrowser: info.browser, hostExtensionVersion: info.extensionVersion, hostToken, };
      await store.createSession(sessionId, hostToken, session);
      store.setHost(sessionId, meta.socketId);
    }

    Socket.setMeta(ws, { socketId: meta.socketId, lastSeenAt: meta.lastSeenAt, role: constants.role.host, sessionId: sessionId!, hostToken: hostToken!, });

    const sessionRemotes = await store.getSessionRemotes(sessionId!);
    let remotes = []
    for (const [_remoteId, remoteToken] of Object.entries(sessionRemotes)) {
      const remoteIdentity = await store.getRemote(remoteToken);
      if (remoteIdentity && t <= Number(remoteIdentity.expiresAt)) {
        remotes.push(remoteIdentity)
      }
    }

    Socket.send(ws, { type: constants.auth.hostRegistered, sessionId: sessionId, hostToken, remotes: remotes });

    // Notify all remotes that host is back online
    const remoteSockets = store.getAllRemoteSockets(sessionId!);
    for (const remote of remoteSockets) {
      Socket.send(remote, { type: constants.auth.hostReconnected });
    }

    return true;
  }

  if (msg.type === constants.auth.pairingKeyRequest) {
    if (meta.role !== constants.role.host) return true;

    store.deletePairCode(meta.sessionId);
    const code = utils.generatePairCode();
    const pairingKeyExpiry = store.setPairCode(code, meta.sessionId);
    Socket.send(ws, { type: constants.auth.pairingKey, code, pairingKeyExpiry, });
    return true;
  }

  // --- PAIRING EXCHANGE (Remote entering code) ---
  if (msg.type === constants.auth.exchangePairKey) {
    if (meta.role !== null) {
      Socket.send(ws, { type: constants.auth.pairFailed, message: "Already authenticated socket attempting to pair, please refresh page" });
      logger.debug("Already authenticated socket attempting to pair");
      return true;
    }

    const { modelName, platform, browser, code } = msg as { modelName: unknown, platform: unknown, browser: unknown, code: unknown };

    if (!isNonEmptyString(code) || !pairCodeRegex.test(code)) {
      Socket.send(ws, { type: constants.auth.pairFailed, message: "Invalid pair code format, please try again" });
      logger.debug("Invalid pair code format");
      return true;
    }

    if (!isNonEmptyString(modelName) || !isNonEmptyString(platform) || !isNonEmptyString(browser)) {
      Socket.send(ws, { type: constants.auth.pairFailed, message: "Invalid device info fields, please try again" });
      logger.debug("Invalid device info fields");
      return true;
    }

    const sessionId = store.resolvePairCode(code);
    if (!sessionId) {
      Socket.send(ws, { type: constants.auth.pairFailed, message: "Invalid pair code, please try again" });
      logger.debug("Invalid pair code");
      return true;
    }

    const session = await store.getSession(sessionId);
    if (!session) {
      Socket.send(ws, { type: constants.auth.pairFailed, message: "Session not found, please try valid session." });
      logger.debug("Session not found");
      return true;
    }

    const remoteToken = utils.generateUUID();
    const remoteIdentityId = utils.generateUUID();

    const identity = {
      id: remoteIdentityId,
      sessionId,
      modelName,
      platform,
      browser,
      connectedAt: t,
      expiresAt: t + config.tokenTtlMs,
      remoteToken,
    };

    await store.registerRemote(remoteToken, identity);
    await attachRemote(ws, identity, remoteToken, session, store, code);

    Socket.send(ws, {
      type: constants.auth.pairSuccess,
      remoteToken,
      remoteId: remoteIdentityId,
      sessionId,
      hostOnline: !!store.getHostSocket(sessionId),
      hostInfo: { os: session.hostOS, browser: session.hostBrowser, extensionVersion: session.hostExtensionVersion, },
    });

    return true;
  }

  // --- SESSION VALIDATION (Remote reconnecting) ---
  if (msg.type === constants.auth.validateSession) {
    if (meta.role === constants.role.host) {
      logger.debug("Host socket attempting session validation as remote");
      return true;
    }

    const remoteToken = msg.remoteToken;
    if (!isNonEmptyString(remoteToken)) {
      Socket.send(ws, { type: constants.auth.sessionInvalid, message: "Invalid remoteToken, please try again" });
      logger.debug("Invalid remoteToken");
      return true;
    }

    if (!isNonEmptyString(msg.modelName as unknown) || !isNonEmptyString(msg.platform as unknown) || !isNonEmptyString(msg.browser as unknown)) {
      Socket.send(ws, { type: constants.auth.sessionInvalid, message: "Invalid device info in session validation, please try again" });
      logger.debug("Invalid device info in session validation");
      return true;
    }

    const identity = await store.getRemote(remoteToken);
    if (!identity || t > Number(identity.expiresAt) || (msg.modelName !== identity.modelName || msg.platform !== identity.platform || msg.browser !== identity.browser)) {
      Socket.send(ws, { type: constants.auth.sessionInvalid, message: "Session invalid, please try again" });
      logger.debug("Session invalid");
      return true;
    }

    const session = await store.getSession(identity.sessionId);
    if (!session) {
      Socket.send(ws, { type: constants.auth.sessionInvalid, message: "Session invalid, please try again" });
      logger.debug("Session invalid — session not found");
      return true;
    }

    await attachRemote(ws, identity, remoteToken, session, store);

    Socket.send(ws, {
      type: constants.auth.sessionValid,
      sessionId: identity.sessionId,
      hostOnline: !!store.getHostSocket(identity.sessionId),
      hostInfo: {
        os: session.hostOS,
        browser: session.hostBrowser,
        extensionVersion: session.hostExtensionVersion,
      },
    });
    return true;
  }

  if (msg.type === constants.auth.kickRemote) {
    if (meta.role !== constants.role.host) {
      logger.debug("Non-host attempting to kick remote");
      return true;
    }

    const remoteId = msg.remoteId;
    if (!isNonEmptyString(remoteId)) {
      logger.debug("Invalid remoteId in kick request");
      return true;
    }

    const sessionId = meta.sessionId;

    // Inform the remote client before disconnecting
    const remoteWs = store.getRemoteSocket(sessionId, remoteId);
    if (remoteWs) {
      Socket.send(remoteWs, { type: constants.auth.remoteKicked, message: "You have been kicked by the host" });
      Socket.close(remoteWs, 4000, "Kicked by host");
    }

    await store.deleteRemote(sessionId, remoteId);
    logger.debug(`Remote kicked: ${remoteId} from session ${sessionId}`);
    return true;
  }

  return false;
}

async function attachRemote(ws: WebSocket, identity: { id: string; sessionId: string; modelName: string; connectedAt: number, platform: string, browser: string }, remoteToken: string, _session: SessionData, store: Store, code?: string): Promise<void> {
  const meta = Socket.metadata(ws);
  const sessionId = identity.sessionId;

  const existingWs = store.getRemoteSocket(sessionId, identity.id);
  if (existingWs && existingWs !== ws) {
    Socket.close(existingWs, 4000, "Session superseded");
    logger.debug(`Closed ghost remote for ${sessionId}`);
  }

  Socket.setMeta(ws, {
    socketId: meta.socketId,
    lastSeenAt: meta.lastSeenAt,
    role: constants.role.remote,
    sessionId,
    remoteIdentityId: identity.id,
    remoteToken,
  });

  await store.addRemoteToSession(sessionId, identity.id, remoteToken, meta.socketId);

  const hostWs = store.getHostSocket(sessionId);
  if (hostWs) {
    Socket.send(hostWs, { type: constants.auth.remoteJoined, invalidateCode: !!code, ...identity });
    logger.debug(`Remote joined: ${sessionId}`);
  }
}

export { handleAuth };
