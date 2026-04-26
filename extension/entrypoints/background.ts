import { CHANNELS } from "@/config/constants";
import { isSocketConnected } from "@/utils/storage/storage";
import { receiveMessage } from "@/utils/messaging/message";
import { updateBadge } from "@/utils/background/badge";
import { setupOffscreenDocument } from "@/utils/background/offscreen";
import { receive, listeners } from "@/utils/background/handlers";

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
  listeners.init();
  listeners.tabOnUpdated();
  listeners.tabOnRemoved();
  listeners.tabOnCreated();
  listeners.onUpdate();
  listeners.reconciliation;
})