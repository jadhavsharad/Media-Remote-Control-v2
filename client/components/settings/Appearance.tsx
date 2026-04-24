"use client"
import SectionTitle from "@/components/ui/SectionTitle"
import Card from "@/components/ui/Card"
import { Icons } from "@/lib/icons"
import { useThemeStore, type Theme } from "@/lib/theme"

const themes: { value: Theme, icon: React.ReactNode }[] = [
  { value: "light", icon: <Icons.light /> },
  { value: "dark", icon: <Icons.dark /> },
  { value: "system", icon: <Icons.theme /> },
]

const Appearance = () => {
  const { theme, setTheme } = useThemeStore()
  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>
      <Card className="flex-row items-center justify-between font-bold">
        <div className="flex items-center gap-2">  <Icons.theme />  <h1>Theme</h1></div>
        <div className="dark:bg-white/5 bg-zinc-200 flex items-center rounded-full">
          {themes.map((t) => (
            <button title={t.value} aria-label={t.value} key={t.value} onClick={() => setTheme(t.value)} className={`cursor-pointer px-2 py-1 rounded-[inherit] capitalize text-xs font-semibold flex items-center gap-1 duration-200 ${theme === t.value ? "dark:bg-sky-800 bg-sky-200 text-sky-800 dark:text-sky-200" : "text-zinc-500"}`}>
              {t.icon}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Appearance
