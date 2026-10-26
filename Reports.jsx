import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Download,
    Filter,
    Search,
    Printer,
    Trash2,
    Calendar,
    FileSpreadsheet,
    Loader2
} from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [filters, setFilters] = useState({
        department: '',
        programme: '',
        type: '',
        status: '',
        assignee: ''
    });
    const [loading, setLoading] = useState(false);
    const [depts, setDepts] = useState([]);
    const [progs, setProgs] = useState([]);
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        fetchInitialData();
        fetchReports();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [dRes, pRes, sRes] = await Promise.all([
                api.get('/master/departments'),
                api.get('/master/programmes'),
                api.get('/master/users')
            ]);
            setDepts(dRes.data);
            setProgs(pRes.data);
            setStaff(sRes.data.filter(u => u.role !== 'User' && u.role !== 'SuperAdmin'));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await api.get(`/complaint/report?${query}`);
            setReports(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!id) return alert('Invalid Ticket ID');
        if (window.confirm('Are you sure you want to permanently delete this complaint record?')) {
            try {
                await api.delete(`/complaint/delete/${id}`);
                fetchReports();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.error || 'Error deleting record');
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const exportToCSV = () => {
        if (reports.length === 0) return alert('No records to export');
        const headers = ['Ticket ID,Date,Type,Block,Room,Raised By,Assignee,Status,Remarks\n'];
        const rows = reports.map(r => {
            const date = new Date(r.createdAt).toLocaleDateString();
            const block = r.block?.name || 'N/A';
            const room = r.roomNumber?.number || 'N/A';
            const raisedBy = r.raisedBy?.username || 'Unknown';
            const assignee = r.assignedTo?.username || 'Unassigned';
            const remarks = `"${(r.remarks || '').replace(/"/g, '""')}"`;
            return `${r._id},${date},${r.type},${block},${room},${raisedBy},${assignee},${r.status},${remarks}\n`;
        });
        const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `complaint-reports-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusStyle = (status) => {
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

    return (
        <div className="space-y-6 max-w-7xl mx-auto print:p-0">
            {/* Header with Print & Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Complaint Analytics & Reports
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Filter, inspect, export CSV, and print comprehensive complaint logs.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="btn-secondary"
                    >
                        <Printer size={18} />
                        <span>Print</span>
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="btn-primary"
                    >
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Filter Controls Card */}
            <div className="glass p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 print:hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm">
                        <Filter size={18} />
                        <span>Filter Records</span>
                    </div>
                    {reports.length > 0 && (
                        <span className="text-xs font-bold text-slate-400">
                            Found {reports.length} matching entries
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <select
                        className="input-field text-xs font-medium"
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    >
                        <option value="">All Departments</option>
                        {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>

                    <select
                        className="input-field text-xs font-medium"
                        value={filters.programme}
                        onChange={(e) => setFilters({ ...filters, programme: e.target.value })}
                    >
                        <option value="">All Programmes</option>
                        {progs.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                    </select>

                    <select
                        className="input-field text-xs font-medium"
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="">All Types</option>
                        <option value="PC Hardware">PC Hardware</option>
                        <option value="PC Software">PC Software</option>
                        <option value="Application Issues">Application Issues</option>
                        <option value="Network">Network</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Others">Others</option>
                    </select>

                    <select
                        className="input-field text-xs font-medium"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="OnHold">OnHold</option>
                        <option value="Completed">Completed</option>
                        <option value="Closed">Closed</option>
                    </select>

                    <button
                        onClick={fetchReports}
                        className="btn-primary w-full"
                    >
                        <Search size={16} />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {/* Reports Data Table */}
            <div className="glass rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Raised By</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assignee</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right print:hidden">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-16 text-center">
                                        <Loader2 className="animate-spin mx-auto text-primary-500 mb-2" size={32} />
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading reports...</p>
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-16 text-center text-slate-400 font-medium">
                                        No complaint logs match the selected filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((r) => (
                                    <tr key={r._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                                            {r.type}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            {r.block?.name || 'N/A'} - {r.roomNumber?.number || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                                            {r.raisedBy?.username || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                            {r.assignedTo ? (
                                                <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                    {r.assignedTo.username}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(r.status)}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right print:hidden">
                                            <button 
                                                onClick={() => handleDelete(r._id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default Reports;

