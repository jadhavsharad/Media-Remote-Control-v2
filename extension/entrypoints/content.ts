
import { CHANNELS } from "@/config/constants";
import { platforms } from "@/config/constants";
import { receiveMessage } from "@/utils/messaging/message";
import { Media } from "@/utils/media/media";


export default defineContentScript({
  matches: platforms,
  main(ctx) {
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