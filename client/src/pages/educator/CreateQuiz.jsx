import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateQuiz = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [duration, setDuration] = useState(30);
    const [passingScore, setPassingScore] = useState(50);
    const [randomizeQuestions, setRandomizeQuestions] = useState(false);
    const [allowReview, setAllowReview] = useState(true);
    const [attemptsAllowed, setAttemptsAllowed] = useState(1);
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
    const [loading, setLoading] = useState(false);
    const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
    const [vaultGroups, setVaultGroups] = useState([]);
    const [selectedVaultGroup, setSelectedVaultGroup] = useState('');
    const [vaultQuestions, setVaultQuestions] = useState([]);
    const [selectedVaultQuestions, setSelectedVaultQuestions] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/instructor/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setCourses(data.courses);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchVaultGroups = async () => {
        if (!selectedCourse) {
            toast.error('Select a Target Module first');
            return;
        }
        try {
            const { data } = await axios.get(`${backendUrl}/api/education/question-group/${selectedCourse}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setVaultGroups(data.groups);
                setIsVaultModalOpen(true);
            }
        } catch (error) { toast.error('Vault access denied'); }
    };

    const fetchVaultQuestions = async (groupId) => {
        setSelectedVaultGroup(groupId);
        try {
            const { data } = await axios.get(`${backendUrl}/api/education/question-bank/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setVaultQuestions(data.questions);
        } catch (error) { toast.error('Intelligence retrieval failed'); }
    };

    const handleImport = () => {
        const imported = vaultQuestions
            .filter(q => selectedVaultQuestions.includes(q._id))
            .map(q => ({
                questionText: q.question,
                options: q.options,
                correctAnswer: q.correctAnswerIndex
            }));
        
        // Filter out empty first question if it's the only one
        const currentQuestions = (questions.length === 1 && !questions[0].questionText) ? [] : questions;
        setQuestions([...currentQuestions, ...imported]);
        setIsVaultModalOpen(false);
        setSelectedVaultQuestions([]);
        setVaultQuestions([]);
        setSelectedVaultGroup('');
        toast.success(`${imported.length} Intelligence Units Synced`);
    };

    const toggleVaultSelection = (id) => {
        setSelectedVaultQuestions(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };

    const removeQuestion = (index) => {
        if (questions.length <= 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourse || !title || questions.some(q => !q.questionText || q.options.some(o => !o))) {
            toast.error('Fundamental parameters required');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/quiz/create`, {
                courseId: selectedCourse, 
                title, 
                instructions,
                duration: Number(duration),
                passingScore: Number(passingScore),
                randomizeQuestions,
                allowReview,
                attemptsAllowed: Number(attemptsAllowed),
                questions
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                toast.success('Intelligence Unit Deployed');
                setTitle('');
                setSelectedCourse('');
                setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Deployment Failed');
        }
        setLoading(false);
    };

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                            <p className="text-[9px] font-black text-[#0C132B]/40 uppercase tracking-[0.3em]">Knowledge Assessment</p>
                        </div>
                        <h1 className="text-4xl font-black text-[#0C132B] tracking-tighter">Deploy Intelligence</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.02)] border border-gray-50">
                        <h2 className="text-lg font-black text-[#0C132B] tracking-tight mb-8">Metadata Calibration</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Module</label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-xs font-bold text-[#0C132B] outline-none appearance-none hover:bg-white transition-all"
                                    required
                                >
                                    <option value="">Choose a course</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assessment Identity (Title)</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-xs font-bold text-[#0C132B] outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                                    placeholder="e.g. Quantum Mechanics Quiz"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Instructions</label>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-xs font-bold text-[#0C132B] outline-none min-h-[120px] focus:bg-white transition-all"
                                placeholder="Provide specific directives for this assessment..."
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duration (Min)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white transition-all"
                                    min="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Passing Score (%)</label>
                                <input
                                    type="number"
                                    value={passingScore}
                                    onChange={(e) => setPassingScore(e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-xs font-bold text-[#0C132B] outline-none focus:bg-white transition-all"
                                    min="1"
                                    max="100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attempt Limits</label>
                                <select
                                    value={attemptsAllowed}
                                    onChange={(e) => setAttemptsAllowed(e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-xs font-bold text-[#0C132B] outline-none appearance-none hover:bg-white transition-all"
                                >
                                    {[1, 2, 3, 5, 10, 100].map(n => <option key={n} value={n}>{n === 100 ? 'Infinite' : `${n} Attempts`}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col justify-center gap-2 px-2">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={randomizeQuestions}
                                        onChange={(e) => setRandomizeQuestions(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-200 text-rose-500 focus:ring-rose-500"
                                    />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Randomize</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={allowReview}
                                        onChange={(e) => setAllowReview(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-200 text-rose-500 focus:ring-rose-500"
                                    />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reviewable</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-gray-50 animate-in fade-in slide-in-from-bottom-5">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 bg-[#0C132B] text-white rounded-lg flex items-center justify-center text-[10px] font-black">Q{qIndex + 1}</span>
                                        <h3 className="text-sm font-black text-[#0C132B] tracking-tight">Question Nexus</h3>
                                    </div>
                                    {questions.length > 1 && (
                                        <button type="button" onClick={() => removeQuestion(qIndex)} className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors">Discard</button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={q.questionText}
                                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl text-sm font-bold text-[#0C132B] outline-none mb-8 focus:bg-white transition-all"
                                    placeholder="Enter query text..."
                                    required
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="relative group">
                                            <input
                                                type="radio"
                                                name={`correct-${qIndex}`}
                                                checked={q.correctAnswer === oIndex}
                                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 border-gray-200 focus:ring-emerald-500 z-10"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                className={`w-full pl-14 pr-5 py-5 border-2 rounded-[1.2rem] text-xs font-bold outline-none transition-all ${q.correctAnswer === oIndex ? 'border-emerald-500/20 bg-emerald-50/30 text-emerald-700' : 'border-gray-50 bg-gray-50 text-gray-500 focus:border-indigo-500/20 focus:bg-white'}`}
                                                placeholder={`Option ${oIndex + 1}`}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Signal the correct response by utilizing the selectors above.</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-6 pt-6">
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="bg-white text-[#0C132B] px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all shadow-xl shadow-black/5"
                        >
                            + Append Question
                        </button>
                        <button
                            type="button"
                            onClick={fetchVaultGroups}
                            className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-xl shadow-indigo-500/5"
                        >
                            Pull from Knowledge Vault
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0C132B] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-2xl shadow-rose-600/10 disabled:opacity-50 flex-1 md:flex-none"
                        >
                            {loading ? 'Transmitting...' : 'Deploy Intelligence Unit'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Vault Import Modal */}
            {isVaultModalOpen && (
                <div className="fixed inset-0 bg-[#0C132B]/80 backdrop-blur-2xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col">
                        <div className="p-12 border-b border-gray-100 bg-gray-50/30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-[#0C132B] tracking-tighter">Knowledge Vault</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Syncing curated intelligence units to active assessment</p>
                                </div>
                                <button onClick={() => setIsVaultModalOpen(false)} className="text-gray-300 hover:text-rose-500 transition-colors text-2xl">×</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Group Nexus</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {vaultGroups.map(g => (
                                        <button
                                            key={g._id}
                                            onClick={() => fetchVaultQuestions(g._id)}
                                            className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedVaultGroup === g._id ? 'bg-[#0C132B] text-white border-[#0C132B] shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200 hover:text-indigo-600'}`}
                                        >
                                            {g.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedVaultGroup && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-5">
                                    <h3 className="text-xs font-black text-[#0C132B] uppercase tracking-widest border-b border-gray-100 pb-4">Available Intelligence ({vaultQuestions.length})</h3>
                                    <div className="grid gap-6">
                                        {vaultQuestions.map(q => (
                                            <div 
                                                key={q._id}
                                                onClick={() => toggleVaultSelection(q._id)}
                                                className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedVaultQuestions.includes(q._id) ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedVaultQuestions.includes(q._id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200'}`}>
                                                        {selectedVaultQuestions.includes(q._id) && <span className="text-white text-[10px]">✓</span>}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#0C132B] mb-2">{q.question}</p>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full">{q.level}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-12 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedVaultQuestions.length} Units Selected</span>
                            <div className="flex gap-6">
                                <button onClick={() => setIsVaultModalOpen(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500">Cancel</button>
                                <button 
                                    onClick={handleImport}
                                    disabled={selectedVaultQuestions.length === 0}
                                    className="bg-emerald-500 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-20"
                                >
                                    Synchronize to Assessment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateQuiz;
