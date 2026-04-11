import { cn } from "@/lib/utils"

interface SliderBarProps {
  label: string
  progress?: number
  trackClass?: string
}

const SliderBar = ({ label, progress = 50, trackClass }: SliderBarProps) => {
  return (
    <div className={cn("w-full relative h-1 rounded-full bg-zinc-200 dark:bg-white/5", trackClass)}>
      <div
        aria-label={label}
        title={label}
        className="h-full absolute bg-sky-600 dark:bg-sky-500 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default SliderBar
