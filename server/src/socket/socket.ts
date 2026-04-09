import logger from "../config/logger";
import utils from "../shared/utils";

interface Base {
  socketId: string;
  lastSeenAt: number;
}

interface Unauthenticated extends Base {
  role: null;
  sessionId: null;
}

interface Host extends Base {
  role: "HOST";
  sessionId: string;
  hostToken: string;
}

interface Remote extends Base {
  role: "REMOTE";
  sessionId: string;
  remoteIdentityId: string;
  remoteToken: string;
}

export type SocketMeta = Unauthenticated | Host | Remote;


const socketMetadata = new WeakMap<WebSocket, SocketMeta>();


const Socket = Object.freeze({

  metadata(ws: WebSocket): SocketMeta {
    const data = socketMetadata.get(ws);
    if (!data) {
      throw new Error("[Socket.meta] Socket has no metadata — was connection.attach() called?");
    }
    return data;
  },

  initMetadata(ws: WebSocket, initial: Unauthenticated): void {
    socketMetadata.set(ws, initial);
  },

  setMeta(ws: WebSocket, updated: SocketMeta): void {
    socketMetadata.set(ws, updated);
  },

  send(ws: WebSocket, payload: object): void {
    try {
      ws.send(JSON.stringify({ ...payload, timestamp: utils.now() }));
    } catch (error) {
      logger.error({ error }, "Failed to send message");
    }
  },

  close(ws: WebSocket, code: number, reason?: string): void {
    try {
      ws.close(code, reason);
    } catch {
      // Already closed
    }
  },

  terminate(ws: WebSocket): void {
    try {
      ws.close();
    } catch {
      // Already closed
    }
  },
});

export default Socket;
