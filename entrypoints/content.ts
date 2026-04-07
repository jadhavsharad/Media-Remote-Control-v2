import logger from "@/config/logger";
import { CHANNELS } from "@/config/constants";
import { receiveMessage } from "@/utils/messaging/message";
import { Media } from "@/utils/media/media";
import { mediaTab } from "@/utils/validators/validators";

export default defineContentScript({
  matches: ['<all_urls>'],
  allFrames: true,
  main(ctx) {
    if (!mediaTab(window.location.hostname)) return;

    Media.init()

    const messageListener = receiveMessage({
      channel: CHANNELS.TO_CONTENT_SCRIPT, handler: (msg, _, sendResponse) => {
        Media.execute(msg.key, msg.value);
      },
    });

    ctx.onInvalidated(() => {
      messageListener();
      Media.destroy()
    });
  },
});