import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const InstructorAddQuestion = () => {
    const { groups: contextGroups } = useContext(AppContext);
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState({
        group: '',
        questionType: 'Multiple Choice',
        marks: 1,
        question: '',
        explanation: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0
    });
    const [image, setImage] = useState(null);

    const questionEditorRef = useRef(null);
    const explanationEditorRef = useRef(null);
    const questionQuill = useRef(null);
    const explanationQuill = useRef(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await api.get('/education/question-group/all');
                if (data.success) {
                    setGroups(data.groups);
                    if (data.groups.length > 0) setFormData(prev => ({ ...prev, group: data.groups[0]._id }));
                }
            } catch (error) {
                toast.error('Failed to fetch question groups');
            }
        };
        fetchGroups();

        if (questionEditorRef.current && !questionQuill.current) {
            questionQuill.current = new Quill(questionEditorRef.current, { theme: 'snow' });
            questionQuill.current.on('text-change', () => {
                setFormData(prev => ({ ...prev, question: questionQuill.current.root.innerHTML }));
            });
        }
        if (explanationEditorRef.current && !explanationQuill.current) {
            explanationQuill.current = new Quill(explanationEditorRef.current, { theme: 'snow' });
            explanationQuill.current.on('text-change', () => {
                setFormData(prev => ({ ...prev, explanation: explanationQuill.current.root.innerHTML }));
            });
        }
    }, []);

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const actionToast = toast.loading('Synchronizing Intelligence Asset...');
        try {
            let imageUrl = '';
            if (image) {
                const imgData = new FormData();
                imgData.append('image', image);
                const uploadRes = await api.post('/instructor/upload-image', imgData);
                if (uploadRes.data.success) imageUrl = uploadRes.data.imageUrl;
            }

            const payload = { ...formData, image: imageUrl };
            const { data } = await api.post('/education/question-bank', payload);
            
            if (data.success) {
                toast.update(actionToast, { render: 'Question added successfully!', type: "success", isLoading: false, autoClose: 3000 });
                // Reset form
                setFormData({
                    group: groups[0]?._id || '',
                    questionType: 'Multiple Choice',
                    marks: 1,
                    question: '',
                    explanation: '',
                    options: ['', '', '', ''],
                    correctAnswerIndex: 0
                });
                setImage(null);
                if (questionQuill.current) questionQuill.current.root.innerHTML = '';
                if (explanationQuill.current) explanationQuill.current.root.innerHTML = '';
            }
        } catch (error) {
            toast.update(actionToast, { render: error.response?.data?.message || 'Failed to add question', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">Add Question</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Dashboard | Education | Quiz | Add Question</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] p-10 shadow-sm relative overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Group Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Group *</label>
                            <select 
                                className="w-full px-6 py-4 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm appearance-none"
                                value={formData.group}
                                onChange={e => setFormData({ ...formData, group: e.target.value })}
                                required
                            >
                                <option value="">Select Group</option>
                                {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                            </select>
                        </div>

                        {/* Question Type */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Question Type *</label>
                            <select 
                                className="w-full px-6 py-4 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm appearance-none"
                                value={formData.questionType}
                                onChange={e => setFormData({ ...formData, questionType: e.target.value })}
                                required
                            >
                                <option value="Multiple Choice">Multiple Choice</option>
                                <option value="Short Answer">Short Answer</option>
                                <option value="Long Answer">Long Answer</option>
                                <option value="True/False">True/False</option>
                            </select>
                        </div>

                        {/* Marks */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marks *</label>
                            <input 
                                type="number" 
                                className="w-full px-6 py-4 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm"
                                value={formData.marks}
                                onChange={e => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image</label>
                        <div className="flex items-center gap-4">
                            <label className="flex-1 border-2 border-dashed border-[var(--border)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all bg-[var(--background)]/30">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{image ? image.name : 'Browse Image File'}</span>
                                <span className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase">Browse</span>
                                <input type="file" className="hidden" onChange={e => setImage(e.target.files[0])} />
                            </label>
                        </div>
                    </div>

                    {/* Question Editor */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Question *</label>
                        <div className="bg-[var(--background)]/50 rounded-2xl overflow-hidden border border-[var(--border)]">
                            <div ref={questionEditorRef} style={{ height: '200px', border: 'none' }}></div>
                        </div>
                    </div>

                    {/* Options (Only for Multiple Choice) */}
                    {formData.questionType === 'Multiple Choice' && (
                        <div className="space-y-6 pt-6 border-t border-[var(--border)]">
                            <h3 className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest">Options Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.options.map((opt, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Option {i + 1}</label>
                                            <input 
                                                type="radio" 
                                                name="correctAnswer" 
                                                checked={formData.correctAnswerIndex === i} 
                                                onChange={() => setFormData({ ...formData, correctAnswerIndex: i })} 
                                            />
                                        </div>
                                        <input 
                                            type="text" 
                                            className={`w-full px-6 py-4 border rounded-xl outline-none transition-all font-bold text-sm bg-[var(--background)]/50 ${formData.correctAnswerIndex === i ? 'border-green-500 ring-4 ring-green-500/10' : 'border-[var(--border)]'}`}
                                            value={opt}
                                            onChange={e => handleOptionChange(i, e.target.value)}
                                            placeholder={`Defintion for option ${i + 1}`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Explanation Editor */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Explanation</label>
                        <div className="bg-[var(--background)]/50 rounded-2xl overflow-hidden border border-[var(--border)]">
                            <div ref={explanationEditorRef} style={{ height: '150px', border: 'none' }}></div>
                        </div>
                    </div>

                    <button type="submit" className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] hover:bg-indigo-700 shadow-2xl transition-all">
                        ✓ Save Question
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InstructorAddQuestion;




