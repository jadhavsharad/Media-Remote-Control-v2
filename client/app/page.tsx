"use client"

import Header from "@/components/Header"
import Navigation from "@/components/Navigation"
import MediaCover from "@/components/player/MediaCover"
import MediaMetadata from "@/components/player/MediaMetadata"
import ProgressSlider from "@/components/player/ProgressSlider"
import PlayerControls from "@/components/player/PlayerControls"
import VolumeControl from "@/components/player/VolumeControl"
import CurrentTabView from "@/components/player/CurrentTabView"
import Divider from "@/components/ui/Divider"

const mediaCover: boolean = true

const Page = () => {
  return (
    <div className="min-h-svh w-full relative overflow-hidden px-6 py-3 flex flex-col justify-between">
      <div>
        <Header title="Media Remote Control" />
        <div className="rounded-full mx-auto text-xs my-4"><div className="bg-white/10 px-4 py-1 rounded-full flex items-center gap-2 w-fit"> <div className="w-2 aspect-square bg-green-500 rounded-full"></div>Connected</div></div>
        {mediaCover ?
          <div className=" absolute opacity-40 -z-50 rounded-full blur-[128px] ">
            <MediaCover />
          </div>
          :
          <div className="w-full aspect-square absolute  left-1/2 -translate-x-1/2 rounded-full blur-[128px] bg-sky-500/40 -z-50"></div>}
        <MediaCover />
        <Divider size="xl" />
        <MediaMetadata />
        <Divider size="xl" />
        <ProgressSlider />
        <Divider size="xl" />
        <PlayerControls />
        <Divider size="lg" />
        <VolumeControl />
        <Divider size="lg" />
        <CurrentTabView />
      </div>
      <div className="w-fit mx-auto border border-white/10  p-2 rounded-full   bg-linear-0  to-zinc-100 dark:from-white/5 dark:to-zinc-950 z-50">
        <Navigation />
      </div>
    </div>
  )
}

export default Page