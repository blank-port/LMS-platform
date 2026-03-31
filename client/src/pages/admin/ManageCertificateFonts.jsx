import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageCertificateFonts = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [fonts, setFonts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', family: '', url: '' });

    const fetchFonts = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/finance/certificate-fonts`, getHeaders());
            if (data.success) setFonts(data.fonts);
        } catch (error) {
            console.error('Font retrieval failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Synchronizing Typography Asset...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/finance/certificate-font`, formData, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Typography asset stabilized.', type: "success", isLoading: false, autoClose: 3000 });
                setShowModal(false);
                setFormData({ name: '', family: '', url: '' });
                fetchFonts();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failed.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchFonts(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Scaling Typography Assets...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Typography Governance</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Institutional Font Repository & Credential Aesthetics</p>
                </div>
                <button onClick={() => setShowModal(true)} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-purple-600 transition-all shadow-2xl shadow-black/10">
                    + Induct Typography
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {fonts.map(font => (
                    <div key={font._id} className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] p-8 hover:shadow-xl hover:shadow-purple-50 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                            <span className="text-8xl font-black">Aa</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-[var(--text-main)] mb-2 uppercase tracking-tight" style={{ fontFamily: font.family }}>{font.name}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 italic">{font.family}</p>
                            <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">Asset Verified</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-md shadow-2xl shadow-purple-900/10 border border-purple-50 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Typography Induction</h2>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mt-1">Font Asset Registration</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-[var(--background)] rounded-full text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Font Protocol Name</label>
                                <input type="text" placeholder="e.g., Primary Sans" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Font Family Alias</label>
                                <input type="text" placeholder="e.g., 'Inter', sans-serif" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.family} onChange={e => setFormData({...formData, family: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Resource Blueprint (URL)</label>
                                <input type="text" placeholder="https://fonts.googleapis.com/..." className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} required />
                            </div>
                            <button type="submit" className="w-full h-16 bg-gray-900 text-white rounded-2xl hover:bg-purple-600 transition-all font-black text-[10px] uppercase tracking-[0.25em] shadow-xl shadow-black/10 mt-4">
                                Initialize Typography Proxy
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCertificateFonts;
