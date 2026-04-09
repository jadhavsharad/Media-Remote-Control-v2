import logger from "@/config/logger";
import { MdManageAccounts, MdWifiTethering } from "react-icons/md";
import { TbExternalLink } from "react-icons/tb";
import { RiLinkM, RiRemoteControlLine } from "react-icons/ri";
import { LuKeyRound } from "react-icons/lu";


const pulseRings = [
  "w-2/6 top-1/2 -translate-y-1/2",
  "w-4/6 top-1/2 -translate-y-1/2",
  "w-full top-0",
  "w-full scale-135 top-0",
];

const Home = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const onDisconnect = () => {
    logger.info("Disconnecting from the device...")
  }
  return (
    <>
      <div className="w-60 min-h-96 bg-linear-to-t to-sky-950 flex flex-col justify-between px-2 py-4 antialiased">
        <div className="w-full aspect-square relative flex items-center justify-center shrink-0">
          {pulseRings.map((positionClasses, i) => (
            <div key={i} className={`animate-pulse absolute aspect-square bg-linear-to-t from-transparent to-white/10 rounded-full ${positionClasses}`} style={{ animationDelay: `${(i + 1) * 500}ms` }} />
          ))}
          <div className="relative flex flex-col">
            <div className="text-5xl text-white"><MdWifiTethering /></div>
            <p className="absolute -translate-x-1/2 left-1/2 -bottom-5/6 select-none text-white font-semibold text-lg">Active</p>
          </div>
          <div className="absolute -bottom-2 px-4 flex justify-between items-center w-full text-white">
            <p className="flex items-center gap-2"><RiRemoteControlLine />Remotes connected </p>
            <p>0</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-white w-full mt-8">
          <button className="cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-4 hover:bg-white/20 duration-100 flex items-center justify-start gap-2 " onClick={() => onNavigate('PAIRING_CODE')}>  <LuKeyRound />Generate Pairing Key</button>
          <button className="cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-4 hover:bg-white/20 duration-100 flex items-center justify-start gap-2" onClick={() => onNavigate('PAIRED_DEVICES')}>  <RiLinkM />View Paired Remotes</button>
          <button className="cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-4 hover:bg-white/20 duration-100 flex items-center justify-start gap-2" onClick={() => onNavigate('CURRENT_SESSION')}> <MdManageAccounts />Manage Current Session</button>
          <a href="" target="_blank" rel="noopener noreferrer" className="cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-4 hover:bg-white/20 duration-100 flex items-center justify-between gap-2"><span className="flex items-center gap-2"><RiRemoteControlLine />Open Remote</span> <TbExternalLink /></a>
        </div>

      </div>
    </>
  )
}

export default Home