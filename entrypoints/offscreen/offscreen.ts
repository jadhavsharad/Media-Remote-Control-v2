import { CHANNELS, MESSAGE_TYPES } from "@/config/constants"
import { sendMessage } from "@/utils/messaging/message"
import ReconnectingWebSocket from "reconnecting-websocket"
import logger from "@/config/logger"

let socket: ReconnectingWebSocket
const socketURL = import.meta.env.VITE_WEBSOCKET_URL

const connect = () => {
    socket = new ReconnectingWebSocket(socketURL, [], {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 5000,
    })


    socket.onopen = () => {
        logger.success("WebSocket connected")
        sendMessage({ channel: CHANNELS.FROM_OFFSCREEN, payload: { type: MESSAGE_TYPES.WS_OPEN } });
    }

    socket.onmessage = (event) => {
        sendMessage({ channel: CHANNELS.FROM_OFFSCREEN, payload: JSON.parse(event.data) });
    }

    socket.onclose = (event: { code: number, reason: string } = { code: 1006, reason: "Connection closed" }) => {
        logger.warn("WebSocket disconnected", event.code, event.reason)
        sendMessage({ channel: CHANNELS.FROM_OFFSCREEN, payload: { type: MESSAGE_TYPES.WS_CLOSED } });
    }

    socket.onerror = (error) => {
        sendMessage({ channel: CHANNELS.FROM_OFFSCREEN, payload: { type: MESSAGE_TYPES.WS_ERROR, error: error.message } });
        logger.error("WebSocket error: ", error.message)
    }

}
connect()

const isSocketOpen = () => {
    return socket.readyState === socket.OPEN
}

const reconnectSocket = (event: { code: number, reason: string }) => {
    return socket.reconnect(event.code, event.reason)
}

browser.runtime.onMessage.addListener((msg) => {
    if (msg.channel !== CHANNELS.TO_OFFSCREEN) return;

    if (msg.payload.type === MESSAGE_TYPES.HOST_DISCONNECT) {
        if (isSocketOpen())
            socket.close(1000, "Host disconnected");
        return;
    }

    if (msg.payload.type === MESSAGE_TYPES.HOST_RECONNECT) {
        if (!isSocketOpen()) {
            reconnectSocket({ code: 1000, reason: "Re-connection requested" });
        }
        return;
    }

    if (!isSocketOpen()) {
        sendMessage({ channel: CHANNELS.FROM_OFFSCREEN, payload: { type: MESSAGE_TYPES.WS_ERROR, error: "WebSocket is not open" } });
        return;
    }

    logger.debug("Sending message to server: ", msg.payload);
    socket.send(JSON.stringify({ ...msg.payload, timestamp: Date.now() }));
});

