'use client';

import { Bell, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header, Card } from '@/components/ui';

export default function AlertsPage() {
    return (
        <DashboardLayout>
            <Header
                title="Alerts"
                subtitle="View system notifications and alerts"
            />

            <Card className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Alerts</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    You&apos;re all caught up! Alerts will appear here when there are important
                    notifications about attendance, system status, or configuration changes.
                </p>
            </Card>

            <Card className="mt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Alert Types</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Bell className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">Info</p>
                            <p className="text-xs text-blue-600">General system notifications</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                        <Bell className="w-5 h-5 text-amber-500" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">Warning</p>
                            <p className="text-xs text-amber-600">Low attendance or configuration issues</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg">
                        <Bell className="w-5 h-5 text-rose-500" />
                        <div>
                            <p className="text-sm font-medium text-rose-800">Error</p>
                            <p className="text-xs text-rose-600">System errors requiring attention</p>
                        </div>
                    </div>
                </div>
            </Card>
        </DashboardLayout>
    );
}
