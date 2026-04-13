import IconButton from "@/components/ui/IconButton"
import SliderBar from "@/components/ui/SliderBar"
import { Icons } from "@/lib/icons"

const VolumeControl = ({ disabled }: { disabled: boolean }) => {

  return (
    <div className="justify-center flex items-center gap-2">
      <IconButton disabled={disabled} label="Mute"><Icons.volumeMute /></IconButton>
      <IconButton disabled={disabled} label="Volume down"><Icons.volumeDown /></IconButton>
      {!disabled && <SliderBar label="Volume bar" trackClass="bg-zinc-100" />}
      <IconButton disabled={disabled} label="Volume up"><Icons.volumeUp /></IconButton>
    </div>
  )
}

export default VolumeControl
