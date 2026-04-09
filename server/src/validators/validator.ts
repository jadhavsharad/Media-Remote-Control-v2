import constants from "../config/constants";
import config from "../config/config";
import type { SocketMeta } from "../socket/socket";


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
});

export default validator;
