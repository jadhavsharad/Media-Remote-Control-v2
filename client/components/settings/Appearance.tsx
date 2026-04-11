import { CgDarkMode } from "react-icons/cg"
import { IoMoon, IoSunny } from "react-icons/io5"
import SectionTitle from "@/components/ui/SectionTitle"
import Card from "@/components/ui/Card"

const Appearance = () => {
  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>
      <Card className="flex-row items-center justify-between font-bold">
        <div className="flex items-center gap-2">
          <CgDarkMode />
          <h1>Theme</h1>
        </div>
        <div className="dark:bg-white/5 bg-zinc-200 flex items-center rounded-full">
          <button className="cursor-pointer dark:bg-sky-800 bg-sky-200 px-2 py-1 rounded-[inherit] text-sky-800 dark:text-sky-200"><IoSunny /></button>
          <button className="cursor-pointer px-2 py-1 rounded-[inherit] text-zinc-500"><IoMoon /></button>
        </div>
      </Card>
    </div>
  )
}

export default Appearance
