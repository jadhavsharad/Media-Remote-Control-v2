import logger from "@/config/logger";
import { MESSAGE_TYPES } from "@/config/constants";
import { hostToken, isSocketConnected, sessionIdentity, pairingKey, pairingKeyExpiry } from "@/utils/storage/storage";
import { Remotes } from "@/utils/storage/remote";
import { executeCommand } from "@/utils/commands/command";
import { isProd } from "@/config/config";
import { forwardToOffscreen } from "./offscreen";
import { getPlatformInfo } from "./platform";
import { getMediaList } from "./tabs";


// SHARED: RESET STATE ON DISCONNECT
const onDisconnect = () => {
  isSocketConnected.setValue(false)
  sessionIdentity.setValue(null)
  Remotes.clear()
}

// SHARED: SYNC MEDIA LIST TO OFFSCREEN → SERVER
const syncMediaList = async () => {
  forwardToOffscreen({ type: MESSAGE_TYPES.MEDIA_LIST, tabs: await getMediaList() })
}

// RUNS WHEN SOCKET OPENS
const onSocketOpen = async () => {
  isSocketConnected.setValue(true)

  // RETRIEVE HOST TOKEN FROM STORAGE
  const token: string | null = await hostToken.getValue();

  // GET PLATFORM DETAILS
  const platformInfo = getPlatformInfo();

  // SEND MESSAGE TO SERVER TO REGISTER HOST
  forwardToOffscreen({ type: MESSAGE_TYPES.HOST_REGISTER, token, platformInfo })
}

// RUNS WHEN HOST IS REGISTERED
const onHostRegistered = async (msg: { type: string, SESSION_IDENTITY: string, hostToken: string }) => {
  try {
    await hostToken.setValue(msg.hostToken)
    await sessionIdentity.setValue(msg.SESSION_IDENTITY)
    return { ok: true }
  } catch (e) {
    logger.error("Error: ", e)
    return { ok: false, reason: e }
  }
}


// SERVER + OFFSCREEN MESSAGES
export const handleOffScreenMessages = async (msg: any) => {
  if (!msg?.type) return;

  switch (msg.type) {
    case MESSAGE_TYPES.WS_OPEN:
      await onSocketOpen()
      break;
    case MESSAGE_TYPES.WS_CLOSED:
    case MESSAGE_TYPES.WS_ERROR:
      onDisconnect()
      break;
    case MESSAGE_TYPES.HOST_REGISTERED:
      const result = await onHostRegistered(msg)
      logger.info("[HOST REGISTERED]:", result)
      if (isProd) await syncMediaList()
      break;
    case MESSAGE_TYPES.PAIRING_KEY:
      await pairingKeyExpiry.setValue(msg.ttl)
      await pairingKey.setValue(msg.code)
      break;

    // TODO: NOTIFY FROM SERVER EACH TIME A REMOTE JOINS OR ON HOST RECONNECTS OR ON REMOTE RECONNECTS
    case MESSAGE_TYPES.REMOTE_JOINED:
      await Remotes.add(msg.remoteId, Date.now(), "generic")
      await syncMediaList()
      //? MAYBE SEND ACTIVE TAB ID AS WELL - REMOTE SPECIFIC (NEEDS TO IMPLEMENT IN SERVER AND CLIENT AS WELL)
      break;
    case MESSAGE_TYPES.SELECT_ACTIVE_TAB:
      Remotes.setTab(msg.remoteId, msg.tabId).then(async (res) => {
        // TODO: SEND CONFIRMATION TO CLIENT
        logger.debug("[TAB SET]: ", res)
      })
      break;
    case MESSAGE_TYPES.STATE_UPDATE:
      await executeCommand(msg).then((res) => {
        // TODO: SEND CONFIRMATION TO CLIENT
        logger.debug("[COMMAND RESPONSE]: ", res)
      }).catch((error) => {
        logger.debug("ERROR: ", error)
      })
      break;
  }
}

// POPUP MESSAGES
export const handlePopupMessages = async (msg: any) => {
  forwardToOffscreen(msg)
}

// CONTENT SCRIPT MESSAGES
export const handleContentScriptMessages = async (msg: { key: string, value: any }) => {
  logger.debug("[CONTENT REPORT]:", msg.key, "→", msg.value);
}
