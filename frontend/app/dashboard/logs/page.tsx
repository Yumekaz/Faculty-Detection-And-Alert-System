'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Lock, Loader2, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header, Card, Button, Input, Badge, Alert } from '@/components/ui';
import { getAttendanceLogs, clearAttendanceLogs, AttendanceLog } from '@/app/api/attendance';

export default function LogsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const logs = await getAttendanceLogs();
            setAttendanceLogs(logs);
        } catch (err) {
            console.error('Failed to load logs:', err);
            setError('Failed to connect to backend. Make sure the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearLogs = async () => {
        if (!confirm('Are you sure you want to clear all attendance logs? This action cannot be undone.')) {
            return;
        }
        try {
            await clearAttendanceLogs();
            await loadLogs();
        } catch (err) {
            console.error('Failed to clear logs:', err);
            alert('Failed to clear logs. Please try again.');
        }
    };

    const handleExportCSV = () => {
        if (attendanceLogs.length === 0) {
            alert('No logs to export');
            return;
        }

        const headers = ['Timestamp', 'Name', 'Status', 'Period', 'Confidence'];
        const rows = attendanceLogs.map(log => [
            new Date(log.timestamp).toISOString(),
            log.name || 'Unknown',
            log.status,
            log.period || '',
            log.confidence?.toString() || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredLogs = attendanceLogs.filter((log) => {
        const matchesSearch = !searchQuery ||
            (log.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            log.status.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <DashboardLayout>
            <Header
                title="Attendance Logs"
                subtitle="View attendance detection history"
                actions={
                    <div className="flex items-center gap-2">
                        <Badge variant="default" size="lg">
                            <Lock className="w-3 h-3 mr-1" />
                            {attendanceLogs.length} Records
                        </Badge>
                        <Button variant="secondary" icon={RefreshCw} onClick={loadLogs}>
                            Refresh
                        </Button>
                        <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
                            Export CSV
                        </Button>
                    </div>
                }
            />

            {error && (
                <Alert type="error" className="mb-6">{error}</Alert>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by name or status..."
                            icon={Search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="danger" onClick={handleClearLogs}>
                        Clear All Logs
                    </Button>
                </div>
            </Card>

            {/* Logs Table */}
            <Card>
                {isLoading ? (
                    <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-slate-500">No attendance logs found.</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Logs will appear here after running face detection.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredLogs.map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-sm text-slate-500 w-40">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                    <Badge variant={log.status === 'Present' ? 'success' : log.status === 'Absent' ? 'danger' : 'warning'}>
                                        {log.status}
                                    </Badge>
                                    <span className="text-sm text-slate-900">{log.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    {log.period && <span>Period: {log.period}</span>}
                                    {log.confidence !== undefined && log.confidence !== null && !Number.isNaN(Number(log.confidence)) && (
                                        <span>Confidence: {(Number(log.confidence) * 100).toFixed(1)}%</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </DashboardLayout>
    );
}
