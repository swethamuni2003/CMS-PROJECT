import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Ticket,
    BarChart3,
    LogOut,
    Building2,
    BookOpen,
    Box,
    DoorClosed,
    ShieldCheck,
    Users,
    PlusCircle,
    Layers
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role?.name === 'SuperAdmin';

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Raise Ticket', path: '/tickets/raise', icon: PlusCircle },
        { name: 'Complaints', path: '/tickets/list', icon: Ticket },
    ];

    const adminItems = [
        { name: 'Departments', path: '/masters/departments', icon: Building2 },
        { name: 'Programmes', path: '/masters/programmes', icon: BookOpen },
        { name: 'Blocks', path: '/masters/blocks', icon: Box },
        { name: 'Rooms', path: '/masters/rooms', icon: DoorClosed },
        { name: 'Roles', path: '/masters/roles', icon: ShieldCheck },
        { name: 'Users', path: '/masters/users', icon: Users },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col h-screen sticky top-0 transition-colors duration-200 z-20">
            {/* Brand Logo Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                        <Layers size={22} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                            TMS<span className="text-primary-500">.</span>
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Service Desk
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Menus */}
            <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
                    Main Menu
                </div>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                                isActive
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold shadow-sm ring-1 ring-primary-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                            }`
                        }
                    >
                        <item.icon size={19} className="shrink-0" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}

                {isSuperAdmin && (
                    <>
                        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-7 mb-2 px-3">
                            Administration
                        </div>
                        {adminItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                                        isActive
                                            ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold shadow-sm ring-1 ring-primary-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                                    }`
                                }
                            >
                                <item.icon size={19} className="shrink-0" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            {/* Logout Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all duration-200 active:scale-98"
                >
                    <LogOut size={19} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
