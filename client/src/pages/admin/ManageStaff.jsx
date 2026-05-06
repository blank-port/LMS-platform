import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const ManageStaff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [institutes, setInstitutes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff', institute: '', department: '' });

    const fetchData = async () => {
        try {
            const instRes = await api.get('/audit/institute/all');
            if (instRes.data.success) {
                setInstitutes(instRes.data.institutes);
            }
            
            const staffRes = await api.get('/admin/users');
            if (staffRes.data.success) {
                setStaff(staffRes.data.users.filter(u => u.role === 'staff' || u.role === 'instructor'));
            }
        } catch (error) {
            toast.error('Personnel Intelligence Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Recruiting New Operative...');
        try {
            const { data } = await api.post('/user/register', formData);
            if (data.success) {
                if (formData.institute || formData.department) {
                    await api.post('/audit/institute/assign', {
                        userId: data.user._id,
                        instituteId: formData.institute,
                        role: formData.role
                    });
                }
                toast.update(actionToast, { render: 'New operative deployed to sector.', type: "success", isLoading: false, autoClose: 3000 });
                setShowAddModal(false);
                fetchData();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Recruitment failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Scaling Operational Force...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Operational Force Governance</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Staff Oversight & Inter-Institute Personnel Flow</p>
                </div>
                <button onClick={() => setShowAddModal(true)} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-blue-600 transition-all shadow-2xl shadow-black/10">
                    + Deploy Operative
                </button>
            </div>

            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operative Designation</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Role</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organizational Node</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Deployment Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {staff.map(member => (
                                <tr key={member._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-900/20 text-blue-400 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-105 transition-transform">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-main)] tracking-tight">{member.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 capitalize font-bold text-[var(--text-muted)] text-xs tracking-tight">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${member.role === 'instructor' ? 'bg-purple-900/20 text-purple-400' : 'bg-blue-900/20 text-blue-400'}`}>
                                            {member.role === 'instructor' ? 'Educator' : 'Operative'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">
                                        {member.institute?.name || 'Central Command'}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="inline-flex items-center gap-2 bg-[var(--background)] px-4 py-2 rounded-xl border border-[var(--border)]">
                                            <div className={`w-1.5 h-1.5 rounded-full ${member.isApproved ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                                {member.isApproved ? 'Active' : 'Awaiting Authorization'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recruitment Surface (Modal) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-md shadow-2xl shadow-blue-900/10 border border-blue-50 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Operative Induction</h2>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1">Personnel Recruitment Suite</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center bg-[var(--background)] rounded-full text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                                <input type="text" placeholder="John Doe" className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Communication Endpoint</label>
                                <input type="email" placeholder="email@nexus.com" className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Token</label>
                                <input type="password" placeholder="••••••••" className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" onChange={e => setFormData({...formData, password: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Strategic Role</label>
                                    <select className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-[10px] uppercase tracking-widest appearance-none" onChange={e => setFormData({...formData, role: e.target.value})}>
                                        <option value="staff">Operative</option>
                                        <option value="instructor">Educator</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Allocation Node</label>
                                    <select className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-[10px] uppercase tracking-widest appearance-none" onChange={e => setFormData({...formData, institute: e.target.value})}>
                                        <option value="">Central Command</option>
                                        {institutes.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full h-16 bg-gray-900 text-white rounded-2xl hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-black/10 mt-4">
                                Initialize Deployment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStaff;






