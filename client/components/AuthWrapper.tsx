"use client"
import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/lib/websocket";
import { auth, extension } from "@/lib/constants";
import PairingScreen from "./PairingScreen";
import HostOffline from "./HostOffline";
import { getDeviceInfo } from "@/lib/device";
import SocketListener from "./SocketListener";
import { useAuthStore } from "@/lib/store";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { token, setAuth, clearAuth } = useAuthStore()
    const [isMounted, setIsMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hostOnline, setHostOnline] = useState(true);
    const [pairError, setPairError] = useState<string | null>(null);
    const [isPairing, setIsPairing] = useState(false);
    const [extensionUpdated, setExtensionUpdated] = useState(false);

    const handler = useCallback((msg: any) => {
        if (msg.type === auth.sessionValid || msg.type === auth.pairSuccess) {
            if (msg.type === auth.pairSuccess)
                setAuth({ token: msg.remoteToken, remoteId: msg.remoteId, hostInfo: msg.hostInfo, sessionId: msg.sessionId, })
            setPairError(null);
            setIsPairing(false);
            setIsAuthenticated(true);
            setHostOnline(msg.hostOnline ?? true);
        }
        if (msg.type === auth.pairFailed) {
            setPairError(msg.message || "Pairing failed");
            setIsPairing(false);
            clearAuth();
            setIsAuthenticated(false);
        }
        if (msg.type === auth.sessionInvalid || msg.type === auth.remoteKicked) {
            setIsPairing(false);
            clearAuth();
            setIsAuthenticated(false);
            
        }
        if (msg.type === auth.hostDisconnected) {
            setHostOnline(false);
        }
        if (msg.type === auth.hostReconnected) {
            setHostOnline(true);
        }
        if (msg.type === extension.configuration) {
            setExtensionUpdated(true);
            setTimeout(() => {
                setExtensionUpdated(false);
            }, 3000);
        }
    }, [setAuth, clearAuth]);

    const { send, isConnected } = useSocket(handler);

    useEffect(() => { setIsMounted(true) }, []);

    useEffect(() => {
        if (!isMounted || !isConnected || !token || isAuthenticated) return;
        getDeviceInfo().then(deviceInfo => {
            send({ type: auth.validateSession, remoteToken: token, ...deviceInfo })
        })
    }, [isMounted, token, isAuthenticated, send, isConnected]);

    if (!isMounted) return null;

    if (!token) return <PairingScreen error={pairError} onClearError={() => setPairError(null)} isPairing={isPairing} onPairingStart={() => setIsPairing(true)} />

    if (!isConnected || !isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-svh">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-zinc-500 font-semibold animate-pulse">{isConnected ? "Validating session..." : "Connecting..."}</p>
            </div>
        );
    }

    if (!hostOnline) return <HostOffline />;

    if (isAuthenticated) { 
        return (
            <>
                <SocketListener />
                {extensionUpdated ? (
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-sky-500 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        Extension Updated, Please wait while extension discovers media.
                    </div>
                ) : (
                    children
                )}
            </>
        ); 
    }

    return null;
}