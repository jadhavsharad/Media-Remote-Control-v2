
import { MdManageAccounts, MdWifiTethering, MdWifiTetheringOff } from "react-icons/md";
import { TbExternalLink } from "react-icons/tb";
import { RiLinkM, RiRemoteControlLine } from "react-icons/ri";
import { LuKeyRound } from "react-icons/lu";
import { isSocketConnected } from "@/utils/storage/storage";
import { useStorageItem } from "../../hooks/useStorageItem";
import { motion, AnimatePresence } from "framer-motion";

const pulseRings = ["w-2/6 top-1/2 -translate-y-1/2", "w-4/6 top-1/2 -translate-y-1/2", "w-full top-0", "w-full scale-135 top-0",];

const Home = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [isSocketActive] = useStorageItem(isSocketConnected)
  return (
    <>
      <div className="w-60 min-h-96 bg-linear-to-t to-sky-950 flex flex-col justify-between px-2 py-4 antialiased">
        <div className="w-full aspect-square relative flex items-center justify-center shrink-0">
          {pulseRings.map((positionClasses, i) => (
            <div key={i} className={`animate-pulse absolute aspect-square bg-linear-to-t from-transparent to-white/10 rounded-full ${positionClasses}`} style={{ animationDelay: `${(i + 1) * 500}ms` }} />
          ))}
          <div className="relative flex flex-col items-center">
            <div className="relative flex justify-center items-center w-12 h-12 text-5xl text-white">
              <AnimatePresence mode="wait">
                <motion.div key={isSocketActive ? "active" : "inactive"} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }} className="absolute">
                  {isSocketActive ? <MdWifiTethering /> : <MdWifiTetheringOff />}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <AnimatePresence mode="wait">
                <motion.p key={isSocketActive ? "active-text" : "inactive-text"} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="select-none text-white font-semibold text-lg">
                  {isSocketActive ? "Active" : "Inactive"}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <div className="absolute -bottom-2 px-4 flex justify-between items-center w-full text-white">
            <p className="flex items-center gap-2"><RiRemoteControlLine />Remotes connected </p>
            <p>0</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-white w-full mt-8">
          <button disabled={!isSocketActive} className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-4 hover:bg-white/20 duration-100 flex items-center justify-start gap-2 " onClick={() => onNavigate('PAIRING_CODE')}>  <LuKeyRound />Generate Pairing Key</button>
          <button disabled={!isSocketActive} className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-4 hover:bg-white/20 duration-100 flex items-center justify-start gap-2" onClick={() => onNavigate('PAIRED_DEVICES')}>  <RiLinkM />View Paired Remotes</button>
          <button className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-4 hover:bg-white/20 duration-100 flex items-center justify-start gap-2" onClick={() => onNavigate('CURRENT_SESSION')}> <MdManageAccounts />Manage Current Session</button>
          <a href="" target="_blank" rel="noopener noreferrer" className="cursor-pointer text-white bg-white/10 rounded-lg w-full py-2 px-4 hover:bg-white/20 duration-100 flex items-center justify-between gap-2"><span className="flex items-center gap-2"><RiRemoteControlLine />Open Remote</span> <TbExternalLink /></a>
        </div>

      </div>
    </>
  )
}

export default Home