import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const InstructorBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'Education', status: 'Published' });
    const [editingId, setEditingId] = useState(null);

    const fetchBlogs = async () => {
        try {
            const { data } = await api.get('/blog/my-blogs');
            if (data.success) setBlogs(data.blogs);
        } catch (error) {
            toast.error('Identity Verification Failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/blog/${editingId}`, formData);
            } else {
                await api.post('/blog', formData);
            }
            toast.success('Conceptual Asset Synchronized');
            setShowModal(false);
            fetchBlogs();
        } catch (error) {
            toast.error('Synchronization failure');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Erase this conceptual asset?')) return;
        try {
            await api.delete(`/blog/${id}`);
            toast.success('Asset Erased');
            fetchBlogs();
        } catch (error) {
            toast.error('Erasure failure');
        }
    };

    useEffect(() => { fetchBlogs(); }, []);

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <p className="text-[9px] font-black text-[#0C132B]/40 uppercase tracking-[0.3em]">Thought Leadership</p>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-[#0C132B] tracking-tighter">Content Repository</h1>
                </div>
                <button 
                    onClick={() => { setEditingId(null); setFormData({ title: '', content: '', category: 'Education', status: 'Published' }); setShowModal(true); }}
                    className="bg-[#0C132B] text-white px-10 py-5 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl shadow-black/10 hover:bg-emerald-600"
                >
                    + Compose Article
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.length === 0 ? (
                    <div className="col-span-full bg-white p-24 rounded-[3rem] border border-dashed border-gray-100 text-center shadow-[0_40px_80px_rgba(0,0,0,0.02)] max-w-4xl mx-auto w-full">
                        <div className="text-7xl mb-10 opacity-10 grayscale">📝</div>
                        <h3 className="text-2xl font-black text-[#0C132B] mb-4 tracking-tight">The Library is Empty</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">You haven't initialized any conceptual assets yet. Begin sharing your intelligence to engage the scholar network.</p>
                    </div>
                ) : blogs.map(b => (
                    <div key={b._id} className="bg-white rounded-[2.5rem] border border-gray-50 shadow-[0_30px_60px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group transition-all hover:shadow-[0_50px_100px_rgba(0,0,0,0.05)] hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-5">
                        <div className="h-48 bg-[#0C132B] flex items-center justify-center text-4xl group-hover:bg-emerald-600 transition-colors duration-500 relative overflow-hidden">
                             <span className="z-10 opacity-40 group-hover:scale-125 transition-transform duration-700">📄</span>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">{b.category}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${b.status === 'Published' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gray-100 text-gray-300'}`}>{b.status}</span>
                            </div>
                            <h3 className="text-xl font-black text-[#0C132B] mb-4 tracking-tighter line-clamp-2 leading-tight group-hover:text-emerald-500 transition-colors" title={b.title}>{b.title}</h3>
                            <p className="text-xs font-bold text-gray-400 line-clamp-2 mb-8 flex-1 leading-relaxed">{b.content.replace(/<[^>]*>?/gm, '')}</p>
                            <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                                <div className="flex gap-6">
                                    <button onClick={() => { setEditingId(b._id); setFormData({ title: b.title, content: b.content, category: b.category, status: b.status }); setShowModal(true); }} className="text-[9px] font-black uppercase tracking-widest text-[#0C132B] hover:text-indigo-500 transition-colors">Revision</button>
                                    <button onClick={() => handleDelete(b._id)} className="text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors">Terminate</button>
                                </div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-[#0C132B]/60 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] p-12 w-full max-w-4xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-[#0C132B] tracking-tighter">{editingId ? 'Revision Suite' : 'Creative Nexus'}</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{editingId ? 'Refining conceptual architecture' : 'Initializing new intellectual asset'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full hover:bg-gray-50 flex items-center justify-center text-xl text-gray-300 hover:text-rose-500 transition-all">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Identity (Title)</label>
                                <input 
                                    className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[1.5rem] text-lg font-black text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all tracking-tight" 
                                    type="text" 
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                    placeholder="Enter compelling identity..." 
                                    required 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Knowledge Domain</label>
                                    <select 
                                        className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#0C132B] outline-none hover:bg-white transition-all appearance-none" 
                                        value={formData.category} 
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option>Education</option>
                                        <option>Technology</option>
                                        <option>Student Life</option>
                                        <option>Tutorial</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Availability Status</label>
                                    <select 
                                        className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#0C132B] outline-none hover:bg-white transition-all appearance-none" 
                                        value={formData.status} 
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option>Published</option>
                                        <option>Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Manuscript Content</label>
                                <textarea 
                                    className="w-full bg-gray-50/50 border border-gray-100 p-8 rounded-[2rem] min-h-[250px] text-sm font-bold text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none leading-relaxed" 
                                    value={formData.content} 
                                    onChange={e => setFormData({...formData, content: e.target.value})} 
                                    placeholder="Synthesize your knowledge..." 
                                    required 
                                />
                            </div>

                            <div className="flex justify-end gap-6 pt-10 border-t border-gray-50">
                                <button type="button" onClick={() => setShowModal(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Discard</button>
                                <button type="submit" className="bg-[#0C132B] text-white px-16 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/10">Synchronize Asset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorBlogs;




