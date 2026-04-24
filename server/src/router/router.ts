import logger from "../config/logger.js";
import constants from "../config/constants.js";
import validator from "../validators/validator.js";
import Socket, { SocketMeta } from "../socket/socket.js";
import { handleAuth } from "../auth/auth.handler.js";
import type { Store } from "../store/store.js";

const router = Object.freeze({
  handle: async (ws: WebSocket, message: string, store: Store) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(message);
    } catch {
      logger.debug("Invalid JSON");
      return;
    }

    if (!validator.isValidMessage(msg)) {
      logger.debug("Invalid message type");
      return;
    }

    if (await handleAuth(ws, msg, store)) return;

    const meta = Socket.metadata(ws);
    if (validator.isRateLimited(meta)) {
      logger.debug(`Rate limiting for socket`);
      return;
    }

    if (!validator.isSessionValid(ws, meta, store)) {
      logger.debug("Session integrity check failed");
      return;
    }

    routeMessage(msg, meta, store);
  },
});

function routeMessage(msg: Record<string, unknown>, meta: SocketMeta, store: Store,): void {
  if (meta.role === constants.role.remote) {
    const host = store.getHostSocket(meta.sessionId);
    if (host) Socket.send(host, { ...msg, remoteId: meta.remoteIdentityId });
    return;
  }

  if (meta.role === constants.role.host) {
    const remoteId = msg.remoteId as string | undefined;
    if (remoteId) {
      const remote = store.getRemoteSocket(meta.sessionId, remoteId);
      if (remote) Socket.send(remote, msg);
    } else {
      const remotes = store.getAllRemoteSockets(meta.sessionId);
      for (const remote of remotes) Socket.send(remote, msg);
    }
  }
}

export default router;