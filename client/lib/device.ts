const getDeviceModel = async () => {
  const nav = navigator as any;
  if (nav.userAgentData) {
    const data = await nav.userAgentData.getHighEntropyValues(["model"]);
    return data.model || "Unknown";
  }
  return null;
}

const getPlatform = async () => {
  const nav = navigator as any;
  if (nav.userAgentData) {
    const data = await nav.userAgentData.getHighEntropyValues(["platform"]);
    return data.platform || nav.userAgentData.platform || "Unknown";
  }
  return null;
}

const getBrowser = () => {
  const nav = navigator as any;
  if (nav.userAgentData && nav.userAgentData.brands?.length > 0) {
    const brandObj = nav.userAgentData.brands.at(-1);
    return brandObj?.brand || "Unknown";
  }
  return null;
}

export const getDeviceInfo = async () => {
  return {
    browser: getBrowser(),
    platform: await getPlatform(),
    modelName: await getDeviceModel()
  };
}