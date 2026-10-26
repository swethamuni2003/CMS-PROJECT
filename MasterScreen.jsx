import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

const MasterScreen = ({ title, endpoint, fields, relations = [] }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [relationData, setRelationData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchData();
        fetchRelations();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(endpoint);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchRelations = async () => {
        const relData = {};
        for (const rel of relations) {
            try {
                const res = await api.get(rel.endpoint);
                relData[rel.name] = res.data;
            } catch (err) {
                console.error(err);
            }
        }
        setRelationData(relData);
    };

    const handleEdit = (item) => {
        setFormData(item);
        setCurrentId(item._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`${endpoint}/${id}`);
                fetchData();
            } catch (err) {
                console.error('Delete Error:', err.response || err);
                const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error deleting record';
                alert(errorMsg);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean data before submission
            const submissionData = { ...formData };
            delete submissionData._id;
            delete submissionData.__v;
            delete submissionData.createdAt;
            delete submissionData.updatedAt;

            // Normalize populated relations: if an object has _id, just send the _id
            Object.keys(submissionData).forEach(key => {
                if (submissionData[key] && typeof submissionData[key] === 'object' && submissionData[key]._id) {
                    submissionData[key] = submissionData[key]._id;
                }
            });

            if (isEditing) {
                await api.put(`${endpoint}/${currentId}`, submissionData);
            } else {
                await api.post(endpoint, submissionData);
            }
            setShowModal(false);
            setFormData({});
            setIsEditing(false);
            setCurrentId(null);
            fetchData();
        } catch (err) {
            console.error('Submit Error:', err.response || err);

            let errorMsg = 'Error saving data';
            if (err.response?.data) {
                const data = err.response.data;
                // Handle Mongoose duplicate key error
                if (data.code === 11000) {
                    const field = Object.keys(data.keyPattern || {})[0];
                    errorMsg = `Duplicate found: This ${field} is already in use.`;
                }
                // Handle Mongoose validation errors
                else if (data.errors) {
                    errorMsg = Object.values(data.errors).map(e => e.message).join(', ');
                }
                // Handle standard error/message fields
                else {
                    errorMsg = data.error || data.message || JSON.stringify(data);
                }
            } else if (err.message) {
                errorMsg = `Network Error: ${err.message}. Is the server running?`;
            }

            alert(errorMsg);
        }
    };

    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {title} Master
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Configure, search, and manage system master records.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setFormData({});
                        setIsEditing(false);
                        setShowModal(true);
                    }}
                    className="btn-primary self-start sm:self-auto"
                >
                    <Plus size={18} />
                    <span>Add New {title.replace(/s$/, '')}</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass rounded-2xl overflow-hidden px-5 py-3.5 flex items-center gap-3 border border-slate-200/80 dark:border-slate-800/80">
                <Search size={18} className="text-slate-400" />
                <input
                    type="text"
                    placeholder={`Search ${title.toLowerCase()} records...`}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {filteredData.length > 0 && (
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {filteredData.length} records
                    </span>
                )}
            </div>

            {/* Records Data Table */}
            <div className="glass rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800">
                            <tr>
                                {fields.filter(f => !f.hideInTable).map(f => (
                                    <th key={f.key} className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        {f.label}
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={fields.length + 1} className="p-16 text-center">
                                        <Loader2 className="animate-spin mx-auto text-primary-500 mb-2" size={32} />
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading records...</p>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={fields.length + 1} className="p-16 text-center text-slate-400 font-medium">
                                        No records found.
                                    </td>
                                </tr>
                            ) : filteredData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                    {fields.filter(f => !f.hideInTable).map(f => (
                                        <td key={f.key} className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">
                                            {f.render ? f.render(item) : item[f.key]}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-xl transition-all"
                                                title="Edit Record"
                                            >
                                                <Edit size={17} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Dialog */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {isEditing ? 'Edit' : 'Add New'} {title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Please fill in the required master fields.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setIsEditing(false);
                                    setFormData({});
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fields.filter(f => !f.readOnly).map(f => (
                                    <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                            {f.label}
                                        </label>
                                        {f.type === 'select' ? (
                                            <select
                                                className="input-field"
                                                required
                                                value={formData[f.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                            >
                                                <option value="">Select {f.label}</option>
                                                {relationData[f.relation]?.map(rel => (
                                                    <option key={rel._id} value={rel._id}>
                                                        {rel.name || rel.username || rel.number}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : f.type === 'textarea' ? (
                                            <textarea
                                                className="input-field min-h-[90px]"
                                                placeholder={`Enter ${f.label.toLowerCase()}`}
                                                required
                                                value={formData[f.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                            />
                                        ) : (
                                            <input
                                                type={f.type || "text"}
                                                className="input-field"
                                                placeholder={`Enter ${f.label.toLowerCase()}`}
                                                required
                                                value={formData[f.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setIsEditing(false);
                                        setFormData({});
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary px-8">
                                    {isEditing ? 'Update' : 'Save'} Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterScreen;
