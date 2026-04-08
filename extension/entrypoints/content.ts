
import { CHANNELS } from "@/config/constants";
import { receiveMessage } from "@/utils/messaging/message";
import { Media } from "@/utils/media/media";
import { mediaTab } from "@/utils/validators/validators";

export default defineContentScript({
  matches: [
    'https://youtube.com/*',
    'https://music.youtube.com/*',
    'https://open.spotify.com/*',
    'https://netflix.com/*',
    'https://primevideo.com/*',
    'https://hotstar.com/*',
    'https://jiohotstar.com/*',
    'https://sonyliv.com/*',
    'https://music.amazon.com/*',
    'https://mxplayer.com/*',
    'https://vimeo.com/*',
    'https://jiosaavn.com/*',
    'https://music.apple.com/*',
  ],
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