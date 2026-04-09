import Socket from "../socket/socket";
import constants from "../config/constants";
import config from "../config/config";
import utils from "../shared/utils";
import logger from "../config/logger";
import type { Store, SessionData } from "../store/store";

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
          logger.warn(`Closed ghost host for ${sessionId}`);
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
    logger.debug(`Host registered: ${hostToken}`);
    Socket.send(ws, { type: constants.auth.hostRegistered, sessionId: sessionId, hostToken, });
    return true;
  }

  if (msg.type === constants.auth.pairingKeyRequest) {
    if (meta.role !== constants.role.host) return true;

    store.deletePairCode(meta.sessionId);
    const code = utils.generatePairCode();
    const pairingKeyExpiry = store.setPairCode(code, meta.sessionId);
    logger.debug(`Pairing key generated: ${code}`);
    Socket.send(ws, { type: constants.auth.pairingKey, code, pairingKeyExpiry, });
    return true;
  }

  // TODO: REVIEW FROM HERE
  // --- PAIRING EXCHANGE (Remote entering code) ---
  if (msg.type === constants.auth.exchangePairKey) {
    const code = msg.code as string;

    const sessionId = store.resolvePairCode(code);
    if (!sessionId) {
      Socket.send(ws, { type: constants.auth.pairFailed });
      return true;
    }

    const session = await store.getSession(sessionId);
    if (!session) {
      Socket.send(ws, { type: constants.auth.pairFailed });
      return true;
    }

    const remoteToken = utils.generateUUID();
    const remoteIdentityId = utils.generateUUID();

    const identity = {
      id: remoteIdentityId,
      sessionId,
      expiresAt: t + config.tokenTtlMs,
      revoked: false,
      remoteToken,
    };

    await store.registerRemote(remoteToken, identity);
    await attachRemote(ws, identity, remoteToken, sessionId, session, store, code);

    Socket.send(ws, {
      type: constants.auth.pairSuccess,
      remoteToken,
      sessionId,
      hostInfo: { os: session.hostOS, browser: session.hostBrowser, extensionVersion: session.hostExtensionVersion, },
    });
    logger.debug(`Remote paired: ${sessionId}`);
    return true;
  }

  // --- SESSION VALIDATION (Remote reconnecting) ---
  if (msg.type === constants.auth.validateSession) {
    const remoteToken = msg.remoteToken as string;

    const identity = await store.getRemote(remoteToken);

    if (!identity || identity.revoked || t > identity.expiresAt) {
      Socket.send(ws, { type: constants.auth.sessionInvalid });
      logger.warn("Session invalid");
      return true;
    }

    const session = await store.getSession(identity.sessionId);
    if (!session) {
      Socket.send(ws, { type: constants.auth.sessionInvalid });
      logger.warn("Session invalid — session not found");
      return true;
    }

    await attachRemote(ws, identity, remoteToken, identity.sessionId, session, store);

    Socket.send(ws, {
      type: constants.auth.sessionValid,
      sessionId: identity.sessionId,
      hostInfo: {
        os: session.hostOS,
        browser: session.hostBrowser,
        extensionVersion: session.hostExtensionVersion,
      },
    });
    logger.debug(`Session validated: ${identity.sessionId}`);
    return true;
  }

  return false;
}

async function attachRemote(ws: WebSocket, identity: { id: string; sessionId: string }, remoteToken: string, sessionId: string, _session: SessionData, store: Store, code?: string): Promise<void> {
  const meta = Socket.metadata(ws);

  const existingWs = store.getRemoteSocket(sessionId, identity.id);
  if (existingWs && existingWs !== ws) {
    Socket.close(existingWs, 4000, "Session superseded");
    logger.warn(`Closed ghost remote for ${sessionId}`);
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
    Socket.send(hostWs, { type: constants.auth.remoteJoined, remoteId: identity.id, code, });
    logger.debug(`Remote joined: ${sessionId}`);
  }
}

export { handleAuth };
