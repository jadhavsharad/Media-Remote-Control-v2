interface TabMetadata {
    tabId: number;
    title: string | undefined;
    url: string | undefined;
    favIconUrl: string | undefined;
    muted: boolean | undefined;
}

interface MediaMetadata {
    mediaTitle: string;
    mediaArtist: string;
    mediaAlbum: string;
    mediaArtwork: string;
}

interface TabEntry {
    tabMetadata: TabMetadata;
    mediaMetadata: Partial<MediaMetadata>;
}

const cache = new Map<number, TabEntry>();

export const TabCache = {
    async setTabMeta(tabId: number, meta: TabMetadata): Promise<{ ok: boolean, reason?: any }> {
        let entry = cache.get(tabId) || { tabMetadata: {} as TabMetadata, mediaMetadata: {} as MediaMetadata };
        Object.assign(entry.tabMetadata, meta);
        cache.set(tabId, entry);
        return { ok: true }
    },

    async setMediaMeta(tabId: number, meta: Partial<MediaMetadata>): Promise<{ ok: boolean, reason?: any }> {
        const entry = cache.get(tabId);
        if (!entry) return { ok: false, reason: "Tab not registered" };
        Object.assign(entry.mediaMetadata, meta);
        cache.set(tabId, entry);
        return { ok: true }
    },

    async getTabMeta(tabId: number): Promise<{ ok: boolean, data?: any }> {
        const entry = cache.get(tabId);
        if (!entry) throw { ok: false, reason: "Tab not found" };
        return { ok: true, data: entry.tabMetadata };
    },

    async getMediaMeta(tabId: number): Promise<{ ok: boolean, data?: any }> {
        const entry = cache.get(tabId);
        if (!entry) throw { ok: false, reason: "Tab not found" };
        return { ok: true, data: entry.mediaMetadata };
    },

    async getMeta(tabId: number): Promise<{ ok: boolean, data?: any }> {
        const entry = cache.get(tabId);
        if (!entry) throw { ok: false, reason: "Tab not found" };
        return {
            ok: true,
            data: {
                ...entry.tabMetadata,
                ...entry.mediaMetadata
            }
        };
    },

    async removeTab(tabId: number): Promise<{ ok: boolean, reason?: any }> {
        cache.delete(tabId);
        return { ok: true }
    },

    getAll(): Array<TabMetadata & Partial<MediaMetadata>> {
        return Array.from(cache.entries()).map(([_, entry]) => ({
            ...entry.tabMetadata,
            ...entry.mediaMetadata
        }));
    },

    has(tabId: number): boolean {
        return cache.has(tabId);
    },

    sync(liveTabs: TabMetadata[]): { added: number[], removed: number[] } {
        const liveIds = new Set(liveTabs.map(t => t.tabId));
        const added: number[] = [], removed: number[] = [];

        for (const cachedId of cache.keys()) {
            if (!liveIds.has(cachedId)) {
                cache.delete(cachedId);
                removed.push(cachedId);
            }
        }

        for (const tab of liveTabs) {
            if (!cache.has(tab.tabId)) {
                cache.set(tab.tabId, { tabMetadata: tab, mediaMetadata: {} });
                added.push(tab.tabId);
            } else {
                const entry = cache.get(tab.tabId)!;
                Object.assign(entry.tabMetadata, tab);
            }
        }

        return { added, removed };
    }
}
