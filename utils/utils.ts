import logger from "@/config/logger";

const DELAY_MS: number = 200;
/**
 * Debounce with automatic per-key support.
 * - No args: single shared timer (e.g. Notify.all)
 * - With args: first arg used as debounce key (e.g. Notify.tab(tabId))
 */
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
