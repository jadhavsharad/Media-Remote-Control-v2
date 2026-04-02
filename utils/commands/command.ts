import { CHANNELS, MEDIA_STATE, MESSAGE_TYPES } from "@/config/constants";
import { Remotes } from "../storage/remote";
import logger from "@/config/logger";
import { doesTabExist, isMediaUrl } from "../validators/validators";
import { z } from "zod";

// TYPE FOR COMMAND HANDLER
type CommandHandler = (tabId: number, value: any) => Promise<any>;

// SCHEMA FOR COMMAND
const commandSchema = z.object({
  intent: z.literal(MESSAGE_TYPES.INTENT.SET),
  key: z.enum([MEDIA_STATE.MUTE, MEDIA_STATE.TIME, MEDIA_STATE.VOLUME, MEDIA_STATE.PLAYBACK]),
  remoteId: z.string(),
  tabId: z.number(),
  value: z.union([z.number(), z.string(), z.boolean()]),
  type: z.literal(MESSAGE_TYPES.STATE_UPDATE)
}).strict();


// REGISTRY FOR COMMANDS
const registry: Partial<Record<string, CommandHandler>> = {
  [MEDIA_STATE.MUTE]: async (tabId, value) => {
    await browser.tabs.update(tabId, { muted: Boolean(value) });
    return { ok: true, type: MESSAGE_TYPES.INTENT.SET, key: MEDIA_STATE.MUTE, value };
  },
  [MEDIA_STATE.PLAYBACK]: async (tabId, value) =>
    emitToTab(tabId, { key: MEDIA_STATE.PLAYBACK, value }),
  [MEDIA_STATE.TIME]: async (tabId, value) =>
    emitToTab(tabId, { key: MEDIA_STATE.TIME, value }),
  [MEDIA_STATE.VOLUME]: async (tabId, value) =>
    emitToTab(tabId, { key: MEDIA_STATE.VOLUME, value }),
}

// EXECUTES WHEN COMMAND IS RECEIVED FROM SERVER
export const executeCommand = async (msg: unknown) => {
  const command = commandSchema.safeParse(msg);
  if (!command.success) throw { ok: false, reason: "Invalid payload format" };

  const { key, remoteId, tabId, value } = command.data;
  const tab = await Remotes.getTab(remoteId)
  const handler = registry[key]

  if (!(await doesTabExist(tabId))) throw { ok: false, reason: "Tab does not exist." }
  if (tab && tab !== tabId) throw { ok: false, reason: "Remote/Tab mismatch. Please select tab." }
  if (!handler) throw { ok: false, reason: "Invalid command key." }

  try {
    return await handler(tabId, value)
  } catch (error) {
    throw { ok: false, reason: error }
  }
}

// USED TO EMIT COMMAND TO TAB CONTENT SCRIPT
const emitToTab = async <T>(tabId: number, payload: { key: string; value: T }) => {
  const message = { channel: CHANNELS.TO_CONTENT_SCRIPT, payload: { ...payload } };

  try {
    await browser.tabs.sendMessage(tabId, message);
  } catch {
    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: ["/content-scripts/content.js"],
      });
    } catch (error) {
      throw { ok: false, reason: error }
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    await browser.tabs.sendMessage(tabId, message);
  }

  return { ok: true, type: MESSAGE_TYPES.INTENT.SET, key: payload.key, value: payload.value };
};