import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const PLACEHOLDER_MAP = {
    '{{STUDENT_NAME}}': 'Vaibhav Gupta',
    '{{COURSE_TITLE}}': 'Advanced Web Development Masterclass',
    '{{COMPLETION_DATE}}': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    '{{CERTIFICATE_ID}}': 'PRISM-2026-0042',
    '{{INSTRUCTOR_NAME}}': 'Dr. Arjun Mehta',
    '{{INSTITUTION_NAME}}': 'PrismEd Academy',
    '{{GRADE}}': 'A+',
    '{{HOURS}}': '42',
    '{{SCHOLAR_ID}}': 'SCH-78291',
};

const replacePlaceholders = (html) => {
    let result = html || '';
    Object.entries(PLACEHOLDER_MAP).forEach(([key, value]) => {
        result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'gi'), value);
    });
    return result;
};

const emptyForm = { title: '', htmlContent: '', cssContent: '', backgroundImage: '', fontSize: '32px', fontFamily: 'Outfit', isDefault: false };

const ManageCertificates = () => {
    const [templates, setTemplates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ ...emptyForm });

    const fetchTemplates = async () => {
        try {
            const { data } = await api.get('/finance/certificate-templates');
            if (data.success) setTemplates(data.templates);
        } catch (error) {
            toast.error('Failed to load certificate templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEdit = !!editingId;
        const actionToast = toast.loading(isEdit ? 'Updating template...' : 'Creating template...');
        try {
            const url = isEdit
                ? `/finance/certificate-template/${editingId}`
                : `/finance/certificate-template`;
            const method = isEdit ? 'put' : 'post';
            const { data } = await api[method](url, formData);
            if (data.success) {
                toast.update(actionToast, { render: isEdit ? 'Template updated!' : 'Template created!', type: 'success', isLoading: false, autoClose: 3000 });
                closeModal();
                fetchTemplates();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Operation failed.', type: 'error', isLoading: false, autoClose: 3000 });
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ ...emptyForm });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to decommission this blueprint? This action is irreversible.')) return;
        const deleteToast = toast.loading('Decommissioning blueprint...');
        try {
            const { data } = await api.delete(`/finance/certificate-template/${id}`);
            if (data.success) {
                toast.update(deleteToast, { render: 'Blueprint decommissioned!', type: 'success', isLoading: false, autoClose: 3000 });
                fetchTemplates();
            }
        } catch (error) {
            toast.update(deleteToast, { render: 'Decommissioning failed.', type: 'error', isLoading: false, autoClose: 3000 });
        }
    };

    const openEditModal = (t) => {
        setEditingId(t._id);
        setFormData({
            title: t.title,
            htmlContent: t.htmlContent,
            cssContent: t.cssContent || '',
            backgroundImage: t.backgroundImage || '',
            fontSize: t.fontSize || '32px',
            fontFamily: t.fontFamily || 'Outfit',
            isDefault: t.isDefault || false,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ ...emptyForm });
    };

    useEffect(() => { fetchTemplates(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-20 h-20 border-8 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.5em]">Loading Templates...</p>
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
                    onClick={openAddModal}
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
                                <button onClick={() => setPreviewTemplate(t)} className="w-full h-14 bg-[var(--surface)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-600 hover:text-white transition-all">Preview Architecture</button>
                                <button onClick={() => openEditModal(t)} className="w-full h-14 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Adjust Protocol</button>
                                <button onClick={() => handleDelete(t._id)} className="w-full h-14 border border-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white transition-all">Decommission</button>
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
                        <button onClick={openAddModal} className="mt-10 px-10 py-5 bg-purple-600 text-white text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-gray-900 transition-all shadow-xl shadow-purple-900/10">Design First Protocol</button>
                    </div>
                )}
            </div>

            {/* ─── Preview Modal ─── */}
            {previewTemplate && (
                <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-2xl flex items-center justify-center p-8 z-[200] animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[4rem] w-full max-w-5xl max-h-[90vh] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/10 animate-in zoom-in-95 duration-500 flex flex-col overflow-hidden">
                        {/* Preview Header */}
                        <div className="flex justify-between items-center px-14 py-8 border-b border-[var(--border)] flex-shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Preview: {previewTemplate.title}</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Live Render with Sample Data</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-green-900/20 border border-green-700/30 rounded-xl">
                                    <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">✓ Render OK</span>
                                </div>
                                <button onClick={() => setPreviewTemplate(null)} className="w-12 h-12 rounded-2xl bg-[var(--background)] flex items-center justify-center text-gray-400 hover:bg-red-900/20 hover:text-red-500 transition-all hover:rotate-90">✕</button>
                            </div>
                        </div>

                        {/* Placeholder Legend */}
                        <div className="px-14 py-4 bg-[var(--background)]/50 border-b border-[var(--border)] flex-shrink-0">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Placeholder Mapping</p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(PLACEHOLDER_MAP).map(([key, val]) => (
                                    <span key={key} className="text-[8px] font-bold bg-[var(--surface)] border border-[var(--border)] px-2 py-1 rounded-lg text-gray-400">
                                        <span className="text-purple-400">{key}</span> → {val}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Certificate Render Area */}
                        <div className="flex-1 overflow-auto p-14">
                            <div className="mx-auto bg-white rounded-3xl shadow-2xl shadow-black/10 border border-gray-200 relative overflow-hidden" style={{ maxWidth: '800px', aspectRatio: '1.414/1' }}>
                                {previewTemplate.backgroundImage && (
                                    <img src={previewTemplate.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
                                )}
                                {previewTemplate.cssContent && (
                                    <style>{previewTemplate.cssContent}</style>
                                )}
                                <div
                                    className="relative z-10 w-full h-full flex items-center justify-center p-12"
                                    style={{ fontFamily: previewTemplate.fontFamily, fontSize: previewTemplate.fontSize }}
                                    dangerouslySetInnerHTML={{ __html: replacePlaceholders(previewTemplate.htmlContent) }}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-14 py-6 border-t border-[var(--border)] flex items-center justify-between flex-shrink-0 bg-[var(--background)]/30">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Font: {previewTemplate.fontFamily} · Size: {previewTemplate.fontSize}</p>
                            <div className="flex gap-4">
                                <button onClick={() => { setPreviewTemplate(null); openEditModal(previewTemplate); }} className="px-8 py-3 border border-[var(--border)] text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest rounded-2xl hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all">
                                    Edit Template
                                </button>
                                <button onClick={() => setPreviewTemplate(null)} className="px-8 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-600 transition-all">
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Add / Edit Modal ─── */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-2xl flex items-center justify-center p-8 z-[200] animate-in fade-in duration-500 px-20">
                    <div className="bg-[var(--surface)] rounded-[5rem] p-16 w-full max-w-7xl h-[90vh] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/20 animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-start mb-14">
                            <div>
                                <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">
                                    {editingId ? 'Edit Template' : 'Architect Mode'}
                                </h2>
                                <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 italic">
                                    {editingId ? 'Modify existing credential architecture' : 'Advanced Credential Visualization Designer'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="w-16 h-16 rounded-[2rem] bg-[var(--background)] flex items-center justify-center text-gray-400 hover:bg-red-900/20 hover:text-red-500 transition-all hover:rotate-90">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-8 space-y-12 custom-scrollbar">
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
                                            placeholder="<div class='cert'>{{STUDENT_NAME}}</div>"
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
                                        onClick={closeModal}
                                        className="h-20 px-14 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="h-20 px-20 bg-gray-900 text-white text-[12px] font-black uppercase tracking-[0.5em] rounded-[2.5rem] hover:bg-purple-600 hover:shadow-2xl hover:shadow-purple-900/10 transition-all"
                                    >
                                        {editingId ? 'Save Changes' : 'Finalize Architecture'}
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




