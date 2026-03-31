import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageBadges = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', icon: '🏅', criteria: 'course_completed' });

    const fetchBadges = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/gamification/badges`, getHeaders());
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
            const { data } = await axios.post(`${backendUrl}/api/gamification/badge`, formData, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Symbolic asset stabilized.', type: "success", isLoading: false, autoClose: 3000 });
                setShowModal(false);
                setFormData({ title: '', description: '', icon: '🏅', criteria: 'course_completed' });
                fetchBadges();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failed.', type: "error", isLoading: false, autoClose: 3000 });
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
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Gamification Architecture</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Symbolic Reward Governance & Scholar Engagement Strategy</p>
                </div>
                <button onClick={() => setShowModal(true)} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-yellow-500 hover:text-[var(--text-main)] transition-all shadow-2xl shadow-black/10">
                    + Engineer New Badge
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {badges.map(badge => (
                    <div key={badge._id} className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] p-10 hover:shadow-2xl hover:shadow-yellow-50 hover:-translate-y-2 transition-all group relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl group-hover:scale-125 transition-transform pointer-events-none">{badge.icon}</div>
                        <div className="w-24 h-24 bg-[var(--background)] rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 group-hover:bg-yellow-50 transition-colors shadow-sm">
                            {badge.icon}
                        </div>
                        <h3 className="text-xl font-black text-[var(--text-main)] mb-2 uppercase tracking-tight">{badge.title}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 h-10 line-clamp-2">{badge.description}</p>
                        <div className="pt-6 border-t border-[var(--border)]">
                            <span className="text-[9px] font-black text-yellow-600 bg-yellow-50 px-4 py-1.5 rounded-full uppercase tracking-widest">{badge.criteria.replace('_', ' ')}</span>
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
                            <div className="grid grid-cols-4 gap-4">
                                {['🏅', '🏆', '🚀', '🧠', '⭐', '🔥', '🛡️', '💎'].map(emoji => (
                                    <button key={emoji} type="button" onClick={() => setFormData({...formData, icon: emoji})} className={`h-12 flex items-center justify-center rounded-2xl text-xl transition-all ${formData.icon === emoji ? 'bg-yellow-400 shadow-lg scale-110' : 'bg-[var(--background)] hover:bg-[var(--background)]'}`}>
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Badge Title</label>
                                <input type="text" placeholder="e.g., Scholar Excellence" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-yellow-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Award Criteria</label>
                                <select className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-yellow-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-[11px] uppercase tracking-widest" value={formData.criteria} onChange={e => setFormData({...formData, criteria: e.target.value})}>
                                    <option value="course_completed">Course Blueprint Finalization</option>
                                    <option value="quiz_passed">Assessment Mastery</option>
                                    <option value="first_login">Initial Protocol Entry</option>
                                    <option value="referral_success">Organic Growth Contribution</option>
                                </select>
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
