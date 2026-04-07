import { CHANNELS } from "@/config/constants";
import { isSocketConnected } from "@/utils/storage/storage";
import { receiveMessage } from "@/utils/messaging/message";
import { updateBadge } from "@/utils/background/badge";
import { setupOffscreenDocument } from "@/utils/background/offscreen";
import { TabCache } from "@/utils/storage/tabs";
import logger from "@/config/logger";
import { mediaTab } from "@/utils/validators/validators";
import { receive } from "@/utils/background/handlers";


export default defineBackground(() => {

  // GET INITIAL SOCKET CONNECTION STATUS AND UPDATE BADGE
  isSocketConnected.getValue().then((isConnected) => {
    updateBadge(isConnected);
  })
  // SETUP OFFSCREEN DOCUMENT
  setupOffscreenDocument();
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
    if (!mediaTab(tab.url)) return;
    if (changeInfo.status === "complete" || changeInfo.url || changeInfo.title || changeInfo.mutedInfo !== undefined) {
      TabCache.setTabMeta(tabId, {
        tabId: tabId,
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
        muted: tab.mutedInfo?.muted,
      }).then(async (res) => {
        logger.debug("Tab updated:", await TabCache.getMeta(tabId))
      }).catch((error) => {
        logger.error("Error updating tab:", error)
      })
    }
  });

  browser.tabs.onRemoved.addListener(async (tabId) => {
    // TODO: SEND REMOVED TABID TO OFFSCREEN
  });
  browser.tabs.onCreated.addListener(async (tab) => {
    // TODO: SEND CREATED TAB TO OFFSCREEN
  });
});