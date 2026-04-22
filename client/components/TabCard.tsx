import { Icons } from "@/lib/icons"
import { MediaTab } from "@/lib/types"
import { motion } from "framer-motion"
import Image from "next/image"



export const TabCard = ({ tab }: { tab: MediaTab }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring" }} className='relative w-full rounded-3xl overflow-hidden dark:bg-white/10'>
            <div className='absolute inset-0 z-0'>
                {tab.mediaArtwork && <Image loading='eager' src={tab.mediaArtwork} alt="source" width={1024} height={1024} className='w-full h-full object-cover opacity-40 saturate-150 blur-xl' />}
                <div className='absolute inset-0 dark:bg-black/50' />
            </div>
            <motion.div className='p-4 flex gap-6 z-10 relative'>
                <motion.div className='relative border-2 dark:border-zinc-800 border-zinc-400 aspect-square rounded-full flex items-center justify-center w-full max-w-24'>
                    {
                        tab.mediaArtwork ? <Image loading='eager' src={tab.mediaArtwork} alt={tab.mediaTitle || tab.title} width={1024} height={1024} className=' w-full h-full object-cover rounded-[inherit]' /> : <div className='absolute inset-0 rounded-[inherit] bg-zinc-800'></div>
                    }
                    <div className='w-5 h-5 bg-black/80 border-2 dark:border-zinc-800 border-zinc-400 absolute rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
                </motion.div>
                <motion.div className='flex gap-2 flex-col w-fit overflow-hidden'>
                    <div className='flex gap-2 items-center text-xs bg-black/20 w-fit h-fit py-1 px-2 rounded-full truncate text-nowrap'>
                        <Image loading='eager' src={tab.url ? `https://www.google.com/s2/favicons?sz=64&domain=${new URL(tab.url).hostname}` : tab.favIconUrl} alt="source" width={512} height={512} className='w-3 aspect-square object-contain' />
                        <p className='truncate text-nowrap'>{new URL(tab.url).hostname}</p>
                    </div>
                    <p className='truncate text-xs font-semibold  text-nowrap'>{tab.mediaTitle || tab.title}</p>
                    <motion.div className={`flex gap-2 items-center text-xs ${tab.playback === 'PLAYING' ? 'dark:text-green-500 text-green-700' : tab.playback === 'PAUSED' ? 'dark:text-yellow-500 text-yellow-600' : 'text-red-500'}`}>
                        {tab.playback === 'PLAYING' ? <Icons.play /> : tab.playback === 'PAUSED' ? <Icons.pause /> : <Icons.stop />}
                        <p className='truncate  font-semibold  text-nowrap lowercase'>{tab.playback || 'IDLE'}</p>
                    </motion.div>
                    <motion.div className={`flex gap-2 items-center text-xs ${tab.muted ? 'text-red-500' : 'text-black dark:text-white'}`}>
                        <Icons.volumeMute />
                        <p className='truncate  font-semibold  text-nowrap'>{tab.muted ? 'Muted' : 'Unmuted'}</p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}