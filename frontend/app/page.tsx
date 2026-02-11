'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Loader2, Sparkles, Shield, Zap, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { MOCK_USERS, ROLE_CONFIG } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';

// Animated background particles
function ParticleBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
            
            {/* Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px),
                                      linear-gradient(to bottom, #fff 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />
        </div>
    );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-brand-500/20">
                <Icon className="w-5 h-5 text-brand-300" />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const { user, login, isLoading, error } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        const success = await login(email, password);
        if (success) {
            router.push('/dashboard');
        }
    };

    const handleDemoLogin = (email: string) => {
        setEmail(email);
        setPassword('password');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <ParticleBackground />

            <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding & Info */}
                <div className="hidden lg:block animate-fade-in-up">
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
                            <Sparkles className="w-4 h-4 text-brand-400" />
                            <span className="text-sm font-medium text-brand-300">Smart Attendance System</span>
                        </div>
                        
                        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                            Faculty Presence{' '}
                            <span className="gradient-text-ocean">Detection</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-md">
                            Face recognition-based attendance system using computer vision and machine learning.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <FeatureCard 
                            icon={Shield}
                            title="Secure & Reliable"
                            description="Enterprise-grade security with encrypted data storage"
                        />
                        <FeatureCard 
                            icon={Zap}
                            title="Real-time Detection"
                            description="Instant face recognition using YOLO and InsightFace"
                        />
                        <FeatureCard 
                            icon={Users}
                            title="Multi-role Access"
                            description="Tailored dashboards for Admin, Director, HOD & Faculty"
                        />
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-600 to-accent-purple rounded-2xl shadow-lg shadow-brand-500/30 mb-4">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Faculty Presence System</h1>
                        <p className="text-slate-400 mt-1">Sign in to continue</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 border border-white/20">
                        <div className="hidden lg:block mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                            <p className="text-slate-500 mt-1">Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <Alert type="error" className="animate-shake">
                                    {error}
                                </Alert>
                            )}

                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <label className={cn(
                                    "block text-sm font-medium transition-colors",
                                    focusedField === 'email' ? 'text-brand-600' : 'text-slate-700'
                                )}>
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className={cn(
                                        "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                                        focusedField === 'email' ? 'text-brand-500' : 'text-slate-400'
                                    )}>
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="you@college.edu"
                                        required
                                        className={cn(
                                            "w-full pl-12 pr-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder-slate-400",
                                            "transition-all duration-200 outline-none",
                                            "focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
                                            "hover:border-slate-300"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <label className={cn(
                                    "block text-sm font-medium transition-colors",
                                    focusedField === 'password' ? 'text-brand-600' : 'text-slate-700'
                                )}>
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className={cn(
                                        "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                                        focusedField === 'password' ? 'text-brand-500' : 'text-slate-400'
                                    )}>
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="••••••••"
                                        required
                                        className={cn(
                                            "w-full pl-12 pr-12 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder-slate-400",
                                            "transition-all duration-200 outline-none",
                                            "focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
                                            "hover:border-slate-300"
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                                    <span className="text-slate-600">Remember me</span>
                                </label>
                                <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full"
                                size="lg"
                                variant="gradient"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-xs text-slate-500 text-center mb-4">
                                Demo Credentials <span className="text-slate-400">(password: password)</span>
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(MOCK_USERS).map(([key, u]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleDemoLogin(u.email)}
                                        className={cn(
                                            "px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                                            "bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200",
                                            "hover:shadow-md hover:-translate-y-0.5"
                                        )}
                                    >
                                        <span className="font-semibold text-slate-700 text-xs block">
                                            {ROLE_CONFIG[u.role].label}
                                        </span>
                                        <span className="text-slate-400 text-[10px] truncate block">{u.email}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        © 2024 Faculty Presence System. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
