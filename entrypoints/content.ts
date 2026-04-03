import logger from "@/config/logger";
import { CHANNELS, MESSAGE_TYPES, supportedPlatforms } from "@/config/constants";
import { receiveMessage, sendMessage } from "@/utils/messaging/message";
import { Media } from "@/utils/media/media";

export default defineContentScript({
  matches: ["<all_urls>"],
  main(ctx) {
    const hostname = window.location.hostname;
    const isSupported = supportedPlatforms.some(p => hostname.includes(p));
    if (!isSupported) return;
    const cleanup = receiveMessage({
      channel: CHANNELS.TO_CONTENT_SCRIPT, handler: (msg) => {
        const result = Media.execute(msg.key, msg.value);
        if (result.ok)
          sendMessage({
            channel: CHANNELS.FROM_CONTENT_SCRIPT,
            payload: {
              type: MESSAGE_TYPES.STATE_UPDATE,
              intent: MESSAGE_TYPES.INTENT.REPORT,
              key: msg.key,
              value: msg.value
            }
          });
      },
    });

    ctx.onInvalidated(() => {
      cleanup();
      logger.debug("Content script invalidated:", hostname);
    });
  },
});