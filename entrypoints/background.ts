import { CHANNELS } from "@/config/constants";
import { isSocketConnected } from "@/utils/storage/storage";
import { receiveMessage } from "@/utils/messaging/message";
import { updateBadge } from "@/utils/background/badge";
import { setupOffscreenDocument } from "@/utils/background/offscreen";
import { TabCache } from "@/utils/storage/tabs";
import logger from "@/config/logger";
import { mediaTab } from "@/utils/validators/validators";
import { receive, Notify } from "@/utils/background/handlers";
import { Remotes } from "@/utils/storage/remote";


export default defineBackground(() => {

  // GET INITIAL SOCKET CONNECTION STATUS AND UPDATE BADGE
  isSocketConnected.getValue().then((isConnected) => {
    updateBadge(isConnected);
  })
  // SETUP OFFSCREEN DOCUMENT
  setupOffscreenDocument();

  // STARTUP SYNC — POPULATE CACHE WITH EXISTING MEDIA TABS
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

  // WATCH FOR SOCKET CONNECTION CHANGES AND UPDATE BADGE
  isSocketConnected.watch((isConnected) => {
    updateBadge(isConnected);
  });
  // MESSAGE HANDLERS
  receiveMessage({ channel: CHANNELS.FROM_OFFSCREEN, handler: async (msg) => { await receive.offscreen(msg) } });
  receiveMessage({ channel: CHANNELS.FROM_POPUP, handler: async (msg) => { await receive.popup(msg) } });
  receiveMessage({ channel: CHANNELS.FROM_CONTENT_SCRIPT, handler: async (msg, sender) => { await receive.contentScript(msg, sender) } });

  // TAB LISTENERS
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

  // PERIODIC RECONCILIATION (30s fallback)
  setInterval(async () => {
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
  }, 30_000);
});