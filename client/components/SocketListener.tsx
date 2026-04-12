"use client"
import { useCallback } from "react"
import { useSessionStorage } from "react-storage-complete"
import { useSocket } from "@/lib/websocket"
import { media } from "@/lib/constants"
import { MediaTab } from "@/lib/tabs"

export default function GlobalMediaListener() {
    const [tabs, setTabs] = useSessionStorage<MediaTab[]>('tabs', [])
    const [activeTab, setActiveTab] = useSessionStorage<MediaTab | null>('activeTab', null)

    const handler = useCallback((msg: any) => {
        const currentTabs = tabs || [];
        const currentActive = activeTab || null;

        switch (msg.type) {
            case media.mediaList:
                setTabs(msg.tabs || []);
                break;

            case media.tabCreated:
                setTabs([...currentTabs, msg.tab]);
                break;

            case media.tabRemoved:
                setTabs(currentTabs.filter((t: MediaTab) => t.tabId !== msg.tabId));
                if (currentActive?.tabId === msg.tabId) {
                    setActiveTab(null);
                }
                break;

            case media.stateUpdate:
                setTabs(currentTabs.map((t: MediaTab) => 
                    t.tabId === msg.tabId ? { ...t, ...msg.state } : t
                ));
                if (currentActive?.tabId === msg.tabId) {
                    setActiveTab({ ...currentActive, ...msg.state });
                }
                break;
        }
    }, [tabs, activeTab, setTabs, setActiveTab])

    useSocket(handler);

    return null;
}