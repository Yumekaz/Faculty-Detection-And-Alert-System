'use client';

import { useEffect, useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header, Card, Button, Badge } from '@/components/ui';
import { getAuditLogs, AuditLog, auditExportUrl } from '@/app/api/audit';

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await getAuditLogs(500);
            setLogs(data);
        } catch (e) {
            console.error('Failed to load audit logs:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <DashboardLayout>
            <Header
                title="Audit Trail"
                subtitle="Track critical system actions"
                action={
                    <Button variant="secondary" icon={Download} onClick={() => (window.location.href = auditExportUrl())}>
                        Export CSV
                    </Button>
                }
            />

            <Card>
                {isLoading ? (
                    <div className="py-10 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : logs.length === 0 ? (
                    <p className="text-slate-500">No audit events yet.</p>
                ) : (
                    <div className="space-y-2">
                        {logs.map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-900">{log.action}</span>
                                        <Badge variant={log.status === 'success' ? 'success' : log.status === 'error' ? 'danger' : 'warning'}>
                                            {log.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {log.timestamp} • {log.actor}
                                    </p>
                                </div>
                                <span className="text-sm text-slate-600">{log.details}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </DashboardLayout>
    );
}
