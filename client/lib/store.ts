import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { MediaTab, RemoteStore, AuthStore } from '@/lib/types'

export const useRemoteStore = create<RemoteStore>()(
    persist(
        (set, get) => ({
            tabs: [], activeTab: null, isConnected: false,
            setConnected: (isConnected) => set({ isConnected }),
            setTabs: (tabs) => set(s => ({ tabs, activeTab: tabs.find(t => t.tabId === s.activeTab?.tabId) ?? null })),
            addTab: (tab: MediaTab) => set(s => ({ tabs: [...s.tabs, tab] })),
            setActiveTab: (activeTab) => set({ activeTab }),
            updateTabs: (incoming) => {
                const activeId = get().activeTab?.tabId;
                let activeTab = get().activeTab
                const tabs = get().tabs.map(t => {
                    const update = incoming.find(u => u.tabId === t.tabId)
                    const updated = update ? { ...t, ...update } : t
                    if (t.tabId === activeId) activeTab = updated
                    return updated
                })
                set({ tabs, activeTab })
            },
            removeTab: (tabId) => set(s => ({
                tabs: s.tabs.filter(t => t.tabId !== tabId),
                activeTab: s.activeTab?.tabId === tabId ? null : s.activeTab
            })),
            reset: () => set({ tabs: [], activeTab: null })
        }),
        { name: 'remote', storage: createJSONStorage(() => sessionStorage) }
    )
)

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null, remoteId: null, hostInfo: null, sessionId: null,
            setAuth: ({ token, remoteId, hostInfo, sessionId }) =>
                set({ token, remoteId, hostInfo, sessionId }),
            clearAuth: () =>
                set({ token: null, remoteId: null, hostInfo: null, sessionId: null }),
        }),
        { name: 'auth', storage: createJSONStorage(() => localStorage) }
    )
)