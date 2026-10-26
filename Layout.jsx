import React from 'react';
import Sidebar from './Sidebar';
import ThemeSwitcher from './ThemeSwitcher';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Sparkles } from 'lucide-react';

const Layout = ({ children }) => {
    const { user } = useContext(AuthContext);
    const roleName = user?.role?.name || user?.role || 'User';

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            <Sidebar />
            
            <div className="flex-1 flex flex-col min-w-0">
                {/* Modern Floating Top Navbar */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-30 transition-colors duration-200 shadow-sm">
                    {/* Left: System Status Pill */}
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>System Active</span>
                        </div>
                    </div>

                    {/* Right: Theme Switcher & User Profile */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Interactive Theme Switcher */}
                        <ThemeSwitcher />

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

                        {/* User Badge */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                    {user?.username || 'User'}
                                </p>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                                    <ShieldCheck size={12} />
                                    {roleName}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white font-extrabold flex items-center justify-center shadow-md shadow-primary-500/25 ring-2 ring-primary-500/20">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area with Ambient Lighting */}
                <main className="p-6 sm:p-8 flex-1 relative overflow-x-hidden">
                    {/* Ambient Glow Orbs */}
                    <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl -z-10" />
                    <div className="pointer-events-none absolute top-1/2 -left-32 w-80 h-80 bg-primary-400/5 dark:bg-primary-400/5 rounded-full blur-3xl -z-10" />

                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

