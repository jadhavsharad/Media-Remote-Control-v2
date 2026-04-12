"use client"
import { useLocalStorage, useSessionStorage } from 'react-storage-complete'
import { MediaTab } from '@/lib/tabs'
import { useSocket } from '@/lib/websocket'
import { media } from '@/lib/constants'

const page = () => {
    const [tabs,, initialized] = useSessionStorage<MediaTab[]>('tabs', [])
    const [, setActiveTab] = useSessionStorage<MediaTab>('activeTab')
    const [remoteId] = useLocalStorage("remoteId");

    const { send } = useSocket()

    const selectActiveTab = (tabId: number) => {
        setActiveTab(tabs?.find((tab) => tab.tabId === tabId) || null)
        send({ type: media.selectActiveTab, remoteId, tabId })
    }

    const tablist = initialized ? tabs : null

    return (
        <div>
            {tablist ?
                tablist.map((tab: MediaTab) => {
                    return (
                        <div key={tab.tabId} onClick={() => selectActiveTab(tab.tabId)}>
                            {tab.title}
                        </div>
                    )
                })
                : <div>No tabs found</div>
            }
        </div>
    )
}

export default page