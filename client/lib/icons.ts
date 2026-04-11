import { IconType } from "react-icons"
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoVolumeHigh, IoVolumeLow, IoVolumeMute } from "react-icons/io5"
import { TbBookmarksFilled } from "react-icons/tb"

const ICON_MAP: Record<string, IconType> = {
  IoPlay, IoPause, IoPlayBack, IoPlayForward,
  IoVolumeHigh, IoVolumeLow, IoVolumeMute,
  TbBookmarksFilled,
}

export const resolveIcon = (name: string): IconType | null => ICON_MAP[name] ?? null
