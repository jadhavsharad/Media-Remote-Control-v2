import { CHANNELS } from "@/config/constants";
import { isSocketConnected } from "@/utils/storage/storage";
import { receiveMessage } from "@/utils/messaging/message";
import { updateBadge } from "@/utils/background/badge";
import { setupOffscreenDocument } from "@/utils/background/offscreen";
import { handleOffScreenMessages, handlePopupMessages, handleContentScriptMessages } from "@/utils/background/handlers";
import { registerTabListeners } from "@/utils/background/tabs";

/*
 ! DO NOT INJECT ON STARTUP;
 ! DO NOT ATTEMPT REINJECTION ON SENDTOTABSAFE;
 ! DO NOT INJECT ON INSTALLED;
 */

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
  receiveMessage({ channel: CHANNELS.FROM_OFFSCREEN, handler: async (msg) => { await handleOffScreenMessages(msg) } });
  receiveMessage({ channel: CHANNELS.FROM_POPUP, handler: async (msg) => { await handlePopupMessages(msg) } });
  receiveMessage({ channel: CHANNELS.FROM_CONTENT_SCRIPT, handler: async (msg) => { await handleContentScriptMessages(msg) } });

  // TAB LISTENERS
  registerTabListeners();
});