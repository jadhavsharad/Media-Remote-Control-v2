"use client"
import { FaChrome, FaWindows, FaLinux, FaApple, FaBrave, FaEdge, FaFirefox, FaQuestion, FaOpera, FaYandex, FaAndroid, } from "react-icons/fa6"
import SectionTitle from "@/components/ui/SectionTitle"
import Card from "@/components/ui/Card"
import Divider from "@/components/ui/Divider"
import { useLocalStorage } from "react-storage-complete"

const browser = (browser: string) => {
  const lower = browser?.toLowerCase();
  if (lower?.includes("chrome")) return <FaChrome />
  if (lower?.includes("brave")) return <FaBrave />
  if (lower?.includes("edge")) return <FaEdge />
  if (lower?.includes("firefox")) return <FaFirefox />
  if (lower?.includes("opera")) return <FaOpera />
  if (lower?.includes("yandex")) return <FaYandex />
  return <FaQuestion />
}

const platform = (platform: string) => {
  const lower = platform?.toLowerCase();
  if (lower?.includes("android")) return <FaAndroid />
  if (lower?.includes("chrome")) return <FaChrome />
  if (lower?.includes("ios")) return <FaApple />
  if (lower?.includes("windows")) return <FaWindows />
  if (lower?.includes("linux")) return <FaLinux />
  if (lower?.includes("mac")) return <FaApple />
  return <FaQuestion />
}

const ConnectionInfo = () => {
  const [hostInfo] = useLocalStorage("hostInfo")
  const [sessionId] = useLocalStorage("sessionId")
  return (
    <div className="my-4">
      <SectionTitle>Host Information</SectionTitle>
      <Card>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {browser(hostInfo?.browser)}
            <h1 className="text-base font-bold">{hostInfo?.browser}</h1>
          </div>
          <div className="flex items-center gap-2">
            {platform(hostInfo?.os)}
            <h1 className="font-bold">{hostInfo?.os}</h1>
          </div>
        </div>
        <Divider line />
        <div className="w-full truncate flex flex-col gap-2">
          <p className="text-xs text-zinc-400 font-semibold">Extension Version: {hostInfo?.extensionVersion}</p>
          <p className="text-xs text-zinc-400 truncate font-semibold">Session id: {sessionId}</p>
        </div>
        <button className="bg-red-500/20 text-rose-500 py-2 text-xs font-bold w-full rounded-lg cursor-pointer">Unpair</button>
      </Card>
    </div>
  )
}

export default ConnectionInfo
