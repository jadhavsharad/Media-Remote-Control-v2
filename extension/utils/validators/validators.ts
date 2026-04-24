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

const extractHostname = (input: string): string | null => {
    try {
        if (input.includes("://")) return new URL(input).hostname;
        return input;
    } catch {
        return null;
    }
}
export const mediaTab = (input: string | undefined): boolean => {
    if (!input) return false;

    const hostname = extractHostname(input);
    if (!hostname) return false;

    const normalized = hostname.replace(/^www\./, "");
    return supportedPlatforms.some((domain: string) => normalized === domain || normalized.endsWith(`.${domain}`)
    );
}
