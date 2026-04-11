import { FaChrome, FaWindows } from "react-icons/fa6"
import SectionTitle from "@/components/ui/SectionTitle"
import Card from "@/components/ui/Card"
import Divider from "@/components/ui/Divider"

const ConnectionInfo = () => {
  return (
    <div className="my-4">
      <SectionTitle>Connection Information</SectionTitle>
      <Card>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FaChrome />
            <h1 className="text-base font-bold">Chrome</h1>
          </div>
          <div className="flex items-center gap-2">
            <FaWindows />
            <h1 className="font-bold">Windows</h1>
          </div>
        </div>
        <Divider line />
        <div className="w-full truncate flex flex-col gap-2">
          <p className="text-xs text-zinc-400 font-semibold">Extension Version: 1.0</p>
          <p className="text-xs text-zinc-400 truncate font-semibold">Session id: 123e4567-e89b-12d3-a456-426614174000-123e4567-e89b-12d3-a456-426614174000</p>
        </div>
        <button className="bg-red-500/20 text-rose-500 py-2 text-xs font-bold w-full rounded-lg cursor-pointer">Unpair</button>
      </Card>
    </div>
  )
}

export default ConnectionInfo
