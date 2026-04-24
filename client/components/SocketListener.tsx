import { media } from "@/lib/constants"
import { useRemoteStore } from "@/lib/store"
import { useSocket } from "@/lib/websocket"
import { useCallback } from "react"

export default function GlobalMediaListener() {
    const { setTabs, updateTabs, removeTab, addTab } = useRemoteStore()

    const handler = useCallback((msg: any) => {
        switch (msg.type) {
            case media.mediaList: return setTabs(msg.tabs ?? [])
            case media.stateUpdate: return updateTabs(msg.tabs ?? [])
            case media.tabCreated: return msg.tab && addTab(msg.tab)
            case media.tabRemoved: return msg.tabId && removeTab(msg.tabId)
        }
    }, [setTabs, updateTabs, removeTab, addTab]) 

    useSocket(handler)
    return null
}

