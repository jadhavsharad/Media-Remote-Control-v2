export interface PlatformInfo {
  os: string;
  browser: string;
  extensionVersion: string;
}

export const getPlatformInfo = (): PlatformInfo => {
  // @ts-ignore
  const brands = navigator.userAgentData?.brands ?? [];
  const chromiumBrand = brands.find((b: any) => !b.brand.includes("Not") && b.brand !== "Chromium");

  return {
    // @ts-ignore
    os: navigator.userAgentData?.platform ?? "Unknown",
    browser: chromiumBrand?.brand ?? "Unknown",
    extensionVersion: browser.runtime.getManifest().version,
  };
}
