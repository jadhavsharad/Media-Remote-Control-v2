"use client"
import Image from "next/image"
import { IoIosMusicalNotes } from "react-icons/io"
import { motion } from "framer-motion"

const MediaCover = ({ src, favicon }: { src: string, favicon?: string }) => {
  return (
    <div className="mx-auto w-4/6 aspect-square rounded-2xl overflow-hidden">
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-full h-full bg-zinc-950/70 rounded-[inherit] flex items-center justify-center">
        {
          src ?
            <Image loading="eager" src={src.toString()} alt="Media Artwork" title="Media Artwork" width={2048} height={2048} className="rounded-[inherit] h-full w-full object-cover" />
            :
            <div className="w-full h-full bg-linear-60 from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 rounded-[inherit] flex items-center justify-center text-white/50">
              {favicon != undefined ?
                <Image loading="eager" src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(favicon)}`} alt="Media Artwork" title="Media Artwork" width={32} height={32} />
                : <IoIosMusicalNotes className="text-4xl dark:text-white/50 text-zinc-900/50" />}
            </div>
        }
      </motion.div>
    </div>
  )
}

export default MediaCover
