import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    RefreshCw,
    UserPlus,
    Search,
    MapPin,
    ExternalLink,
    Tag,
    Filter
} from 'lucide-react';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useContext(AuthContext);

    const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role?.name === 'SuperAdmin';

    useEffect(() => {
        fetchTickets();
        if (isSuperAdmin) {
            fetchStaff();
        }
    }, [user]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/complaint/list');
            setTickets(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchStaff = async () => {
        try {
            const res = await api.get('/master/users');
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            await api.patch(`/complaint/status/${ticketId}`, { status: newStatus });
            fetchTickets();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error updating status');
        }
    };

    const handleAssignment = async (ticketId, userId) => {
        try {
            await api.patch(`/complaint/assign/${ticketId}`, { assignedTo: userId });
            fetchTickets();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error assigning ticket');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
            case 'Assigned': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
            case 'In-Progress': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
            case 'OnHold': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
            case 'Completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
            case 'Closed': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
            default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
        }
    };

    const canUpdateStatus = (ticket) => {
        if (!user) return false;
        if (isSuperAdmin) return true;
        return ticket.assignedTo?._id === user._id;
    };

    const filterTabs = ['All', 'Pending', 'Assigned', 'In-Progress', 'Completed', 'Closed'];

    const filteredTickets = tickets.filter(t => {
        const matchesTab = activeTab === 'All' || t.status === activeTab;
        const matchesSearch = 
            t.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.block?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.raisedBy?.username?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Complaints Desk
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Track, assign, and update status of all submitted complaints.
                    </p>
                </div>

                <button
                    onClick={fetchTickets}
                    className="btn-secondary self-start sm:self-auto"
                >
                    <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 overflow-x-auto">
                    {filterTabs.map((tab) => {
                        const count = tab === 'All' 
                            ? tickets.length 
                            : tickets.filter(t => t.status === tab).length;
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                    isActive
                                        ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <span>{tab}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    isActive ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-extrabold' : 'bg-slate-300/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Box */}
                <div className="relative min-w-[260px]">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-16 text-center glass rounded-3xl">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fetching complaints records...</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="p-16 text-center glass rounded-3xl">
                        <AlertCircle className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">No complaints match your criteria</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                            Try switching status filter tabs or adjusting your search keyword.
                        </p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <div
                            key={ticket._id}
                            className="glass p-6 rounded-3xl hover:shadow-xl transition-all duration-200 border border-slate-200/80 dark:border-slate-800/80 group"
                        >
                            {/* Card Top Row */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                        <span className="text-slate-400 dark:text-slate-500 text-xs font-mono font-bold">
                                            #{ticket._id.slice(-6).toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-1">
                                        {ticket.type}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <Clock size={13} />
                                        <span>Reported {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </p>
                                </div>

                                {/* Controls: Status & Assignment */}
                                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                    {canUpdateStatus(ticket) && (
                                        <div className="flex flex-col gap-1 min-w-[140px]">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                                            <select
                                                className="input-field py-1.5 text-xs font-bold"
                                                value={ticket.status}
                                                onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In-Progress">In-Progress</option>
                                                <option value="OnHold">OnHold</option>
                                                <option value="Completed">Completed</option>
                                                {isSuperAdmin && <option value="Closed">Closed</option>}
                                            </select>
                                        </div>
                                    )}

                                    {isSuperAdmin && (
                                        <div className="flex flex-col gap-1 min-w-[180px]">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign Technician</label>
                                            <div className="relative">
                                                <select
                                                    className="input-field py-1.5 pl-8 text-xs font-bold"
                                                    value={ticket.assignedTo?._id || ''}
                                                    onChange={(e) => handleAssignment(ticket._id, e.target.value)}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {staff.map(s => (
                                                        <option key={s._id} value={s._id}>{s.username} ({s.role?.name || s.role})</option>
                                                    ))}
                                                </select>
                                                <UserPlus size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Remarks Quote Box */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 mb-4">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                    "{ticket.remarks}"
                                </p>
                                {ticket.attachment && (
                                    <a
                                        href={`${api.defaults.baseURL}/uploads/${ticket.attachment}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                                    >
                                        <ExternalLink size={13} />
                                        <span>View Attachment</span>
                                    </a>
                                )}
                            </div>

                            {/* Meta Info Pills */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                                    <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                                        <User size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Raised By</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{ticket.raisedBy?.username || 'Unknown'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                        <MapPin size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Location</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{ticket.block?.name || 'N/A'} • Rm {ticket.roomNumber?.number || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${ticket.assignedTo ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Assignee</p>
                                        <p className={`font-bold truncate ${ticket.assignedTo ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'}`}>
                                            {ticket.assignedTo?.username || 'Unassigned'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TicketList;

