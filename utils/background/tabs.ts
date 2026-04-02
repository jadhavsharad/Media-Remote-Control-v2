import { isMediaUrl } from "@/utils/validators/validators";

// TODO: ENRICH WITH MEDIA STATE [ PLAYING, PAUSED, VOLUME, MUTE, TIME, DURATION, TITLE, FAVICON]
export const getMediaList = async () => {
  const tabs = await browser.tabs.query({});
  return tabs
    .filter((tab) => isMediaUrl(tab.url))
    .map((tab) => ({
      tabId: tab.id,
      title: tab.title || "Untitled",
      url: tab.url,
      favIconUrl: tab.favIconUrl || "",
      muted: tab.mutedInfo?.muted ?? false,
    }));
}

export const registerTabListeners = () => {
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" || changeInfo.url) {
      // TODO: SEND UPDATED TAB TO OFFSCREEN
    }
  });

  browser.tabs.onRemoved.addListener(async (tabId) => {
    // TODO: SEND REMOVED TABID TO OFFSCREEN
  });

  browser.tabs.onCreated.addListener(async (tab) => {
    // TODO: SEND CREATED TAB TO OFFSCREEN
  });
}
