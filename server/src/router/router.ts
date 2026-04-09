import logger from "../config/logger";
import validator from "../validators/validator";
import Socket from "../socket/socket";
import { handleAuth } from "../auth/auth.handler";
import type { Store } from "../store/store";

const router = Object.freeze({
  handle: async (ws: WebSocket, message: string, store: Store) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(message);
    } catch {
      logger.error("Invalid JSON");
      return;
    }

    if (!validator.isValidMessage(msg)) {
      logger.error("Invalid message type");
      return;
    }

    if (await handleAuth(ws, msg, store)) return;

    const meta = Socket.metadata(ws);
    if (validator.isRateLimited(meta)) {
      logger.warn(`Rate limiting for socket ${meta.socketId}`);
      return;
    };

    // TODO: session integrity check
    // TODO: message routing
  },
});

export default router;