"use client"
import Header from "@/components/Header"
import MediaCover from "@/components/player/MediaCover"
import MediaMetadata from "@/components/player/MediaMetadata"
import ProgressSlider from "@/components/player/ProgressSlider"
import PlayerControls from "@/components/player/PlayerControls"
import VolumeControl from "@/components/player/VolumeControl"
import CurrentTabView from "@/components/player/CurrentTabView"
import Divider from "@/components/ui/Divider"
import { useAuthStore, useRemoteStore } from "@/lib/store"
import { useSocket } from "@/lib/websocket"
import { media } from "@/lib/constants"
import Link from "next/link"


const Page = () => {
  const activeTab = useRemoteStore((state) => state.activeTab)
  const remoteId = useAuthStore(s => s.remoteId)
  const playback = activeTab?.playback || "IDLE"

  const { send } = useSocket()

  const handlePlayback = () => {
    if (!activeTab?.tabId) return;
    send({ type: media.stateUpdate, intent: media.intent.set, key: media.key.playback, value: playback === "PLAYING" ? "PAUSED" : "PLAYING", tabId: activeTab.tabId, remoteId })
  }
  const volume = activeTab?.volume && activeTab?.volume * 100
  const currentTime = activeTab?.currentTime && activeTab.currentTime
  const totalTime = activeTab?.duration && activeTab.duration

  return (
    <div className="h-full w-full relative overflow-hidden px-6 py-3 flex flex-col justify-between">
      <Header title="Media Remote Control" className="capitalize" />
      <Divider  />
      {
        activeTab ?
          <div>
            <div className=" absolute saturate-150 opacity-60 -z-10 rounded-2xl blur-[128px]">
              <MediaCover src={activeTab?.mediaArtwork || ""} />
            </div>
            <MediaCover src={activeTab?.mediaArtwork || ""} />
            <Divider size="xl" />
            <MediaMetadata title={activeTab?.mediaTitle || ""} artist={activeTab?.mediaArtist || ""} album={activeTab?.mediaAlbum || ""} />
            <Divider size="xl" />
            <ProgressSlider current={currentTime || 0} total={totalTime || 0} />
            <Divider size="xl" />
            <PlayerControls playback={playback} handlePlayback={handlePlayback} handleBackward={() => { }} handleForward={() => { }} handleCopy={() => { }} handleBookmark={() => { }} />
            <Divider size="lg" />
            <VolumeControl volume={volume || 0} disabled={playback === 'IDLE'} />
            <Divider size="lg" />
            <CurrentTabView playback={playback} url={activeTab?.url || ""} />
          </div>
          :
          <div className="capitalize text-center">
            <h1 className="font-bold">no active tab</h1>
            <p>please select a tab from tabs screen.</p>
            <Divider/>
            <Link className="font-bold text-blue-500 bg-zinc-100 dark:bg-white/10 px-4 py-2 rounded-full" href="/tabs">view tabs</Link>
          </div>
      }
    </div>
  )
}

export default Page