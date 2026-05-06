import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const ManageQuestionGroups = () => {
    const { backendUrl } = useContext(AppContext);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const fetchGroups = async () => {
        try {
            const { data } = await api.get('/education/question-group/all');
            if (data.success) setGroups(data.groups);
        } catch (error) {
            toast.error('Question Group Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Synchronizing Sector Node...');
        try {
            const { data } = await api.post('/education/question-group', formData);
            if (data.success) {
                toast.update(actionToast, { render: 'Sector node stabilized.', type: "success", isLoading: false, autoClose: 3000 });
                setShowModal(false);
                setFormData({ name: '', description: '' });
                fetchGroups();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization protocol failed.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchGroups(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Mapping Intellectual Sectors...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">Question Group</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Dashboard | Quiz | Question Group</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Add Question Group Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] p-8 shadow-sm">
                        <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest mb-8">Add Question Group</h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title *</label>
                                <input 
                                    type="text" 
                                    className="w-full px-6 py-4 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm"
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="w-full h-12 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                ✓ Save
                            </button>
                        </form>
                    </div>
                </div>

                {/* Question Group List */}
                <div className="lg:col-span-3">
                    <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Question Group List</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[var(--background)]/30">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">SL</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Title</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.map((group, idx) => (
                                        <tr key={group._id} className="hover:bg-[var(--background)]/20 transition-colors">
                                            <td className="px-8 py-5 text-xs font-bold text-[var(--text-main)] border-b border-[var(--border)]/50">{idx + 1}</td>
                                            <td className="px-8 py-5 text-xs font-bold text-[var(--text-main)] border-b border-[var(--border)]/50 uppercase">{group.name}</td>
                                            <td className="px-8 py-5 border-b border-[var(--border)]/50">
                                                <div className="flex items-center gap-2">
                                                    <button className="px-4 py-2 bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                                        Select ▼
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {groups.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-10 text-center text-xs font-bold text-gray-500 uppercase">No Data Found</td>
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

export default ManageQuestionGroups;




