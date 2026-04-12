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
import { useSessionStorage } from "react-storage-complete"
import { MediaTab } from "@/lib/tabs"

const mediaCover: boolean = true



const Page = () => {
  const [activeTab] = useSessionStorage<MediaTab>('activeTab')

  return (
    <div className="h-full w-full relative overflow-hidden px-6 py-3 flex flex-col justify-between">
      <div>
        <Header title="Media Remote Control" />
        <div className="rounded-full mx-auto text-xs my-4"><div className="bg-white/10 px-4 py-1 rounded-full flex items-center gap-2 w-fit"> <div className="w-2 aspect-square bg-green-500 rounded-full"></div>Connected</div></div>
        <div className=" absolute opacity-80 scale-125 -z-10 rounded-full blur-[128px]">
          <MediaCover src={activeTab?.mediaArtwork || ""} />
        </div>
        <MediaCover src={activeTab?.mediaArtwork || ""} />
        <Divider size="xl" />
        <MediaMetadata title={activeTab?.mediaTitle || ""} artist={activeTab?.mediaArtist || ""} album={activeTab?.mediaAlbum || ""} />
        <Divider size="xl" />
        {/* <ProgressSlider /> */}
        <Divider size="xl" />
        <PlayerControls />
        <Divider size="lg" />
        <VolumeControl />
        <Divider size="lg" />
        <CurrentTabView playback="playing" url={activeTab?.url || ""} />
      </div>

    </div>
  )
}

export default Page