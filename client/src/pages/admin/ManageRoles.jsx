import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageRoles = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [roles, setRoles] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', type: 'staff', permissions: [] });
    const [loading, setLoading] = useState(true);

    const availablePermissions = [
        { id: 'manage_users', label: 'Identity Governance' },
        { id: 'manage_courses', label: 'Curriculum Oversight' },
        { id: 'manage_institutes', label: 'Corporate Entity Management' },
        { id: 'view_reports', label: 'Intelligence Retrieval' },
        { id: 'manage_quiz', label: 'Assessment Control' },
        { id: 'manage_finance', label: 'Fiscal Operations' }
    ];

    const fetchRoles = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/audit/role/all`, getHeaders());
            if (data.success) {
                setRoles(data.roles);
            }
        } catch (error) {
            toast.error('Authorization Matrix Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Synchronizing Authorization Protocol...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/audit/role/create`, formData, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Authorization protocol established.', type: "success", isLoading: false, autoClose: 3000 });
                setShowAddModal(false);
                setFormData({ name: '', description: '', type: 'staff', permissions: [] });
                fetchRoles();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Protocol synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const togglePermission = (perm) => {
        const newPerms = formData.permissions.includes(perm) 
            ? formData.permissions.filter(p => p !== perm) 
            : [...formData.permissions, perm];
        setFormData({...formData, permissions: newPerms});
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Permission Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Authorization Protocol Nexus</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">RBAC Governance & Granular Authority Management</p>
                </div>
                <button onClick={() => setShowAddModal(true)} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-purple-600 transition-all shadow-2xl shadow-black/10">
                    + Define Authority
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {roles.map(role => (
                    <div key={role._id} className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] p-10 hover:shadow-xl hover:shadow-purple-50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                            <span className="text-9xl font-black">{role.name.charAt(0)}</span>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-[var(--background)] rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    🔐
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black text-[var(--text-main)] tracking-tight uppercase tracking-wider">{role.name}</h3>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-full">{role.type}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Protocol ID: {role._id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>

                            <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8 h-12 overflow-hidden">{role.description || 'No operational brief defined for this protocol.'}</p>
                            
                            <div className="space-y-4 pt-8 border-t border-[var(--border)]">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Permissions</p>
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.map(p => (
                                        <span key={p} className="px-4 py-2 bg-[var(--background)] text-[var(--text-main)] rounded-xl text-[9px] font-black uppercase tracking-widest border border-[var(--border)] group-hover:bg-[var(--surface)] group-hover:border-purple-800/30 transition-colors">
                                            {p.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                    {role.permissions.length === 0 && (
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">No authorities assigned.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Protocol Specification Surface (Modal) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-12 w-full max-w-2xl shadow-2xl shadow-purple-900/10 border border-purple-50 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Protocol Specification</h2>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mt-1">Authorization Matrix Configuration</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-12 h-12 flex items-center justify-center bg-[var(--background)] rounded-full text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Protocol Name</label>
                                    <input type="text" placeholder="e.g., Regional Oversight" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Type</label>
                                    <select className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-[10px] uppercase tracking-widest appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="staff">Staff Management</option>
                                        <option value="admin">System Administration</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Protocol Brief</label>
                                <textarea placeholder="Define the authorities and constraints for this identity..." className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm min-h-[80px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authorized Capabilities</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {availablePermissions.map(p => (
                                        <label key={p.id} className={`flex items-center justify-between gap-4 p-5 border rounded-[1.5rem] cursor-pointer transition-all ${formData.permissions.includes(p.id) ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-[var(--background)] border-[var(--border)] text-gray-400 hover:bg-[var(--surface)] hover:border-purple-200'}`}>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                                            <input type="checkbox" className="hidden" checked={formData.permissions.includes(p.id)} onChange={() => togglePermission(p.id)} />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.permissions.includes(p.id) ? 'border-white bg-[var(--surface)]' : 'border-[var(--border)]'}`}>
                                                {formData.permissions.includes(p.id) && <div className="w-2 h-2 bg-purple-600 rounded-full"></div>}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full h-16 bg-gray-900 text-white rounded-2xl hover:bg-purple-600 transition-all font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-black/10 mt-4">
                                Finalize Authorization Protocol
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRoles;

