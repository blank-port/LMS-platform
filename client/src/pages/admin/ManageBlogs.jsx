import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    NewspaperIcon, 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon,
    ChatBubbleLeftRightIcon,
    CalendarDaysIcon,
    TagIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

const ManageBlogs = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category: 'Education',
        tags: '',
        status: 'draft',
        allowComments: true,
        featuredImage: ''
    });

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/blog`, getHeaders());
            if (data.success) setBlogs(data.blogs);
        } catch (error) { toast.error('Failed to fetch blogs'); }
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const action = editingId ? 'Updating' : 'Publishing';
        const loadingToast = toast.loading(`${action} Article...`);
        try {
            const url = editingId ? `${backendUrl}/api/blog/${editingId}` : `${backendUrl}/api/blog`;
            const method = editingId ? 'put' : 'post';
            
            // Format tags as array
            const formattedForm = {
                ...form,
                tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()) : form.tags
            };

            const { data } = await axios[method](url, formattedForm, getHeaders());
            
            if (data.success) {
                toast.update(loadingToast, { render: `Article ${action.toLowerCase()}ed successfully`, type: "success", isLoading: false, autoClose: 3000 });
                fetchBlogs();
                setShowModal(false);
            }
        } catch (error) {
            toast.update(loadingToast, { render: error.response?.data?.message || 'Publication failed', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Proceed with article deletion?')) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/blog/${id}`, getHeaders());
            if (data.success) {
                toast.success('Article removed');
                fetchBlogs();
            }
        } catch (error) { toast.error('Removal failed'); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-gray-800/20 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Indexing Intellectual Assets...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Blog & Article Hub</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Institutional Thought Leadership & News</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setForm({
                            title: '', slug: '', content: '', excerpt: '',
                            category: 'Education', tags: '', status: 'draft', allowComments: true,
                            featuredImage: ''
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10"
                >
                    <PlusIcon className="w-4 h-4" />
                    Publish Article
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <div key={blog._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-emerald-900/10 transition-all">
                        <div className="h-48 bg-gray-900 relative overflow-hidden">
                            {blog.featuredImage ? (
                                <img src={blog.featuredImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/20">
                                    <NewspaperIcon className="w-12 h-12 text-emerald-500 opacity-30" />
                                </div>
                            )}
                            <div className="absolute top-6 left-6 flex gap-2">
                                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                                    blog.status === 'published' ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'
                                }`}>
                                    {blog.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                <TagIcon className="w-3 h-3" />
                                {blog.category}
                            </div>
                            <h3 className="text-lg font-black text-[var(--text-main)] italic line-clamp-2 leading-snug">
                                "{blog.title}"
                            </h3>
                            <p className="text-xs text-gray-500 font-medium line-clamp-3 leading-relaxed">
                                {blog.excerpt || 'No excerpt provided for this article.'}
                            </p>
                            <div className="pt-4 flex items-center justify-between border-t border-[var(--border)]">
                                <div className="flex items-center gap-2">
                                    <UserCircleIcon className="w-6 h-6 text-gray-500" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{blog.author?.name || 'Academic'}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => {
                                            setEditingId(blog._id);
                                            setForm({ ...blog, tags: blog.tags?.join(', ') || '' });
                                            setShowModal(true);
                                        }}
                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-emerald-400"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(blog._id)}
                                        className="p-2 hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-400"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-[var(--border)] shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-[var(--surface)] py-2 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] italic tracking-tighter">{editingId ? 'Refine Intellectual Asset' : 'Manifest New Theory'}</h2>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-1">Institutional Blog Engine</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Article Title</label>
                                        <input 
                                            type="text" required value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="w-full px-6 py-5 bg-[var(--background)] border border-[var(--border)] rounded-[2rem] outline-none text-xl font-black italic tracking-tight"
                                            placeholder="The Future of Knowledge..."
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Featured Narrative Asset (Image URL)</label>
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

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Core Narrative (Rich Content)</label>
                                        <textarea 
                                            required value={form.content}
                                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                                            className="w-full px-8 py-8 bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] outline-none text-sm font-medium h-[400px] leading-extraloose"
                                            placeholder="Manifest your thoughts here..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 bg-[var(--background)]/50 rounded-[2.5rem] border border-[var(--border)] space-y-6">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Metadata Vector</h4>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Classification</label>
                                            <select 
                                                value={form.category}
                                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none text-[10px] font-black uppercase tracking-widest appearance-none"
                                            >
                                                <option>Education</option>
                                                <option>Technology</option>
                                                <option>Career</option>
                                                <option>Announcement</option>
                                                <option>Other</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Taxonomy (Tags, comma separated)</label>
                                            <input 
                                                type="text" value={form.tags}
                                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                                className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none text-xs font-bold"
                                                placeholder="news, trends, guide"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Status Protocol</label>
                                            <div className="flex bg-[var(--surface)] rounded-xl p-1 border border-[var(--border)]">
                                                <button 
                                                    type="button"
                                                    onClick={() => setForm({ ...form, status: 'draft' })}
                                                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${form.status === 'draft' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-gray-500'}`}
                                                >Draft</button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setForm({ ...form, status: 'published' })}
                                                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${form.status === 'published' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-gray-500'}`}
                                                >Published</button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Allow Interaction</span>
                                            <div 
                                                onClick={() => setForm({ ...form, allowComments: !form.allowComments })}
                                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${form.allowComments ? 'bg-emerald-600' : 'bg-gray-800'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${form.allowComments ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Abbreviated Abstract (Excerpt)</label>
                                        <textarea 
                                            value={form.excerpt}
                                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                            className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-xs font-medium h-32 leading-relaxed"
                                            placeholder="Brief summary for indexing..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[3rem] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-900/30">
                                {editingId ? 'Authorize Revision' : 'Initialize Global Manifest'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBlogs;
