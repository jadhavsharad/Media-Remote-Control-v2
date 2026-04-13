import SliderBar from "@/components/ui/SliderBar"
import { formatTime } from "@/lib/utils"

const ProgressSlider = ({ current, total }: { current: number, total: number }) => {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="mx-auto flex flex-col gap-2">
      <SliderBar progress={percent} label="Progress bar" />
      <div className="flex items-center justify-between">
        <p aria-label="Current time" title="Current time" className="text-xs text-zinc-400">{formatTime(current)}</p>
        <p aria-label="Total time" title="Total time" className="text-xs text-zinc-400">{formatTime(total)}</p>
      </div>
    </div>
  )
}

export default ProgressSlider
