"use client"
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { FaRegFileLines } from 'react-icons/fa6';
import { IoQrCode } from 'react-icons/io5';

const qrcodeRegionId = "html5qr-code-full-region";

const Html5QrcodePlugin = ({
    fps = 10,
    qrbox = 250,
    disableFlip = false,
    verbose = false,
    qrCodeSuccessCallback,
    qrCodeErrorCallback
}) => {
    const [scanError, setScanError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const html5QrCodeRef = useRef(null);
    const fileInputRef = useRef(null);
    const hasScannedRef = useRef(false);

    const startScanning = async () => {
        if (!html5QrCodeRef.current) return;
        try {
            setIsLoading(true);
            hasScannedRef.current = false;
            const config = { fps, qrbox, disableFlip };
            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    if (hasScannedRef.current) return;
                    hasScannedRef.current = true;
                    if (qrCodeSuccessCallback) qrCodeSuccessCallback(decodedText, decodedResult);
                    if (html5QrCodeRef.current?.isScanning) {
                        html5QrCodeRef.current.stop().then(() => {
                            setIsScanning(false);
                        }).catch(err => console.error("Auto-stop error", err));
                    }
                },
                (errorMessage) => { if (qrCodeErrorCallback) qrCodeErrorCallback(errorMessage) }
            );
            setIsScanning(true);
            setScanError(null);
        } catch (err) {
            console.error("Error starting QR scanner:", err);
            setScanError("Failed to access camera.");
            setIsScanning(false);
        } finally {
            setIsLoading(false);
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current && isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    const handleFileChange = async (e) => {
        if (e.target.files.length === 0 || !html5QrCodeRef.current) return;
        if (hasScannedRef.current) return;

        const imageFile = e.target.files[0];
        try {
            setIsLoading(true);
            const result = await html5QrCodeRef.current.scanFileV2(imageFile, true);
            if (qrCodeSuccessCallback) {
                hasScannedRef.current = true;
                qrCodeSuccessCallback(result.decodedText, result);
            }
        } catch (err) {
            setScanError("Could not read QR code from this image");
            console.error("Error scanning file:", err);
        } finally {
            setIsLoading(false);
            e.target.value = '';
        }
    };

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(qrcodeRegionId, verbose);
        html5QrCodeRef.current = html5QrCode;

        return () => {
            if (html5QrCodeRef.current) {
                if (html5QrCodeRef.current.isScanning) {
                    html5QrCodeRef.current.stop().catch(err => console.error("Cleanup error", err)).finally(() => { html5QrCodeRef.current.clear() });
                } else {
                    html5QrCodeRef.current.clear();
                }
            }
        };
    }, []);

    return (
        <div className="flex flex-col w-full mx-auto gap-2">
            <div className={`relative overflow-hidden`}>
                <div id={qrcodeRegionId} className='w-full h-full' />
                {isScanning && !scanError && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute saturate-150 top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-75 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-scan"></div>
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[16px_16px]"></div>
                    </div>
                )}

                {scanError && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center bg-zinc-900/90 text-red-400 text-sm font-medium">    {scanError}</div>
                )}
            </div>

            <div className="flex flex-col gap-2 justify-center w-full">
                <button disabled={isLoading} onClick={() => isScanning ? stopScanning() : startScanning()} className={`disabled:text-zinc-400 disabled:bg-zinc-600 cursor-pointer disabled:cursor-not-allowed  font-bold rounded-2xl transition-all duration-300 flex items-center justify-center  p-4 gap-4 bg-zinc-100 dark:bg-white/5 w-full `}>
                    {isScanning ? 'Stop Scan'
                        :
                        <>
                            <div className='p-4 bg-sky-500/10 rounded-full text-full border border-sky-500/50 text-sky-500 text-2xl'><IoQrCode /></div>
                            <div className='text-start'>
                                <p>Scan QR Code</p>
                                <p className="text-xs text-zinc-500">Use Camera</p>
                            </div>
                        </>
                    }
                </button>

                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

                <button onClick={() => fileInputRef.current?.click()} className={`disabled:text-zinc-400 disabled:bg-zinc-600 cursor-pointer disabled:cursor-not-allowed  font-bold rounded-2xl transition-all duration-300 flex items-center justify-center  p-4 gap-4 bg-zinc-100 dark:bg-white/5 w-full`}>
                    <div className='p-4 bg-emerald-500/10 rounded-full text-full border border-emerald-500/50 text-emerald-500 text-2xl'><FaRegFileLines /></div>
                    <div className='text-start'>
                        <p>Pick QR Code</p>
                        <p className="text-xs text-zinc-500">Use File</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Html5QrcodePlugin;