"use client"
import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "react-storage-complete";
import { useSocket } from "@/lib/websocket";
import { auth } from "@/lib/constants";
import PairingScreen from "./PairingScreen";
import { getDeviceInfo } from "@/lib/device";
import SocketListener from "./SocketListener";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {

    const [token, setToken] = useLocalStorage("token");
    const [, setRemoteId] = useLocalStorage("remoteId");
    const [, setHostInfo] = useLocalStorage("hostInfo");
    const [, setSessionId] = useLocalStorage("sessionId");
    const [isMounted, setIsMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handler = useCallback((msg: any) => {
        if (msg.type === auth.sessionValid || msg.type === auth.pairSuccess) {
            if (msg.type === auth.pairSuccess) {
                setToken(msg.remoteToken);
                setHostInfo(msg.hostInfo);
                setRemoteId(msg.remoteId);
                setSessionId(msg.sessionId);
            }
            setIsAuthenticated(true);
        }
        if (msg.type === auth.sessionInvalid || msg.type === auth.pairFailed || msg.type === auth.remoteKicked) {
            setToken(null);
            setHostInfo(null);
            setRemoteId(null);
            setSessionId(null);
            setIsAuthenticated(false);
        }
    }, [setToken, setHostInfo, setRemoteId, setSessionId]);

    const { send, isConnected } = useSocket(handler);

    useEffect(() => { setIsMounted(true) }, []);

    useEffect(() => {
        if (!isMounted || !isConnected || !token || isAuthenticated) return;
        const validate = async () => {
            const deviceInfo = await getDeviceInfo();
            send({ type: auth.validateSession, remoteToken: token, ...deviceInfo });
        }
        validate();
    }, [isMounted, token, isAuthenticated, send, isConnected]);

    if (!isMounted) return null;

    if (!token) return <PairingScreen />

    if (!isConnected || !isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-svh">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-zinc-500 font-semibold animate-pulse">{isConnected ? "Validating session..." : "Connecting..."}</p>
            </div>
        );
    }

    if (isAuthenticated) { return <><SocketListener />{children}</>; }

    return null;
}