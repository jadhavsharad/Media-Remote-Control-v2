interface TabMetadata {
    tabId: number;
    title: string | undefined;
    url: string | undefined;
    favIconUrl: string | undefined;
    muted: boolean | undefined;
}

interface MediaMetadata {
    [key: string]: any;
    mediaTitle: string;
    mediaArtist: string;
    mediaAlbum: string;
    mediaArtwork: string;
}

interface TabEntry {
    tabMetadata: TabMetadata;
    mediaMetadata: Partial<MediaMetadata>;
}

type TabStore = Record<number, TabEntry>;

const cache = new Map<number, TabEntry>();

export const TabCache = {
    async setTabMeta(tabId: number, meta: TabMetadata): Promise<{ ok: boolean, reason?: any }> {
        let entry = cache.get(tabId) || { tabMetadata: {} as TabMetadata, mediaMetadata: {} as MediaMetadata };
        if (!entry) throw { ok: false, reason: "Tab not found" };
        Object.assign(entry.tabMetadata, meta);
        cache.set(tabId, entry);
        return { ok: true }
    },

    async setMediaMeta(tabId: number, meta: MediaMetadata): Promise<{ ok: boolean, reason?: any }> {
        let entry = cache.get(tabId) || { tabMetadata: {} as TabMetadata, mediaMetadata: {} as MediaMetadata };

        const { key, value, mediaTitle, mediaArtist, mediaAlbum, mediaArtwork } = meta;
        entry.mediaMetadata = {
            mediaTitle,
            mediaArtist,
            mediaAlbum,
            mediaArtwork
        };
        entry.mediaMetadata[key] = value;
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
    }
}
