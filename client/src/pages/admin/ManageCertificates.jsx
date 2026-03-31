import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageCertificates = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [templates, setTemplates] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ 
        title: '', 
        htmlContent: '', 
        cssContent: '', 
        backgroundImage: '',
        fontSize: '32px',
        fontFamily: 'Outfit',
        isDefault: false 
    });

    const fetchTemplates = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/finance/certificate-templates`, getHeaders());
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            toast.error('Credential Matrix Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Synchronizing Credential Architecture...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/finance/certificate-template`, formData, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Credential architecture finalized.', type: "success", isLoading: false, autoClose: 3000 });
                setShowAddModal(false);
                fetchTemplates();
                setFormData({ title: '', htmlContent: '', cssContent: '', backgroundImage: '', fontSize: '32px', fontFamily: 'Outfit', isDefault: false });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Initialization protocol failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-20 h-20 border-8 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.5em]">Parsing Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-10">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">Credential Architect</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[11px] tracking-[0.3em]">Institutional Verification & Authority Mapping</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)} 
                    className="h-16 px-12 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] hover:bg-purple-600 hover:scale-105 transition-all flex items-center gap-6 shadow-2xl shadow-black/10"
                >
                    <span className="text-xl">+</span>
                    New Template
                </button>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {templates.map(t => (
                    <div key={t._id} className="bg-[var(--surface)] rounded-[3.5rem] border border-[var(--border)] p-5 transition-all hover:shadow-2xl hover:shadow-purple-900/5 group">
                        <div className="aspect-[1.414/1] bg-[var(--background)] rounded-[3rem] flex items-center justify-center relative overflow-hidden">
                            {t.backgroundImage ? (
                                <img src={t.backgroundImage} alt="BG" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-125 group-hover:grayscale-0 transition-all duration-700" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50"></div>
                            )}
                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <span className="text-7xl opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500">📜</span>
                            </div>
                            <div className="absolute inset-0 bg-gray-900/80 p-10 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-md">
                                <button className="w-full h-14 bg-[var(--surface)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-600 hover:text-white transition-all">Preview Architecture</button>
                                <button className="w-full h-14 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Adjust Protocol</button>
                            </div>
                            {t.isDefault && (
                                <div className="absolute top-8 right-8 z-20">
                                    <div className="px-5 py-2 bg-yellow-400 text-[var(--text-main)] text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg border-2 border-white animate-bounce-slow">Primary</div>
                                </div>
                            )}
                        </div>
                        <div className="px-8 py-10">
                            <h3 className="font-black text-[var(--text-main)] text-xl tracking-tight mb-3">{t.title}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-purple-400 bg-purple-900/20 px-3 py-1 rounded-lg uppercase tracking-widest">{t.fontFamily}</span>
                                <span className="text-[9px] font-black text-gray-400 bg-[var(--background)] px-3 py-1 rounded-lg uppercase tracking-widest">{t.fontSize}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-[var(--background)]/50 rounded-[5rem] border-4 border-dashed border-[var(--border)]">
                        <div className="w-28 h-28 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-10 text-6xl opacity-10 rotate-12 shadow-inner">V</div>
                        <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">Vault Protocol Empty</h3>
                        <p className="text-xs font-bold text-gray-400 mt-3 uppercase tracking-[0.3em]">Initialize a visual substrate to begin credentialing.</p>
                        <button onClick={() => setShowAddModal(true)} className="mt-10 px-10 py-5 bg-purple-600 text-white text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-gray-900 transition-all shadow-xl shadow-purple-900/10">Design First Protocol</button>
                    </div>
                )}
            </div>

            {/* Designer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-2xl flex items-center justify-center p-8 z-[200] animate-in fade-in duration-500 px-20">
                    <div className="bg-[var(--surface)] rounded-[5rem] p-16 w-full max-w-7xl h-[90vh] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/20 animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-start mb-14">
                            <div>
                                <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Architect Mode</h2>
                                <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 italic">Advanced Credential Visualization Designer</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-16 h-16 rounded-[2rem] bg-[var(--background)] flex items-center justify-center text-gray-400 hover:bg-red-900/20 hover:text-red-500 transition-all hover:rotate-90">✕</button>
                        </div>
                        
                        <form onSubmit={handleAdd} className="flex-1 overflow-y-auto pr-8 space-y-12 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Protocol Designation</label>
                                        <input 
                                            type="text" 
                                            placeholder="Unique Architecture Name..." 
                                            className="w-full h-20 px-10 bg-[var(--background)] border-none rounded-[2rem] text-[var(--text-main)] font-black focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-gray-200 text-lg" 
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})} 
                                            required 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Primary Font</label>
                                            <select 
                                                className="w-full h-20 px-10 bg-[var(--background)] border-none rounded-[2rem] text-[var(--text-main)] font-bold focus:ring-4 focus:ring-purple-100 transition-all appearance-none uppercase text-[10px] tracking-widest"
                                                value={formData.fontFamily}
                                                onChange={e => setFormData({...formData, fontFamily: e.target.value})}
                                            >
                                                <option value="Outfit">Outfit (Premium)</option>
                                                <option value="Inter">Inter (Classic)</option>
                                                <option value="Playfair Display">Playfair (Auth)</option>
                                                <option value="Montserrat">Montserrat (Global)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Base Typo Scale</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g., 32px" 
                                                className="w-full h-20 px-10 bg-[var(--background)] border-none rounded-[2rem] text-[var(--text-main)] font-black focus:ring-4 focus:ring-purple-100 transition-all text-center"
                                                value={formData.fontSize}
                                                onChange={e => setFormData({...formData, fontSize: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Visual Background (URL)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Cloudinary/External Asset Interface..." 
                                            className="w-full h-20 px-10 bg-[var(--background)] border-none rounded-[2rem] text-[var(--text-main)] font-bold focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-gray-200" 
                                            value={formData.backgroundImage} 
                                            onChange={e => setFormData({...formData, backgroundImage: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Structural Blueprint (HTML)</label>
                                        <textarea 
                                            placeholder="<div class='cert'>{{SCHOLAR_ID}}</div>" 
                                            className="w-full h-60 px-10 py-10 bg-gray-900 text-purple-400 font-mono text-xs rounded-[3rem] border-none focus:ring-8 focus:ring-purple-100 transition-all resize-none shadow-2xl" 
                                            value={formData.htmlContent} 
                                            onChange={e => setFormData({...formData, htmlContent: e.target.value})} 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Aesthetic Properties (CSS)</label>
                                        <textarea 
                                            placeholder=".cert { padding: 4rem; }" 
                                            className="w-full h-60 px-10 py-10 bg-gray-900 text-blue-400 font-mono text-xs rounded-[3rem] border-none focus:ring-8 focus:ring-blue-100 transition-all resize-none shadow-2xl" 
                                            value={formData.cssContent} 
                                            onChange={e => setFormData({...formData, cssContent: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-10 border-t border-[var(--border)] mt-10 pb-10">
                                <label className="flex items-center gap-6 cursor-pointer group p-4 rounded-3xl hover:bg-[var(--background)] transition-all">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${formData.isDefault ? 'bg-purple-600 text-white shadow-xl shadow-purple-900/20' : 'bg-[var(--background)] text-transparent border border-[var(--border)] group-hover:border-purple-300'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={formData.isDefault} 
                                            onChange={e => setFormData({...formData, isDefault: e.target.checked})} 
                                        />
                                        <span className="text-sm font-black italic">✓</span>
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest">Global Default</span>
                                        <span className="block text-[9px] font-bold text-gray-400 uppercase mt-1">Automatic Deployment to All Curriculum Nodes</span>
                                    </div>
                                </label>
                                
                                <div className="flex gap-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddModal(false)} 
                                        className="h-20 px-14 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                    >
                                        Abort
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="h-20 px-20 bg-gray-900 text-white text-[12px] font-black uppercase tracking-[0.5em] rounded-[2.5rem] hover:bg-purple-600 hover:shadow-2xl hover:shadow-purple-900/10 transition-all"
                                    >
                                        Finalize Architecture
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCertificates;
