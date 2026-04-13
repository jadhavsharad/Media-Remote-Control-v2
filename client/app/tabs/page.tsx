"use client"
import { useSocket } from '@/lib/websocket'
import { media } from '@/lib/constants'
import Header from '@/components/Header'
import SectionTitle from '@/components/ui/SectionTitle'
import { TbRefresh } from 'react-icons/tb'
import IconButton from '@/components/ui/IconButton'
import { motion } from 'framer-motion'
import { useAuthStore, useRemoteStore } from '@/lib/store'
import { MediaTab } from '@/lib/types'
import { TabCard } from '@/components/TabCard'

const page = () => {
    const tabs = useRemoteStore(s => s.tabs)
    const activeTab = useRemoteStore(s => s.activeTab)
    const setActiveTab = useRemoteStore(s => s.setActiveTab)

    const remoteId = useAuthStore(s => s.remoteId)

    const { send } = useSocket()

    const selectActiveTab = (tabId: number) => {
        setActiveTab(tabs?.find((tab) => tab.tabId === tabId) || null)
        send({ type: media.selectActiveTab, remoteId, tabId })
    }

    const validActiveTab = activeTab && tabs?.some(t => t.tabId === activeTab.tabId) ? activeTab : null
    const otherTabs = validActiveTab ? tabs.filter(t => t.tabId !== validActiveTab.tabId) : tabs

    const reload = () => window.location.reload()

    return (

        <div className='p-4 flex flex-col gap-4 '>
            <Header title='Media sources' />
            <div className='flex justify-between items-center w-full'>
                <SectionTitle>Active tab</SectionTitle>
                <IconButton className='p-0' label="Refresh" onClick={() => reload()} scale>
                    <TbRefresh />
                </IconButton>
            </div>

            {validActiveTab ?
                <motion.div initial={{ opacity: 0, y: 50, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring" }}>
                    <TabCard tab={validActiveTab} />
                </motion.div> : <motion.p key={"no-active"} className='flex items-center justify-center h-full'>No active tab found</motion.p>}


            <SectionTitle>Other tabs</SectionTitle>

            {otherTabs && otherTabs.length > 0 &&
                otherTabs.map((tab: MediaTab) => (
                    <motion.div key={tab.tabId} transition={{ type: "spring" }} onClick={() => selectActiveTab(tab.tabId)}>
                        <TabCard tab={tab} />
                    </motion.div>
                ))}
            {otherTabs && otherTabs.length === 0 && <div className='flex items-center justify-center h-full'>No other tabs found</div>}

        </div >

    )
}

export default page

