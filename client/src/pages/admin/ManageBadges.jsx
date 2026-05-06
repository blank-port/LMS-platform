import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import BadgeIcon from '../../components/common/BadgeIcon.jsx';

const ManageBadges = () => {
    const { backendUrl } = useContext(AppContext);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '', 
        icon: '🏅', 
        type: 'activity', 
        threshold: 1 
    });

    const fetchBadges = async () => {
        try {
            const { data } = await api.get('/gamification/badges');
            if (data.success) setBadges(data.badges);
        } catch (error) {
            console.error('Badge retrieval failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Synchronizing Symbolic Asset...');
        try {
            const { data } = await api.post('/gamification/badges', formData);
            if (data.success) {
                toast.update(actionToast, { render: 'Symbolic asset stabilized.', type: "success", isLoading: false, autoClose: 3000 });
                setShowModal(false);
                setFormData({ title: '', description: '', icon: '🏅', type: 'activity', threshold: 1 });
                fetchBadges();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failed.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Decommission this symbolic asset?')) return;
        try {
            const { data } = await api.delete(`/gamification/badges/${id}`);
            if (data.success) {
                toast.success('Asset decommissioned');
                fetchBadges();
            }
        } catch (error) {
            toast.error('Decommissioning failure');
        }
    };

    useEffect(() => { fetchBadges(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Gamification Tokens...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Badge Engineering</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Symbolic Reward Governance & Scholar Engagement Strategy</p>
                </div>
                <button onClick={() => setShowModal(true)} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-yellow-500 hover:text-[var(--text-main)] transition-all shadow-2xl shadow-black/10">
                    + Manifest Achievement
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {badges.map(badge => (
                    <div key={badge._id} className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] p-10 hover:shadow-2xl hover:shadow-yellow-50 hover:-translate-y-2 transition-all group relative overflow-hidden text-center">
                        <button 
                            onClick={() => handleDelete(badge._id)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                        >✕</button>
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all pointer-events-none w-32 h-32 flex items-center justify-center">
                            <BadgeIcon icon={badge.icon} className="w-full h-full grayscale" />
                        </div>
                        <div className="w-24 h-24 bg-[var(--background)] rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 group-hover:bg-yellow-50 transition-all shadow-sm overflow-hidden p-4">
                            <BadgeIcon icon={badge.icon} className="w-full h-full" />
                        </div>
                        <h3 className="text-xl font-black text-[var(--text-main)] mb-2 uppercase tracking-tight">{badge.title}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 h-10 line-clamp-2">{badge.description}</p>
                        <div className="pt-6 border-t border-[var(--border)]">
                            <span className="text-[9px] font-black text-yellow-600 bg-yellow-50 px-4 py-1.5 rounded-full uppercase tracking-widest block mb-2">
                                {badge.type.replace('_', ' ')} logic
                            </span>
                            <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">
                                Threshold: {badge.threshold}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-md shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Badge Engineering</h2>
                                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] mt-1">Token Property Specification</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-[var(--background)] rounded-full text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-6 gap-2">
                                    {['🏅', '🏆', '🚀', '🧠', '⭐', '🔥', '🛡️', '💎', '🎯', '🎓', '👑', '⚡'].map(emoji => (
                                        <button key={emoji} type="button" onClick={() => setFormData({...formData, icon: emoji})} className={`h-12 flex items-center justify-center rounded-xl text-xl transition-all ${formData.icon === emoji ? 'bg-yellow-400 shadow-lg scale-110' : 'bg-[var(--background)] hover:bg-slate-100'}`}>
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Or Paste Icon URL (e.g. https://...)" 
                                        className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-yellow-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-[11px] uppercase tracking-widest"
                                        value={formData.icon.startsWith('http') ? formData.icon : ''} 
                                        onChange={e => setFormData({...formData, icon: e.target.value || '🏅'})} 
                                    />
                                    {formData.icon.startsWith('http') && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border border-[var(--border)] bg-white p-1">
                                            <BadgeIcon icon={formData.icon} className="w-full h-full" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Badge Title</label>
                                <input type="text" placeholder="e.g., Scholar Excellence" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-yellow-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Award Logic</label>
                                    <select className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-yellow-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-[11px] uppercase tracking-widest" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="activity">Activity (Logins)</option>
                                        <option value="registration">Longevity (Days)</option>
                                        <option value="learning">Points Earned</option>
                                        <option value="test">Tests Passed</option>
                                        <option value="course_count">Courses Finished</option>
                                        <option value="certification">Certs Earned</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Threshold</label>
                                    <input type="number" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-yellow-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Semantic Description</label>
                                <textarea className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-yellow-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                            </div>
                            <button type="submit" className="w-full h-16 bg-gray-900 text-white rounded-2xl hover:bg-yellow-500 hover:text-[var(--text-main)] transition-all font-black text-[10px] uppercase tracking-[0.25em] shadow-xl shadow-black/10 mt-4">
                                Initialize Symbolic Asset
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBadges;




