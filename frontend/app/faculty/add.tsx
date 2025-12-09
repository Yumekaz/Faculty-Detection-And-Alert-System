"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import CameraCapture, { CapturedImage } from "@/components/CameraCapture";
import { initModels } from "../api/inference";
import { addFaculty } from "../api/recognition";

export default function AddFacultyPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCapture = (image: CapturedImage) => {
    setCapturedImage(image);
    setError(null);
  };

  const handleInitModels = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      await initModels();
      setSuccess("Models initialized successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize models");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the faculty member's name");
      return;
    }
    if (!capturedImage) {
      setError("Please capture or upload a photo");
      return;
    }

    setIsSubmitting(true);

    try {
      await addFaculty(name, capturedImage.base64);
      setSuccess(`Successfully added ${name} to the faculty database!`);
      setTimeout(() => router.push("/faculty"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add faculty");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setName("");
    setCapturedImage(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      <NavBar />
      <main className="add-faculty-page">
        <div className="add-faculty-page__header">
          <Link href="/faculty" className="add-faculty-page__back">← Back to Directory</Link>
          <h1 className="add-faculty-page__title">Add New Faculty</h1>
          <p className="add-faculty-page__subtitle">Capture or upload a clear photo of the faculty member</p>
        </div>

        <div className="add-faculty-page__init">
          <button onClick={handleInitModels} disabled={isInitializing} className="add-faculty-page__init-btn">
            {isInitializing ? <><span className="spinner" /> Initializing...</> : <>⚡ Initialize AI Models</>}
          </button>
          <span className="add-faculty-page__init-hint">Required before adding faculty</span>
        </div>

        {error && <div className="add-faculty-page__message add-faculty-page__message--error">{error}</div>}
        {success && <div className="add-faculty-page__message add-faculty-page__message--success">{success}</div>}

        <form onSubmit={handleSubmit} className="add-faculty-page__form">
          <div className="add-faculty-page__field">
            <label htmlFor="name" className="add-faculty-page__label">Faculty Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name..." className="add-faculty-page__input" disabled={isSubmitting} />
          </div>

          <div className="add-faculty-page__field">
            <label className="add-faculty-page__label">Photo</label>
            <CameraCapture onCapture={handleCapture} onError={(err) => setError(err)} width={480} height={360} />
          </div>

          {capturedImage && (
            <div className="add-faculty-page__preview-info">
              <span>✓ Image ready</span>
              <span>{capturedImage.width} × {capturedImage.height}px</span>
            </div>
          )}

          <div className="add-faculty-page__actions">
            <button type="button" onClick={handleClear} className="add-faculty-page__btn add-faculty-page__btn--secondary" disabled={isSubmitting}>Clear</button>
            <button type="submit" className="add-faculty-page__btn add-faculty-page__btn--primary" disabled={isSubmitting || !name.trim() || !capturedImage}>
              {isSubmitting ? <><span className="spinner" /> Adding...</> : <>➕ Add Faculty</>}
            </button>
          </div>
        </form>

        <style jsx>{`
          .add-faculty-page { min-height: 100vh; padding: 2rem; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); color: #f1f5f9; }
          .add-faculty-page__header { margin-bottom: 2rem; }
          .add-faculty-page__back { display: inline-block; color: #818cf8; text-decoration: none; font-size: 0.9rem; margin-bottom: 1rem; }
          .add-faculty-page__back:hover { color: #a5b4fc; }
          .add-faculty-page__title { font-size: 2rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .add-faculty-page__subtitle { color: #94a3b8; margin: 0.5rem 0 0; }
          .add-faculty-page__init { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
          .add-faculty-page__init-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.3); border-radius: 8px; color: #fbbf24; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
          .add-faculty-page__init-btn:hover:not(:disabled) { background: rgba(251,191,36,0.25); }
          .add-faculty-page__init-btn:disabled { opacity: 0.7; cursor: not-allowed; }
          .add-faculty-page__init-hint { font-size: 0.8rem; color: #64748b; }
          .add-faculty-page__message { padding: 0.875rem 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem; }
          .add-faculty-page__message--error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
          .add-faculty-page__message--success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #86efac; }
          .add-faculty-page__form { max-width: 600px; }
          .add-faculty-page__field { margin-bottom: 1.5rem; }
          .add-faculty-page__label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: #e2e8f0; }
          .add-faculty-page__input { width: 100%; padding: 0.875rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f1f5f9; font-size: 1rem; outline: none; transition: all 0.2s; }
          .add-faculty-page__input:focus { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
          .add-faculty-page__input::placeholder { color: #64748b; }
          .add-faculty-page__input:disabled { opacity: 0.6; }
          .add-faculty-page__preview-info { display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); border-radius: 8px; font-size: 0.85rem; color: #86efac; margin-bottom: 1.5rem; }
          .add-faculty-page__actions { display: flex; gap: 1rem; margin-top: 2rem; }
          .add-faculty-page__btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border: none; border-radius: 10px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
          .add-faculty-page__btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .add-faculty-page__btn--primary { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; }
          .add-faculty-page__btn--primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
          .add-faculty-page__btn--secondary { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
          .add-faculty-page__btn--secondary:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
          .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: currentColor; border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </>
  );
}
