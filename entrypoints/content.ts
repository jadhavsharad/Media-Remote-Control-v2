import logger from "@/config/logger";
import { CHANNELS, MESSAGE_TYPES, supportedPlatforms } from "@/config/constants";
import { receiveMessage, sendMessage } from "@/utils/messaging/message";
import { Media } from "@/utils/media/media";

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  main(ctx) {
    const hostname = window.location.hostname;
    const isSupported = supportedPlatforms.some(p => hostname.includes(p));
    if (!isSupported) return;

    Media.init()

    const messageListener = receiveMessage({
      channel: CHANNELS.TO_CONTENT_SCRIPT, handler: (msg, _, sendResponse) => {
         Media.execute(msg.key, msg.value);
      },
    });

    ctx.onInvalidated(() => {
      messageListener();
      Media.destroy()
      logger.debug("Content script invalidated:", hostname);
    });
  },
});