import constants from "../config/constants";
import config from "../config/config";
import Socket from "../socket/socket";
import type { SocketMeta } from "../socket/socket";
import type { Store } from "../store/store";


function collectTypes(obj: Record<string, unknown>): string[] {
  const types: string[] = [];
  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      types.push(value);
    } else if (typeof value === "object" && value !== null) {
      types.push(...collectTypes(value as Record<string, unknown>));
    }
  }
  return types;
}

const ALL_VALID_TYPES = Object.freeze(collectTypes(constants));

const validator = Object.freeze({
  isValidMessage(msg: unknown): msg is { type: string; [key: string]: unknown } {
    if (!msg || typeof msg !== "object") return false;
    const m = msg as Record<string, unknown>;
    if (typeof m.type !== "string") return false;
    return ALL_VALID_TYPES.includes(m.type);
  },

  isRateLimited(metadata: SocketMeta): boolean {
    const t = Date.now();
    if (t - (metadata.lastSeenAt || 0) < config.rateLimit) return true;
    metadata.lastSeenAt = t;
    return false;
  },


  isSessionValid(ws: WebSocket, meta: SocketMeta, store: Store): boolean {
    if (meta.role === constants.role.host) {
      if (!store.isHostValid(meta.sessionId, meta.socketId)) {
        Socket.close(ws, 4000, "Session desync");
        return false;
      }
    }

    if (meta.role === constants.role.remote) {
      if (!store.isRemoteValid(meta.sessionId, meta.remoteIdentityId, meta.socketId)) {
        Socket.close(ws, 4000, "Session desync");
        return false;
      }
    }

    return true;
  },
});

export default validator;
