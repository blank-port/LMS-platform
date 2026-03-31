import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageQA = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQA, setSelectedQA] = useState(null);

    const fetchQA = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/communication/qa`, getHeaders());
            if (data.success) setQuestions(data.questions);
        } catch (error) {
            toast.error('Knowledge Base Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (id, answer) => {
        const actionToast = toast.loading('Synchronizing Knowledge Asset...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/communication/qa/${id}/answer`, { answer }, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Knowledge asset updated.', type: "success", isLoading: false, autoClose: 3000 });
                fetchQA();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchQA(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Optimizing Knowledge Exchange...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Structured Knowledge Exchange</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Q&A Discussion Nodes & Academic Inquiry Governance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    {questions.map(q => (
                        <div key={q._id} className={`p-8 rounded-[3rem] border transition-all cursor-pointer ${selectedQA?._id === q._id ? 'bg-purple-600 border-purple-800/30 text-white shadow-2xl shadow-purple-200' : 'bg-[var(--surface)] border-[var(--border)] hover:shadow-xl hover:shadow-slate-100'}`} onClick={() => setSelectedQA(q)}>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedQA?._id === q._id ? 'bg-white/20 text-white' : 'bg-purple-900/20 text-purple-400'}`}>{q.course?.courseTitle}</span>
                                <span className="text-[10px] font-bold opacity-60 italic">{new Date(q.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-black tracking-tight mb-4">Q: {q.question}</h3>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${selectedQA?._id === q._id ? 'bg-white/20' : 'bg-[var(--background)] text-gray-400'}`}>
                                    {q.student?.name?.charAt(0)}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{q.student?.name}</p>
                            </div>
                        </div>
                    ))}

                    {questions.length === 0 && (
                        <div className="py-24 text-center bg-[var(--background)] rounded-[4rem] border-2 border-dashed border-[var(--border)]">
                            <span className="text-6xl opacity-10">❓</span>
                            <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight mt-6">Inquiry Void</h3>
                            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No inquiry streams detected in the discourse.</p>
                        </div>
                    )}
                </div>

                <div className="bg-[var(--surface)] rounded-[3rem] p-10 border border-[var(--border)] shadow-sm h-fit sticky top-8">
                    {selectedQA ? (
                        <div className="space-y-8 animate-in zoom-in-95">
                            <div>
                                <h2 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4">Discourse Property</h2>
                                <p className="text-xl font-black text-[var(--text-main)] tracking-tight">{selectedQA.question}</p>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Institutional Response Protocol</label>
                                <textarea className="w-full px-8 py-6 bg-[var(--background)] border border-[var(--border)] rounded-[2rem] outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm h-48" placeholder="Type response..." defaultValue={selectedQA.answer} id="answer-field" />
                                <button onClick={() => handleAnswer(selectedQA._id, document.getElementById('answer-field').value)} className="w-full h-16 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-purple-600 shadow-xl transition-all">Submit Protocol Response</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 space-y-6 opacity-20">
                            <div className="text-8xl">💡</div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select an inquiry to initiate discourse.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageQA;
