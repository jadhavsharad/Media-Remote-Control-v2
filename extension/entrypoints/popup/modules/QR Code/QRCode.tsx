import { useEffect, useRef, useState, CSSProperties } from "react"
import { CHANNELS, MESSAGE_TYPES } from "@/config/constants"
import { sendMessage } from "@/utils/messaging/message"
import { pairingKey, pairingKeyExpiry, pairingKeyCreatedAt } from "@/utils/storage/storage"
import { useStorageItem } from "../../hooks/useStorageItem"
import QRCodeStyling from "qr-code-styling"
import { IoArrowBack, IoRefreshOutline, IoCopyOutline, IoShareSocialOutline, IoQrCodeOutline, IoChevronDown } from "react-icons/io5"
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2"
import { LuKeyRound, LuWifi } from "react-icons/lu"


const qrCode = new QRCodeStyling({
    width: 180,
    height: 180,
    margin: 0,
    type: "svg",
    shape: "square",
    dotsOptions: {
        color: "#fff",
        type: "square"
    },
    backgroundOptions: {
        color: "transparent"
    }
});

const DOWNLOAD_FORMATS = [
    { label: "PNG", ext: "png" as const },
    { label: "JPEG", ext: "jpeg" as const },
    { label: "WebP", ext: "webp" as const },
    { label: "SVG", ext: "svg" as const },
] as const;

const STEPS = [
    {
        icon: HiOutlineDevicePhoneMobile,
        title: "Open Remote",
        description: "Launch the remote control app on your phone",
        color: "text-white",
        bg: "bg-white/10",
    },
    {
        icon: IoQrCodeOutline,
        title: "Scan or Enter",
        description: "Scan the QR code or enter the pairing key manually",
        color: "text-white",
        bg: "bg-white/10",
    },
    {
        icon: LuWifi,
        title: "Connected",
        description: "Control your media remotely — play, pause, skip, and more",
        color: "text-white",
        bg: "bg-white/10",
    },
] as const;

