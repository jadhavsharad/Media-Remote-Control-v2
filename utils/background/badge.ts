import { activeIcons, inactiveIcons } from "@/config/constants";

export const updateBadge = (isConnected: boolean) => {
  (!isConnected) ?
    browser.action.setIcon({ path: inactiveIcons }) :
    browser.action.setIcon({ path: activeIcons });
}
