import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, Info, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const RaiseTicket = () => {
    const [formData, setFormData] = useState({
        department: '',
        block: '',
        roomNumber: '',
        type: '',
        remarks: '',
        attachment: ''
    });
    const [departments, setDepartments] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alertStatus, setAlertStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMasters();
    }, []);

    const fetchMasters = async () => {
        try {
            const [deptsRes, blocksRes] = await Promise.all([
                api.get('/master/departments'),
                api.get('/master/blocks')
            ]);
            setDepartments(deptsRes.data || []);
            setBlocks(blocksRes.data || []);
            if (deptsRes.data?.length > 0) {
                setFormData(prev => ({ ...prev, department: deptsRes.data[0].name }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBlockChange = async (blockId) => {
        setFormData({ ...formData, block: blockId, roomNumber: '' });
        try {
            const res = await api.get('/master/rooms');
            setRooms(res.data.filter(r => r.block?._id === blockId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlertStatus(null);
        try {
            await api.post('/complaint/raise', formData);
            setAlertStatus({ type: 'success', message: 'Complaint submitted successfully!' });
            setTimeout(() => {
                navigate('/tickets/list');
            }, 1200);
        } catch (err) {
            setAlertStatus({ type: 'error', message: err.response?.data?.error || 'Error raising complaint' });
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-2 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Raise a New Complaint
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Report an IT, hardware, network, or facility issue for quick resolution.
                    </p>
                </div>
            </div>

            {/* Notification Alert */}
            {alertStatus && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border ${
                    alertStatus.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}>
                    {alertStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{alertStatus.message}</span>
                </div>
            )}

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="glass p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6">
                {/* Department Selection */}
                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                        className="input-field"
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d._id} value={d.name}>{d.name} {d.shortName ? `(${d.shortName})` : ''}</option>
                        ))}
                    </select>
                </div>

                {/* Location Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Block Name <span className="text-rose-500">*</span>
                        </label>
                        <select
                            className="input-field"
                            required
                            value={formData.block}
                            onChange={(e) => handleBlockChange(e.target.value)}
                        >
                            <option value="">Select Block</option>
                            {blocks.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Room Number <span className="text-rose-500">*</span>
                        </label>
                        <select
                            className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                            disabled={!formData.block}
                            value={formData.roomNumber}
                            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        >
                            <option value="">Select Room</option>
                            {rooms.map(r => (
                                <option key={r._id} value={r._id}>{r.number}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Complaint Type */}
                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Complaint Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                        className="input-field"
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="">Select Category</option>
                        <option value="PC Hardware">PC Hardware (Monitor, CPU, Mouse, Keyboard)</option>
                        <option value="PC Software">PC Software (OS, Driver, Software installation)</option>
                        <option value="Application Issues">Application Issues (Portals, LMS, ERP)</option>
                        <option value="Network">Network & WiFi Connectivity</option>
                        <option value="Electronics">Electronics (Projector, AC, UPS)</option>
                        <option value="Plumbing">Plumbing & Water Facility</option>
                        <option value="Others">Others</option>
                    </select>
                </div>

                {/* Remarks Description */}
                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Detailed Problem Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        className="input-field min-h-[120px] resize-y"
                        placeholder="Please describe the malfunction, error messages, or assistance needed..."
                        required
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </div>

                {/* Attachment Drop Zone */}
                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Attachment (Screenshot / Photo - Optional)
                    </label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 group">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:text-primary-500 transition-colors">
                            <Upload size={22} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Upload issue screenshot or photo
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, PDF up to 10MB</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-8"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Send size={18} />
                        )}
                        <span>{loading ? 'Submitting...' : 'Submit Complaint'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RaiseTicket;

