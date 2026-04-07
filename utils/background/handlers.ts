import logger from "@/config/logger";
import { MESSAGE_TYPES } from "@/config/constants";
import { hostToken, isSocketConnected, sessionIdentity, pairingKey, pairingKeyExpiry } from "@/utils/storage/storage";
import { Remotes } from "@/utils/storage/remote";
import { executeCommand } from "@/utils/commands/command";
import { isProd } from "@/config/config";
import { forwardToOffscreen } from "./offscreen";
import { getPlatformInfo } from "./platform";
import { TabCache } from "../storage/tabs";

const Socket = {
  onOpen: async () => {
    isSocketConnected.setValue(true)
    const token: string | null = await hostToken.getValue();
    const platformInfo = getPlatformInfo();
    forwardToOffscreen({ type: MESSAGE_TYPES.HOST_REGISTER, token, platformInfo })
  },
  onRegistered: async (msg: { type: string, SESSION_IDENTITY: string, hostToken: string }): Promise<({ ok: boolean })> => {
    await hostToken.setValue(msg.hostToken)
    await sessionIdentity.setValue(msg.SESSION_IDENTITY)
    return { ok: true }
  },
  onClose: () => {
    isSocketConnected.setValue(false)
    sessionIdentity.setValue(null)
    Remotes.clear()
  }
}

export const receive = {
  offscreen: async (msg: any) => {
    if (!msg?.type) return;

    switch (msg.type) {
      case MESSAGE_TYPES.WS_OPEN:
        await Socket.onOpen()
        break;
      case MESSAGE_TYPES.WS_CLOSED:
      case MESSAGE_TYPES.WS_ERROR:
        Socket.onClose()
        break;
      case MESSAGE_TYPES.HOST_REGISTERED:
        const result = await Socket.onRegistered(msg)
        logger.info("Host Registered:", result.ok)
        // if (isProd) await Media.sendList()
        break;
      case MESSAGE_TYPES.PAIRING_KEY:
        await pairingKeyExpiry.setValue(msg.ttl)
        await pairingKey.setValue(msg.code)
        break;

      // TODO: NOTIFY FROM SERVER EACH TIME A REMOTE JOINS OR ON HOST RECONNECTS OR ON REMOTE RECONNECTS
      case MESSAGE_TYPES.REMOTE_JOINED:
        await Remotes.add(msg.remoteId, Date.now(), "generic")
        // await Media.sendList()
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
  },
  popup: async (msg: any) => {
    forwardToOffscreen(msg)
  },
  contentScript: async (msg: any, sender: any) => {
    TabCache.setMediaMeta(sender.tab.id, msg).then(async (res) => {
      logger.debug("Media Meta Set: ", await TabCache.getMeta(sender.tab.id))
    }).catch((error) => {
      logger.error("Media Meta Set Error: ", error)
    })
  }
}