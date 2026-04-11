import ReconnectingWebSocket from "reconnecting-websocket";

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

export const send = (msg: unknown) => { if (ws.readyState === 1) ws.send(JSON.stringify(msg)) };
export const listen = (callback: Handler) => { subs.add(callback); return () => subs.delete(callback); };
export const socketState = (callback: Handler) => { state.add(callback); return () => state.delete(callback); };