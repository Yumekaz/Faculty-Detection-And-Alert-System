'use client';

import { useState, useEffect, useCallback } from 'react';
import { Camera, Play, Square, Download, RefreshCw, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface DVRConfig {
    ip: string;
    port: number;
    username: string;
    num_cameras: number;
    resolution: { width: number; height: number };
}

interface CameraStatus {
    [key: string]: boolean;
}

interface StreamStatus {
    running: boolean;
    cameras: CameraStatus;
    active_cameras: number;
    total_cameras: number;
}

export default function CamerasPage() {
    // State
    const [config, setConfig] = useState<DVRConfig>({
        ip: '192.168.1.68',
        port: 554,
        username: 'admin',
        num_cameras: 3,
        resolution: { width: 640, height: 360 }
    });
    const [password, setPassword] = useState('hik@4455');
    const [status, setStatus] = useState<StreamStatus | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch current config on mount
    useEffect(() => {
        fetchConfig();
        fetchStatus();
    }, []);

    // Poll status while streaming
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isStreaming) {
            interval = setInterval(fetchStatus, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isStreaming]);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_BASE}/dvr/config`);
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
            }
        } catch (e) {
            console.error('Failed to fetch config:', e);
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/dvr/status`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
                setIsStreaming(data.running);
            }
        } catch (e) {
            console.error('Failed to fetch status:', e);
        }
    };

    const saveConfig = async () => {
        try {
            setError(null);
            const res = await fetch(`${API_BASE}/dvr/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: config.ip,
                    port: config.port,
                    username: config.username,
                    password: password,
                    num_cameras: config.num_cameras
                })
            });
            if (!res.ok) {
                throw new Error('Failed to save configuration');
            }
            setShowConfig(false);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const startStreaming = async () => {
        try {
            setError(null);
            setIsConnecting(true);
            const res = await fetch(`${API_BASE}/dvr/connect`, { method: 'POST' });
            if (!res.ok) {
                throw new Error('Failed to connect to cameras');
            }
            const data = await res.json();
            setIsStreaming(true);
            setStatus({
                running: true,
                cameras: data.cameras,
                active_cameras: data.active_cameras,
                total_cameras: data.total_cameras
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const stopStreaming = async () => {
        try {
            setError(null);
            await fetch(`${API_BASE}/dvr/disconnect`, { method: 'POST' });
            setIsStreaming(false);
            setStatus(null);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const takeSnapshot = async () => {
        try {
            setError(null);
            const res = await fetch(`${API_BASE}/dvr/snapshot`, { method: 'POST' });
            if (!res.ok) {
                throw new Error('Failed to capture snapshot');
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">DVR Camera Viewer</h1>
                        <p className="text-slate-400 text-sm">Hikvision Multi-Camera Monitoring</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-4">
                    {status && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg">
                            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-slate-300 text-sm">
                                {isStreaming ? `Active: ${status.active_cameras}/${status.total_cameras}` : 'Offline'}
                            </span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfig(!showConfig)}
                        className="text-slate-400 hover:text-white"
                    >
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">×</button>
                </div>
            )}

            {/* Configuration Panel */}
            {showConfig && (
                <Card className="mb-6 bg-slate-900 border-slate-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">DVR Configuration</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">IP Address</label>
                            <input
                                type="text"
                                value={config.ip}
                                onChange={(e) => setConfig({ ...config, ip: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">RTSP Port</label>
                            <input
                                type="number"
                                value={config.port}
                                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Username</label>
                            <input
                                type="text"
                                value={config.username}
                                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                        <Button onClick={saveConfig} className="bg-emerald-600 hover:bg-emerald-700">
                            Save Configuration
                        </Button>
                        <Button variant="ghost" onClick={() => setShowConfig(false)} className="text-slate-400">
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}

            {/* Control Bar */}
            <div className="flex gap-3 mb-6">
                {!isStreaming ? (
                    <Button
                        onClick={startStreaming}
                        disabled={isConnecting}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                    >
                        {isConnecting ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        {isConnecting ? 'Connecting...' : 'Start Streaming'}
                    </Button>
                ) : (
                    <Button onClick={stopStreaming} className="bg-red-600 hover:bg-red-700 gap-2">
                        <Square className="w-4 h-4" />
                        Stop Streaming
                    </Button>
                )}
                <Button
                    variant="ghost"
                    onClick={takeSnapshot}
                    disabled={!isStreaming}
                    className="gap-2 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600"
                >
                    <Download className="w-4 h-4" />
                    Take Snapshot
                </Button>
                <Button
                    variant="ghost"
                    onClick={fetchStatus}
                    className="gap-2 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Status
                </Button>
            </div>

            {/* Camera Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: config.num_cameras }, (_, i) => i + 1).map((channel) => (
                    <CameraFeed
                        key={channel}
                        channel={channel}
                        isStreaming={isStreaming}
                        isConnected={status?.cameras?.[channel.toString()] ?? false}
                        apiBase={API_BASE}
                    />
                ))}
            </div>

            {/* Status Footer */}
            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <span>DVR: {config.ip}:{config.port}</span>
                <span>Resolution: {config.resolution.width}×{config.resolution.height}</span>
                <span>{new Date().toLocaleString()}</span>
            </div>
        </div>
    );
}

// Camera Feed Component
interface CameraFeedProps {
    channel: number;
    isStreaming: boolean;
    isConnected: boolean;
    apiBase: string;
}

function CameraFeed({ channel, isStreaming, isConnected, apiBase }: CameraFeedProps) {
    const streamUrl = `${apiBase}/dvr/stream/${channel}`;

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            {/* Camera Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-medium">Camera {channel}</span>
                </div>
                <div className="flex items-center gap-1">
                    {isStreaming ? (
                        isConnected ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                        )
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                    <span className={`text-xs ${isConnected ? 'text-emerald-400' : isStreaming ? 'text-amber-400' : 'text-slate-500'}`}>
                        {isStreaming ? (isConnected ? 'Live' : 'No Feed') : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Video Feed */}
            <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
                {isStreaming ? (
                    <>
                        {/* Streaming MJPEG feed; next/image is not suitable here. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                        src={streamUrl}
                        alt={`Camera ${channel} Feed`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Show placeholder on error
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        />
                    </>
                ) : null}

                {/* Placeholder when not streaming */}
                {!isStreaming && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                        <Camera className="w-12 h-12 mb-2 opacity-30" />
                        <span className="text-sm">Camera {channel}</span>
                        <span className="text-xs text-slate-700">Click Start Streaming</span>
                    </div>
                )}

                {/* Overlay when streaming but no feed */}
                {isStreaming && !isConnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-amber-400">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <span className="text-sm">No Feed Available</span>
                        <span className="text-xs text-slate-500">Check camera connection</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
