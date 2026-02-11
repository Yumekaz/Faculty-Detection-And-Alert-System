'use client';

import { useState, useEffect } from 'react';
import { Check, Send, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header, Card, Button, Input, Tabs, Alert } from '@/components/ui';
import { getConfig, updateConfig, SystemConfig, NOTIFICATION_MODES, DEFAULT_CONFIG, formatThreshold } from '@/app/api/config';
import { exportAttendanceUrl, exportScheduleUrl, exportConfigUrl, exportBackupUrl } from '@/app/api/export';
import { auditExportUrl } from '@/app/api/audit';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('detection');
    const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSendingTest, setIsSendingTest] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setIsLoading(true);
        try {
            const data = await getConfig();
            setConfig(data);
        } catch (error) {
            console.error('Failed to load config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            await updateConfig(config);
            alert('Configuration saved successfully!');
        } catch (error) {
            console.error('Failed to save config:', error);
            alert('Failed to save configuration. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetDefaults = () => {
        if (confirm('Are you sure you want to reset to default settings?')) {
            setConfig(DEFAULT_CONFIG);
        }
    };

    const handleSendTestEmail = async () => {
        setIsSendingTest(true);
        try {
            const res = await fetch(`${API_BASE}/notify/test`, { method: 'POST' });
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.detail || `HTTP ${res.status}`);
            }
            const data = await res.json();
            alert(data.message || 'Test email sent successfully.');
        } catch (error) {
            console.error('Failed to send test email:', error);
            alert('Failed to send test email. Please verify your email settings.');
        } finally {
            setIsSendingTest(false);
        }
    };

    return (
        <DashboardLayout>
            <Header
                title="System Configuration"
                subtitle="Configure detection parameters and notification settings"
            />

            <Tabs
                tabs={[
                    { id: 'detection', label: 'Detection' },
                    { id: 'notifications', label: 'Notifications' },
                    { id: 'email', label: 'Email Settings' },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            <div className="mt-6">
                {isLoading ? (
                    <Card>
                        <div className="py-12 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Detection Tab */}
                        {activeTab === 'detection' && (
                            <Card>
                                <h3 className="font-semibold text-slate-900 mb-6">Detection Settings</h3>
                                <div className="space-y-8">
                                    {/* Detection Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Detection Time Window
                                        </label>
                                        <p className="text-sm text-slate-500 mb-4">
                                            Mark faculty as absent if not detected within the first N seconds.
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min={5}
                                                max={60}
                                                value={config.detection_time}
                                                onChange={(e) => setConfig({ ...config, detection_time: Number(e.target.value) })}
                                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                            />
                                            <span className="w-20 text-center font-medium text-slate-900 bg-slate-100 rounded-lg py-2">
                                                {config.detection_time} sec
                                            </span>
                                        </div>
                                    </div>

                                    {/* Confidence Threshold */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Confidence Threshold
                                        </label>
                                        <p className="text-sm text-slate-500 mb-4">
                                            Minimum AI confidence level required for valid detection.
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min={0.1}
                                                max={1}
                                                step={0.05}
                                                value={config.threshold}
                                                onChange={(e) => setConfig({ ...config, threshold: Number(e.target.value) })}
                                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                            />
                                            <span className="w-20 text-center font-medium text-slate-900 bg-slate-100 rounded-lg py-2">
                                                {formatThreshold(config.threshold)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
                                    <Button variant="secondary" onClick={handleResetDefaults}>
                                        Reset Defaults
                                    </Button>
                                    <Button variant="primary" icon={Check} onClick={handleSaveConfig} disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <Card>
                                <h3 className="font-semibold text-slate-900 mb-6">Notification Settings</h3>
                                <div className="space-y-4">
                                    {NOTIFICATION_MODES.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:border-slate-400 ${config.notification_mode === opt.value ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="notif"
                                                value={opt.value}
                                                checked={config.notification_mode === opt.value}
                                                onChange={(e) => setConfig({ ...config, notification_mode: e.target.value })}
                                                className="mt-1"
                                            />
                                            <div>
                                                <p className="font-medium text-slate-900">{opt.value}</p>
                                                <p className="text-sm text-slate-500">{opt.label}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
                                    <Button variant="primary" icon={Check} onClick={handleSaveConfig} disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Email Tab */}
                        {activeTab === 'email' && (
                            <Card>
                                <h3 className="font-semibold text-slate-900 mb-6">Email Configuration</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Sender Email"
                                        placeholder="notifications@college.edu"
                                        value={config.sender_email}
                                        onChange={(e) => setConfig({ ...config, sender_email: e.target.value })}
                                    />
                                    <Input
                                        label="Sender Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={config.sender_password}
                                        onChange={(e) => setConfig({ ...config, sender_password: e.target.value })}
                                    />
                                    <Input
                                        label="Receiver Email"
                                        placeholder="admin@college.edu"
                                        value={config.email_receiver}
                                        onChange={(e) => setConfig({ ...config, email_receiver: e.target.value })}
                                        className="col-span-2"
                                    />
                                </div>

                                <Alert type="info" className="mt-4">
                                    For Gmail, use an App Password instead of your regular password.
                                </Alert>

                                <div className="flex items-center gap-4 mt-6">
                                    <Button
                                        variant="secondary"
                                        icon={isSendingTest ? Loader2 : Send}
                                        onClick={handleSendTestEmail}
                                        disabled={isSendingTest}
                                    >
                                        {isSendingTest ? 'Sending...' : 'Send Test Email'}
                                    </Button>
                                    <span className="text-sm text-slate-500">
                                        Send a test email to verify configuration
                                    </span>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
                                    <Button variant="primary" icon={Check} onClick={handleSaveConfig} disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </>
                )}
            </div>

            {/* Data Management */}
            <Card className="mt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Data Management</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Download backups and export system data for records.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => (window.location.href = exportBackupUrl())}>
                        Download Full Backup
                    </Button>
                    <Button variant="secondary" onClick={() => (window.location.href = exportAttendanceUrl())}>
                        Attendance CSV
                    </Button>
                    <Button variant="secondary" onClick={() => (window.location.href = exportScheduleUrl())}>
                        Schedule JSON
                    </Button>
                    <Button variant="secondary" onClick={() => (window.location.href = exportConfigUrl())}>
                        Config JSON
                    </Button>
                    <Button variant="secondary" onClick={() => (window.location.href = auditExportUrl())}>
                        Audit Log CSV
                    </Button>
                </div>
            </Card>
        </DashboardLayout>
    );
}
