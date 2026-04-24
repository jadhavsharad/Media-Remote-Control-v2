
import IconButton from "@/components/ui/IconButton"
import { Icons } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"

interface PlayerControlsProps {
  playback: string
  handlePlayback: () => void
  handleCopy: () => void
  handleBookmark: () => void
  copied: boolean
  bookmarked?: boolean
}

const iconVariants = {
  hidden: { opacity: 0, scale: 0.75, rotate: -30 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring" as const } },
  exit: { opacity: 0, scale: 0.75, rotate: 30, transition: { duration: 0.1 } },
}

const PlayerControls = ({ playback, handlePlayback, handleCopy, handleBookmark, copied = false, bookmarked = false }: PlayerControlsProps) => {
  const isPlaying = playback === "PLAYING"
  const isPaused = playback === "PAUSED"
  const isIdle = playback === "IDLE"

  const PlaybackIcon = isPlaying ? Icons.pause : isPaused ? Icons.play : Icons.stop


  return (
    <div className="mx-auto flex items-center justify-between gap-2">
      <IconButton onClick={handleBookmark} disabled={isIdle} label="Bookmark the site">
        <Icons.bookmark className={bookmarked ? "text-sky-500 transition-colors duration-200" : "transition-colors duration-200"} />
      </IconButton>

      <div className="flex items-center gap-2 w-fit mx-auto">
        {/* <IconButton onClick={handleBackward} disabled={isIdle} label="Previous" scale>
          <Icons.backward />
        </IconButton> */}

        <IconButton onClick={handlePlayback} label={isPlaying ? "Pause" : "Play"} scale className="text-4xl">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={playback} variants={iconVariants} initial="hidden" animate="visible" exit="exit" style={{ display: "flex" }} >
              <PlaybackIcon />
            </motion.span>
          </AnimatePresence>
        </IconButton>

        {/* <IconButton onClick={handleForward} disabled={isIdle} label="Next" scale>
          <Icons.forward />
        </IconButton> */}
      </div>

      <IconButton onClick={handleCopy} disabled={isIdle} label="Copy the site URL">
        {
          copied ? <Icons.copied />
            :
            <Icons.copy />
        }
      </IconButton>
    </div>
  )
}

export default PlayerControls
