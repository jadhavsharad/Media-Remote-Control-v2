import logger from "@/config/logger";

export const debouncedScheduler = (fn: () => void | any, delay = 300) => {
  let timer: NodeJS.Timeout | null = null;
  return () => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn().catch((e: any) => logger.warn("Scheduled task failed", e));
    }, delay);
  };
}
