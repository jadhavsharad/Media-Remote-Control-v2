"use client"
import Html5QrcodePlugin from "@/components/Html5QrcodePlugin"
import { IoPhonePortraitOutline } from "react-icons/io5"
import { useSocket } from "@/hook/websocket"
import { auth } from "@/lib/constants"
import { getDeviceInfo } from "@/lib/device"

const PairingScreen = () => {
    const { send } = useSocket()
    const handlePairing = async (code: string) => {
        const deviceInfo = await getDeviceInfo();
        send({ type: auth.exchangePairKey, code, ...deviceInfo })
    }
    return (
        <div className="p-4 flex flex-col items-center justify-center">
            <div className="relative bg-sky-500/20 dark:bg-sky-500/20 p-4 w-fit rounded-full mx-auto">
                <IoPhonePortraitOutline className="text-4xl" />
                <div className="absolute inset-0 bg-sky-500/40 dark:bg-sky-500/40 rounded-[inherit] blur-xl" />
            </div>
            <h1 className="text-center font-bold text-2xl my-4">Connect remote</h1>
            <p className="text-center text-zinc-500 font-semibold">Enter your pairing code</p>
            <div className="my-4" />
            <input type="text" placeholder="Enter your pairing code" className="w-full px-4 py-2 border border-zinc-500 text-center tracking-widest outline-0 rounded-full uppercase font-bold placeholder:font-normal placeholder:capitalize" />
            <div className="flex w-full items-center gap-4 my-4">
                <div className="w-full h-px bg-radial from-black to-transparent dark:from-white dark:to-transparent"></div>
                <p className="text-zinc-500 font-semibold">OR</p>
                <div className="w-full h-px bg-radial from-black to-transparent dark:from-white dark:to-transparent"></div>
            </div>
            <div data-testid="scanner-container" className="w-full">
                <Html5QrcodePlugin fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={(e: string) => { handlePairing(e) }} qrCodeErrorCallback={() => { }} />
            </div>
        </div>
    )
}

export default PairingScreen
