export interface MediaTab {
    favIconUrl: string;
    muted: boolean;
    tabId: number;
    title: string;
    url: string;
    volume?: number;
    mediaTitle?: string;
    mediaArtist?: string;
    mediaAlbum?: string;
    mediaArtwork?: string;
    playback?: string;
    ended?: boolean;
}

export interface RemoteStore {
    tabs: MediaTab[]
    activeTab: MediaTab | null
    setTabs: (tabs: MediaTab[]) => void
    addTab: (tab: MediaTab) => void
    setActiveTab: (tab: MediaTab | null) => void
    updateTabs: (incoming: MediaTab[]) => void
    removeTab: (tabId: number) => void
    isConnected: boolean
    setConnected: (isConnected: boolean) => void
}

export interface AuthStore {
    token: string | null
    remoteId: string | null
    hostInfo: any | null
    sessionId: string | null
    setAuth: (data: { token: string, remoteId: string, hostInfo: any, sessionId: string }) => void
    clearAuth: () => void
}