"use client"
import Image from "next/image"
import { motion } from "framer-motion"

const CurrentTabView = ({ title, url }: { title: string, url: string }) => {
  if (!url) return null;
  const urlObj = new URL(url)
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }} aria-label="Current Tab" title={urlObj.hostname} className="mx-auto my-4 flex items-center gap-4 bg-zinc-100 dark:bg-white/5 border border-white/5 px-4 py-2 rounded-full">
      <Image src={`https://www.google.com/s2/favicons?sz=128&domain=${urlObj.hostname}`} alt="Favicon" title="Favicon" width={128} height={128} className="w-8 aspect-square" />
      <div className="truncate">
        <h1 className="text-xs text-zinc-400 font-semibold capitalize truncate">{title}</h1>
        <a href={url.toString()} className="text-xs text-zinc-400 truncate lowercase">{url.toString()}</a>
      </div>
    </motion.div>
  )
}

export default CurrentTabView
