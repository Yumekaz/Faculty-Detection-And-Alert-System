'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Loader2, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header, Card, Button } from '@/components/ui';
import { getFullSchedule, updateSchedule, SchedulePeriod } from '@/app/api/schedule';

export default function SchedulesPage() {
    const [schedule, setSchedule] = useState<SchedulePeriod[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        setIsLoading(true);
        try {
            const data = await getFullSchedule();
            setSchedule(data);
        } catch (error) {
            console.error('Failed to load schedule:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSchedule = async () => {
        try {
            const cleaned = schedule
                .map((p) => ({
                    ...p,
                    period: Number(p.period),
                }))
                .sort((a, b) => a.period - b.period);

            await updateSchedule(cleaned);
            setSchedule(cleaned);
            alert('Schedule saved successfully!');
        } catch (error) {
            console.error('Failed to save schedule:', error);
            alert('Failed to save schedule. Please try again.');
        }
    };

    const handleAddPeriod = () => {
        const nextPeriod = schedule.length > 0
            ? Math.max(...schedule.map((p) => Number(p.period) || 0)) + 1
            : 1;

        setSchedule((prev) => [
            ...prev,
            {
                period: nextPeriod,
                start: '09:00',
                end: '10:00',
                faculty: '',
                subject: '',
            },
        ]);
    };

    const handleUpdate = (index: number, field: keyof SchedulePeriod, value: string | number) => {
        setSchedule((prev) =>
            prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
        );
    };

    const handleDelete = (index: number) => {
        setSchedule((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <DashboardLayout>
            <Header
                title="Schedule Management"
                subtitle="Configure class schedules and faculty assignments"
                action={
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={Plus} onClick={handleAddPeriod}>
                            Add Period
                        </Button>
                        <Button variant="primary" icon={Check} onClick={handleSaveSchedule}>
                            Save Changes
                        </Button>
                    </div>
                }
            />

            {/* Schedule Grid */}
            <Card>
                {isLoading ? (
                    <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : schedule.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-slate-500 mb-4">No schedules configured yet.</p>
                        <p className="text-sm text-slate-400">Click “Add Period” to create your first class slot.</p>
                    </div>
                ) : null}

                {schedule.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-200">
                                    <th className="py-2 pr-4">Period</th>
                                    <th className="py-2 pr-4">Start</th>
                                    <th className="py-2 pr-4">End</th>
                                    <th className="py-2 pr-4">Faculty</th>
                                    <th className="py-2 pr-4">Subject</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((p, idx) => (
                                    <tr key={`${p.period}-${idx}`} className="border-b border-slate-100">
                                        <td className="py-2 pr-4">
                                            <input
                                                type="number"
                                                min={1}
                                                value={p.period}
                                                onChange={(e) => handleUpdate(idx, 'period', Number(e.target.value))}
                                                className="w-20 rounded-md border border-slate-200 px-2 py-1"
                                            />
                                        </td>
                                        <td className="py-2 pr-4">
                                            <input
                                                type="time"
                                                value={p.start}
                                                onChange={(e) => handleUpdate(idx, 'start', e.target.value)}
                                                className="rounded-md border border-slate-200 px-2 py-1"
                                            />
                                        </td>
                                        <td className="py-2 pr-4">
                                            <input
                                                type="time"
                                                value={p.end}
                                                onChange={(e) => handleUpdate(idx, 'end', e.target.value)}
                                                className="rounded-md border border-slate-200 px-2 py-1"
                                            />
                                        </td>
                                        <td className="py-2 pr-4">
                                            <input
                                                type="text"
                                                value={p.faculty}
                                                onChange={(e) => handleUpdate(idx, 'faculty', e.target.value)}
                                                placeholder="Faculty name"
                                                className="w-48 rounded-md border border-slate-200 px-2 py-1"
                                            />
                                        </td>
                                        <td className="py-2 pr-4">
                                            <input
                                                type="text"
                                                value={p.subject || ''}
                                                onChange={(e) => handleUpdate(idx, 'subject', e.target.value)}
                                                placeholder="Subject (optional)"
                                                className="w-48 rounded-md border border-slate-200 px-2 py-1"
                                            />
                                        </td>
                                        <td className="py-2">
                                            <button
                                                onClick={() => handleDelete(idx)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                aria-label="Delete period"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </DashboardLayout>
    );
}
