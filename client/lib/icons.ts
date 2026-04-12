import { IconType } from "react-icons"
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoVolumeHigh, IoVolumeLow, IoVolumeMute } from "react-icons/io5"
import { TbBookmarksFilled, TbCopy } from "react-icons/tb"

const iconMap: Record<string, IconType> = {
  IoPlay, IoPause, IoPlayBack, IoPlayForward,
  IoVolumeHigh, IoVolumeLow, IoVolumeMute,
  TbBookmarksFilled, TbCopy
}

export const resolveIcon = (name: string): IconType | null => iconMap[name] ?? null
