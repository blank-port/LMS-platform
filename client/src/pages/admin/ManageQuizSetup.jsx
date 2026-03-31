import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageQuizSetup = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({ 
        quizTitle: '', 
        categoryId: '', 
        subCategoryId: '',
        questionGroup: '', 
        minimumPercentage: 0, 
        randomizeQuestions: false,
        changeDefaultSettings: false
    });

    const fetchData = async () => {
        try {
            const categoryRes = await axios.get(`${backendUrl}/api/course/categories`, getHeaders());
            const groupRes = await axios.get(`${backendUrl}/api/education/question-group/all`, getHeaders());
            if (categoryRes.data.success) setCategories(categoryRes.data.categories);
            if (groupRes.data.success) setGroups(groupRes.data.groups);
        } catch (error) {
            toast.error('Strategic Intelligence Retrieval Failure');
        }
    };

    const fetchSubCategories = async (catId) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/sub-category/${catId}`, getHeaders());
            if (data.success) setSubCategories(data.subCategories);
        } catch (error) {
            console.error('Sub-Category Retrieval Failure');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (formData.categoryId) {
            fetchSubCategories(formData.categoryId);
        } else {
            setSubCategories([]);
        }
    }, [formData.categoryId]);

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        setLoading(true);
        const actionToast = toast.loading('Initializing Assessment Blueprint...');
        try {
            // Mapping fields to support the simplified UI while keeping backend compatibility
            const payload = {
                ...formData,
                questionGroups: [formData.questionGroup], // Backend expects array
                duration: 30, // Default or added to UI later
                passingScore: formData.minimumPercentage
            };
            const { data } = await axios.post(`${backendUrl}/api/education/quiz-setup`, payload, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Assessment blueprint finalized and linked.', type: "success", isLoading: false, autoClose: 3000 });
                setFormData({ 
                    quizTitle: '', 
                    categoryId: '', 
                    subCategoryId: '',
                    questionGroup: '', 
                    minimumPercentage: 0, 
                    randomizeQuestions: false,
                    changeDefaultSettings: false
                });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Blueprinting protocol failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">Add Quiz</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Dashboard | Quiz | Add Quiz</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] p-12 shadow-sm relative overflow-hidden">
                <form onSubmit={handleCreateQuiz} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Quiz Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quiz Title *</label>
                            <input 
                                type="text"
                                className="w-full px-8 py-5 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm"
                                value={formData.quizTitle}
                                onChange={(e) => setFormData({...formData, quizTitle: e.target.value})}
                                required
                                placeholder="Enter Quiz Title"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category *</label>
                            <select 
                                className="w-full px-8 py-5 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm appearance-none"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Sub Category */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sub Category *</label>
                            <select 
                                className="w-full px-8 py-5 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm appearance-none"
                                value={formData.subCategoryId}
                                onChange={(e) => setFormData({...formData, subCategoryId: e.target.value})}
                                required
                            >
                                <option value="">Select Sub Category</option>
                                {subCategories.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
                            </select>
                        </div>

                        {/* Group */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Group *</label>
                            <select 
                                className="w-full px-8 py-5 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm appearance-none"
                                value={formData.questionGroup}
                                onChange={(e) => setFormData({...formData, questionGroup: e.target.value})}
                                required
                            >
                                <option value="">Select Group</option>
                                {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                            </select>
                        </div>

                        {/* Minimum Percentage */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Minimum Percentage *</label>
                            <input 
                                type="number"
                                className="w-full px-8 py-5 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm"
                                value={formData.minimumPercentage}
                                onChange={(e) => setFormData({...formData, minimumPercentage: parseInt(e.target.value)})}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Randomize Questions */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Set Random Question *</label>
                            <div className="flex items-center gap-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="randomQuestions" 
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-[var(--border)]"
                                        checked={formData.randomizeQuestions === true} 
                                        onChange={() => setFormData({...formData, randomizeQuestions: true})} 
                                    />
                                    <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">Yes</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="randomQuestions" 
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-[var(--border)]"
                                        checked={formData.randomizeQuestions === false} 
                                        onChange={() => setFormData({...formData, randomizeQuestions: false})} 
                                    />
                                    <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">No</span>
                                </label>
                            </div>
                        </div>

                        {/* Change Default Settings */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Change Default Settings *</label>
                            <div className="flex items-center gap-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="defaultSettings" 
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-[var(--border)]"
                                        checked={formData.changeDefaultSettings === true} 
                                        onChange={() => setFormData({...formData, changeDefaultSettings: true})} 
                                    />
                                    <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">Yes</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="defaultSettings" 
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-[var(--border)]"
                                        checked={formData.changeDefaultSettings === false} 
                                        onChange={() => setFormData({...formData, changeDefaultSettings: false})} 
                                    />
                                    <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">No</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 flex justify-center">
                        <button type="submit" disabled={loading} className="w-full md:w-fit px-16 h-14 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-indigo-700 shadow-2xl transition-all disabled:opacity-50 flex items-center gap-3 justify-center">
                            ✓ Save Online Quiz
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageQuizSetup;
