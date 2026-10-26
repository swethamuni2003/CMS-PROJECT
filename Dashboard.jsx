import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import {
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
    ClipboardList,
    ChevronRight,
    MapPin,
    PlusCircle,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0, pending: 0, assigned: 0, completed: 0, closed: 0
    });
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, ticketsRes] = await Promise.all([
                    api.get('/complaint/dashboard'),
                    api.get('/complaint/list')
                ]);
                setStats(statsRes.data);
                setRecentTickets(ticketsRes.data.slice(0, 6));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'Assigned':
                return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
            case 'In-Progress':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'OnHold':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            case 'Completed':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'Closed':
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    const cards = [
        {
            title: 'Total Complaints',
            value: stats.total,
            icon: Activity,
            gradient: 'from-blue-600 to-indigo-600',
            glow: 'shadow-blue-500/20',
            tag: 'All Time'
        },
        {
            title: 'Pending Action',
            value: stats.pending,
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            glow: 'shadow-amber-500/20',
            tag: 'Needs Review'
        },
        {
            title: 'Assigned',
            value: stats.assigned,
            icon: ClipboardList,
            gradient: 'from-indigo-500 to-violet-600',
            glow: 'shadow-indigo-500/20',
            tag: 'In Queue'
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-teal-600',
            glow: 'shadow-emerald-500/20',
            tag: 'Resolved'
        },
        {
            title: 'Closed',
            value: stats.closed,
            icon: XCircle,
            gradient: 'from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800',
            glow: 'shadow-slate-500/20',
            tag: 'Archived'
        },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Top Greeting & Action Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {getTimeGreeting()}, {user?.username}! 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Here is the real-time operational overview for your department.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/tickets/raise')}
                        className="btn-primary"
                    >
                        <PlusCircle size={18} />
                        <span>Raise New Complaint</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="glass p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-200 border border-slate-200/80 dark:border-slate-800/80"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center text-white shadow-md ${card.glow} group-hover:scale-105 transition-transform duration-200`}>
                                <card.icon size={22} />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {card.tag}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            {card.title}
                        </p>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                            {card.value}
                        </h2>
                    </div>
                ))}
            </div>

            {/* Recent Complaints Feed */}
            <div className="glass rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Recent Complaint Activity</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold">
                                Live
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Recently reported hardware, software, and facility tickets
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/tickets/list')}
                        className="text-primary-600 dark:text-primary-400 font-bold text-sm hover:underline flex items-center gap-1 transition-colors"
                    >
                        <span>View All</span>
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading activity stream...</p>
                        </div>
                    ) : recentTickets.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                                <Activity size={32} />
                            </div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-300">No activity yet</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                                Raised complaints will appear here in real-time.
                            </p>
                        </div>
                    ) : (
                        recentTickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-100 dark:border-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-105 transition-transform shrink-0">
                                        <Activity size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                                {ticket.type}
                                            </h4>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                            <span className="flex items-center gap-1 font-medium">
                                                <MapPin size={13} className="text-primary-500" />
                                                {ticket.block?.name || 'Block N/A'} • Room {ticket.roomNumber?.number || 'N/A'}
                                            </span>
                                            <span className="flex items-center gap-1 font-medium">
                                                <Clock size={13} className="text-slate-400" />
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/tickets/list')}
                                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all shrink-0 ml-4"
                                    title="View Ticket"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

