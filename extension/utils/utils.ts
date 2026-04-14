import logger from "@/config/logger";

const DELAY_MS: number = 200;

export const debounced = <T extends (...args: any[]) => any>(fn: T, delay: number = DELAY_MS) => {
  const timers = new Map<string, NodeJS.Timeout>();
  return (...args: Parameters<T>): void => {
    const key = args.length > 0 ? String(args[0]) : '__default__';
    const existing = timers.get(key);
    if (existing) clearTimeout(existing);
    timers.set(key, setTimeout(async () => {
      timers.delete(key);
      try { await fn(...args); }
      catch (e) { logger.warn("Scheduled task failed", e); }
    }, delay));
  };
}
export const maxResImage = (src: string, fallback?: string) => {
  if (!src) return src

  try {
    const url = new URL(src)
    const hostname = url.hostname

    if (hostname.includes("youtube.com")) {
      if (hostname.includes("youtu.be")) {
        const videoId = url.pathname.slice(1)
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
      if (hostname.includes("youtube.com") && url.pathname.startsWith("/embed/")) {
        const videoId = url.pathname.split("/embed/")[1]?.split("/")[0]
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
      const videoId = url.searchParams.get("v")
      if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
  } catch {

  }

  return fallback
}