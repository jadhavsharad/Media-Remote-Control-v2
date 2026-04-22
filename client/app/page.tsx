"use client"
import Header from "@/components/Header"
import MediaCover from "@/components/player/MediaCover"
import MediaMetadata from "@/components/player/MediaMetadata"
import PlayerControls from "@/components/player/PlayerControls"
import VolumeControl from "@/components/player/VolumeControl"
import CurrentTabView from "@/components/player/CurrentTabView"
import Divider from "@/components/ui/Divider"
import PageTransition from "@/components/PageTransition"
import { useAuthStore, useRemoteStore } from "@/lib/store"
import { useSocket, ws } from "@/lib/websocket"
import { media } from "@/lib/constants"
import Link from "next/link"
import { formatTime } from "@/lib/utils"
import { useState } from "react"
import { Icons } from "@/lib/icons"
import { motion, AnimatePresence } from "framer-motion"


const Page = () => {
  const activeTab = useRemoteStore((state) => state.activeTab)
  const remoteId = useAuthStore(s => s.remoteId)
  const playback = activeTab?.playback || "IDLE"
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const { send, isConnected } = useSocket()

  const volume = activeTab?.volume && activeTab?.volume || 0

  const handlePlayback = () => {
    if (!activeTab?.tabId) return;
    send({ type: media.stateUpdate, intent: media.intent.set, key: media.key.playback, value: playback === "PLAYING" ? "PAUSED" : "PLAYING", tabId: activeTab.tabId, remoteId })
  }
  const handleBookmark = () => {
    if (!activeTab?.tabId) return;
    send({ type: media.bookmark, intent: media.intent.set, key: media.bookmark, tabId: activeTab.tabId, remoteId })
    setBookmarked(true)
    setTimeout(() => setBookmarked(false), 1500)
  }

  const handleVolumeChange = (newVolume: number) => {
    if (!activeTab?.tabId) return;
    const bounded = Math.max(0, Math.min(1, newVolume)).toFixed(2);
    send({ type: media.stateUpdate, intent: media.intent.set, key: media.key.volume, value: bounded, tabId: activeTab.tabId, remoteId });
  }

  const volumeUp = () => handleVolumeChange(Number(volume) + 0.1);
  const volumeDown = () => handleVolumeChange(Number(volume) - 0.1);

  const handleCopy = () => {
    if (!activeTab?.tabId) return;
    navigator.clipboard.writeText(activeTab?.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  const handleMute = () => {
    if (!activeTab?.tabId) return;
    send({ type: media.stateUpdate, intent: media.intent.set, key: media.key.mute, value: !activeTab.muted, tabId: activeTab.tabId, remoteId })
  }


  const totalTime = activeTab?.duration && activeTab.duration || 0

  return (
    <PageTransition>
      <div className="h-full w-full relative overflow-hidden px-6 py-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Header title="Media Remote Control" className="capitalize" />
          <div className="flex items-center gap-1.5" title={isConnected ? "Connected" : "Disconnected"}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
            <span className="text-[0.6rem] text-zinc-400 font-semibold">{isConnected ? "Live" : "Offline"}</span>
          </div>
        </div>
        <Divider />
        {
          activeTab ?
            <div>
              <div className=" absolute saturate-200 scale-110 opacity-60 -z-10 blur-[128px]">
                <MediaCover src={activeTab?.mediaArtwork || ""} favicon={activeTab?.favIconUrl} />
              </div>
              <MediaCover src={activeTab?.mediaArtwork || ""} favicon={activeTab?.favIconUrl} />
              <Divider size="xl" />
              <MediaMetadata title={activeTab?.mediaTitle || ""} artist={activeTab?.mediaArtist || ""} album={activeTab?.mediaAlbum || ""} />
              <p className="text-xs text-center text-zinc-500 mt-2">Duration: {formatTime(totalTime)}</p>
              <Divider size="xl" />
              <PlayerControls playback={playback} handlePlayback={handlePlayback} copied={copied} handleCopy={handleCopy} handleBookmark={handleBookmark} bookmarked={bookmarked} />
              <Divider size="lg" />
              <VolumeControl volumeDown={volumeDown} volumeUp={volumeUp} handleMute={handleMute} ismute={activeTab.muted} volume={volume || 0} disabled={playback === 'IDLE'} />
              <Divider size="lg" />
              <CurrentTabView title={activeTab?.title} url={activeTab?.url || ""} />
              {
                activeTab.tabId && playback === "IDLE" && (
                  <>
                    <p className="text-center text-sm text-zinc-500 mt-2"> Controls Not supported for this tab </p>
                  </>
                )
              }
            </div>
            :
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="capitalize text-center flex flex-col items-center justify-center gap-4 py-12">
              <div className="relative bg-sky-500/10 p-6 rounded-full">
                <Icons.tabs className="text-4xl text-sky-500" />
                <div className="absolute inset-0 bg-sky-500/20 rounded-[inherit] blur-xl" />
              </div>
              <h1 className="font-bold text-lg">no active tab</h1>
              <p className="text-zinc-500 text-sm">please select a tab from tabs screen.</p>
              <Divider size="sm" />
              <Link className="font-bold text-sky-500 bg-zinc-100 dark:bg-white/10 px-6 py-2.5 rounded-full text-sm hover:bg-zinc-200 dark:hover:bg-white/15 duration-200" href="/tabs">view tabs</Link>
            </motion.div>
        }

        {/* Action toasts */}
        <AnimatePresence>
          {bookmarked && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50">
              Bookmarked on host
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {copied && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50">
              URL copied
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default Page