import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ManageCategories = () => {
    const { backendUrl, token, fetchCategories } = useContext(AppContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { fetchCats(); }, []);

    const fetchCats = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setCategories(data.categories);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const handleSave = async () => {
        const actionToast = toast.loading(editingId ? 'Calibrating Lexicon Entry...' : 'Initializing New Discipline...');
        try {
            if (editingId) {
                const { data } = await axios.put(`${backendUrl}/api/admin/categories/${editingId}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) { 
                    toast.update(actionToast, { render: 'Lexicon entry calibrated.', type: "success", isLoading: false, autoClose: 3000 });
                    fetchCats(); 
                    fetchCategories(); 
                }
            } else {
                const { data } = await axios.post(`${backendUrl}/api/admin/categories`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) { 
                    toast.update(actionToast, { render: 'New discipline initialized.', type: "success", isLoading: false, autoClose: 3000 });
                    fetchCats(); 
                    fetchCategories(); 
                }
                else toast.error(data.message);
            }
            setShowModal(false);
            setEditingId(null);
            setForm({ name: '', description: '' });
        } catch (error) { 
            toast.update(actionToast, { render: 'Calibration failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Proceed with permanent disciplinary erasure? This action will affect global asset classification.')) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) { toast.success('Discipline erased from lexicon.'); fetchCats(); fetchCategories(); }
        } catch (error) { toast.error('Erasure failed.'); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Optimizing Disciplinary Logic...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Disciplinary Lexicon</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Asset Categorization & Academic Taxonomy</p>
                </div>
                <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ name: '', description: '' }); }}
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-purple-600 transition-all shadow-2xl shadow-black/10">
                    + Initialize Discipline
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat) => (
                    <div key={cat._id} 
                        onClick={() => navigate(`/admin/courses?category=${cat._id}`)}
                        className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] p-8 hover:shadow-xl hover:shadow-purple-50 transition-all group relative overflow-hidden cursor-pointer">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                            <span className="text-8xl font-black leading-none">{cat.name.charAt(0)}</span>
                        </div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 bg-[var(--background)] rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    🏷️
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setForm({ name: cat.name, description: cat.description }); setEditingId(cat._id); setShowModal(true); }}
                                        className="h-9 px-4 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[var(--background)] transition-all shadow-sm">Calibrate</button>
                                    <button onClick={() => handleDelete(cat._id)} className="w-9 h-9 flex items-center justify-center bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">✕</button>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight mb-3 uppercase tracking-wider">{cat.name}</h3>
                            <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8 flex-grow">{cat.description || 'No conceptual metadata provided for this discipline.'}</p>
                            
                            <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] flex items-center justify-between">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Operational Status: Nominal</span>
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20">🏷️</div>
                    <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Lexicon Depleted</h3>
                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No disciplinary classifications detected in the taxonomy repository.</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-lg shadow-2xl shadow-purple-900/10 border border-purple-50 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">{editingId ? 'Lexicon Calibration' : 'Taxonomy Initialization'}</h2>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mt-1">Academic Classification Suite</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-[var(--background)] rounded-full text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Disciplinary Designation</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" placeholder="e.g., Cryptographic Engineering" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Conceptual Metadata</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm min-h-[120px]" placeholder="Brief description of the academic discipline..." />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button onClick={handleSave} className="flex-1 h-16 bg-gray-900 text-white rounded-2xl hover:bg-purple-600 transition-all font-black text-[10px] uppercase tracking-[0.25em] shadow-xl shadow-black/10">
                                {editingId ? 'Confirm Calibration' : 'Initialize Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;

