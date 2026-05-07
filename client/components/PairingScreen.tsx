"use client"
import Html5QrcodePlugin from "@/components/Html5QrcodePlugin"
import { useSocket } from "@/lib/websocket"
import { auth } from "@/lib/constants"
import { getDeviceInfo } from "@/lib/device"
import { Icons } from "@/lib/icons"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PairingScreenProps {
    error?: string | null
    onClearError?: () => void
    isPairing?: boolean
    onPairingStart?: () => void
}

const PairingScreen = ({ error, onClearError, isPairing = false, onPairingStart }: PairingScreenProps) => {
    const { send } = useSocket()
    const [code, setCode] = useState("")

    // Auto-dismiss error after 4s
    useEffect(() => {
        if (!error) return
        const timer = setTimeout(() => onClearError?.(), 4000)
        return () => clearTimeout(timer)
    }, [error, onClearError])

    const handlePairing = async (pairCode: string) => {
        if (!pairCode.trim() || isPairing) return
        onClearError?.()
        onPairingStart?.()
        const deviceInfo = await getDeviceInfo();
        send({ type: auth.exchangePairKey, code: pairCode, ...deviceInfo })
    }
    return (
        <div className="p-4 flex flex-col items-center justify-center">
            <div className="relative bg-sky-500/20 dark:bg-sky-500/20 p-4 w-fit rounded-full mx-auto">
                <Icons.phone className="text-4xl" />
                <div className="absolute inset-0 bg-sky-500/40 dark:bg-sky-500/40 rounded-[inherit] blur-xl" />
            </div>
            <h1 className="text-center font-bold text-2xl my-4">Connect remote</h1>
            <p className="text-center text-zinc-500 font-semibold">Enter your pairing code</p>
            <div className="my-4" />
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePairing(code)} placeholder="Enter your pairing code" disabled={isPairing} className="w-full px-4 py-2 border border-zinc-500 text-center tracking-widest outline-0 rounded-full uppercase font-bold placeholder:font-normal placeholder:capitalize disabled:opacity-50" />
            <button onClick={() => handlePairing(code)} disabled={!code.trim() || isPairing} className="w-full mt-3 py-2.5 rounded-full bg-sky-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-600 active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-2">
                {isPairing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Connecting...
                    </>
                ) : (
                    "Connect"
                )}
            </button>
            <div className="flex w-full items-center gap-4 my-4">
                <div className="w-full h-px bg-radial from-black to-transparent dark:from-white dark:to-transparent"></div>
                <p className="text-zinc-500 font-semibold">OR</p>
                <div className="w-full h-px bg-radial from-black to-transparent dark:from-white dark:to-transparent"></div>
            </div>
            <div data-testid="scanner-container" className="w-full">
                <Html5QrcodePlugin fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={(e: string) => { handlePairing(e) }} qrCodeErrorCallback={() => { }} />
            </div>

            {/* Error toast */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={() => onClearError?.()} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg z-50 cursor-pointer max-w-xs text-center">
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <small className="text-center my-4 text-zinc-500 font-semibold">If you are using old version of extension, please update it.</small>
        </div>
    )
}

export default PairingScreen
