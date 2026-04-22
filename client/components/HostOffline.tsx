"use client"
import { motion } from "framer-motion"
import { Icons } from "@/lib/icons"
import { useAuthStore } from "@/lib/store"

export default function HostOffline() {
    const clearAuth = useAuthStore(s => s.clearAuth)
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-svh gap-4 px-6">
            <div className="relative bg-amber-500/10 p-6 rounded-full">
                <Icons.info className="text-4xl text-amber-500" />
                <div className="absolute inset-0 bg-amber-500/20 rounded-[inherit] blur-xl" />
            </div>
            <h1 className="font-bold text-lg">Host is offline</h1>
            <p className="text-zinc-500 text-sm text-center">
                The host computer isn&apos;t connected. Make sure the browser extension is running.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="animate-pulse">Waiting for host...</span>
            </div>
            <button onClick={clearAuth} className="font-bold text-white bg-sky-500 px-6 py-2.5 rounded-full text-sm hover:bg-sky-600 active:scale-95 duration-200 cursor-pointer flex items-center gap-2">Log Out</button>
        </motion.div>
    )
}
