
import { MESSAGE_TYPES } from "@/config/constants";
import { hostToken, isSocketConnected, sessionIdentity, pairingKey, pairingKeyExpiry, pairingKeyCreatedAt, connectedDevices } from "@/utils/storage/storage";
import { Remotes } from "@/utils/storage/remote";
import { executeCommand } from "@/utils/commands/command";
import { forwardToOffscreen } from "./offscreen";
import { getPlatformInfo } from "./platform";
import { TabCache } from "../storage/tabs";
import { mediaTab } from "@/utils/validators/validators";

const Socket = {
  onOpen: async () => {
    isSocketConnected.setValue(true)
    const token: string | null = await hostToken.getValue();
    const platformInfo = getPlatformInfo();
    forwardToOffscreen({ type: MESSAGE_TYPES.HOST_REGISTER, token, platformInfo })
  },
  onRegistered: async (msg: { type: string, sessionId: string, hostToken: string, remotes: any[] }): Promise<({ ok: boolean })> => {
    await hostToken.setValue(msg.hostToken)
    await sessionIdentity.setValue(msg.sessionId)
    await connectedDevices.setValue(msg.remotes)
    return { ok: true }
  },
  onClose: () => {
    isSocketConnected.setValue(false)
    sessionIdentity.setValue(null)
    Remotes.clear()
    connectedDevices.setValue([])
  }
}

export const receive = {
  offscreen: async (msg: any) => {
    if (!msg?.type) return;

    switch (msg.type) {
      case MESSAGE_TYPES.WS_OPEN:
        await Socket.onOpen()
        break;
      case MESSAGE_TYPES.WS_CLOSED:
      case MESSAGE_TYPES.WS_ERROR:
        Socket.onClose()
        break;
      case MESSAGE_TYPES.HOST_REGISTERED:
        await Socket.onRegistered(msg)
        break;
      case MESSAGE_TYPES.PAIRING_KEY:
        await pairingKey.setValue(msg.code)
        await pairingKeyExpiry.setValue(msg.pairingKeyExpiry)
        await pairingKeyCreatedAt.setValue(Date.now())
        break;

      case MESSAGE_TYPES.REMOTE_JOINED:
        if (!msg.id || !msg.sessionId) {
          console.error("Remote joined message missing required fields")
          return;
        }

        // TODO: NOTIFY SERVER ON THIS
        if (msg.sessionId !== await sessionIdentity.getValue()) {
          console.error("Remote is not registered for this session")
          return;
        }

        if (msg.invalidateCode) {
          await pairingKey.removeValue()
          await pairingKeyExpiry.removeValue()
          await pairingKeyCreatedAt.removeValue()
        }

        await navigator.locks.request("connectedDevices", async () => {
          await Remotes.add(msg.id)
          const currentDevices = await connectedDevices.getValue() || [];
          const filter = currentDevices.filter(device => device.id !== msg.id);
          await connectedDevices.setValue([...filter, { id: msg.id, browser: msg.browser, modelName: msg.modelName, platform: msg.platform, connectedAt: msg.connectedAt }]);
        })

        Notify.all()
        break;
      case MESSAGE_TYPES.SELECT_ACTIVE_TAB:
        await Remotes.setTab(msg.remoteId, msg.tabId);
        break;
      case MESSAGE_TYPES.STATE_UPDATE:
        try {
          await executeCommand(msg);
        } catch (error) {
          console.error("Error in executing command: ", error)
        }
        break;
      case MESSAGE_TYPES.MEDIA_BOOKMARK:
        const tab = await browser.tabs.get(msg.tabId);
        if (!tab.url) throw { ok: false, reason: "Tab URL not found" };
        let bookmarkUrl = tab.url;
        await browser.bookmarks.create({
          title: tab.title || "Bookmark by Media Remote Control Extension",
          url: bookmarkUrl
        });
        break;
      case MESSAGE_TYPES.NEW_TAB:
        await handleNewTab(msg.url)
        break;
    }
  },
  popup: async (msg: any) => {
    forwardToOffscreen(msg)
  },
  contentScript: async (msg: any, sender: any) => {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    const { type, intent, key, value, ...mediaMeta } = msg;
    const update = { ...mediaMeta, ...(key !== undefined ? { [key]: value } : {}) };

    const result = await TabCache.setMediaMeta(tabId, { ...update, mediaArtwork: maxResImage(sender.tab.url, update.mediaArtwork) });

    if (!result.ok) {
      // Tab not registered — auto-register from sender.tab if it's a media tab
      if (sender.tab?.url && mediaTab(sender.tab.url)) {
        await TabCache.setTabMeta(tabId, {
          tabId,
          title: sender.tab.title,
          url: sender.tab.url,
          favIconUrl: sender.tab.favIconUrl,
          muted: sender.tab.mutedInfo?.muted,
        });
        await TabCache.setMediaMeta(tabId, { ...update, mediaArtwork: maxResImage(sender.tab.url, update.mediaArtwork) });
      } else {
        return;
      }
    }

    Notify.tab(tabId);
  }
}

