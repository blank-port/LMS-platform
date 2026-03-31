import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageInstitutes = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', contactEmail: '', address: '' });

    const fetchInstitutes = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/audit/institute/all`, getHeaders());
            if (data.success) {
                setInstitutes(data.institutes);
            }
        } catch (error) {
            toast.error('Entity Directory Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Initializing Corporate Node...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/audit/institute/create`, formData, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Corporate identity stabilized.', type: "success", isLoading: false, autoClose: 3000 });
                setShowAddModal(false);
                setFormData({ name: '', description: '', contactEmail: '', address: '' });
                fetchInstitutes();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Initialization protocol failed.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => {
        fetchInstitutes();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Surveying Global Entities...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Corporate Entity Oversight</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Institutional Governance & Educational Clusters</p>
                </div>
                <button onClick={() => setShowAddModal(true)} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-purple-600 transition-all shadow-2xl shadow-black/10">
                    + Initialize Institute
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {institutes.map(inst => (
                    <div key={inst._id} className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] p-8 hover:shadow-xl hover:shadow-purple-50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                            <span className="text-8xl font-black leading-none">{inst.name.charAt(0)}</span>
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-[var(--background)] rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm">
                                    🏛️
                                </div>
                                <div className="px-3 py-1.5 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                    ID: {inst._id.slice(-6).toUpperCase()}
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-[var(--text-main)] tracking-tight mb-3 uppercase tracking-wider">{inst.name}</h3>
                            <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8 flex-grow">{inst.description || 'No operational baseline documented for this entity.'}</p>
                            
                            <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <span className="flex items-center gap-2">📧 CONTACT</span>
                                    <span className="text-[var(--text-main)]">{inst.contactEmail}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <span className="flex items-center gap-2">📍 LOCATION</span>
                                    <span className="text-[var(--text-main)] max-w-[150px] truncate text-right">{inst.address}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-purple-900/20 p-4 rounded-2xl border border-purple-800/30/50">
                                        <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">Educators</p>
                                        <p className="text-lg font-black text-purple-900">{inst.instructors?.length || 0}</p>
                                    </div>
                                    <div className="bg-blue-900/20 p-4 rounded-2xl border border-blue-100/50">
                                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Scholars</p>
                                        <p className="text-lg font-black text-blue-900">{inst.students?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {institutes.length === 0 && (
                <div className="py-20 text-center bg-[var(--surface)] rounded-[3rem] border-2 border-dashed border-[var(--border)]">
                    <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20">🏛️</div>
                    <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Institutional Void</h3>
                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No corporate entities detected in the global ecosystem.</p>
                </div>
            )}

            {/* Entity Initialization Surface (Modal) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-lg shadow-2xl shadow-purple-900/10 border border-purple-50 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Entity Initialization</h2>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mt-1">Corporate Node Configuration</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center bg-[var(--background)] rounded-full text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entity Name</label>
                                <input type="text" placeholder="PrismEd Academy North" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mission Mandate</label>
                                <textarea placeholder="Describe the entity's strategic purpose..." className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Endpoint</label>
                                    <input type="email" placeholder="hq@entity.com" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Geographic Node</label>
                                    <input type="text" placeholder="New York, NY" className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="w-full h-16 bg-gray-900 text-white rounded-2xl hover:bg-purple-600 transition-all font-black text-[10px] uppercase tracking-[0.25em] shadow-xl shadow-black/10 mt-4">
                                Initialize Corporate Entity
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageInstitutes;

