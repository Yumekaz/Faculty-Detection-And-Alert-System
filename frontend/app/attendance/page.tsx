"use client";

import React, { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import CameraCapture, { CapturedImage } from "@/components/CameraCapture";
import FaceBoxOverlay, { FaceBox } from "@/components/FaceBoxOverlay";
import { initModels, detectFaces, extractEmbedding } from "../api/inference";
import { searchFaculty } from "../api/recognition";
import { manualAttendanceCheck, startAutoAttendance, stopAutoAttendance } from "../api/attendance";
import { getCurrentPeriod, type SchedulePeriod } from "../api/schedule";

export default function AttendancePage() {
    const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
    const [detectedFaces, setDetectedFaces] = useState<FaceBox[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAutoRunning, setIsAutoRunning] = useState(false);
    const [result, setResult] = useState<{ matched: boolean; name: string | null; confidence: number } | null>(null);
    const [currentPeriod, setCurrentPeriod] = useState<SchedulePeriod | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleCapture = (image: CapturedImage) => {
        setCapturedImage(image);
        setDetectedFaces([]);
        setResult(null);
        setError(null);
    };

    const handleInitModels = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            await initModels();
            setMessage("Models initialized successfully!");
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to initialize models");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDetectAndRecognize = async () => {
        if (!capturedImage) return;

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            // Get current period
            const period = await getCurrentPeriod().catch(() => null);
            setCurrentPeriod(period);

            // Detect faces
            const { faces } = await detectFaces(capturedImage.base64);

            if (faces.length === 0) {
                setDetectedFaces([]);
                setError("No faces detected in the image");
                setIsProcessing(false);
                return;
            }

            // Process first face
            const face = faces[0];
            const { embedding } = await extractEmbedding(capturedImage.base64, face.bbox as [number, number, number, number]);

            if (!embedding) {
                setDetectedFaces([{ ...face, isMatched: false }]);
                setError("Could not extract face embedding");
                setIsProcessing(false);
                return;
            }

            // Search for match
            const searchResult = await searchFaculty(embedding);

            setDetectedFaces([{
                ...face,
                name: searchResult.name,
                isMatched: searchResult.matched,
            }]);
            setResult(searchResult);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Recognition failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualCheck = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const result = await manualAttendanceCheck();
            setResult(result);
            setMessage(result.matched ? `Matched: ${result.name}` : "No match found");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Manual check failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleAuto = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            if (isAutoRunning) {
                await stopAutoAttendance();
                setIsAutoRunning(false);
                setMessage("Auto attendance stopped");
            } else {
                await startAutoAttendance();
                setIsAutoRunning(true);
                setMessage("Auto attendance started");
            }
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to toggle auto attendance");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <NavBar />
            <main className="attendance-page">
                <div className="attendance-page__header">
                    <h1 className="attendance-page__title">Attendance Check</h1>
                    <Link href="/attendance/logs" className="attendance-page__logs-link">📊 View Logs</Link>
                </div>

                {/* Current Period */}
                {currentPeriod && (
                    <div className="attendance-page__period">
                        <span>Current: <strong>{currentPeriod.faculty}</strong></span>
                        <span>{currentPeriod.start} - {currentPeriod.end}</span>
                    </div>
                )}

                {/* Controls */}
                <div className="attendance-page__controls">
                    <button onClick={handleInitModels} disabled={isProcessing} className="control-btn control-btn--init">
                        ⚡ Init Models
                    </button>
                    <button onClick={handleManualCheck} disabled={isProcessing} className="control-btn control-btn--manual">
                        📸 Manual Check
                    </button>
                    <button onClick={handleToggleAuto} disabled={isProcessing} className={`control-btn ${isAutoRunning ? "control-btn--stop" : "control-btn--auto"}`}>
                        {isAutoRunning ? "⏹️ Stop Auto" : "▶️ Start Auto"}
                    </button>
                </div>

                {/* Messages */}
                {error && <div className="attendance-page__message attendance-page__message--error">{error}</div>}
                {message && <div className="attendance-page__message attendance-page__message--success">{message}</div>}

                {/* Camera Section */}
                <div className="attendance-page__camera-section">
                    <h2>Manual Recognition</h2>
                    <div className="attendance-page__capture-container">
                        <CameraCapture onCapture={handleCapture} onError={setError} width={640} height={480} />

                        {/* Face overlay */}
                        {capturedImage && detectedFaces.length > 0 && (
                            <FaceBoxOverlay
                                faces={detectedFaces}
                                imageWidth={capturedImage.width}
                                imageHeight={capturedImage.height}
                                containerWidth={640}
                                containerHeight={480}
                            />
                        )}
                    </div>

                    {capturedImage && (
                        <button onClick={handleDetectAndRecognize} disabled={isProcessing} className="attendance-page__recognize-btn">
                            {isProcessing ? "Processing..." : "🔍 Detect & Recognize"}
                        </button>
                    )}

                    {/* Result */}
                    {result && (
                        <div className={`attendance-page__result ${result.matched ? "attendance-page__result--matched" : "attendance-page__result--unmatched"}`}>
                            <span className="result__icon">{result.matched ? "✅" : "❌"}</span>
                            <div className="result__content">
                                <span className="result__status">{result.matched ? "Matched" : "Not Matched"}</span>
                                {result.name && <span className="result__name">{result.name}</span>}
                                <span className="result__confidence">Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    )}
                </div>

                <style jsx>{`
          .attendance-page { min-height: 100vh; padding: 2rem; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); color: #f1f5f9; }
          .attendance-page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
          .attendance-page__title { font-size: 2rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .attendance-page__logs-link { color: #818cf8; text-decoration: none; font-size: 0.9rem; }
          .attendance-page__logs-link:hover { text-decoration: underline; }

          .attendance-page__period { display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem; color: #a5b4fc; }

          .attendance-page__controls { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
          .control-btn { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
          .control-btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .control-btn--init { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
          .control-btn--init:hover:not(:disabled) { background: rgba(251,191,36,0.25); }
          .control-btn--manual { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
          .control-btn--manual:hover:not(:disabled) { background: rgba(99,102,241,0.25); }
          .control-btn--auto { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
          .control-btn--auto:hover:not(:disabled) { background: rgba(34,197,94,0.25); }
          .control-btn--stop { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
          .control-btn--stop:hover:not(:disabled) { background: rgba(239,68,68,0.25); }

          .attendance-page__message { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
          .attendance-page__message--error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
          .attendance-page__message--success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #86efac; }

          .attendance-page__camera-section { max-width: 700px; }
          .attendance-page__camera-section h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem; color: #e2e8f0; }
          .attendance-page__capture-container { position: relative; display: inline-block; }

          .attendance-page__recognize-btn { margin-top: 1rem; padding: 0.875rem 2rem; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
          .attendance-page__recognize-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
          .attendance-page__recognize-btn:disabled { opacity: 0.6; cursor: not-allowed; }

          .attendance-page__result { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; padding: 1.25rem; border-radius: 12px; }
          .attendance-page__result--matched { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); }
          .attendance-page__result--unmatched { background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); }
          .result__icon { font-size: 2rem; }
          .result__content { display: flex; flex-direction: column; gap: 0.25rem; }
          .result__status { font-weight: 600; font-size: 1.1rem; }
          .attendance-page__result--matched .result__status { color: #86efac; }
          .attendance-page__result--unmatched .result__status { color: #fde047; }
          .result__name { font-size: 1.25rem; font-weight: 700; color: #f1f5f9; }
          .result__confidence { font-size: 0.85rem; color: #94a3b8; }
        `}</style>
            </main>
        </>
    );
}
