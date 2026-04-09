import { Redis } from "@upstash/redis";
import config from "../config/config";

// --- Types ---

export interface SessionData {
  hostOS: string | null;
  hostBrowser: string | null;
  hostExtensionVersion: string | null;
  hostToken: string;
}

export interface RemoteIdentity {
  id: string;
  sessionId: string;
  expiresAt: number;
  revoked: boolean;
  remoteToken: string;
}

// --- Internal types ---

interface PairCodeEntry {
  sessionId: string;
  timer: ReturnType<typeof setTimeout>;
}

interface RouteEntry {
  hostSocketId: string | null;
  remotes: Map<string, string>;
}

// --- Redis keys ---

const KEYS = {
  session: (id: string) => `session:${id}`,
  hostToken: (token: string) => `hosttoken:${token}`,
  remote: (token: string) => `remote:${token}`,
  sessionRemotes: (id: string) => `session:${id}:remotes`,
};

// --- Store ---

function createStore(redis: Redis) {
  const sockets = new Map<string, WebSocket>(); // Socket ID -> WebSocket
  const pairCodes = new Map<string, PairCodeEntry>(); // Pair Code -> { sessionId, timer }
  const sessionToPairCode = new Map<string, string>(); // Session ID -> Pair Code
  const routes = new Map<string, RouteEntry>(); // Session ID -> { hostSocketId, remotes }
  const ttl = Math.ceil(config.tokenTtlMs / 1000);

  function ensureRoute(sessionId: string): RouteEntry {
    let route = routes.get(sessionId);
    if (!route) {
      route = { hostSocketId: null, remotes: new Map() };
      routes.set(sessionId, route);
    }
    return route;
  }

  return Object.freeze({
    registerSocket(id: string, ws: WebSocket) { sockets.set(id, ws); },
    getSocket(id: string) { return sockets.get(id); },
    removeSocket(id: string) { sockets.delete(id); },

    setPairCode(code: string, sessionId: string): number {
      const existing = sessionToPairCode.get(sessionId);

      if (existing) {
        const entry = pairCodes.get(existing);
        if (entry) clearTimeout(entry.timer);
        pairCodes.delete(existing);
      }
      sessionToPairCode.delete(sessionId);

      const timer = setTimeout(() => {
        pairCodes.delete(code);
        sessionToPairCode.delete(sessionId);
      }, config.pairCodeTtlMs);

      pairCodes.set(code, { sessionId, timer });
      sessionToPairCode.set(sessionId, code);
      return Date.now() + config.pairCodeTtlMs;
    },

    resolvePairCode(code: string): string | null {
      const entry = pairCodes.get(code);
      if (!entry) return null;
      clearTimeout(entry.timer);
      pairCodes.delete(code);
      sessionToPairCode.delete(entry.sessionId);
      return entry.sessionId;
    },

    deletePairCode(sessionId: string): void {
      const code = sessionToPairCode.get(sessionId);
      if (!code) return;
      const entry = pairCodes.get(code);
      if (entry) clearTimeout(entry.timer);
      pairCodes.delete(code);
      sessionToPairCode.delete(sessionId);
    },

    setHost(sessionId: string, socketId: string) {
      ensureRoute(sessionId).hostSocketId = socketId;
    },

    clearHost(sessionId: string) {
      const route = routes.get(sessionId);
      if (route) route.hostSocketId = null;
    },

    getHostSocket(sessionId: string): WebSocket | null {
      const route = routes.get(sessionId);
      if (!route || !route.hostSocketId) return null;
      return sockets.get(route.hostSocketId) ?? null;
    },

    addRemote(sessionId: string, remoteId: string, socketId: string) {
      ensureRoute(sessionId).remotes.set(remoteId, socketId);
    },

    removeRemote(sessionId: string, remoteId: string) {
      const route = routes.get(sessionId);
      if (route) route.remotes.delete(remoteId);
    },

    getRemoteSocket(sessionId: string, remoteId: string): WebSocket | null {
      const route = routes.get(sessionId);
      if (!route) return null;
      const socketId = route.remotes.get(remoteId);
      if (!socketId) return null;
      return sockets.get(socketId) ?? null;
    },

    isHostValid(sessionId: string, socketId: string): boolean {
      const route = routes.get(sessionId);
      return route ? route.hostSocketId === socketId : false;
    },

    isRemoteValid(sessionId: string, remoteId: string, socketId: string): boolean {
      const route = routes.get(sessionId);
      return route ? route.remotes.get(remoteId) === socketId : false;
    },

    async createSession(id: string, hostToken: string, data: SessionData): Promise<void> {
      await Promise.all([
        redis.hset(KEYS.session(id), { ...data }),
        redis.expire(KEYS.session(id), ttl),
        redis.set(KEYS.hostToken(hostToken), id, { ex: ttl }),
      ]);
    },

    async getSession(sessionId: string): Promise<SessionData | null> {
      const session = await redis.hgetall(KEYS.session(sessionId));
      if (!session || Object.keys(session).length === 0) return null;
      return session as unknown as SessionData;
    },

    async getSessionByHostToken(token: string): Promise<{ sessionId: string; session: SessionData } | null> {
      const sessionId = await redis.get<string>(KEYS.hostToken(token));
      if (!sessionId) return null;
      const session = await redis.hgetall(KEYS.session(sessionId));
      if (!session || Object.keys(session).length === 0) return null;
      return { sessionId, session: session as unknown as SessionData };
    },

    async updateSession(sessionId: string, fields: Partial<SessionData>): Promise<void> {
      await redis.hset(KEYS.session(sessionId), { ...fields });
    },
    async registerRemote(remoteToken: string, identity: RemoteIdentity): Promise<void> {
      await Promise.all([
        redis.hset(KEYS.remote(remoteToken), { ...identity }),
        redis.expire(KEYS.remote(remoteToken), ttl),
      ]);
    },

    async getRemote(remoteToken: string): Promise<RemoteIdentity | null> {
      const identity = await redis.hgetall(KEYS.remote(remoteToken));
      if (!identity || Object.keys(identity).length === 0) return null;
      return identity as unknown as RemoteIdentity;
    },

    async updateRemote(remoteToken: string, fields: Partial<RemoteIdentity>): Promise<void> {
      await redis.hset(KEYS.remote(remoteToken), { ...fields });
    },
    async addRemoteToSession(sessionId: string, remoteId: string, remoteToken: string, socketId: string): Promise<void> {
      ensureRoute(sessionId).remotes.set(remoteId, socketId);
      await redis.hset(KEYS.sessionRemotes(sessionId), { [remoteId]: remoteToken });
    },

    async removeRemoteFromSession(sessionId: string, remoteId: string): Promise<void> {
      const route = routes.get(sessionId);
      if (route) route.remotes.delete(remoteId);
      await redis.hdel(KEYS.sessionRemotes(sessionId), remoteId);
    },
  });
}

export type Store = ReturnType<typeof createStore>;
export default createStore;
