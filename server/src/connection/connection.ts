import Socket from "../socket/socket.js";
import constants from "../config/constants.js";
import utils from "../shared/utils.js";
import logger from "../config/logger.js";
import type { Store } from "../store/store.js";

function ConnectionManager(store: Store) {
  return Object.freeze({
    attach(ws: WebSocket): void {
      const socketId = utils.generateUUID();
      Socket.initMetadata(ws, { socketId, role: null, lastSeenAt: Date.now(), sessionId: null, });
      store.registerSocket(socketId, ws);
    },

    async onClose(ws: WebSocket): Promise<void> {
      const meta = Socket.metadata(ws);
      store.removeSocket(meta.socketId);

      if (meta.role === "HOST") {
        if (store.isHostValid(meta.sessionId, meta.socketId)) {
          store.clearHost(meta.sessionId);
          const remotes = store.getAllRemoteSockets(meta.sessionId);
          for (const remote of remotes) {
            Socket.send(remote, { type: constants.auth.hostDisconnected });
          }
        }
        logger.debug(`Host disconnected from session ${meta.sessionId}`);
      }

      if (meta.role === "REMOTE") {
        await store.removeRemoteFromSession(meta.sessionId, meta.remoteIdentityId);
        logger.debug(`Remote disconnected from session ${meta.sessionId}`);
      }
    },
  });
}

export type ConnectionManager = ReturnType<typeof ConnectionManager>;
export default ConnectionManager;
