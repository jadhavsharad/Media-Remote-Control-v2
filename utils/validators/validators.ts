import { supportedPlatforms } from "@/config/constants";
import { browser } from "wxt/browser"

// CHECK FOR VALID MEDIA ELEMENT
export const isValidMedia = (media: HTMLMediaElement) => {
    return (
        (media instanceof HTMLVideoElement || media instanceof HTMLAudioElement) &&
        media.isConnected &&
        (!(media instanceof HTMLVideoElement) || !media.disablePictureInPicture) &&
        media.readyState >= 2
    );
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
