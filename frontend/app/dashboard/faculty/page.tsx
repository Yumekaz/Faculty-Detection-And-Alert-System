'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Upload, User, Loader2, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header, Card, Button, Input, Select, Badge, Table, Modal, Alert } from '@/components/ui';
import { DEPARTMENTS } from '@/lib/constants';
import { listFaculty, addFaculty, deleteFaculty } from '@/app/api/recognition';

interface FacultyMember {
    name: string;
    department?: string;
}

export default function FacultyPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [newFacultyName, setNewFacultyName] = useState('');
    const [newFacultyDept, setNewFacultyDept] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    useEffect(() => {
        loadFacultyFromBackend();
    }, []);

    const loadFacultyFromBackend = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const names = await listFaculty();
            setFacultyList(names.map(name => ({ name, department: undefined })));
        } catch (err) {
            console.error('Failed to load faculty:', err);
            setError('Failed to connect to backend. Make sure the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFaculty = facultyList.filter((f) => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleEnrollFaculty = async () => {
        if (!newFacultyName || !selectedImage) {
            alert('Please provide name and photo');
            return;
        }

        setIsSubmitting(true);
        try {
            await addFaculty(newFacultyName, selectedImage);
            await loadFacultyFromBackend();
            setShowEnrollModal(false);
            // Reset form
            setNewFacultyName('');
            setNewFacultyDept('');
            setSelectedImage(null);
        } catch (err) {
            console.error('Failed to add faculty:', err);
            alert('Failed to enroll faculty. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFaculty = async (name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            await deleteFaculty(name);
            await loadFacultyFromBackend();
        } catch (err) {
            console.error('Failed to delete faculty:', err);
            alert('Failed to delete faculty. Please try again.');
        }
    };

    const columns = [
        {
            header: 'Faculty',
            render: (row: FacultyMember) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{row.name}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            render: () => (
                <Badge variant="success">Enrolled</Badge>
            ),
        },
        {
            header: 'Actions',
            render: (row: FacultyMember) => (
                <button
                    onClick={() => handleDeleteFaculty(row.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Header
                title="Faculty Management"
                subtitle="Manage faculty enrollment and biometric data"
                actions={
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={RefreshCw} onClick={loadFacultyFromBackend}>
                            Refresh
                        </Button>
                        <Button variant="primary" icon={Plus} onClick={() => setShowEnrollModal(true)}>
                            Enroll New Faculty
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
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
                    </div>
                </div>
            </Card>

            {/* Faculty Table */}
            <Card padding={false}>
                {isLoading ? (
                    <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : facultyList.length === 0 ? (
                    <div className="py-12 text-center">
                        <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No faculty enrolled yet.</p>
                        <p className="text-sm text-slate-400 mt-1">Click &quot;Enroll New Faculty&quot; to add your first faculty member.</p>
                    </div>
                ) : (
                    <Table columns={columns} data={filteredFaculty} />
                )}
            </Card>

            {/* Stats */}
            <div className="mt-6 flex gap-4">
                <Card className="flex-1">
                    <p className="text-sm text-slate-500">Total Enrolled</p>
                    <p className="text-2xl font-bold text-slate-900">{facultyList.length}</p>
                </Card>
                <Card className="flex-1">
                    <p className="text-sm text-slate-500">Backend Status</p>
                    <p className={`text-2xl font-bold ${error ? 'text-rose-600' : 'text-emerald-600'}`}>{error ? 'Disconnected' : 'Connected'}</p>
                </Card>
            </div>

            {/* Enroll Modal */}
            <Modal
                isOpen={showEnrollModal}
                onClose={() => setShowEnrollModal(false)}
                title="Enroll New Faculty"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            placeholder="Dr. John Smith"
                            required
                            value={newFacultyName}
                            onChange={(e) => setNewFacultyName(e.target.value)}
                        />
                        <Select
                            label="Department (Optional)"
                            options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                            placeholder="Select department"
                            value={newFacultyDept}
                            onChange={(e) => setNewFacultyDept(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Biometric Photo
                            <span className="text-rose-500 ml-1">*</span>
                        </label>
                        <div
                            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                            />
                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                            {selectedImage ? (
                                <p className="text-sm text-emerald-600">{selectedImage.name}</p>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-600 mb-1">
                                        Click to upload faculty photo
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        JPG, PNG (max 5MB) - Clear frontal face photo
                                    </p>
                                </>
                            )}
                        </div>
                        <Alert type="info">
                            The photo will be processed for face recognition. Ensure the face is clearly visible.
                        </Alert>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button variant="secondary" onClick={() => setShowEnrollModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            icon={Plus}
                            onClick={handleEnrollFaculty}
                            disabled={isSubmitting || !newFacultyName || !selectedImage}
                        >
                            {isSubmitting ? 'Enrolling...' : 'Enroll Faculty'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
