import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const InstructorQuestionBank = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [questions, setQuestions] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [formData, setFormData] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        group: '',
        level: 'Beginner'
    });

    const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

    const fetchInstructorCourses = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/instructor/courses`, getHeaders());
            if (data.success) {
                setCourses(data.courses);
                if (data.courses.length > 0) setSelectedCourse(data.courses[0]._id);
            }
        } catch (error) {
            toast.error('Identity Verification Failed');
        }
    };

    const fetchGroups = async () => {
        if (!selectedCourse) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/education/question-group/${selectedCourse}`, getHeaders());
            if (data.success) {
                setGroups(data.groups);
                if (data.groups.length > 0) setSelectedGroup(data.groups[0]._id);
                else setSelectedGroup('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchQuestions = async () => {
        if (!selectedGroup) {
            setQuestions([]);
            return;
        }
        try {
            const { data } = await axios.get(`${backendUrl}/api/education/question-bank/${selectedGroup}`, getHeaders());
            if (data.success) setQuestions(data.questions);
        } catch (error) {
            toast.error('Knowledge retrieval failed');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            if (editingQuestionId) {
                const { data } = await axios.put(`${backendUrl}/api/education/question-bank/${editingQuestionId}`, formData, getHeaders());
                if (data.success) {
                    toast.success('Knowledge Nexus Recalibrated');
                    setShowAddModal(false);
                    setEditingQuestionId(null);
                    fetchQuestions();
                }
            } else {
                const { data } = await axios.post(`${backendUrl}/api/education/question-bank`, formData, getHeaders());
                if (data.success) {
                    toast.success('Knowledge Nexus Integrated');
                    setShowAddModal(false);
                    fetchQuestions();
                }
            }
        } catch (error) {
            toast.error('Integration failure');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Exterminate this intelligence unit?')) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/education/question-bank/${id}`, getHeaders());
            if (data.success) {
                toast.success('Nexus Purged');
                fetchQuestions();
            }
        } catch (error) {
            toast.error('Decommissioning failed');
        }
    };

    const handleEditClick = (q) => {
        setFormData({
            question: q.question,
            options: q.options,
            correctAnswerIndex: q.correctAnswerIndex,
            group: q.group,
            level: q.level
        });
        setEditingQuestionId(q._id);
        setShowAddModal(true);
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${backendUrl}/api/education/question-group`, { name: newGroupName, course: selectedCourse }, getHeaders());
            if (data.success) {
                toast.success('Group Nexus Established');
                setNewGroupName('');
                fetchGroups();
            }
        } catch (error) { toast.error(error.message); }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    useEffect(() => { fetchInstructorCourses(); }, []);
    useEffect(() => { fetchGroups(); }, [selectedCourse]);
    useEffect(() => { fetchQuestions(); }, [selectedGroup]);

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        <p className="text-[9px] font-black text-[#0C132B]/40 uppercase tracking-[0.3em]">Knowledge Management</p>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-[#0C132B] tracking-tighter">Question Repository</h1>
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="relative group">
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 p-4 rounded-xl outline-none shadow-sm hover:shadow-md transition-all appearance-none pr-10 min-w-[200px]"
                            >
                                <option value="">Target Course</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-indigo-500 transition-colors opacity-40">▼</span>
                        </div>
                        <div className="relative group">
                            <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 p-4 rounded-xl outline-none shadow-sm hover:shadow-md transition-all appearance-none pr-10 min-w-[200px]"
                            >
                                <option value="">Target Group</option>
                                {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-indigo-500 transition-colors opacity-40">▼</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowGroupModal(true)}
                        disabled={!selectedCourse}
                        className="bg-white text-[#0C132B] border border-gray-100 px-10 py-5 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-black/5 hover:bg-gray-50 disabled:opacity-20"
                    >
                        Manage Groups
                    </button>
                    <button
                        onClick={() => {
                            setEditingQuestionId(null);
                            setFormData({ question: '', options: ['', '', '', ''], correctAnswerIndex: 0, group: selectedGroup, level: 'Beginner' });
                            setShowAddModal(true);
                        }}
                        disabled={!selectedGroup}
                        className="bg-[#0C132B] text-white px-10 py-5 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl shadow-black/10 hover:bg-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        + Append Nexus
                    </button>
                </div>
            </div>

            <div className="grid gap-8">
                {questions.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-24 text-center border border-gray-50 max-w-4xl mx-auto shadow-[0_50px_100px_rgba(0,0,0,0.02)]">
                        <div className="text-7xl mb-10 opacity-10 grayscale">🗄️</div>
                        <h3 className="text-2xl font-black text-[#0C132B] mb-4 tracking-tight">The Vault is Offline</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Select a Knowledge Group or append a new Intelligence Nexus to this repository.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {questions.map((q, idx) => (
                            <div key={q._id} className="bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-[0_30px_60px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.04)] transition-all animate-in fade-in slide-in-from-bottom-5">
                                <div className="flex justify-between items-start gap-4 mb-8">
                                    <div className="flex gap-4 items-start">
                                        <span className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0">#{idx + 1}</span>
                                        <h3 className="text-base font-black text-[#0C132B] leading-snug tracking-tight">{q.question}</h3>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-600 px-3 py-1.5 rounded-full uppercase tracking-widest flex-shrink-0">{q.level}</span>
                                        <button onClick={() => handleEditClick(q)} className="text-[10px] hover:text-indigo-600 transition-colors opacity-40 hover:opacity-100">⚙️</button>
                                        <button onClick={() => handleDelete(q._id)} className="text-[10px] hover:text-rose-500 transition-colors opacity-40 hover:opacity-100">🗑️</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className={`p-5 rounded-2xl border transition-all ${i === q.correctAnswerIndex ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-gray-50/50 border-gray-50'}`}>
                                            <div className="flex items-start gap-4">
                                                <span className={`text-[10px] font-black ${i === q.correctAnswerIndex ? 'text-emerald-500' : 'text-gray-300'} opacity-40`}>{String.fromCharCode(65 + i)}</span>
                                                <p className={`text-[11px] font-bold tracking-tight ${i === q.correctAnswerIndex ? 'text-emerald-700' : 'text-gray-500'}`}>{opt}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-[#0C132B]/60 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] p-12 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-[#0C132B] tracking-tighter">{editingQuestionId ? 'Recalibrate Nexus' : 'Append Nexus'}</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{editingQuestionId ? 'Adjusting existing intelligence parameters' : 'Integrating Intelligence to '}<span className="text-indigo-500">{groups.find(g => g._id === selectedGroup)?.name}</span></p>
                            </div>
                            <button onClick={() => { setShowAddModal(false); setEditingQuestionId(null); }} className="w-12 h-12 rounded-full hover:bg-gray-50 flex items-center justify-center text-xl text-gray-300 hover:text-rose-500 transition-all">×</button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nexus Query (Question)</label>
                                <textarea
                                    className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[1.5rem] text-sm font-bold text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all h-[120px] resize-none"
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="Enter query text..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {formData.options.map((opt, i) => (
                                    <div key={i} className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Option {String.fromCharCode(65 + i)}</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                            value={opt}
                                            onChange={e => handleOptionChange(i, e.target.value)}
                                            placeholder={`Option ${i + 1} text...`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Verified Resolution</label>
                                    <select
                                        className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-[11px] font-black text-[#0C132B] outline-none hover:bg-white transition-all appearance-none"
                                        value={formData.correctAnswerIndex}
                                        onChange={e => setFormData({ ...formData, correctAnswerIndex: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value={0}>Option A (Primary)</option>
                                        <option value={1}>Option B (Secondary)</option>
                                        <option value={2}>Option C (Tertiary)</option>
                                        <option value={3}>Option D (Quaternary)</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complexity Level</label>
                                    <select
                                        className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-[11px] font-black text-[#0C132B] outline-none hover:bg-white transition-all appearance-none"
                                        value={formData.level}
                                        onChange={e => setFormData({ ...formData, level: e.target.value })}
                                        required
                                    >
                                        <option value="Beginner">Level: Fundamental</option>
                                        <option value="Intermediate">Level: Operational</option>
                                        <option value="Advanced">Level: Specialized</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-6 pt-10 border-t border-gray-50">
                                <button type="button" onClick={() => { setShowAddModal(false); setEditingQuestionId(null); }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Discard</button>
                                <button type="submit" className="bg-[#0C132B] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/10">
                                    {editingQuestionId ? 'Synchronize Updates' : 'Integrate to Repository'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Group Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 bg-[#0C132B]/60 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] p-12 w-full max-w-xl shadow-2xl border border-white/20">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black text-[#0C132B] tracking-tighter">Manage Group Nexuses</h2>
                            <button onClick={() => setShowGroupModal(false)} className="text-gray-300 hover:text-rose-500 transition-colors">×</button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="flex gap-4 mb-10">
                            <input 
                                required
                                value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)}
                                className="flex-1 bg-gray-50 border-none p-4 rounded-xl text-xs font-bold"
                                placeholder="New Group Name..."
                            />
                            <button className="bg-indigo-600 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">Create</button>
                        </form>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                            {groups.map(g => (
                                <div key={g._id} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0C132B]">{g.name}</span>
                                    <span className="text-[8px] font-black text-gray-400">Stable Repository</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorQuestionBank;
