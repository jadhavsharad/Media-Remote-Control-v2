import { MEDIA_STATE, MESSAGE_TYPES, CHANNELS, supportedPlatforms } from "@/config/constants";
import logger from "@/config/logger";
import { browser } from "wxt/browser"

// CHECK FOR VALID MEDIA STATE
export const isMediaState = (key: string) => {
    return Object.values(MEDIA_STATE).includes(key);
}

// CHECK FOR VALID MEDIA ELEMENT
export const isValidMedia = (media: HTMLMediaElement) => {
    return (
        (media instanceof HTMLVideoElement || media instanceof HTMLAudioElement) &&
        media.isConnected &&
        (!(media instanceof HTMLVideoElement) || !media.disablePictureInPicture) &&
        media.readyState >= 2
    );
}

// CHECK FOR VALID MESSAGE TYPE
export const isValidMessage = (type: string) => {
    return Object.values(MESSAGE_TYPES).includes(type);
}

// CHECK FOR VALID CHANNEL
export const isValidChannel = (channel: string) => {
    return Object.values(CHANNELS).includes(channel);
}

// CHECK FOR TAB EXIST
export const doesTabExist = async (tabId: number) => {
    if (!tabId) return false;
    try {
        await browser.tabs.get(tabId);
        return true;
    } catch {
        return false;
    }
}


// CHECK FOR MEDIA URL
export const isMediaUrl = (url: string | undefined): boolean => {
    if (!url) return false;

    try {
        const { hostname } = new URL(url);
        return supportedPlatforms.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`) || hostname.includes(`.${domain}`));
    } catch {
        return false;
    }
}
