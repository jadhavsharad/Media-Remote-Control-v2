import { useEffect, useRef } from "react"
import { CHANNELS, MESSAGE_TYPES } from "@/config/constants"
import { sendMessage } from "@/utils/messaging/message"
import { pairingKey, pairingKeyExpiry } from "@/utils/storage/storage"
import { useStorageItem } from "../../hooks/useStorageItem"
import QRCodeStyling from "qr-code-styling"

const qrCode = new QRCodeStyling({
    width: 200,
    height: 200,
    margin: 0,
    type: "svg",
    shape: "square",
    dotsOptions: {
        color: "#000000",
        type: "square"
    },
});

const QRCode = ({ onNavigate }: { onNavigate: (module: string) => void }) => {
    // TODO: add loading state
    // TODO: add error state
    // TODO: add timer
    // TODO: add toast
    // TODO: add animation

    // GET PAIRING KEY FROM STORAGE
    const [key] = useStorageItem(pairingKey);
    // GET PAIRING KEY EXPIRY FROM STORAGE
    const [expiry] = useStorageItem(pairingKeyExpiry)
    // QR CODE REFRENCE CONTAINER
    const renderQR = useRef<HTMLDivElement>(null);

    // QR CODE INSTANCE
    useEffect(() => {
        if (renderQR.current) qrCode.append(renderQR.current);
    }, []);

    // CHECK IF PAIRING KEY IS EXPIRED
    const isExpired = expiry ? Date.now() > expiry : false;

    // CLEAR PAIRING KEY DATA
    const clearKeyData = () => {
        pairingKey.setValue(null);
        pairingKeyExpiry.setValue(null);
    }

    // DOWNLOAD QR CODE
    const onDownloadClick = (format: "png" | "jpeg" | "webp" | "svg") => {
        qrCode.download({
            extension: format,
            name: "Media Remote Control Pairing Key",
        });
    };

    // UPDATE QR CODE DATA WHEN KEY CHANGES
    useEffect(() => {
        qrCode.update({ data: key || undefined });
    }, [key]);

    // SET TIMER FOR PAIRING KEY EXPIRY
    useEffect(() => {
        if (!expiry) return;
        const remaining = expiry - Date.now();
        if (remaining <= 0) { clearKeyData(); return }
        const timer = setTimeout(clearKeyData, remaining);
        return () => clearTimeout(timer);
    }, [expiry]);

    // COPY PAIRING KEY TO CLIPBOARD
    const onCopyClick = () => {
        navigator.clipboard.writeText(key || "");
        window.alert("Pairing key copied to clipboard");
    }

    // SHARE PAIRING KEY
    const onShareClick = () => {
        navigator.share({
            title: "Media Remote Control Pairing Key",
            text: key || "",
        });
    }

    // REFRESH PAIRING KEY
    const refreshKey = () => {
        clearKeyData();
        sendMessage({ channel: CHANNELS.FROM_POPUP, payload: { type: MESSAGE_TYPES.PAIRING_KEY_REQUEST } });
    }

    const keyCheck = key && !isExpired

    return (
        <div >
            {keyCheck && <p>Pairing Key: {key}</p>}
            {!keyCheck && <p>Pairing key expired. Generate a new one.</p>}
            <div ref={renderQR} />
            <button onClick={keyCheck ? refreshKey : () => sendMessage({ channel: CHANNELS.FROM_POPUP, payload: { type: MESSAGE_TYPES.PAIRING_KEY_REQUEST } })}>
                {keyCheck ? "Refresh Key" : "Generate Pairing Key"}
            </button>
            <button onClick={() => onNavigate('HOME')}>Back</button>
            {keyCheck && <button onClick={() => onDownloadClick("png")}>png</button>}
            {keyCheck && <button onClick={() => onDownloadClick("jpeg")}>jpeg</button>}
            {keyCheck && <button onClick={() => onDownloadClick("webp")}>webp</button>}
            {keyCheck && <button onClick={() => onDownloadClick("svg")}>svg</button>}
            {keyCheck && <button onClick={() => onCopyClick()}>Copy</button>}
            {keyCheck && <button onClick={() => onShareClick()}>Share</button>}
        </div>
    )
}

export default QRCode