const QRCode = ({ onNavigate }: { onNavigate: (module: string) => void }) => {
    const [key] = useStorageItem(pairingKey);
    const [expiry] = useStorageItem(pairingKeyExpiry);
    const [createdAt] = useStorageItem(pairingKeyCreatedAt);
    const renderQR = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState<number | null>(100);
    const [secondsLeft, setSecondsLeft] = useState<number>(0); // New state for seconds
    const [copied, setCopied] = useState(false);
    const [showFormats, setShowFormats] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        if (renderQR.current) qrCode.append(renderQR.current);
    }, []);

    useEffect(() => {
        setCanShare(typeof navigator.share === "function");
    }, []);

    const isExpired = expiry ? Date.now() > expiry : false;

    const clearKeyData = () => {
        pairingKey.setValue(null);
        pairingKeyExpiry.setValue(null);
        pairingKeyCreatedAt.setValue(null);
        setSecondsLeft(0);
        setProgress(0);
    };

    useEffect(() => {
        qrCode.update({ data: key || undefined });
    }, [key]);

    useEffect(() => {
        if (!expiry || !createdAt) { setProgress(0); setSecondsLeft(0); return; }
        const totalDuration = expiry - createdAt;
        if (totalDuration <= 0) { clearKeyData(); return; }

        const tick = () => {
            const remaining = expiry - Date.now();
            if (remaining <= 0) { clearKeyData(); return false; }
            setProgress((remaining / totalDuration) * 100);
            setSecondsLeft(Math.ceil(remaining / 1000));
            return true;
        };

        if (!tick()) return;
        const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 100);
        return () => clearInterval(timer);
    }, [expiry, createdAt]);

    const onDownloadClick = (format: "png" | "jpeg" | "webp" | "svg") => {
        qrCode.download({ extension: format, name: "Media Remote Control Pairing Key", });
        setShowFormats(false);
    };

    const onCopyClick = () => {
        navigator.clipboard.writeText(key || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onShareClick = () => {
        navigator.share({ title: "Media Remote Control Pairing Key", text: key || "", });
    };

    const requestKey = () => {
        sendMessage({ channel: CHANNELS.FROM_POPUP, payload: { type: MESSAGE_TYPES.PAIRING_KEY_REQUEST } });
    };

    const refreshKey = () => {
        clearKeyData();
        requestKey();
    };

    const keyCheck = key && !isExpired;

    return (
        <div className="bg-linear-to-t to-sky-950 text-white w-60 flex flex-col antialiased">
            <div className="flex items-center justify-between px-3 py-3">
                <button onClick={() => onNavigate('HOME')} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors cursor-pointer" aria-label="Go back to home">
                    <IoArrowBack className="text-lg" />
                </button>
                <div className="flex items-center gap-1.5">
                    <LuKeyRound className="text-white text-sm" />
                    <h1 className="text-sm font-semibold tracking-wide">Pairing Key</h1>
                </div>
                {keyCheck ? (
                    <button onClick={refreshKey} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors cursor-pointer" aria-label="Refresh pairing key">    <IoRefreshOutline className="text-lg" /></button>
                ) : (
                    <div className="w-8" aria-hidden="true" />
                )}
            </div>

            <div className="px-3 pb-2">
                <div className={`relative flex flex-col items-center rounded-lg p-4 border transition-all duration-500 min-h-[200px] justify-center border-white/5 bg-black/20`}>
                    <div ref={renderQR} className={`transition-opacity duration-300 ${keyCheck ? "opacity-100" : "opacity-20"}`} aria-label={keyCheck ? "QR code for pairing" : "QR code placeholder"} />
                    {!keyCheck && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/40">
                            <IoQrCodeOutline className="text-4xl text-red-400/80 mb-2" />
                            <p className="text-xs text-red-400 font-medium mb-3">
                                {key && isExpired ? "Key expired" : "No active key"}
                            </p>
                            <button onClick={requestKey} className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer" aria-label="Generate a new pairing key">
                                Generate Key
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {keyCheck && (
                <div className="mx-3 mb-2 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-base font-bold tracking-[0.25em] text-white/90" aria-label={`Pairing key: ${key?.split("").join(" ")}`} role="status">
                        {key}
                    </p>
                    <div className="radial-progress text-yellow-400 bg-white/5 border border-white/5" style={{ "--value": progress, "--size": "1.75rem", "--thickness": "2px" } as CSSProperties} role="progressbar" aria-valuenow={Math.round(progress || 0)} aria-valuemin={0} aria-valuemax={100} aria-label={`Key expires in ${Math.round(progress || 0)} percent time remaining`} >
                        <span className="countdown">
                            <span style={{ "--value": secondsLeft, "--digits": 2} as CSSProperties} aria-live="polite">{secondsLeft}</span>
                        </span>
                    </div>
                </div>
            )}

            {keyCheck && (
                <div className="mx-3 mb-2 flex items-center gap-1.5" role="toolbar" aria-label="Pairing key actions">
                    <button onClick={onCopyClick} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer bg-white/5 text-white hover:bg-white/10`} aria-label={copied ? "Pairing key copied" : "Copy pairing key to clipboard"}>
                        {copied ? <>Copied</> : <><IoCopyOutline />Copy</>}
                    </button>
                    <div className="flex-1 relative">
                        <button onClick={() => setShowFormats(!showFormats)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 font-medium transition-colors cursor-pointer" aria-label="Download QR code" aria-expanded={showFormats} aria-haspopup="menu">
                            Save
                            <IoChevronDown className={`transition-transform duration-200 ${showFormats ? "rotate-180" : ""}`} />
                        </button>

                        {showFormats && (
                            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shadow-xl z-10" role="menu" aria-label="Download format options">
                                {DOWNLOAD_FORMATS.map((f) => (
                                    <button key={f.ext} onClick={() => onDownloadClick(f.ext)} className="w-full px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer" role="menuitem" aria-label={`Download QR code as ${f.label}`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {canShare && (
                        <button onClick={onShareClick} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer" aria-label="Share pairing key">
                            <IoShareSocialOutline className="text-sm" />
                            Share
                        </button>
                    )}
                </div>
            )}

            <div className="mx-3 mb-3 mt-1" aria-label="Pairing instructions" role="region">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2 px-1">How to connect</p>
                <div className="flex flex-col gap-0">
                    {STEPS.map((step, i) => (
                        <div key={i} className="flex items-start gap-2.5 relative">
                            {i < STEPS.length - 1 && (
                                <div className="absolute left-[13px] top-7 w-px h-[calc(100%-4px)] bg-white/10" aria-hidden="true" />
                            )}
                            <div className={`shrink-0 w-7 h-7 rounded-lg ${step.bg} flex items-center justify-center relative z-10`}>
                                <step.icon className={`text-sm ${step.color}`} />
                            </div>
                            <div className={`pb-3 ${i === STEPS.length - 1 ? "pb-0" : ""}`}>
                                <p className={`text-xs font-semibold ${step.color}`}>{step.title}</p>
                                <p className="text-[10px] text-white/40 leading-tight mt-0.5">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default QRCode;