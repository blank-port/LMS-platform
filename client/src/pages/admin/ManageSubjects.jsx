import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageSubjects = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', icon: '📖' });

    const fetchSubjects = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/education/subject/all`, getHeaders());
            if (data.success) setSubjects(data.subjects);
        } catch (error) {
            toast.error('Domain Inventory Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Synchronizing Epistemological Domain...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/education/subject`, formData, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Domain stabilized.', type: "success", isLoading: false, autoClose: 3000 });
                setShowModal(false);
                setFormData({ name: '', icon: '📖' });
                fetchSubjects();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failed.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Proceed with permanent domain excision?')) return;
        try {
            await axios.delete(`${backendUrl}/api/education/subject/${id}`, getHeaders());
            toast.success('Domain excised.');
            fetchSubjects();
        } catch (error) { toast.error('Excision failed.'); }
    };

    useEffect(() => { fetchSubjects(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Scanning Knowledge Dimensions...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Epistemological Domain Inventory</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Academic Subject Matrix & Curriculum Domains</p>
                </div>
                <button onClick={() => setShowModal(true)} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-purple-600 transition-all shadow-2xl shadow-black/10">
                    + Initialize Domain
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subjects.map((subject) => (
                    <div key={subject._id} className="bg-[var(--surface)] px-8 py-6 rounded-[2rem] border border-[var(--border)] shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-purple-50 transition-all hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[var(--background)] rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                {subject.icon || '📖'}
                            </div>
                            <span className="text-sm font-black text-[var(--text-muted)] uppercase tracking-wider group-hover:text-[var(--text-main)] transition-colors">{subject.name}</span>
                        </div>
                        <button onClick={() => handleDelete(subject._id)} className="w-8 h-8 flex items-center justify-center bg-[var(--background)] text-gray-300 rounded-xl hover:bg-red-900/20 hover:text-red-500 transition-all">✕</button>
                    </div>
                ))}
                
                <button onClick={() => setShowModal(true)} className="px-8 py-6 rounded-[2rem] border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 group hover:border-purple-200 hover:bg-purple-50/30 transition-all min-h-[88px]">
                    <span className="text-gray-400 group-hover:text-purple-400 transition-colors font-black text-[10px] uppercase tracking-widest">+ Expand Inventory</span>
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-md shadow-2xl shadow-purple-900/10 border border-purple-50 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Domain Induction</h2>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mt-1">Academic Subject Initialization</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-[var(--background)] rounded-full text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Domain Designation</label>
                                <input type="text" placeholder="e.g., Quantum Physics" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Icon Representation</label>
                                <input type="text" placeholder="⚛️" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} required />
                            </div>
                            <button type="submit" className="w-full h-16 bg-gray-900 text-white rounded-2xl hover:bg-purple-600 transition-all font-black text-[10px] uppercase tracking-[0.25em] shadow-xl shadow-black/10 mt-4">
                                Induct Academic Domain
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSubjects;

