import { CHANNELS } from "@/config/constants";
import { sendMessage } from "@/utils/messaging/message";

const offscreenUrl = "/offscreen.html";
let creating: Promise<void> | null = null;

export const setupOffscreenDocument = async () => {
  const offscreen = browser.runtime.getURL(offscreenUrl);

  const existingContexts = await browser.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreen]
  });

  if (existingContexts.length > 0) return;

  if (creating) {
    await creating;
  } else {
    creating = browser.offscreen.createDocument({
      url: offscreenUrl,
      reasons: ['WEB_RTC'],
      justification: 'Persistent Websocket Connection',
    });
    await creating;
    creating = null;
  }
}

export const forwardToOffscreen = async (payload: object | string) => {
  await setupOffscreenDocument();
  sendMessage({ channel: CHANNELS.TO_OFFSCREEN, payload });
}
