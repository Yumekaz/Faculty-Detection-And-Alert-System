'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Server, Database, Loader2, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header, Card, Button, StatusDot, Alert } from '@/components/ui';
import { listFaculty } from '@/app/api/recognition';
import { getConfig } from '@/app/api/config';

interface ServiceStatus {
    name: string;
    status: 'online' | 'offline';
    detail: string;
    icon: typeof Server;
}

export default function HealthPage() {
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [services, setServices] = useState<ServiceStatus[]>([]);

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        setIsLoading(true);
        const newServices: ServiceStatus[] = [];

        // Check Recognition Service
        try {
            await listFaculty();
            newServices.push({
                name: 'Recognition Service',
                status: 'online',
                detail: 'Faculty API responding',
                icon: Server
            });
        } catch {
            newServices.push({
                name: 'Recognition Service',
                status: 'offline',
                detail: 'Unable to connect',
                icon: Server
            });
        }

        // Check Config Service
        try {
            await getConfig();
            newServices.push({
                name: 'Config Service',
                status: 'online',
                detail: 'Configuration loaded',
                icon: Database
            });
        } catch {
            newServices.push({
                name: 'Config Service',
                status: 'offline',
                detail: 'Unable to connect',
                icon: Database
            });
        }

        // Backend Health check
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`);
            if (response.ok) {
                const data = await response.json();
                newServices.push({
                    name: 'FastAPI Backend',
                    status: 'online',
                    detail: `Models: ${data.models_loaded ? 'Loaded' : 'Not Loaded'} | Cameras: ${data.active_cameras}/${data.total_cameras}`,
                    icon: Server
                });
            } else {
                throw new Error('Not accessible');
            }
        } catch {
            newServices.push({
                name: 'FastAPI Backend',
                status: 'offline',
                detail: 'Unable to connect',
                icon: Server
            });
        }

        setServices(newServices);
        setLastUpdated(new Date());
        setIsLoading(false);
    };

    const allOnline = services.every(s => s.status === 'online');
    const onlineCount = services.filter(s => s.status === 'online').length;

    return (
        <DashboardLayout>
            <Header
                title="System Health"
                subtitle="Monitor backend services and connectivity"
                actions={
                    <Button variant="secondary" icon={RefreshCw} onClick={checkHealth}>
                        Refresh
                    </Button>
                }
            />

            {/* Overall Status */}
            {isLoading ? (
                <Card className="mb-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        <span className="ml-3 text-slate-500">Checking services...</span>
                    </div>
                </Card>
            ) : (
                <div className={`${allOnline ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} border rounded-xl p-6 mb-6`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${allOnline ? 'bg-emerald-500' : 'bg-amber-500'} rounded-xl flex items-center justify-center`}>
                            {allOnline ? (
                                <CheckCircle className="w-8 h-8 text-white" />
                            ) : (
                                <XCircle className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${allOnline ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {allOnline ? 'All Systems Operational' : `${onlineCount}/${services.length} Services Online`}
                            </h2>
                            <p className={allOnline ? 'text-emerald-600' : 'text-amber-600'}>
                                Last checked: {lastUpdated.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Status Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {services.map((svc) => (
                    <Card key={svc.name}>
                        <div className="flex items-center gap-3 mb-3">
                            <svc.icon className="w-5 h-5 text-slate-600" />
                            <span className="font-medium text-slate-900">{svc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusDot status={svc.status} />
                            <span className="text-sm text-slate-600">{svc.detail}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Connection Info */}
            <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Connection Details</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Backend URL</span>
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                            {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                        </code>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Frontend URL</span>
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                            http://localhost:3000
                        </code>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-600">Environment</span>
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                            Development
                        </code>
                    </div>
                </div>
            </Card>

            {!allOnline && (
                <Alert type="warning" className="mt-6">
                    Some services are offline. Make sure the backend is running with:
                    <code className="block mt-2 bg-white/50 p-2 rounded text-sm">
                        cd backend &amp;&amp; .\venv\Scripts\activate &amp;&amp; python -m uvicorn main:app --reload
                    </code>
                </Alert>
            )}
        </DashboardLayout>
    );
}
