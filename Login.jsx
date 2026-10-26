import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle, Eye, EyeOff, Layers, Sparkles } from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const cleanUser = (username || '').trim();
        const cleanPass = (password || '').trim();
        try {
            await login(cleanUser, cleanPass);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickFill = (u, p) => {
        setError('');
        setUsername(u);
        setPassword(p);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-200 overflow-hidden">
            {/* Top Right Theme Toggle */}
            <div className="absolute top-6 right-6 z-20">
                <ThemeSwitcher />
            </div>

            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary-500/15 dark:bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-primary-600/10 dark:bg-primary-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="w-full max-w-md relative z-10">
                {/* Main Card */}
                <div className="glass p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-800/80 backdrop-blur-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-primary-500/30 ring-4 ring-primary-500/10">
                            <Layers size={32} className="stroke-[2.5]" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Welcome to TMS
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
                            Complaint & Ticket Management System
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <User size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="input-field input-with-icon-left"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field input-with-icon-left input-with-icon-right"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-primary-500/30 mt-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    <span>Sign In to Dashboard</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Presets Helper */}
                    <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-center gap-1.5">
                            <Sparkles size={13} className="text-primary-500" />
                            <span>Quick Demo Credentials</span>
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleQuickFill('admin', 'adminpassword')}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 text-xs font-semibold border border-slate-200/70 dark:border-slate-700/80 transition-all"
                            >
                                SuperAdmin
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickFill('user', 'userpassword')}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 text-xs font-semibold border border-slate-200/70 dark:border-slate-700/80 transition-all"
                            >
                                User
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickFill('staff', 'staffpassword')}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 text-xs font-semibold border border-slate-200/70 dark:border-slate-700/80 transition-all"
                            >
                                Staff
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

