'use client';

import { useState, useEffect } from 'react';
import {
    Users, Calendar, Camera, CheckCircle, RefreshCw, Plus, Settings,
    Building2, TrendingUp, AlertCircle, BookOpen, Loader2, Sparkles,
    ArrowUpRight, Activity, Clock, Zap, Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Header, StatCard, Badge, Button } from '@/components/ui';
import { ROLES, DEPARTMENTS } from '@/lib/constants';
import { listFaculty } from '@/app/api/recognition';
import { getAttendanceLogs, AttendanceLog } from '@/app/api/attendance';
import { getFullSchedule, SchedulePeriod } from '@/app/api/schedule';
import { cn } from '@/lib/utils';

// Animated Counter Component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let startTime: number;
        let animationFrame: number;
        
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * value));
            
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };
        
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);
    
    return <span>{count}</span>;
}

// Quick Action Card
function QuickActionCard({ 
    icon: Icon, 
    title, 
    description, 
    href, 
    color = 'brand' 
}: { 
    icon: any; 
    title: string; 
    description: string; 
    href: string;
    color?: 'brand' | 'emerald' | 'amber' | 'rose';
}) {
    const colorStyles = {
        brand: 'from-brand-500 to-brand-600 hover:shadow-brand-500/30',
        emerald: 'from-emerald-500 to-emerald-600 hover:shadow-emerald-500/30',
        amber: 'from-amber-500 to-amber-600 hover:shadow-amber-500/30',
        rose: 'from-rose-500 to-rose-600 hover:shadow-rose-500/30',
    };

    return (
        <a 
            href={href}
            className={cn(
                "group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100",
                "hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            )}
        >
            <div className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                "text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
                colorStyles[color]
            )}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-slate-500 truncate">{description}</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
        </a>
    );
}

// Status Banner Component
function StatusBanner({ status, onRefresh }: { status: 'ready' | 'warning' | 'error'; onRefresh: () => void }) {
    const configs = {
        ready: {
            bg: 'bg-emerald-50 border-emerald-200',
            icon: 'bg-emerald-500',
            text: 'text-emerald-800',
            subtext: 'text-emerald-600',
            label: 'System Ready',
            message: 'All systems operational',
        },
        warning: {
            bg: 'bg-amber-50 border-amber-200',
            icon: 'bg-amber-500',
            text: 'text-amber-800',
            subtext: 'text-amber-600',
            label: 'System Warning',
            message: 'Some services may be slow',
        },
        error: {
            bg: 'bg-rose-50 border-rose-200',
            icon: 'bg-rose-500',
            text: 'text-rose-800',
            subtext: 'text-rose-600',
            label: 'System Error',
            message: 'Connection issues detected',
        },
    };

    const config = configs[status];

    return (
        <div className={cn(
            "mb-6 rounded-2xl border p-4 flex items-center justify-between",
            config.bg
        )}>
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                    config.icon
                )}>
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className={cn("font-bold", config.text)}>{config.label}</p>
                        <span className="relative flex h-2 w-2">
                            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.icon)} />
                            <span className={cn("relative inline-flex rounded-full h-2 w-2", config.icon)} />
                        </span>
                    </div>
                    <p className={cn("text-sm", config.subtext)}>{config.message}</p>
                </div>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                icon={RefreshCw} 
                onClick={onRefresh}
                className="hover:bg-white/50"
            >
                Refresh
            </Button>
        </div>
    );
}

