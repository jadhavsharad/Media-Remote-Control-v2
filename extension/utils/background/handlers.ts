import logger from "@/config/logger";
import { MESSAGE_TYPES } from "@/config/constants";
import { hostToken, isSocketConnected, sessionIdentity, pairingKey, pairingKeyExpiry, pairingKeyCreatedAt } from "@/utils/storage/storage";
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
  onRegistered: async (msg: { type: string, SESSION_IDENTITY: string, hostToken: string }): Promise<({ ok: boolean })> => {
    await hostToken.setValue(msg.hostToken)
    await sessionIdentity.setValue(msg.SESSION_IDENTITY)
    return { ok: true }
  },
  onClose: () => {
    isSocketConnected.setValue(false)
    sessionIdentity.setValue(null)
    Remotes.clear()
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
        const result = await Socket.onRegistered(msg)
        logger.info("Host Registered:", result.ok)
        // if (isProd) await Media.sendList()
        break;
      case MESSAGE_TYPES.PAIRING_KEY:
        await pairingKey.setValue(msg.code)
        await pairingKeyExpiry.setValue(msg.pairingKeyExpiry).then(async () => {
          await pairingKeyCreatedAt.setValue(Date.now())
        })
        break;

      // TODO: NOTIFY FROM SERVER EACH TIME A REMOTE JOINS OR ON HOST RECONNECTS OR ON REMOTE RECONNECTS
      case MESSAGE_TYPES.REMOTE_JOINED:
        await Remotes.add(msg.remoteId, Date.now(), "generic")
        Notify.all()
        break;
      case MESSAGE_TYPES.SELECT_ACTIVE_TAB:
        Remotes.setTab(msg.remoteId, msg.tabId).then(async (res) => {
          // TODO: SEND CONFIRMATION TO CLIENT
          logger.debug("[TAB SET]: ", res)
        })
        break;
      case MESSAGE_TYPES.STATE_UPDATE:
        await executeCommand(msg).then((res) => {
          // TODO: SEND CONFIRMATION TO CLIENT
          logger.debug("[COMMAND RESPONSE]: ", res)
        }).catch((error) => {
          logger.debug("ERROR: ", error)
        })
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

    const result = await TabCache.setMediaMeta(tabId, update);

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
        await TabCache.setMediaMeta(tabId, update);
      } else {
        return;
      }
    }

    Notify.tab(tabId);
  }
}

const Notify = {
  all: debounced(() => {
    logger.info("[NOTIFY:ALL]", TabCache.getAll());
    forwardToOffscreen({ type: MESSAGE_TYPES.MEDIA_LIST, tabs: TabCache.getAll() });
  }),
  tab: debounced(async (tabId: number) => {
    try {
      const { data } = await TabCache.getMeta(tabId);
      forwardToOffscreen({ type: MESSAGE_TYPES.STATE_UPDATE, tab: data });
      logger.info("[NOTIFY:TAB]", data);
    } catch { }
  }),
  removed: debounced((tabId: number) => {
    Notify.all()
    logger.info("[NOTIFY:REMOVED]", tabId);
  }),
}

export const listeners = {
  init: () => {
    browser.tabs.query({}).then((allTabs) => {
      const mediaTabs = allTabs.filter(t => mediaTab(t.url));
      const result = TabCache.sync(mediaTabs.map(t => ({
        tabId: t.id!,
        title: t.title,
        url: t.url,
        favIconUrl: t.favIconUrl,
        muted: t.mutedInfo?.muted,
      })));
      if (result.added.length || result.removed.length) {
        logger.debug("Startup sync:", result);
      }
    });
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
        TabCache.setTabMeta(tabId, {
          tabId: tabId,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          muted: tab.mutedInfo?.muted,
        }).then(() => {
          Notify.tab(tabId);
        }).catch((error) => {
          logger.error("Error updating tab:", error)
        })
      }
    });
  },

  tabOnRemoved: () => {
    browser.tabs.onRemoved.addListener(async (tabId) => {
      TabCache.removeTab(tabId).then(async () => {
        Notify.removed(tabId);
        // Clean up remote contexts pointing to this tab
        const remotes = await Remotes.getAll();
        for (const [remoteId, ctx] of Object.entries(remotes)) {
          if (ctx.tabId === tabId) {
            await Remotes.setTab(remoteId, null);
          }
        }
      }).catch((error) => {
        logger.error("Error removing tab:", error)
      })
    });
  },

  tabOnCreated: () => {
    browser.tabs.onCreated.addListener(async (tab) => {
      if (tab.id === undefined) return;
      if (!mediaTab(tab.url)) return;

      TabCache.setTabMeta(tab.id, {
        tabId: tab.id,
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
        muted: tab.mutedInfo?.muted,
      }).then(() => {
        Notify.tab(tab.id!);
      }).catch((error) => {
        logger.error("Error creating tab:", error)
      })
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
      logger.debug("Reconciliation drift:", result);
      Notify.all();
    }
  }, 30_000)
}