import { useEffect, useState } from "react";
import { listen, send, socketState } from "@/lib/websocket";

export function useSocket(callback?: (msg: any) => void) {
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        const stopState = socketState(setIsConnected);
        const stopListen = callback ? listen(callback) : () => { };
        return () => { stopState(); stopListen(); };
    }, [callback]);

    return { send, isConnected };
}