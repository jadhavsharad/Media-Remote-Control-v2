import { supportedPlatforms } from "@/config/constants";
import { browser } from "wxt/browser"

// CHECK FOR VALID MEDIA ELEMENT
export const isValidMedia = (media: HTMLMediaElement) => {
    return (
        (media instanceof HTMLVideoElement || media instanceof HTMLAudioElement) &&
        media.isConnected &&
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
export const mediaTab = (hostname: string | undefined): boolean => {
    if (!hostname) return false;
    return supportedPlatforms.some((domain) => hostname.includes(domain));
}
