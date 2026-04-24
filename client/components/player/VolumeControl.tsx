import IconButton from "@/components/ui/IconButton"
import SliderBar from "@/components/ui/SliderBar"
import { Icons } from "@/lib/icons"

const VolumeControl = ({ disabled, volume, ismute, handleMute, volumeDown, volumeUp }: { disabled: boolean, volume: number, ismute:boolean, handleMute: () => void, volumeUp: () => void, volumeDown: () => void }) => {

  return (
    <div className="justify-center flex items-center gap-2">
      <IconButton onClick={handleMute} disabled={disabled} label="Mute"><Icons.volumeMute className={ismute ? "text-red-500" : ""} /></IconButton>
      <IconButton onClick={volumeDown} disabled={disabled} label="Volume down"><Icons.volumeDown /></IconButton>
      {!disabled && <SliderBar progress={volume * 100} label="Volume bar" trackClass="bg-zinc-100" />}
      <IconButton onClick={volumeUp} disabled={disabled} label="Volume up"><Icons.volumeUp /></IconButton>
    </div>
  )
}

export default VolumeControl
