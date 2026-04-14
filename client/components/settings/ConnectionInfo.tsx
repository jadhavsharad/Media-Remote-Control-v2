"use client"
import SectionTitle from "@/components/ui/SectionTitle"
import Card from "@/components/ui/Card"
import Divider from "@/components/ui/Divider"
import { useAuthStore } from "@/lib/store"
import { Icons } from "@/lib/icons"

const browser = (browser: string) => {
  const lower = browser?.toLowerCase();
  if (lower?.includes("chrome")) return <Icons.chrome />
  if (lower?.includes("brave")) return <Icons.brave />
  if (lower?.includes("edge")) return <Icons.edge />
  if (lower?.includes("firefox")) return <Icons.firefox />
  if (lower?.includes("opera")) return <Icons.opera />
  if (lower?.includes("yandex")) return <Icons.yandex />
  return <Icons.question />
}

const platform = (platform: string) => {
  const lower = platform?.toLowerCase();
  if (lower?.includes("android")) return <Icons.android />
  if (lower?.includes("chrome")) return <Icons.chrome />
  if (lower?.includes("ios")) return <Icons.mac />
  if (lower?.includes("windows")) return <Icons.windows />
  if (lower?.includes("linux")) return <Icons.linux />
  if (lower?.includes("mac")) return <Icons.mac />
  return <Icons.question />
}

const ConnectionInfo = () => {
  const hostInfo = useAuthStore(s => s.hostInfo)
  const sessionId = useAuthStore(s => s.sessionId)
  const clearAuth = useAuthStore(s => s.clearAuth)
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
        <button onClick={() => { clearAuth(); window.location.reload(); }} className="bg-red-500/20 text-rose-500 py-2 text-xs font-bold w-full rounded-lg cursor-pointer">Unpair</button>
      </Card>
    </div>
  )
}

export default ConnectionInfo
