import { useEffect } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { useRemoteStore } from "./store";

type Handler = (message: any) => void;
const subs = new Set<Handler>();
const state = new Set<Handler>();
const url: string = process.env.NEXT_PUBLIC_WS_URL || "ws://192.168.0.100:8000";

export const ws = new ReconnectingWebSocket(url, [], { maxReconnectionDelay: 10000, minReconnectionDelay: 5000 });

ws.onopen = () => { console.log("Connected"); state.forEach((callback) => callback(ws.readyState)) };
ws.onclose = () => { console.log("Disconnected"); state.forEach((callback) => callback(ws.readyState)) };
ws.onerror = (err) => { console.warn("Error: ", err.message); state.forEach((callback) => callback(ws.readyState)) };
ws.onmessage = (evt) => {
    try {
        const data = JSON.parse(evt.data);
        subs.forEach((callback) => callback(data));
    } catch (err) {
        console.error("Parse", err);
    }
};

const send = (msg: unknown) => { if (ws.readyState === 1) ws.send(JSON.stringify(msg)) };
const listen = (callback: Handler) => { subs.add(callback); return () => subs.delete(callback); };
const socketState = (callback: Handler) => { state.add(callback); return () => state.delete(callback); };


export function useSocket(callback?: (msg: any) => void) {
    const setConnected = useRemoteStore(s => s.setConnected)
    useEffect(() => {
        const stop = socketState(setConnected)
        setConnected(ws.readyState === 1)
        return () => { stop() }
    }, [setConnected])
    useEffect(() => {
        if (!callback) return
        const stop = listen(callback)
        return () => { stop() }
    }, [callback])
    return { send, isConnected: useRemoteStore(s => s.isConnected) }
}