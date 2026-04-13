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


const Page = () => {
  const activeTab = useRemoteStore((state) => state.activeTab)
  const remoteId = useAuthStore(s => s.remoteId)
  const playback = activeTab?.playback || "IDLE"

  const { send } = useSocket()

  const handlePlayback = () => {
    if (!activeTab?.tabId) return;
    send({ type: media.stateUpdate, intent: media.intent.set, key: media.key.playback, value: playback === "PLAYING" ? "PAUSED" : "PLAYING", tabId: activeTab.tabId, remoteId })
  }

  return (
    <div className="h-full w-full relative overflow-hidden px-6 py-3 flex flex-col justify-between">
      <div>
        <Header title="Media Remote Control" className="capitalize" />
        <Divider />
        <div className=" absolute opacity-60 -z-10 rounded-2xl blur-[128px]">
          <MediaCover src={activeTab?.mediaArtwork || ""} />
        </div>
        <MediaCover src={activeTab?.mediaArtwork || ""} />
        <Divider size="xl" />
        <MediaMetadata title={activeTab?.mediaTitle || ""} artist={activeTab?.mediaArtist || ""} album={activeTab?.mediaAlbum || ""} />
        <Divider size="xl" />
        <ProgressSlider />
        <Divider size="xl" />
        <PlayerControls playback={playback} handlePlayback={handlePlayback} handleBackward={() => { }} handleForward={() => { }} handleCopy={() => { }} handleBookmark={() => { }} />
        <Divider size="lg" />
        <VolumeControl disabled={playback === 'IDLE'} />
        <Divider size="lg" />
        <CurrentTabView playback="PLAYING" url={activeTab?.url || ""} />
      </div>

    </div>
  )
}

export default Page