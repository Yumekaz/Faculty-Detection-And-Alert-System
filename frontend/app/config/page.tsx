"use client";

import React, { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { getConfig, updateConfig, resetConfig, validateConfig, NOTIFICATION_MODES, type SystemConfig, DEFAULT_CONFIG } from "../api/config";

export default function ConfigPage() {
    const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    useEffect(() => { loadConfig(); }, []);

    const loadConfig = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getConfig();
            setConfig(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load config");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof SystemConfig, value: string | number) => {
        setConfig({ ...config, [field]: value });
        setValidationErrors([]);
    };

    const handleSave = async () => {
        const errors = validateConfig(config);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await updateConfig(config);
            setMessage("Configuration saved successfully!");
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save config");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm("Reset all settings to defaults?")) return;
        setIsSaving(true);
        setError(null);
        try {
            const result = await resetConfig();
            setConfig(result.config);
            setMessage("Configuration reset to defaults!");
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset config");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <NavBar />
                <main className="config-page"><div className="config-page__loading"><div className="spinner" /><p>Loading configuration...</p></div></main>
            </>
        );
    }

    return (
        <>
            <NavBar />
            <main className="config-page">
                <div className="config-page__header">
                    <h1 className="config-page__title">System Configuration</h1>
                    <div className="config-page__actions">
                        <button onClick={handleReset} disabled={isSaving} className="config-page__btn config-page__btn--secondary">🔄 Reset</button>
                        <button onClick={handleSave} disabled={isSaving} className="config-page__btn config-page__btn--save">{isSaving ? "Saving..." : "💾 Save"}</button>
                    </div>
                </div>

                {error && <div className="config-page__message config-page__message--error">{error}</div>}
                {message && <div className="config-page__message config-page__message--success">{message}</div>}
                {validationErrors.length > 0 && (
                    <div className="config-page__message config-page__message--error">
                        {validationErrors.map((e, i) => <div key={i}>• {e}</div>)}
                    </div>
                )}

                <div className="config-page__sections">
                    {/* Detection Settings */}
                    <section className="config-section">
                        <h2>Detection Settings</h2>
                        <div className="config-section__fields">
                            <div className="config-field">
                                <label>Detection Time (seconds)</label>
                                <input type="number" min="1" max="60" value={config.detection_time} onChange={(e) => handleChange("detection_time", parseInt(e.target.value) || 10)} />
                                <span className="config-field__hint">Time to wait during auto detection (1-60s)</span>
                            </div>
                            <div className="config-field">
                                <label>Recognition Threshold</label>
                                <input type="number" min="0.1" max="1" step="0.05" value={config.threshold} onChange={(e) => handleChange("threshold", parseFloat(e.target.value) || 0.6)} />
                                <span className="config-field__hint">Minimum confidence for a match (0.1-1.0)</span>
                            </div>
                        </div>
                    </section>

                    {/* Notification Settings */}
                    <section className="config-section">
                        <h2>Notification Settings</h2>
                        <div className="config-section__fields">
                            <div className="config-field">
                                <label>Notification Mode</label>
                                <select value={config.notification_mode} onChange={(e) => handleChange("notification_mode", e.target.value)}>
                                    {NOTIFICATION_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Email Settings - Show when notifications are enabled */}
                    {config.notification_mode !== "None" && (
                        <section className="config-section">
                            <h2>Email Configuration</h2>
                            <div className="config-section__fields">
                                <div className="config-field">
                                    <label>Sender Email</label>
                                    <input type="email" placeholder="sender@example.com" value={config.sender_email} onChange={(e) => handleChange("sender_email", e.target.value)} />
                                </div>
                                <div className="config-field">
                                    <label>Sender Password / App Password</label>
                                    <input type="password" placeholder="••••••••" value={config.sender_password} onChange={(e) => handleChange("sender_password", e.target.value)} />
                                    <span className="config-field__hint">Use app password for Gmail</span>
                                </div>
                                <div className="config-field">
                                    <label>Receiver Email</label>
                                    <input type="email" placeholder="receiver@example.com" value={config.email_receiver} onChange={(e) => handleChange("email_receiver", e.target.value)} />
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <style jsx>{`
          .config-page { min-height: 100vh; padding: 2rem; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); color: #f1f5f9; }
          .config-page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
          .config-page__title { font-size: 2rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .config-page__actions { display: flex; gap: 0.75rem; }
          .config-page__btn { padding: 0.625rem 1.25rem; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
          .config-page__btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .config-page__btn--save { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; }
          .config-page__btn--secondary { background: rgba(255,255,255,0.1); color: #94a3b8; }

          .config-page__message { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
          .config-page__message--error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
          .config-page__message--success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #86efac; }

          .config-page__loading { padding: 4rem; text-align: center; color: #64748b; }
          .spinner { width: 32px; height: 32px; margin: 0 auto 1rem; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }

          .config-page__sections { max-width: 600px; display: flex; flex-direction: column; gap: 1.5rem; }
          .config-section { padding: 1.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
          .config-section h2 { margin: 0 0 1.25rem; font-size: 1.1rem; font-weight: 600; color: #e2e8f0; }
          .config-section__fields { display: flex; flex-direction: column; gap: 1.25rem; }

          .config-field { display: flex; flex-direction: column; gap: 0.375rem; }
          .config-field label { font-size: 0.9rem; font-weight: 500; color: #e2e8f0; }
          .config-field input, .config-field select { padding: 0.75rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f1f5f9; font-size: 0.95rem; }
          .config-field input:focus, .config-field select:focus { outline: none; border-color: rgba(99,102,241,0.5); }
          .config-field__hint { font-size: 0.75rem; color: #64748b; }
        `}</style>
            </main>
        </>
    );
}
