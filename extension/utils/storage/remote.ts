import { storage } from 'wxt/utils/storage';

type RemoteCtx = {
    tabId: number | null;
    model?: string;
    connectedAt?: number | null
};
type RemoteMap = Record<string, RemoteCtx>;

const store = storage.defineItem<RemoteMap>('local:remoteContext', { defaultValue: {} });

export const Remotes = {

    async add(remoteId: string, connectedAt: number, model?: string): Promise<{ok: boolean}> {
        const map = await store.getValue();
        await store.setValue({ ...map, [remoteId]: { tabId: null, model, connectedAt } });
        return {ok: true};
    },

    async remove(remoteId: string): Promise<void> {
        const map = await store.getValue();
        const { [remoteId]: _, ...rest } = map;
        await store.setValue(rest);
    },

    async setTab(remoteId: string, tabId: number | null): Promise<{ok: boolean}> {
        const map = await store.getValue();
        await store.setValue({ ...map, [remoteId]: {...map[remoteId], tabId } });
        return {ok: true};
    },

    async getTab(remoteId: string): Promise<number | null> {
        const map = await store.getValue();
        return map[remoteId]?.tabId ?? null;
    },

    async get(remoteId: string): Promise<RemoteCtx | null> {
        const map = await store.getValue();
        return map[remoteId] ?? null;
    },

    async getAll(): Promise<RemoteMap> {
        return store.getValue();
    },

    async clear(): Promise<void> {
        await store.setValue({});
    },

    watch(callback: (map: RemoteMap) => void): () => void {
        return store.watch(callback);
    },

};