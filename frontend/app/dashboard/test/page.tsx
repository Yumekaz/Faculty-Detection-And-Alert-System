'use client';

import { useState, useCallback } from 'react';
import {
    Play,
    CheckCircle,
    XCircle,
    Loader2,
    Clock,
    Server,
    Brain,
    Users,
    Settings,
    ScanFace,
    FileText,
    Mail,
    Camera,
    RotateCcw,
    AlertTriangle,
    PlayCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

interface TestStep {
    id: string;
    name: string;
    description: string;
    icon: typeof Server;
    status: TestStatus;
    duration?: number;
    error?: string;
    result?: any;
}

const initialSteps: TestStep[] = [
    { id: 'backend', name: 'Backend Connection', description: 'Check FastAPI server connectivity', icon: Server, status: 'pending' },
    { id: 'models', name: 'Model Initialization', description: 'Load YOLO + InsightFace AI models', icon: Brain, status: 'pending' },
    { id: 'faculty', name: 'Faculty Database', description: 'Verify faculty records accessible', icon: Users, status: 'pending' },
    { id: 'config', name: 'Configuration', description: 'Load system configuration', icon: Settings, status: 'pending' },
    { id: 'detection', name: 'Face Detection Pipeline', description: 'Test face detection capability', icon: ScanFace, status: 'pending' },
    { id: 'logs', name: 'Attendance Logging', description: 'Verify log file read/write', icon: FileText, status: 'pending' },
    { id: 'email', name: 'Email Notification', description: 'Test email configuration', icon: Mail, status: 'pending' },
    { id: 'dvr', name: 'DVR Cameras', description: 'Check camera system status', icon: Camera, status: 'pending' },
];

// Test functions for each module
const testFunctions: Record<string, () => Promise<any>> = {
    backend: async () => {
        const res = await fetch(`${API_BASE}/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    models: async () => {
        const res = await fetch(`${API_BASE}/inference/init-models`, { method: 'POST' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.status === 'error') throw new Error(data.message);
        return data;
    },
    faculty: async () => {
        const res = await fetch(`${API_BASE}/recognition/faculty/list`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { count: data.faculty?.length || 0 };
    },
    config: async () => {
        const res = await fetch(`${API_BASE}/config/config`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    detection: async () => {
        const res = await fetch(`${API_BASE}/attendance/manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_faculty: null })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    logs: async () => {
        const res = await fetch(`${API_BASE}/attendance/logs`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { logCount: data.logs?.length || 0 };
    },
    email: async () => {
        const res = await fetch(`${API_BASE}/config/config`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const config = await res.json();
        if (!config.sender_email) {
            throw new Error('Email not configured');
        }
        return { configured: true, receiver: config.email_receiver };
    },
    dvr: async () => {
        const res = await fetch(`${API_BASE}/dvr/status`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }
};

export default function SystemTestPage() {
    const [steps, setSteps] = useState<TestStep[]>(initialSteps);
    const [isRunning, setIsRunning] = useState(false);
    const [runningStep, setRunningStep] = useState<string | null>(null);
    const [totalTime, setTotalTime] = useState<number>(0);

    const updateStep = (id: string, updates: Partial<TestStep>) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const resetTests = () => {
        setSteps(initialSteps);
        setTotalTime(0);
        setRunningStep(null);
    };

    const runSingleTest = async (stepId: string) => {
        if (isRunning) return;

        setRunningStep(stepId);
        // eslint-disable-next-line react-hooks/purity
        const startTime = Date.now();
        updateStep(stepId, { status: 'running', error: undefined, result: undefined });

        try {
            const result = await testFunctions[stepId]();
            // eslint-disable-next-line react-hooks/purity
            const duration = Date.now() - startTime;
            updateStep(stepId, { status: 'passed', duration, result });
        } catch (error: any) {
            // eslint-disable-next-line react-hooks/purity
            const duration = Date.now() - startTime;
            updateStep(stepId, {
                status: 'failed',
                duration,
                error: error.message || 'Unknown error'
            });
        }

        setRunningStep(null);
    };

    const runAllTests = async () => {
        setIsRunning(true);
        resetTests();
        const overallStart = Date.now();

        for (const step of initialSteps) {
            setRunningStep(step.id);
            const startTime = Date.now();
            updateStep(step.id, { status: 'running' });

            try {
                const result = await testFunctions[step.id]();
                const duration = Date.now() - startTime;
                updateStep(step.id, { status: 'passed', duration, result });
            } catch (error: any) {
                const duration = Date.now() - startTime;
                updateStep(step.id, {
                    status: 'failed',
                    duration,
                    error: error.message || 'Unknown error'
                });

                // Stop on backend failure
                if (step.id === 'backend') break;
            }
        }

        setTotalTime(Date.now() - overallStart);
        setIsRunning(false);
        setRunningStep(null);
    };

    const passedCount = steps.filter(s => s.status === 'passed').length;
    const failedCount = steps.filter(s => s.status === 'failed').length;
    const testedCount = passedCount + failedCount;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Play className="w-5 h-5 text-white" />
                        </div>
                        System Test
                    </h1>
                    <p className="text-slate-500 mt-1">Run comprehensive system diagnostics</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        icon={RotateCcw}
                        onClick={resetTests}
                        disabled={isRunning}
                    >
                        Reset
                    </Button>
                    <Button
                        icon={isRunning ? Loader2 : Play}
                        onClick={runAllTests}
                        disabled={isRunning || runningStep !== null}
                        className={isRunning ? 'animate-pulse' : ''}
                    >
                        {isRunning ? 'Running Tests...' : 'Run All Tests'}
                    </Button>
                </div>
            </div>

            {/* Summary Card */}
            {testedCount > 0 && (
                <Card className={`mb-6 ${failedCount > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${failedCount > 0 ? 'bg-red-500' : 'bg-emerald-500'} rounded-xl flex items-center justify-center`}>
                                {failedCount > 0 ? (
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                ) : (
                                    <CheckCircle className="w-6 h-6 text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className={`font-bold ${failedCount > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
                                    {failedCount > 0
                                        ? `${failedCount} Test${failedCount > 1 ? 's' : ''} Failed`
                                        : testedCount === steps.length
                                            ? 'All Tests Passed'
                                            : `${passedCount} Test${passedCount > 1 ? 's' : ''} Passed`
                                    }
                                </h3>
                                <p className={failedCount > 0 ? 'text-red-600' : 'text-emerald-600'}>
                                    {passedCount}/{testedCount} tests passed
                                </p>
                            </div>
                        </div>
                        {totalTime > 0 && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="w-4 h-4" />
                                <span>{(totalTime / 1000).toFixed(2)}s total</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Instructions */}
            <Card className="mb-6 bg-slate-50 border-slate-200">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-slate-800">How to use</h4>
                        <p className="text-sm text-slate-600 mt-1">
                            Click <strong>&quot;Run All Tests&quot;</strong> to test the entire system in sequence,
                            or click the <strong>play button</strong> on individual steps to test specific modules.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Test Steps */}
            <div className="space-y-3">
                {steps.map((step, index) => (
                    <TestStepCard
                        key={step.id}
                        step={step}
                        stepNumber={index + 1}
                        isActive={runningStep === step.id}
                        onRunTest={() => runSingleTest(step.id)}
                        disabled={isRunning || runningStep !== null}
                    />
                ))}
            </div>
        </DashboardLayout>
    );
}

interface TestStepCardProps {
    step: TestStep;
    stepNumber: number;
    isActive: boolean;
    onRunTest: () => void;
    disabled: boolean;
}

function TestStepCard({ step, stepNumber, isActive, onRunTest, disabled }: TestStepCardProps) {
    const Icon = step.icon;

    const statusColors = {
        pending: 'bg-slate-100 text-slate-400',
        running: 'bg-blue-100 text-blue-600',
        passed: 'bg-emerald-100 text-emerald-600',
        failed: 'bg-red-100 text-red-600',
        skipped: 'bg-amber-100 text-amber-600',
    };

    const StatusIcon = {
        pending: Clock,
        running: Loader2,
        passed: CheckCircle,
        failed: XCircle,
        skipped: AlertTriangle,
    }[step.status];

    return (
        <Card className={`transition-all ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
            <div className="flex items-center gap-4">
                {/* Run Individual Test Button */}
                <button
                    onClick={onRunTest}
                    disabled={disabled || step.status === 'running'}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${disabled || step.status === 'running'
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-violet-100 text-violet-600 hover:bg-violet-200 hover:scale-105'
                        }`}
                    title={`Run ${step.name} test`}
                >
                    {step.status === 'running' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <PlayCircle className="w-5 h-5" />
                    )}
                </button>

                {/* Step Number */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.status === 'passed' ? 'bg-emerald-500 text-white' :
                        step.status === 'failed' ? 'bg-red-500 text-white' :
                            step.status === 'running' ? 'bg-blue-500 text-white' :
                                'bg-slate-200 text-slate-500'
                    }`}>
                    {stepNumber}
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColors[step.status]}`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{step.name}</h4>
                    <p className="text-sm text-slate-500">{step.description}</p>
                    {step.error && (
                        <p className="text-sm text-red-600 mt-1">Error: {step.error}</p>
                    )}
                    {step.result && step.status === 'passed' && (
                        <p className="text-sm text-emerald-600 mt-1">
                            {JSON.stringify(step.result).slice(0, 100)}
                        </p>
                    )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                    {step.duration !== undefined && (
                        <span className="text-sm text-slate-400">
                            {step.duration}ms
                        </span>
                    )}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[step.status]}`}>
                        <StatusIcon className={`w-4 h-4 ${step.status === 'running' ? 'animate-spin' : ''}`} />
                        <span className="capitalize">{step.status}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
