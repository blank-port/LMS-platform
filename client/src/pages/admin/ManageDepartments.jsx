import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const ManageDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', institute: '' });
    const [loading, setLoading] = useState(true);

    const fetchInstitutes = async () => {
        try {
            const { data } = await api.get('/audit/institute/all');
            if (data.success) {
                setInstitutes(data.institutes);
                if (data.institutes.length > 0) setSelectedInstitute(data.institutes[0]._id);
            }
        } catch (error) {
            toast.error('Institute Directory Retrieval Failure');
        }
    };

    const fetchDepartments = async () => {
        if (!selectedInstitute) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/audit/department/${selectedInstitute}`);
            if (data.success) {
                setDepartments(data.departments);
            }
        } catch (error) {
            toast.error('SBU Intelligence Retrieval Failure');
        }
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Initializing Strategic Business Unit...');
        try {
            const { data } = await api.post('/audit/department/create', formData);
            if (data.success) {
                toast.update(actionToast, { render: 'Strategic Business Unit initialized.', type: "success", isLoading: false, autoClose: 3000 });
                setShowAddModal(false);
                fetchDepartments();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Initialization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => {
        fetchInstitutes();
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [selectedInstitute]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Strategic Business Units</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Departmental Governance & Entity Oversight</p>
                    
                    <div className="mt-6 flex items-center gap-4 bg-[var(--background)] p-2 rounded-2xl border border-[var(--border)] w-fit">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Active Institute:</span>
                        <select 
                            value={selectedInstitute} 
                            onChange={(e) => setSelectedInstitute(e.target.value)} 
                            className="bg-[var(--surface)] border-none text-xs font-black text-purple-400 outline-none px-4 py-2 rounded-xl shadow-sm cursor-pointer hover:bg-[var(--background)] transition-colors uppercase tracking-widest"
                        >
                            {institutes.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={() => setShowAddModal(true)} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-purple-600 transition-all shadow-2xl shadow-black/10">
                    + Initialize SBU
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[40vh]">
                    <div className="w-12 h-12 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Entity Intelligence...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {departments.map(dept => (
                        <div key={dept._id} className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] p-8 hover:shadow-xl hover:shadow-purple-50 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                                <span className="text-8xl font-black leading-none">{dept.name.charAt(0)}</span>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-[var(--background)] rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-6">
                                    🏢
                                </div>
                                <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight mb-2 uppercase tracking-wider">{dept.name}</h3>
                                <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6 h-12 overflow-hidden">{dept.description || 'No operational metadata provided for this unit.'}</p>
                                
                                <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Personnel Count</span>
                                        <span className="text-xs font-black text-[var(--text-main)]">{dept.staff?.length || 0} Operatives</span>
                                    </div>
                                    <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {departments.length === 0 && (
                        <div className="col-span-full p-20 text-center border-2 border-dashed border-[var(--border)] rounded-[3rem]">
                            <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-20">🏢</div>
                            <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">Sector Blank</h3>
                            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No strategic business units detected in this institute's hierarchy.</p>
                        </div>
                    )}
                </div>
            )}

            {/* SBU Initialization Surface (Modal) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-lg shadow-2xl shadow-purple-900/10 border border-purple-50 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Entity Initialization</h2>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mt-1">Strategic Business Unit Setup</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center bg-[var(--background)] rounded-full text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Institute</label>
                                <select 
                                    className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm appearance-none" 
                                    value={formData.institute} 
                                    onChange={e => setFormData({...formData, institute: e.target.value})} 
                                    required
                                >
                                    <option value="">Select Organizational Node</option>
                                    {institutes.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SBU Designation</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Department of Theoretical Physics" 
                                    className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Mandate</label>
                                <textarea 
                                    placeholder="Brief description of the department's focus and responsibilities..." 
                                    className="w-full px-6 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm min-h-[120px]" 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                />
                            </div>
                            <button type="submit" className="w-full h-16 bg-gray-900 text-white rounded-2xl hover:bg-purple-600 transition-all font-black text-[10px] uppercase tracking-[0.25em] shadow-xl shadow-black/10 mt-4">
                                Initialize Strategic Unit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDepartments;






