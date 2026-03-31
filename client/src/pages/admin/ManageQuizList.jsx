import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';

const ManageQuizList = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/education/quiz-setup/all`, getHeaders());
            if (data.success) {
                setQuizzes(data.quizzes);
            }
        } catch (error) {
            toast.error('Quiz Repository Access Failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to decommission this assessment blueprint?')) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/quiz/${id}`, getHeaders());
            if (data.success) {
                toast.success('Assessment blueprint decommissioned.');
                fetchQuizzes();
            }
        } catch (error) {
            toast.error('Decommissioning protocol failure.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">Quiz Setup</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Dashboard | Quiz | Quiz Setup</p>
                </div>
                <NavLink 
                    to="/admin/add-quiz"
                    className="px-8 h-12 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20"
                >
                    + Add New Quiz
                </NavLink>
            </div>

            {/* List Table */}
            <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-[var(--border)] flex justify-between items-center">
                    <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Active Assessments</h2>
                </div>
                
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[var(--border)] border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Repository...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[var(--background)]/30">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">SL</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Title</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Category</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Pass %</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Questions</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[var(--border)]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizzes.map((q, idx) => (
                                    <tr key={q._id} className="hover:bg-[var(--background)]/20 transition-colors">
                                        <td className="px-8 py-5 text-xs font-bold text-[var(--text-main)] border-b border-[var(--border)]/50">{idx + 1}</td>
                                        <td className="px-8 py-5 border-b border-[var(--border)]/50">
                                            <div className="text-sm font-black text-indigo-400 uppercase tracking-tight">{q.title || q.quizTitle}</div>
                                            {q.subCategoryId && (
                                                <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 italic">{q.subCategoryId.name}</div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-gray-400 border-b border-[var(--border)]/50 uppercase">
                                            {q.categoryId?.name || 'Uncategorized'}
                                        </td>
                                        <td className="px-8 py-5 border-b border-[var(--border)]/50">
                                            <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-black">{q.passingScore}%</span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-[var(--text-main)] border-b border-[var(--border)]/50">
                                            {q.questions?.length || 0} Assets
                                        </td>
                                        <td className="px-8 py-5 border-b border-[var(--border)]/50">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleDelete(q._id)}
                                                    className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                                                    title="Decommission"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <button className="px-4 py-2 bg-[var(--background)] text-[var(--text-main)] text-[10px] font-black uppercase rounded-lg border border-[var(--border)] hover:border-indigo-400 transition-all">
                                                    Manage
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {quizzes.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-[var(--background)] rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                </div>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No Assessment Blueprints Found</p>
                                                <NavLink to="/admin/add-quiz" className="mt-4 text-indigo-400 text-[10px] font-black uppercase hover:underline">Create your first quiz</NavLink>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageQuizList;
