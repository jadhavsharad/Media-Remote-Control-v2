import { cn } from "@/lib/utils"

interface SliderBarProps {
  label: string
  progress?: number
  trackClass?: string
}

const SliderBar = ({ label, progress = 0, trackClass }: SliderBarProps) => {
  return (
    <div className={cn("w-full relative h-1.5 rounded-full bg-zinc-200 dark:bg-white/5", trackClass)}>
      <div aria-label={label} title={label} className="h-full absolute bg-sky-600 dark:bg-sky-500 rounded-full" style={{ width: `${progress}%` }}>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-sky-600 dark:bg-sky-400 shadow-sm" />
      </div>
    </div>
  )
}

export default SliderBar
