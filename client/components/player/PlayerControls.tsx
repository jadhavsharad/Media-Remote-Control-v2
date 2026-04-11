import { IoIosCopy } from "react-icons/io"
import { mediaControls } from "@/lib/feature"
import { resolveIcon } from "@/lib/icons"
import IconButton from "@/components/ui/IconButton"

const PlayerControls = () => {
  const { toggle, backward, forward } = mediaControls.playback
  const { bookmark } = mediaControls.others

  const PlayIcon = resolveIcon(toggle.icon.off)
  const BackwardIcon = resolveIcon(backward.icon)
  const ForwardIcon = resolveIcon(forward.icon)
  const BookmarkIcon = resolveIcon(bookmark.icon)

  return (
    <div className="mx-auto flex items-center justify-between gap-2">
      <div>
        {bookmark.isAvailable && BookmarkIcon && (
          <IconButton label="Bookmark the site"><BookmarkIcon /></IconButton>
        )}
      </div>
      <div className="flex items-center gap-2 w-fit mx-auto">
        {backward.isAvailable && BackwardIcon && (
          <IconButton label="Previous" scale><BackwardIcon /></IconButton>
        )}
        {toggle.isAvailable && PlayIcon && (
          <IconButton label="Play" scale className="text-4xl"><PlayIcon /></IconButton>
        )}
        {forward.isAvailable && ForwardIcon && (
          <IconButton label="Next" scale><ForwardIcon /></IconButton>
        )}
      </div>
      <div>
        <IconButton label="Copy the site URL"><IoIosCopy /></IconButton>
      </div>
    </div>
  )
}

export default PlayerControls
