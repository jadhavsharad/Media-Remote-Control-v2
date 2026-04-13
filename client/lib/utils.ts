import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (s: number): string => {
    if (!isFinite(s) || s < 0) return "0:00"
    const h = Math.floor(s / 3600)
    const m = Math.floor(s % 3600 / 60).toString().padStart(h > 0 ? 2 : 1, "0")
    const sec = Math.floor(s % 60).toString().padStart(2, "0")
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`
}