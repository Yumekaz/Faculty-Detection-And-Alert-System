"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

// --- Types ---
export interface CapturedImage {
    blob: Blob;
    base64: string;
    dataUrl: string;
    width: number;
    height: number;
}

interface CameraCaptureProps {
    onCapture: (image: CapturedImage) => void;
    onError?: (error: string) => void;
    width?: number;
    height?: number;
    facingMode?: "user" | "environment";
    showPreview?: boolean;
    className?: string;
}

// --- Component ---
export default function CameraCapture({
    onCapture,
    onError,
    width = 640,
    height = 480,
    facingMode = "user",
    showPreview = true,
    className = "",
}: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- Camera Functions ---
    const startCamera = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: width }, height: { ideal: height }, facingMode },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play();
            }

            setStream(mediaStream);
            setIsCameraActive(true);
            setPreviewUrl(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to access camera";
            setError(message);
            onError?.(message);
        } finally {
            setIsLoading(false);
        }
    }, [width, height, facingMode, onError]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    }, [stream]);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    // --- Capture Functions ---
    const captureFromVideo = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setError("Failed to capture image");
                    return;
                }

                const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
                const base64 = dataUrl.split(",")[1];

                const capturedImage: CapturedImage = {
                    blob,
                    base64,
                    dataUrl,
                    width: canvas.width,
                    height: canvas.height,
                };

                if (showPreview) setPreviewUrl(dataUrl);
                onCapture(capturedImage);
            },
            "image/jpeg",
            0.9
        );
    }, [onCapture, showPreview]);

    // --- File Upload ---
    const handleFileUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                const message = "Please upload an image file";
                setError(message);
                onError?.(message);
                return;
            }

            setIsLoading(true);
            setError(null);

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const base64 = dataUrl.split(",")[1];

                const img = new Image();
                img.onload = () => {
                    fetch(dataUrl)
                        .then((res) => res.blob())
                        .then((blob) => {
                            const capturedImage: CapturedImage = {
                                blob,
                                base64,
                                dataUrl,
                                width: img.width,
                                height: img.height,
                            };

                            if (showPreview) setPreviewUrl(dataUrl);
                            stopCamera();
                            onCapture(capturedImage);
                            setIsLoading(false);
                        });
                };
                img.src = dataUrl;
            };
            reader.onerror = () => {
                setError("Failed to read file");
                setIsLoading(false);
            };
            reader.readAsDataURL(file);
            event.target.value = "";
        },
        [onCapture, onError, showPreview, stopCamera]
    );

    const triggerFileUpload = () => fileInputRef.current?.click();
    const clearPreview = () => {
        setPreviewUrl(null);
        setError(null);
    };

    return (
        <div className={`camera-capture ${className}`}>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />

            <div className="camera-capture__preview">
                {previewUrl && showPreview ? (
                    <img src={previewUrl} alt="Captured" className="camera-capture__image" style={{ maxWidth: width, maxHeight: height }} />
                ) : isCameraActive ? (
                    <video ref={videoRef} autoPlay playsInline muted className="camera-capture__video" style={{ width, height }} />
                ) : (
                    <div className="camera-capture__placeholder" style={{ width, height }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        <p>Camera not active</p>
                    </div>
                )}
            </div>

            {error && <div className="camera-capture__error">{error}</div>}

            <div className="camera-capture__controls">
                {!isCameraActive && !previewUrl && (
                    <>
                        <button onClick={startCamera} disabled={isLoading} className="camera-capture__btn camera-capture__btn--primary">
                            {isLoading ? "Starting..." : "Start Camera"}
                        </button>
                        <button onClick={triggerFileUpload} disabled={isLoading} className="camera-capture__btn camera-capture__btn--secondary">
                            Upload Image
                        </button>
                    </>
                )}

                {isCameraActive && !previewUrl && (
                    <>
                        <button onClick={captureFromVideo} className="camera-capture__btn camera-capture__btn--capture">📸 Capture</button>
                        <button onClick={stopCamera} className="camera-capture__btn camera-capture__btn--secondary">Stop Camera</button>
                    </>
                )}

                {previewUrl && (
                    <>
                        <button onClick={clearPreview} className="camera-capture__btn camera-capture__btn--secondary">Clear</button>
                        <button onClick={startCamera} className="camera-capture__btn camera-capture__btn--primary">Retake</button>
                        <button onClick={triggerFileUpload} className="camera-capture__btn camera-capture__btn--secondary">Upload Different</button>
                    </>
                )}
            </div>

            <style jsx>{`
        .camera-capture { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .camera-capture__preview { border-radius: 12px; overflow: hidden; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .camera-capture__video, .camera-capture__image { display: block; object-fit: cover; border-radius: 12px; }
        .camera-capture__placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: #6b7280; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 12px; }
        .camera-capture__placeholder svg { opacity: 0.5; }
        .camera-capture__placeholder p { margin: 0; font-size: 0.875rem; }
        .camera-capture__error { padding: 0.75rem 1rem; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #ef4444; font-size: 0.875rem; }
        .camera-capture__controls { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
        .camera-capture__btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .camera-capture__btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .camera-capture__btn--primary { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; }
        .camera-capture__btn--primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
        .camera-capture__btn--secondary { background: rgba(255,255,255,0.1); color: #d1d5db; border: 1px solid rgba(255,255,255,0.1); }
        .camera-capture__btn--secondary:hover:not(:disabled) { background: rgba(255,255,255,0.15); }
        .camera-capture__btn--capture { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-size: 1rem; padding: 0.875rem 2rem; }
        .camera-capture__btn--capture:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(16,185,129,0.4); }
      `}</style>
        </div>
    );
}
