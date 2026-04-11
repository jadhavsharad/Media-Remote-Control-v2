import { IoVolumeLow } from "react-icons/io5"
import { mediaControls } from "@/lib/feature"
import { resolveIcon } from "@/lib/icons"
import IconButton from "@/components/ui/IconButton"
import SliderBar from "@/components/ui/SliderBar"

const VolumeControl = () => {
  const { volume, mute } = mediaControls.audio
  const VolumeIcon = resolveIcon(volume.icon)
  const MuteIcon = resolveIcon(mute.icon)

  return (
    <div className="mx-auto flex items-center gap-2">
      {mute.isAvailable && MuteIcon && (
        <IconButton label="Mute"><MuteIcon /></IconButton>
      )}
      <IconButton label="Volume down"><IoVolumeLow /></IconButton>
      {volume.isAvailable && (
        <SliderBar label="Volume bar" trackClass="bg-zinc-100" />
      )}
      {volume.isAvailable && VolumeIcon && (
        <IconButton label="Volume up"><VolumeIcon /></IconButton>
      )}
    </div>
  )
}

export default VolumeControl
