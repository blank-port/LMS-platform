import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    DocumentTextIcon, 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon,
    GlobeAltIcon,
    EyeIcon,
    CodeBracketIcon
} from '@heroicons/react/24/outline';

const ManageCMS = () => {
    const { token } = useContext(AppContext);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [activeTab, setActiveTab] = useState('page');

    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        status: 'draft',
        pageType: 'page',
        featuredImage: '',
        sortOrder: 0,
        sectionData: {}
    });



    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const { data } = await api.get('/cms');
            if (data.success) setPages(data.pages);
        } catch (error) { toast.error('Failed to fetch CMS pages'); }
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const action = editingId ? 'Updating' : 'Creating';
        const loadingToast = toast.loading(`${action} CMS Node...`);
        try {
            const url = editingId ? `/cms/${editingId}` : '/cms';
            const method = editingId ? 'put' : 'post';
            const { data } = await api[method](url, form);
            
            if (data.success) {
                toast.update(loadingToast, { render: `CMS node ${action.toLowerCase()}ed successfully`, type: "success", isLoading: false, autoClose: 3000 });
                fetchPages();
                setShowModal(false);
            }
        } catch (error) {
            toast.update(loadingToast, { render: error.response?.data?.message || 'Operation failed', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this page?')) return;
        try {
            const { data } = await api.delete(`/cms/${id}`);
            if (data.success) {
                toast.success('CMS Page deleted');
                fetchPages();
            }
        } catch (error) { toast.error('Delete failed'); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-gray-800/20 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Compiling Digital Content...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Content Management Suite</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Frontend CMS & Static Page Governance</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setForm({
                            title: '', slug: '', content: '', metaTitle: '',
                            metaDescription: '', status: 'draft', pageType: 'page',
                            featuredImage: '', sortOrder: 0, sectionData: {}
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/10"
                >
                    <PlusIcon className="w-4 h-4" />
                    New CMS Page
                </button>
            </div>

            {/* Stats / Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--surface)] p-8 rounded-[2rem] border border-[var(--border)] group hover:border-indigo-500/30 transition-all">
                    <GlobeAltIcon className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Global Reach</h3>
                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">Manage static landing pages and site navigation nodes.</p>
                </div>
                <div className="bg-[var(--surface)] p-8 rounded-[2rem] border border-[var(--border)] group hover:border-emerald-500/30 transition-all">
                    <EyeIcon className="w-8 h-8 text-emerald-500 mb-4" />
                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Visibility Control</h3>
                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">Toggle draft/published status to control public view.</p>
                </div>
                <div className="bg-[var(--surface)] p-8 rounded-[2rem] border border-[var(--border)] group hover:border-purple-500/30 transition-all">
                    <CodeBracketIcon className="w-8 h-8 text-purple-500 mb-4" />
                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">SEO Optimized</h3>
                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">Custom meta titles and descriptions for search engines.</p>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                            <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Page Structure</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Endpoint (Slug)</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Modified</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {pages.map((page) => (
                            <tr key={page._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-400 font-black">
                                            <DocumentTextIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[var(--text-main)] tracking-tight">{page.title}</p>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{page.pageType}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <code className="text-[10px] bg-[var(--background)] px-2 py-1 rounded text-indigo-400 font-bold tracking-wider">
                                        /{page.slug}
                                    </code>
                                </td>
                                <td className="px-8 py-6 text-[10px] font-bold text-[var(--text-muted)]">
                                    {new Date(page.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                                        page.status === 'published' ? 'bg-green-900/20 text-green-400' : 'bg-gray-800 text-gray-400'
                                    }`}>
                                        {page.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => {
                                                setEditingId(page._id);
                                                setForm({ ...page });
                                                setShowModal(true);
                                            }}
                                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-indigo-400 transition-all"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(page._id)}
                                            className="p-2 hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[var(--border)] shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-[var(--surface)] py-2 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)]">{editingId ? 'Edit Content Node' : 'Deploy New Content Node'}</h2>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">CMS Engine / Structural Update</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Page Title</label>
                                    <input 
                                        type="text" required value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-bold"
                                        placeholder="e.g. Terms of Service"
                                    />
                                </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Slug (URL Hook)</label>
                                <input 
                                    type="text" value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-bold text-indigo-400"
                                    placeholder="about-us"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Visual Asset (Featured Image URL)</label>
                                <div className="flex gap-4">
                                    <input 
                                        type="text" value={form.featuredImage}
                                        onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                                        className="flex-1 px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-bold text-emerald-400"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                    {form.featuredImage && (
                                        <div className="w-14 h-14 bg-gray-900 rounded-xl overflow-hidden border border-[var(--border)]">
                                            <img src={form.featuredImage} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Master Content (HTML/Markdown)</label>
                                <textarea 
                                    value={form.content} required
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-medium h-[300px] font-mono leading-relaxed"
                                    placeholder="<h1>Welcome to the node...</h1>"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8 p-8 bg-[var(--background)]/50 rounded-[2rem] border border-[var(--border)]">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">SEO Matrix</h4>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Meta Title</label>
                                        <input 
                                            type="text" value={form.metaTitle}
                                            onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                                            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none text-xs font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
                                        <textarea 
                                            value={form.metaDescription}
                                            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                                            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none text-xs font-medium h-24"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Operational Metadata</h4>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Publishing Identity</label>
                                        <div className="flex bg-[var(--surface)] rounded-xl p-1 border border-[var(--border)]">
                                            <button 
                                                type="button"
                                                onClick={() => setForm({ ...form, status: 'draft' })}
                                                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${form.status === 'draft' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                            >Draft</button>
                                            <button 
                                                type="button"
                                                onClick={() => setForm({ ...form, status: 'published' })}
                                                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${form.status === 'published' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                            >Published</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Content Template</label>
                                        <select 
                                            value={form.pageType}
                                            onChange={(e) => setForm({ ...form, pageType: e.target.value })}
                                            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                        >
                                            <option value="page">Standard Page</option>
                                            <option value="section">UI Section</option>
                                            <option value="banner">Promotional Banner</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Display Order (Weight)</label>
                                        <input 
                                            type="number" value={form.sortOrder}
                                            onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20">
                                {editingId ? 'Authorize Update' : 'Initialize Node Deployment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCMS;




