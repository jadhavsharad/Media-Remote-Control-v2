import { connectedDevices, Device } from "@/utils/storage/storage"
import { Remotes } from "@/utils/storage/remote"
import { sendMessage } from "@/utils/messaging/message"
import { CHANNELS, MESSAGE_TYPES } from "@/config/constants"
import { useStorageItem } from "../../hooks/useStorageItem"
import { IoArrowBack } from "react-icons/io5"
import { LuSmartphone, LuMonitor, LuTablet, LuGlobe, LuCopy, LuCheck, LuTrash2 } from "react-icons/lu"
import { SiGooglechrome, SiFirefox, SiSafari, SiOpera } from "react-icons/si"
import { TbBrowser, TbDeviceDesktop } from "react-icons/tb"
import { RiRemoteControlLine } from "react-icons/ri"
import { useState } from "react"

/** Pick a device-type icon based on platform/os hint */
const getDeviceIcon = (device: Device) => {
  const p = (device.platform || "").toLowerCase();
  if (p.includes("android") || p.includes("ios") || p.includes("iphone")) return LuSmartphone;
  if (p.includes("ipad") || p.includes("tablet")) return LuTablet;
  if (p.includes("windows") || p.includes("mac") || p.includes("linux")) return LuMonitor;
  return LuGlobe;
};

/** Pick a browser icon */
const getBrowserIcon = (browser?: string) => {
  const b = (browser || "").toLowerCase();
  if (b.includes("chrome")) return SiGooglechrome;
  if (b.includes("firefox")) return SiFirefox;
  if (b.includes("safari")) return SiSafari;
  if (b.includes("opera")) return SiOpera;
  return TbBrowser;
};

/** Format relative time e.g. "2h ago", "just now" */
const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/** Truncate UUID for display: first 8 chars */
const truncateId = (id: string) => {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
};

const DeviceCard = ({ device, onRemove }: { device: Device; onRemove: (id: string) => void }) => {
  const [copiedId, setCopiedId] = useState(false);
  const DeviceIcon = getDeviceIcon(device);
  const BrowserIcon = getBrowserIcon(device.browser);

  const copyId = () => {
    navigator.clipboard.writeText(device.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="rounded-lg bg-white/5 border border-white/5 p-3 transition-colors hover:bg-white/[0.07]">
      {/* Top row: icon + name + time */}
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center" aria-hidden="true">
          <DeviceIcon className="text-base text-white/80" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate" aria-label={`Device model: ${device.modelName || "Unknown device"}`}>
            {device.modelName || "Unknown Device"}
          </p>
          <p className="text-[10px] text-white/30 mt-0.5" aria-label={`Connected ${formatRelativeTime(device.connectedAt)}`}>
            Connected {formatRelativeTime(device.connectedAt)}
          </p>
        </div>
      </div>

      {/* Detail rows */}
      <div className="mt-2.5 flex flex-col gap-1.5">
        {/* OS */}
        <div className="flex items-center gap-2 text-[11px]">
          <TbDeviceDesktop className="text-white/30 shrink-0" aria-hidden="true" />
          <span className="text-white/40 w-10 shrink-0">OS</span>
          <span className="text-white/70 truncate">{device.platform || "Unknown"}</span>
        </div>

        {/* Browser */}
        <div className="flex items-center gap-2 text-[11px]">
          <BrowserIcon className="text-white/30 shrink-0" aria-hidden="true" />
          <span className="text-white/40 w-10 shrink-0">Browser</span>
          <span className="text-white/70 truncate">{device.browser || "Unknown"}</span>
        </div>

        {/* Remote ID */}
        <div className="flex items-center gap-2 text-[11px]">
          <RiRemoteControlLine className="text-white/30 shrink-0" aria-hidden="true" />
          <span className="text-white/40 w-10 shrink-0">ID</span>
          <span className="text-white/70 font-mono text-[10px] truncate" title={device.id} aria-label={`Remote ID: ${device.id}`}>
            {truncateId(device.id)}
          </span>
          <button
            onClick={copyId}
            className="ml-auto p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label={copiedId ? "Remote ID copied" : "Copy remote ID to clipboard"}
            title={copiedId ? "Copied!" : "Copy ID"}
          >
            {copiedId ? <LuCheck className="text-xs text-white/60" /> : <LuCopy className="text-xs text-white/30 hover:text-white/60" />}
          </button>
        </div>
      </div>

      {/* Remove button */}
      <button onClick={() => onRemove(device.id)} className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-white/5 hover:bg-red-500/15 text-white/40 hover:text-red-400 text-[11px] transition-colors cursor-pointer" aria-label={`Remove device ${device.modelName || device.id}`} title={`Disconnect and remove ${device.modelName || "this device"}`}>
        <LuTrash2 className="text-xs" />
        Remove
      </button>
    </div>
  );
};

const PairedDevices = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [devices, setDevices] = useStorageItem(connectedDevices);

  const handleRemove = async (id: string) => {
    const updated = (devices || []).filter(d => d.id !== id);
    setDevices(updated);
    await Remotes.remove(id);
    sendMessage({ channel: CHANNELS.FROM_POPUP, payload: { type: MESSAGE_TYPES.KICK_REMOTE, remoteId: id } });
  };

  const deviceList = devices?.length ? devices : [];
  const deviceCount = deviceList.length;

  return (
    <div className="w-60 bg-sky-950/50 text-white flex flex-col antialiased">
      <div className="flex items-center justify-between px-3 py-3">
        <button onClick={() => onNavigate('HOME')} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors cursor-pointer" aria-label="Go back to home" title="Back to home">
          <IoArrowBack className="text-lg" />
        </button>
        <div className="flex items-center gap-1.5">
          <RiRemoteControlLine className="text-white text-sm" />
          <h1 className="text-sm font-semibold tracking-wide">Paired Remotes</h1>
        </div>
        <div className="w-8 flex justify-center">
          <span className="text-xs font-bold text-white/50 bg-white/10 rounded-full w-5 h-5 flex items-center justify-center" aria-label={`${deviceCount} paired device${deviceCount !== 1 ? "s" : ""}`} title={`${deviceCount} device${deviceCount !== 1 ? "s" : ""}`}>
            {deviceCount}
          </span>
        </div>
      </div>
      <div className="px-3 pb-3 flex flex-col gap-2">
        {deviceCount > 0 ? (
          deviceList.map((device) => (
            <DeviceCard key={device.id} device={device} onRemove={handleRemove} />
          ))
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3" aria-hidden="true">
              <RiRemoteControlLine className="text-2xl text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/50">No remotes paired</p>
            <p className="text-[10px] text-white/30 mt-1 max-w-[180px] leading-tight">
              Generate a pairing key to connect a remote device
            </p>
            <button onClick={() => onNavigate('PAIRING_CODE')} className="mt-4 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer" aria-label="Go to pairing key generation" title="Generate a pairing key">
              Generate Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PairedDevices;