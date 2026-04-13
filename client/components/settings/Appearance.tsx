import SectionTitle from "@/components/ui/SectionTitle"
import Card from "@/components/ui/Card"
import { Icons } from "@/lib/icons"

const Appearance = () => {
  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>
      <Card className="flex-row items-center justify-between font-bold">
        <div className="flex items-center gap-2">  <Icons.theme />  <h1>Theme</h1></div>
        <div className="dark:bg-white/5 bg-zinc-200 flex items-center rounded-full">
          <button className="cursor-pointer dark:bg-sky-800 bg-sky-200 px-2 py-1 rounded-[inherit] text-sky-800 dark:text-sky-200"><Icons.light /></button>
          <button className="cursor-pointer px-2 py-1 rounded-[inherit] text-zinc-500"><Icons.dark /></button>
        </div>
      </Card>
    </div>
  )
}

export default Appearance
