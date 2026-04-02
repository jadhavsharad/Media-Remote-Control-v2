import { MEDIA_STATE } from "@/config/constants";
import { isValidMedia } from "@/utils/validators/validators";
import logger from "@/config/logger";

// COMMAND HANDLERS — KEYED BY MEDIA_STATE
const handlers: Record<string, (media: HTMLMediaElement, value: any) => void> = {

  [MEDIA_STATE.PLAYBACK]: (media, value) => {
    if (value === "PLAYING") {
      media.play().catch(() => {
        throw { ok: false, reason: "Play blocked by browser autoplay policy" };
      });
    } else {
      media.pause();
    }
  },

  [MEDIA_STATE.VOLUME]: (media, value) => {
    const vol = Math.max(0, Math.min(1, Number(value) / 100));
    media.volume = vol;
  },

  [MEDIA_STATE.TIME]: (media, value) => {
    const raw = String(value);
    const isRelative = raw.startsWith("+") || raw.startsWith("-");

    if (isRelative) {
      const offset = Number(raw);
      if (Number.isNaN(offset)) throw { ok: false, reason: "Invalid time offset" };
      media.currentTime = Math.max(0, Math.min(media.duration || 0, media.currentTime + offset));
    } else {
      const absolute = Number(raw);
      if (Number.isNaN(absolute) || absolute < 0) throw { ok: false, reason: "Invalid time value" };
      media.currentTime = Math.min(absolute, media.duration || absolute);
    }
  },
};

// MEDIA UTILITY — FIND ELEMENTS AND EXECUTE COMMANDS
export const Media = {

  // FIND THE BEST MEDIA ELEMENT ON THE PAGE (returns null if none found)
  find(): HTMLMediaElement | null {
    const elements = Array
      .from(document.querySelectorAll<HTMLMediaElement>("video, audio"))
      .filter(isValidMedia);

    if (!elements.length) return null;

    // PRIORITY: currently playing (with progress) > first valid element
    return elements.find(el => !el.paused && el.currentTime > 0) || elements[0];
  },

  // EXECUTE A COMMAND ON THE BEST AVAILABLE MEDIA
  execute(key: string, value: unknown): { ok: boolean; reason: string } {
    const media = Media.find();
    if (!media) {
      logger.debug("No media element found on page");
      return { ok: false, reason: "No media found" };
    }

    const handler = handlers[key];
    if (!handler) {
      logger.debug("Unknown command key:", key);
      return { ok: false, reason: `Unknown key: ${key}` };
    }

    try {
      handler(media, value);
      return { ok: true, reason: "Command executed successfully" };
    } catch (error: any) {
      logger.debug("Command execution failed:", error);
      return { ok: false, reason: error?.reason ?? "Execution failed" };
    }
  },
};
