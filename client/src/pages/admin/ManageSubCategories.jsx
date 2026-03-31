import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageSubCategories = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', categoryId: '', description: '' });

    const fetchData = async () => {
        try {
            const catRes = await axios.get(`${backendUrl}/api/course/categories`, getHeaders());
            const subRes = await axios.get(`${backendUrl}/api/sub-category/all`, getHeaders());
            if (catRes.data.success) setCategories(catRes.data.categories);
            if (subRes.data.success) setSubCategories(subRes.data.subCategories);
        } catch (error) {
            toast.error('Failed to fetch stratification data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${backendUrl}/api/sub-category/add`, formData, getHeaders());
            if (data.success) {
                toast.success('Sub-Category initialized.');
                setFormData({ name: '', categoryId: '', description: '' });
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Initialization failure.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">Sub Categories</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Dashboard | Courses | Sub Category</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Add Sub-Category Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] p-8 shadow-sm">
                        <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest mb-8">Add Sub Category</h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Category *</label>
                                <select 
                                    className="w-full px-6 py-4 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm appearance-none"
                                    value={formData.categoryId} 
                                    onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                                    required 
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sub Category Name *</label>
                                <input 
                                    type="text" 
                                    className="w-full px-6 py-4 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm"
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="w-full h-12 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                ✓ Save Sub Category
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sub-Category List */}
                <div className="lg:col-span-3">
                    <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-[var(--border)]">
                            <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Sub Category List</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[var(--background)]/30">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">SL</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Category</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Sub Category</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subCategories.map((sc, idx) => (
                                        <tr key={sc._id} className="hover:bg-[var(--background)]/20 transition-colors">
                                            <td className="px-8 py-5 text-xs font-bold text-[var(--text-main)] border-b border-[var(--border)]/50">{idx + 1}</td>
                                            <td className="px-8 py-5 text-xs font-bold text-indigo-400 border-b border-[var(--border)]/50 uppercase">{sc.categoryId?.name}</td>
                                            <td className="px-8 py-5 text-xs font-bold text-[var(--text-main)] border-b border-[var(--border)]/50 uppercase">{sc.name}</td>
                                            <td className="px-8 py-5 border-b border-[var(--border)]/50">
                                                <button className="px-4 py-2 bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                                    Action ▼
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {subCategories.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-10 text-center text-xs font-bold text-gray-500 uppercase">No Data Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSubCategories;
