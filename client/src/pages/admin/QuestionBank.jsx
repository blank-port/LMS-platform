import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const QuestionBank = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [questions, setQuestions] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ 
        question: '', 
        options: ['', '', '', ''], 
        correctAnswerIndex: 0, 
        group: '',
        level: 'Beginner',
        subject: ''
    });

    const fetchQuestions = async () => {
        if (!selectedGroup) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/education/question-bank/${selectedGroup}`, getHeaders());
            if (data.success) {
                setQuestions(data.questions);
            }
        } catch (error) {
            toast.error('Question Intelligence Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/education/question-group/all`, getHeaders());
            if (data.success) {
                setGroups(data.groups);
                if (data.groups.length > 0) setSelectedGroup(data.groups[0]._id);
            }
        } catch (error) {
            console.error('Question Group Retrieval Failure:', error);
            toast.error('First initialize a Question Group Node in the Education module.');
        }
    };

    const handleCSVImport = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedGroup) {
            toast.error('Select an organizational node first.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const questionsToImport = [];

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length >= 6) {
                    questionsToImport.push({
                        question: cols[0].trim(),
                        options: [cols[1].trim(), cols[2].trim(), cols[3].trim(), cols[4].trim()],
                        correctAnswerIndex: parseInt(cols[5].trim()),
                        group: selectedGroup,
                        level: 'Beginner'
                    });
                }
            }

            try {
                const importToast = toast.loading(`Importing ${questionsToImport.length} assets into the repository...`);
                for (const q of questionsToImport) {
                    await axios.post(`${backendUrl}/api/education/question-bank`, q, getHeaders());
                }
                toast.update(importToast, { render: 'Batch synchronization completed.', type: "success", isLoading: false, autoClose: 3000 });
                fetchQuestions();
            } catch (error) {
                toast.error('Batch synchronization failure.');
            }
        };
        reader.readAsText(file);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to decommission this intelligence unit?')) return;
        const deleteToast = toast.loading('Decommissioning Asset...');
        try {
            const { data } = await axios.delete(`${backendUrl}/api/education/question-bank/${id}`, getHeaders());
            if (data.success) {
                toast.update(deleteToast, { render: 'Asset decommissioned.', type: "success", isLoading: false, autoClose: 3000 });
                fetchQuestions();
            }
        } catch (error) {
            toast.update(deleteToast, { render: 'Decommissioning failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        
        if (!formData.group) {
            toast.error('Strategic grouping required. Select an organizational node (group).');
            return;
        }

        const actionToast = toast.loading('Synchronizing Intelligence Asset...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/education/question-bank`, formData, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Intelligence asset synchronized.', type: "success", isLoading: false, autoClose: 3000 });
                setShowAddModal(false);
                fetchQuestions();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Asset synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [selectedGroup]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">Question Bank</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Dashboard | Quiz | Question Bank</p>
                </div>
            </div>

            {/* Selection Area */}
            <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] p-10 shadow-sm flex flex-col md:flex-row items-end gap-6">
                <div className="flex-1 space-y-2 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Organizational Node (Group)</label>
                    <select 
                        value={selectedGroup} 
                        onChange={(e) => setSelectedGroup(e.target.value)} 
                        className="w-full px-6 py-4 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm appearance-none"
                    >
                        <option value="">Select Group</option>
                        {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                    </select>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <label className="h-14 px-8 bg-emerald-600/10 text-emerald-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap">
                        📥 Import CSV
                        <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                    </label>
                    <button 
                        onClick={() => {
                            setFormData({ question: '', options: ['', '', '', ''], correctAnswerIndex: 0, group: selectedGroup, level: 'Beginner', subject: '' });
                            setShowAddModal(true);
                        }}
                        className="h-14 px-10 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 whitespace-nowrap"
                    >
                        ➕ Add New Asset
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background)]/20">
                    <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Question Bank Repository</h2>
                    <span className="text-[10px] font-black text-indigo-400 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 uppercase tracking-widest italic">{questions.length} Assets Identified</span>
                </div>
                
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[var(--border)] border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Infrastructure...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[var(--background)]/30">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">#</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Classification</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Intellectual Asset (Question)</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Schema Type</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)] text-right">Strategic Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((q, idx) => (
                                    <tr key={q._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                        <td className="px-8 py-6 text-xs font-bold text-[var(--text-muted)] border-b border-[var(--border)]/50">{idx + 1}</td>
                                        <td className="px-8 py-6 border-b border-[var(--border)]/50">
                                            <span className="px-3 py-1 bg-indigo-900/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/10">{q.group?.name || 'Unassigned'}</span>
                                        </td>
                                        <td className="px-8 py-6 border-b border-[var(--border)]/50">
                                            <div className="text-xs font-bold text-[var(--text-main)] max-w-lg line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.question }}></div>
                                        </td>
                                        <td className="px-8 py-6 border-b border-[var(--border)]/50">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{q.questionType || 'Selection'}</p>
                                        </td>
                                        <td className="px-8 py-6 border-b border-[var(--border)]/50">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDelete(q._id)}
                                                    className="p-2.5 bg-red-900/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {questions.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-24 text-center">
                                            <div className="w-16 h-16 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 opacity-30 text-2xl">📁</div>
                                            <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight">System Repository Empty</h3>
                                            <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">Select an organization group or initialize a new asset node.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Question Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-12 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[var(--border)] shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-10 sticky top-0 bg-[var(--surface)] py-2 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] italic tracking-tighter uppercase">Manifest Intelligence Unit</h2>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2 italic shadow-indigo-500/20">Knowledge Asset Synthesis / Education Module</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full hover:bg-[var(--background)] transition-all flex items-center justify-center text-gray-400 hover:text-red-500">✕</button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic ml-1">Asset Narrative (Question)</label>
                                <textarea 
                                    required value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full px-8 py-8 bg-[var(--background)] border border-[var(--border)] rounded-[2rem] outline-none text-sm font-medium leading-extraloose focus:ring-4 focus:ring-indigo-500/10 min-h-[120px]"
                                    placeholder="Synthesize the core knowledge inquiry here..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {formData.options.map((opt, i) => (
                                    <div key={i} className="space-y-3 p-6 bg-[var(--background)]/30 rounded-[2rem] border border-[var(--border)] transition-all hover:bg-[var(--background)]/50">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Vector {i + 1} (Choice)</label>
                                            <input 
                                                type="radio" name="correct" 
                                                checked={formData.correctAnswerIndex === i}
                                                onChange={() => setFormData({ ...formData, correctAnswerIndex: i })}
                                                className="w-4 h-4 accent-indigo-500"
                                            />
                                        </div>
                                        <input 
                                            type="text" required value={opt}
                                            onChange={(e) => handleOptionChange(i, e.target.value)}
                                            className="w-full px-5 py-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none text-xs font-bold focus:bg-[var(--background)] transition-colors"
                                            placeholder={`Inquiry potential ${i + 1}...`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30">
                                Finalize Logic Synthesis & Archive Asset
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;

