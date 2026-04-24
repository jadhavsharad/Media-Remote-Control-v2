"use client"
import { useEffect, useRef, useState } from "react";
import { ws, socketState } from "@/lib/websocket";
import { motion } from "framer-motion";
import { Icons } from "@/lib/icons";

type ConnectionState = "connecting" | "connected" | "server_error";

const SERVER_TIMEOUT_MS = 10_000;

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);
    const [state, setState] = useState<ConnectionState>("connecting");
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => { setIsMounted(true) }, []);

    useEffect(() => {
        if (!isMounted) return;

        const startTimeout = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setState("server_error");
            }, SERVER_TIMEOUT_MS);
        };

        const stop = socketState((readyState) => {
            if (readyState === 1) {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setState("connected");
            } else {
                setState((prev) => prev === "server_error" ? "server_error" : "connecting");
                startTimeout();
            }
        });

        // Initial check after mount
        if (ws.readyState === 1) {
            setState("connected");
        } else {
            startTimeout();
        }

        return () => {
            stop();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isMounted]);

    if (!isMounted) return null;

    if (state === "connecting") {
        return (
            <div className="flex flex-col items-center justify-center min-h-svh gap-4">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 font-semibold animate-pulse">Connecting to server...</p>
            </div>
        );
    }

    if (state === "server_error") {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-svh gap-4 px-6">
                <div className="relative bg-red-500/10 p-6 rounded-full">
                    <Icons.info className="text-4xl text-red-500" />
                    <div className="absolute inset-0 bg-red-500/20 rounded-[inherit] blur-xl" />
                </div>
                <h1 className="font-bold text-lg">Can&apos;t reach server</h1>
                <p className="text-zinc-500 text-sm text-center">
                    The server appears to be offline. Check your network connection and try again.
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-600 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Retrying in background...
                </div>
                <div className="mt-2" />
                <button onClick={() => window.location.reload()} className="font-bold text-white bg-sky-500 px-6 py-2.5 rounded-full text-sm hover:bg-sky-600 active:scale-95 duration-200 cursor-pointer flex items-center gap-2">
                    <Icons.refresh className="text-base" />
                    Reload App
                </button>
            </motion.div>
        );
    }

    return <>{children}</>;
}
