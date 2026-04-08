import logger from "@/config/logger";

// REUSABLE FUNCTION TO SEND MESSAGES TO SERVER, OFFSCREEN, POPUP, CONTENT SCRIPT
export const sendMessage = ({ channel, payload }: { channel: string, payload: any }) => {
  browser.runtime.sendMessage({ channel, payload });
}

// REUSABLE FUNCTION TO RECEIVE MESSAGES FROM (SERVER, OFFSCREEN, POPUP, CONTENT SCRIPT)
// RETURNS A CLEANUP FUNCTION TO REMOVE THE LISTENER
export const receiveMessage = ({ channel, handler }: { channel: string, handler: (msg: any, sender: any, sendResponse: any) => void }) => {
  const listener = (msg: any, sender: any, sendResponse: any) => {
    if (sender.id !== browser.runtime.id) return;
    if (!msg || !msg.channel) return;
    if (msg.channel !== channel) return;
    return handler(msg.payload, sender, sendResponse);
  };
  browser.runtime.onMessage.addListener(listener);
  return () => browser.runtime.onMessage.removeListener(listener);
}

