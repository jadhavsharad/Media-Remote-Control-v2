import { FaChevronRight, FaCrown } from "react-icons/fa"

const PremiumBanner = () => {
  return (
    <div className="my-4 cursor-pointer duration-300 flex items-center justify-start gap-4 bg-linear-0 from-yellow-500/10 via-yellow-500/5 to-yellow-500/10 px-4 py-2 w-full border border-yellow-500 rounded-xl">
      <div><FaCrown className="text-3xl" /></div>
      <div className="flex flex-col items-start justify-center">
        <h1 className="text-base font-bold">Unlock Premium</h1>
        <p className="text-xs text-zinc-400 text-start">Get access to all the premium features</p>
      </div>
      <FaChevronRight className="ml-auto" />
    </div>
  )
}

export default PremiumBanner
