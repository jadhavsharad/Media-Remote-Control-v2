import SliderBar from "@/components/ui/SliderBar"

const ProgressSlider = () => {
  return (
    <div className="mx-auto flex flex-col gap-2">
      <SliderBar label="Progress bar" />
      <div className="flex items-center justify-between">
        <p aria-label="Current time" title="Current time" className="text-xs text-zinc-400">0:00</p>
        <p aria-label="Total time" title="Total time" className="text-xs text-zinc-400">07:59</p>
      </div>
    </div>
  )
}

export default ProgressSlider
