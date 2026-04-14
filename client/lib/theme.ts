import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({ theme: 'system', setTheme: (theme) => set({ theme }), }),
    { name: 'theme', storage: createJSONStorage(() => localStorage) }
  )
)

/** Applies the resolved theme class to the document root */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)
}
