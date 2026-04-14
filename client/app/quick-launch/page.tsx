"use client"
import Header from '@/components/Header'
import Divider from '@/components/ui/Divider'
import PageTransition from '@/components/PageTransition'
import { media } from '@/lib/constants'
import { useSocket } from '@/lib/websocket'
import { motion } from "framer-motion"
import Image from 'next/image'

const apps = [

  { name: "youtube", url: "https://www.youtube.com", supported: true, },
  { name: "vimeo", url: "https://vimeo.com", supported: true, },
  { name: "youtube music", url: "https://music.youtube.com", supported: true, },
  { name: "apple music", url: "https://music.apple.com", supported: true, },
  { name: "spotify", url: "https://open.spotify.com", supported: false, },
  { name: "jio saavn", url: "https://www.jiosaavn.com", supported: true, },
  { name: "amazon music", url: "https://music.amazon.com", supported: false, },
  { name: "netflix", url: "https://www.netflix.com", supported: true, },
  { name: "prime video", url: "https://www.primevideo.com", supported: true, },
  { name: "hotstar", url: "https://www.hotstar.com", supported: true, },
  { name: "sony liv", url: "https://www.sonyliv.com", supported: true, },
]



const QuickLaunchPage = () => {
  const { send } = useSocket()
  const launch = (url: string) => {
    send({ type: media.session.launchApp, url })
  }
  return (
    <PageTransition>
      <div className='p-4'>
        <Header title='quick launch' />
        <Divider />
        <div className='grid grid-cols-3  gap-4'>
          {
            apps.map((app, index) => (
              <motion.div onClick={() => launch(app.url)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04 } }} whileTap={{ scale: 0.85, transition: { delay: 0 } }} key={`${app.name}-${index}`} className='select-none bg-zinc-100 border border-zinc-200 dark:border-white/5 dark:bg-white/5 rounded-2xl flex flex-col items-center justify-center py-4 gap-3 text-center cursor-pointer'>
                <Image loading='eager' className='w-1/4' src={`https://www.google.com/s2/favicons?sz=256&domain=${new URL(app.url).hostname}`} width={256} height={256} alt={`${app.name} logo`} />
                <p className='text-xs capitalize font-semibold'>{app.name}</p>
                {!app.supported && <p className='text-[0.6rem] text-zinc-400 -mt-2'>controls limited</p>}
              </motion.div>
            ))}

        </div>
      </div>
    </PageTransition>
  )
}

export default QuickLaunchPage