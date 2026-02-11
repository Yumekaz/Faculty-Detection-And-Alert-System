'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header, Card, Button, Input, Textarea, Badge } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { createCorrection, listCorrections, reviewCorrection, CorrectionRequest } from '@/app/api/corrections';
import { ROLES } from '@/lib/constants';

export default function CorrectionsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<CorrectionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [facultyName, setFacultyName] = useState('');
    const [date, setDate] = useState('');
    const [period, setPeriod] = useState('');
    const [reason, setReason] = useState('');

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const data = await listCorrections();
            setRequests(data.requests || []);
        } catch (e) {
            console.error('Failed to load corrections:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleSubmit = async () => {
        if (!facultyName || !date || !reason) {
            alert('Please fill in Faculty, Date, and Reason.');
            return;
        }
        setIsSubmitting(true);
        try {
            await createCorrection({
                faculty_name: facultyName,
                date,
                period: period || undefined,
                reason,
                requester: user?.name || 'unknown',
            });
            setFacultyName('');
            setDate('');
            setPeriod('');
            setReason('');
            await loadRequests();
            alert('Correction request submitted.');
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Failed to submit request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReview = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await reviewCorrection(id, status, user?.name || 'reviewer');
            await loadRequests();
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Failed to update request.');
        }
    };

    const isReviewer = user?.role === ROLES.ADMIN || user?.role === ROLES.HOD;

    return (
        <DashboardLayout>
            <Header
                title="Attendance Corrections"
                subtitle="Request and review attendance corrections"
            />

            <Card className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-4">Submit a Correction Request</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Faculty Name"
                        placeholder="Dr. Priya Patel"
                        value={facultyName}
                        onChange={(e) => setFacultyName(e.target.value)}
                    />
                    <Input
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <Input
                        label="Period (optional)"
                        placeholder="Period 2"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    />
                    <div />
                    <div className="col-span-2">
                        <Textarea
                            label="Reason"
                            placeholder="Camera failure / wrong marking / leave approved..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <Button icon={isSubmitting ? Loader2 : Send} onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </div>
            </Card>

            <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Requests</h3>
                {isLoading ? (
                    <div className="py-10 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : requests.length === 0 ? (
                    <p className="text-slate-500">No correction requests yet.</p>
                ) : (
                    <div className="space-y-3">
                        {requests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between border-b border-slate-100 py-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900">{req.faculty_name}</span>
                                        <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}>
                                            {req.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        {req.date} {req.period ? `• ${req.period}` : ''} • Requested by {req.requester}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">{req.reason}</p>
                                </div>
                                {isReviewer && req.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button variant="secondary" icon={CheckCircle} onClick={() => handleReview(req.id!, 'approved')}>
                                            Approve
                                        </Button>
                                        <Button variant="danger" icon={XCircle} onClick={() => handleReview(req.id!, 'rejected')}>
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </DashboardLayout>
    );
}