// Activity Item Component
function ActivityItem({ log, index }: { log: AttendanceLog; index: number }) {
    const time = new Date(log.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    return (
        <div 
            className={cn(
                "flex items-center gap-4 py-3 border-b border-slate-50 last:border-0",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="w-12 text-xs font-mono text-slate-400">{time}</div>
            <Badge 
                variant={log.status === 'Present' ? 'success' : log.status === 'Absent' ? 'danger' : 'warning'} 
                size="sm"
                dot
            >
                {log.status}
            </Badge>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{log.name || 'Unknown'}</p>
                <p className="text-xs text-slate-400">{log.period || 'Period --'}</p>
            </div>
        </div>
    );
}

// ============================================
// ADMIN DASHBOARD
// ============================================
function AdminDashboard() {
    const [facultyCount, setFacultyCount] = useState<number>(0);
    const [schedules, setSchedules] = useState<SchedulePeriod[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [faculty, schedule, attendanceLogs] = await Promise.all([
                listFaculty().catch(() => []),
                getFullSchedule().catch(() => []),
                getAttendanceLogs().catch(() => []),
            ]);
            setFacultyCount(faculty.length);
            setSchedules(schedule);
            setLogs(attendanceLogs);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const todayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp).toDateString();
        return logDate === new Date().toDateString();
    });

    const presentCount = todayLogs.filter(l => l.status === 'Present').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                    <p className="text-slate-500 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header 
                title="System Dashboard" 
                subtitle="Welcome back! Here's your system overview."
                icon={<Sparkles className="w-5 h-5" />}
            />

            {/* Status Banner */}
            <StatusBanner status="ready" onRefresh={loadData} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Faculty Enrolled" 
                    value={facultyCount} 
                    icon={Users} 
                    variant="info" 
                    trend="up"
                    trendValue="+12%"
                />
                <StatCard 
                    title="Active Schedules" 
                    value={schedules.length} 
                    icon={Calendar} 
                    variant="purple"
                    subtitle="Across all departments"
                />
                <StatCard 
                    title="Detections Today" 
                    value={todayLogs.length} 
                    icon={Camera} 
                    variant="success"
                    trend="up"
                    trendValue="+5"
                />
                <StatCard 
                    title="Present Today" 
                    value={presentCount} 
                    icon={CheckCircle} 
                    variant="gradient"
                    subtitle={`${Math.round((presentCount / (facultyCount || 1)) * 100)}% attendance rate`}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <QuickActionCard
                    icon={Plus}
                    title="Enroll Faculty"
                    description="Add new faculty members to the system"
                    href="/dashboard/faculty"
                    color="brand"
                />
                <QuickActionCard
                    icon={Calendar}
                    title="Manage Schedules"
                    description="Update class schedules and timetables"
                    href="/dashboard/schedules"
                    color="emerald"
                />
                <QuickActionCard
                    icon={Settings}
                    title="Configuration"
                    description="System settings and preferences"
                    href="/dashboard/settings"
                    color="amber"
                />
            </div>

            {/* Recent Activity */}
            <Card variant="elevated">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                        <p className="text-sm text-slate-500">Latest attendance detections</p>
                    </div>
                    <Button variant="ghost" size="sm" href="/dashboard/logs">
                        View All
                    </Button>
                </div>
                
                {logs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500">No attendance logs yet</p>
                        <p className="text-sm text-slate-400 mt-1">Run a detection to see logs here</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {logs.slice(0, 5).map((log, idx) => (
                            <ActivityItem key={idx} log={log} index={idx} />
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

// ============================================
// DIRECTOR DASHBOARD
// ============================================
function DirectorDashboard() {
    const [facultyCount, setFacultyCount] = useState<number>(0);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [faculty, attendanceLogs] = await Promise.all([
                listFaculty().catch(() => []),
                getAttendanceLogs().catch(() => []),
            ]);
            setFacultyCount(faculty.length);
            setLogs(attendanceLogs);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const todayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp).toDateString();
        return logDate === new Date().toDateString();
    });

    const attendanceRate = todayLogs.length > 0
        ? Math.round((todayLogs.filter(l => l.status === 'Present').length / todayLogs.length) * 100)
        : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        );
    }

    return (
        <div>
            <Header 
                title="Institution Dashboard" 
                subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                icon={<Building2 className="w-5 h-5" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Faculty" value={facultyCount} icon={Users} variant="info" />
                <StatCard 
                    title="Today's Attendance" 
                    value={`${attendanceRate}%`} 
                    icon={CheckCircle} 
                    variant={attendanceRate > 80 ? 'success' : attendanceRate > 50 ? 'warning' : 'danger'}
                />
                <StatCard title="Detections Today" value={todayLogs.length} icon={Camera} variant="default" />
                <StatCard title="Departments" value={DEPARTMENTS.length} icon={Building2} variant="purple" />
            </div>

            <Card variant="elevated">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Department Overview</h3>
                <div className="space-y-4">
                    {DEPARTMENTS.map((dept) => (
                        <div key={dept} className="flex items-center gap-4">
                            <span className="w-32 text-sm font-medium text-slate-600 truncate">{dept}</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-1000" 
                                    style={{ width: '0%' }} 
                                />
                            </div>
                            <span className="w-12 text-sm font-medium text-slate-500">--</span>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-slate-400 mt-4 text-center">
                    Department statistics will appear once attendance data is collected.
                </p>
            </Card>
        </div>
    );
}

// ============================================
// HOD DASHBOARD
// ============================================
function HODDashboard() {
    const { user } = useAuth();
    const [facultyList, setFacultyList] = useState<string[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [faculty, attendanceLogs] = await Promise.all([
                listFaculty().catch(() => []),
                getAttendanceLogs().catch(() => []),
            ]);
            setFacultyList(faculty);
            setLogs(attendanceLogs);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const todayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp).toDateString();
        return logDate === new Date().toDateString();
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        );
    }

    return (
        <div>
            <Header 
                title="Department Dashboard" 
                subtitle={user?.department || 'Department'}
                icon={<Users className="w-5 h-5" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Department Faculty" value={facultyList.length} icon={Users} variant="info" />
                <StatCard title="Detections Today" value={todayLogs.length} icon={CheckCircle} variant="success" />
                <StatCard 
                    title="Present Today" 
                    value={todayLogs.filter(l => l.status === 'Present').length} 
                    icon={CheckCircle} 
                    variant="success" 
                />
                <StatCard 
                    title="Absent Today" 
                    value={todayLogs.filter(l => l.status === 'Absent').length} 
                    icon={AlertCircle} 
                    variant="danger" 
                />
            </div>

            <Card variant="elevated">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Enrolled Faculty</h3>
                {facultyList.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500">No faculty enrolled yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {facultyList.map((name, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">{name}</span>
                                </div>
                                <Badge variant="success" size="sm" dot>Enrolled</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

// ============================================
// FACULTY DASHBOARD
// ============================================
function FacultyDashboard() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [schedules, setSchedules] = useState<SchedulePeriod[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const firstName = user?.name.split(' ')[0] || 'User';
    const greeting = new Date().getHours() < 12 ? 'Good Morning' : 
                     new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [attendanceLogs, schedule] = await Promise.all([
                getAttendanceLogs().catch(() => []),
                getFullSchedule().catch(() => []),
            ]);
            setLogs(attendanceLogs);
            setSchedules(schedule);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const myLogs = logs.filter(log =>
        log.name?.toLowerCase().includes(firstName.toLowerCase())
    );

    const todayLogs = myLogs.filter(log => {
        const logDate = new Date(log.timestamp).toDateString();
        return logDate === new Date().toDateString();
    });

    const isPresent = todayLogs.some(log => log.status === 'Present');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        );
    }

    return (
        <div>
            <Header 
                title={`${greeting}, ${firstName}`} 
                subtitle={user?.department || ''}
                icon={<Zap className="w-5 h-5" />}
            />

            {/* Attendance Status Card */}
            <div className={cn(
                "mb-8 rounded-2xl p-6 border-2 transition-all duration-500",
                isPresent 
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200' 
                    : 'bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200'
            )}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                        isPresent ? 'bg-emerald-500' : 'bg-slate-400'
                    )}>
                        {isPresent ? (
                            <CheckCircle className="w-8 h-8 text-white" />
                        ) : (
                            <Clock className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className={cn(
                            "text-lg font-bold",
                            isPresent ? 'text-emerald-800' : 'text-slate-700'
                        )}>
                            {isPresent ? 'You are marked PRESENT' : 'No detection recorded today'}
                        </h3>
                        <p className={cn(
                            "text-sm",
                            isPresent ? 'text-emerald-600' : 'text-slate-500'
                        )}>
                            {isPresent 
                                ? `Last detected: ${todayLogs[0] ? new Date(todayLogs[0].timestamp).toLocaleTimeString() : '--'}`
                                : 'Attendance will update after face detection'
                            }
                        </p>
                    </div>
                    <Badge 
                        variant={isPresent ? 'success' : 'default'} 
                        size="lg"
                        pulse={isPresent}
                    >
                        {isPresent ? 'Present' : 'Pending'}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Today's Classes" value={schedules.length} icon={BookOpen} variant="info" />
                <StatCard title="My Detections" value={myLogs.length} icon={Camera} variant="default" />
                <StatCard 
                    title="Present Days" 
                    value={myLogs.filter(l => l.status === 'Present').length} 
                    icon={CheckCircle} 
                    variant="success" 
                />
                <StatCard title="Schedules" value={schedules.length} icon={Calendar} variant="purple" />
            </div>

            <Card variant="elevated">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">My Attendance History</h3>
                        <p className="text-sm text-slate-500">Recent attendance records</p>
                    </div>
                </div>
                
                {myLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500">No attendance records yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {myLogs.slice(0, 10).map((log, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Badge variant={log.status === 'Present' ? 'success' : 'danger'}>
                                        {log.status}
                                    </Badge>
                                    <span className="text-sm text-slate-600">{log.period || 'Period --'}</span>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

// ============================================
// MAIN DASHBOARD PAGE
// ============================================
export default function DashboardPage() {
    const { user } = useAuth();

    const renderDashboard = () => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return <AdminDashboard />;
            case ROLES.DIRECTOR:
                return <DirectorDashboard />;
            case ROLES.HOD:
                return <HODDashboard />;
            case ROLES.FACULTY:
                return <FacultyDashboard />;
            default:
                return <AdminDashboard />;
        }
    };

    if (!user) return null;

    return (
        <DashboardLayout>
            {renderDashboard()}
        </DashboardLayout>
    );
}
