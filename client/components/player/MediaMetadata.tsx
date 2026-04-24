"use client"
import { motion } from "framer-motion"
const MediaMetadata = ({ title = "Title", artist = "Artist", album = "Album" }: { title?: string, artist?: string, album?: string }) => {
  return (
    <div className="mx-auto text-center flex flex-col gap-4">
      <motion.h1 initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }} aria-label="Media title" title={title} className="font-bold text-lg md:text-xl">{title}</motion.h1>
      <motion.p initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }} aria-label="Media artist" title={artist} className="text-xs md:text-sm text-zinc-400 font-black">{artist}</motion.p>
      <motion.p initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }} aria-label="Media album" title={album} className="text-xs md:text-sm text-zinc-400">{album}</motion.p>
    </div>
  )
}

export default MediaMetadata