const Notify = {
  all: debounced(() => {
    forwardToOffscreen({ type: MESSAGE_TYPES.MEDIA_LIST, tabs: TabCache.getAll() });
  }),
  tab: debounced(async (tabId: number) => {
    try {
      const { data } = await TabCache.getMeta(tabId);
      forwardToOffscreen({ type: MESSAGE_TYPES.STATE_UPDATE, tabs: [data] });
    } catch { }
  }),
  removed: debounced((tabId: number) => {
    forwardToOffscreen({ type: MESSAGE_TYPES.MEDIA_TAB_REMOVED, tabId });
  }),
  created: debounced((tabId: number) => {
    forwardToOffscreen({ type: MESSAGE_TYPES.MEDIA_TAB_CREATED, tabId });
  }),
}

export const listeners = {
  init: async () => {
    const allTabs = await browser.tabs.query({});
    const mediaTabs = allTabs.filter(t => mediaTab(t.url));
    const result = TabCache.sync(mediaTabs.map(t => ({
      tabId: t.id!,
      title: t.title,
      url: t.url,
      favIconUrl: t.favIconUrl,
      muted: t.mutedInfo?.muted,
    })));
  },
  tabOnUpdated: () => {
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      // Tab navigated AWAY from media domain — clean up
      if (!mediaTab(tab.url)) {
        if (TabCache.has(tabId)) {
          await TabCache.removeTab(tabId);
          Notify.removed(tabId);
        }
        return;
      }
      // Tab is on a media domain — update metadata
      if (changeInfo.status === "complete" || changeInfo.url || changeInfo.title || changeInfo.mutedInfo !== undefined) {
        try {
          await TabCache.setTabMeta(tabId, {
            tabId: tabId,
            title: tab.title,
            url: tab.url,
            favIconUrl: tab.favIconUrl,
            muted: tab.mutedInfo?.muted,
          });
          Notify.all();
        } catch (error) {
          console.error("Error updating tab:", error)
        }
      }
    });
  },

  tabOnRemoved: () => {
    browser.tabs.onRemoved.addListener(async (tabId) => {
      try {
        await TabCache.removeTab(tabId);
        Notify.removed(tabId);
        // Clean up remote contexts pointing to this tab
        const remotes = await Remotes.getAll();
        for (const [remoteId, ctx] of Object.entries(remotes)) {
          if (ctx.tabId === tabId) {
            await Remotes.setTab(remoteId, null);
          }
        }
      } catch (error) {
        console.error("Error removing tab:", error)
      }
    });
  },

  tabOnCreated: () => {
    browser.tabs.onCreated.addListener(async (tab) => {
      if (tab.id === undefined) return;
      if (!mediaTab(tab.url)) return;

      try {
        await TabCache.setTabMeta(tab.id, {
          tabId: tab.id,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          muted: tab.mutedInfo?.muted,
        });
        Notify.created(tab.id!);
      } catch (error) {
        console.error("Error creating tab:", error)
      }
    });
  },

  reconciliation: setInterval(async () => {
    const allTabs = await browser.tabs.query({});
    const mediaTabs = allTabs.filter(t => mediaTab(t.url));
    const result = TabCache.sync(mediaTabs.map(t => ({
      tabId: t.id!,
      title: t.title,
      url: t.url,
      favIconUrl: t.favIconUrl,
      muted: t.mutedInfo?.muted,
    })));
    if (result.added.length || result.removed.length) {
      Notify.all();
    }
  }, 30_000)
}

async function handleNewTab(url: string) {
  if (!url) return;
  let targetUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    targetUrl = "https://" + url;
  }
  try {
    await browser.tabs.create({ url: targetUrl, active: true });
  } catch (err) {
    console.error("Failed to open new tab:", err);
  }
}
