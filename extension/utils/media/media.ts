import { CHANNELS, MEDIA_STATE, MESSAGE_TYPES } from "@/config/constants";
import { isValidMedia } from "@/utils/validators/validators";
import logger from "@/config/logger";
import { sendMessage } from "../messaging/message";

const state = {
  currentMedia: null as HTMLMediaElement | null, // CHECK
  discovering: false as boolean, // CHECK
  observer: null as MutationObserver | null, // CHECK
  mediaContainer: null as HTMLElement | null,
  interval: null as ReturnType<typeof setInterval> | null, // CHECK
  debounce: null as ReturnType<typeof setTimeout> | null,
  lastReport: 0 as number
}

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

// MEDIA UTILITY — FIND, OBSERVE AND EXECUTE COMMANDS
export const Media = {
  init(): void {
    if (state.discovering) return;
    state.discovering = true;
    state.observer = new MutationObserver(utils.debounced);
    Media.observer(document.body);
    state.interval = setInterval(Media.find, 10000);
  },

  find(): boolean | null {
    const elements = Array
      .from(document.querySelectorAll<HTMLMediaElement>("video, audio"))
      .filter(isValidMedia);

    if (!elements.length) {
      listeners.detach();
      state.observer?.disconnect()
      state.mediaContainer = null;
      Media.observer(document.body);
      return null;
    };

    const media = elements.find(el => !el.paused && el.currentTime > 0) || elements[0];
    listeners.attach(media);

    const container = media.closest('div') || media.parentElement;

    if (container && state.mediaContainer !== container) {
      logger.debug("New media container found");
      state.observer?.disconnect()
      state.mediaContainer = container;
      Media.observer(container);
      logger.debug("Media container updated");
    }
    return true
  },
  observer: (container: HTMLElement): void => {
    state.observer?.observe(container, {
      childList: true,
      subtree: true,
    });
  },
  execute(key: string, value: unknown): { ok: boolean; reason: string } {
    if (!state.currentMedia?.isConnected) {
      logger.debug("No media element found on page");
      return { ok: false, reason: "No media found" };
    }

    const handler = handlers[key];

    if (!handler) {
      logger.debug("Unknown command key:", key);
      return { ok: false, reason: `Unknown key: ${key}` };
    }

    try {
      handler(state.currentMedia, value);
      return { ok: true, reason: "Command executed successfully" };
    } catch (error: any) {
      logger.debug("Command execution failed:", error);
      return { ok: false, reason: error?.reason ?? "Execution failed" };
    }
  },
  destroy(): void {
    // 1. Detach event listeners from media
    listeners.detach();
    // 2. Kill the observer
    state.observer?.disconnect();
    state.observer = null;
    // 3. Kill all async timers
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    if (state.debounce) clearTimeout(state.debounce);
    state.debounce = null;
    // 4. Reset flags and pointers
    state.discovering = false;
    state.mediaContainer = null;
  }
};

const utils = {
  debounced: () => {
    if (state.debounce) clearTimeout(state.debounce);
    state.debounce = setTimeout(() => {
      state.debounce = null;
      Media.find();
    }, 1500);
  },

  metadata: () => {
    return {
      playback: navigator.mediaSession.playbackState,
      info: {
        mediaTitle: navigator.mediaSession.metadata?.title || 'Unknown',
        mediaArtist: navigator.mediaSession.metadata?.artist || 'Unknown',
        mediaAlbum: navigator.mediaSession.metadata?.album || 'Unknown',
        mediaArtwork: navigator.mediaSession.metadata?.artwork?.[navigator.mediaSession.metadata?.artwork.length - 1].src || 'Unknown',
      }
    }
  }

}

const listeners = {
  attach: (media: HTMLMediaElement) => {
    if (state.currentMedia === media) return;
    listeners.detach()
    state.currentMedia = media;
    media.addEventListener("play", event.playback)
    media.addEventListener("pause", event.playback)
    media.addEventListener("volumechange", event.volumechange)
    media.addEventListener("ended", event.ended)
    media.addEventListener("timeupdate", event.timeupdate)
    media.addEventListener("durationchange", event.durationchange)
    media.addEventListener("seeking", event.seeking)

    report.All()
  },

  detach: () => {
    if (!state.currentMedia) return;
    state.currentMedia?.removeEventListener("play", event.playback)
    state.currentMedia?.removeEventListener("pause", event.playback)
    state.currentMedia?.removeEventListener("volumechange", event.volumechange)
    state.currentMedia?.removeEventListener("ended", event.ended)
    state.currentMedia?.removeEventListener("timeupdate", event.timeupdate)
    state.currentMedia?.removeEventListener("durationchange", event.durationchange)
    state.currentMedia.removeEventListener("seeking", event.seeking)
    state.currentMedia = null;
    report.Once(MEDIA_STATE.PLAYBACK, "IDLE");
  },
}

const report = {
  Once: (key: string, value: unknown) => {
    sendMessage({
      channel: CHANNELS.FROM_CONTENT_SCRIPT,
      payload: {
        type: MESSAGE_TYPES.STATE_UPDATE,
        intent: MESSAGE_TYPES.INTENT.REPORT,
        key,
        value,
        ...utils.metadata().info
      }
    })
  },
  All: () => {
    if (!state.currentMedia) return;
    event.playback()
    event.volumechange()
    event.ended()
    event.timeupdate()
    event.durationchange()
  }
}

const event = {
  playback() {
    report.Once(MEDIA_STATE.PLAYBACK, state.currentMedia?.paused ? "PAUSED" : "PLAYING")
    event.ended();
  },
  volumechange() {
    report.Once(MEDIA_STATE.VOLUME, state.currentMedia?.volume)
  },
  timeupdate() {
    const time = state.currentMedia?.currentTime
    if (!isFinite(time!) || time! < 0) return
    const now = Date.now()
    if (now - state.lastReport < 2000) return
    state.lastReport = now
    report.Once(MEDIA_STATE.TIME, state.currentMedia?.currentTime)
  },
  durationchange() {
    const duration = state.currentMedia?.duration
    if (!duration || !isFinite(duration) || duration <= 0) return
    report.Once(MEDIA_STATE.DURATION, state.currentMedia?.duration)
  },
  ended() {
    report.Once(MEDIA_STATE.ENDED, state.currentMedia?.ended)
  },
  seeking() {
    state.lastReport = 0
    const time = state.currentMedia?.currentTime
    if (time !== undefined && Number.isFinite(time) && time >= 0) {
      report.Once(MEDIA_STATE.TIME, time);
    }
  }
}
