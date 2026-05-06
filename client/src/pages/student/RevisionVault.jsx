import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { 
    Zap, 
    Sparkles, 
    History, 
    ChevronRight, 
    Mic, 
    Search,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const RevisionVault = () => {
    
    const [activeTab, setActiveTab] = useState('flashcards'); // flashcards | interviews
    const [flashcards, setFlashcards] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [transcriptBlocks, setTranscriptBlocks] = useState([]);

    const renderInsightList = (items, tone, emptyLabel) => {
        const palette = {
            emerald: {
                text: 'text-emerald-800',
                dot: 'bg-emerald-500',
                empty: 'bg-emerald-100 text-emerald-700 border-emerald-200'
            },
            amber: {
                text: 'text-amber-800',
                dot: 'bg-amber-500',
                empty: 'bg-amber-100 text-amber-700 border-amber-200'
            }
        }[tone];

        if (!Array.isArray(items) || items.length === 0) {
            return (
                <div className={`rounded-2xl border px-4 py-3 text-[11px] font-bold uppercase tracking-wide ${palette.empty}`}>
                    {emptyLabel}
                </div>
            );
        }

        return (
            <ul className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className={`text-xs font-bold leading-relaxed flex items-start gap-3 ${palette.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${palette.dot}`} />
                        {item}
                    </li>
                ))}
            </ul>
        );
    };

    const parseTranscript = (rawTranscript) => {
        if (!rawTranscript) return [];
        if (Array.isArray(rawTranscript)) return rawTranscript;
        
        try {
            // Attempt to parse if it's a JSON stringified array (future proofing)
            const parsed = JSON.parse(rawTranscript);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            // Not a JSON array, proceed to manual parsing
        }

        // Manual Parsing for the "AI Examiner: ... \n\n Student: ..." format
        return rawTranscript.split('\n\n').map(block => {
            const match = block.match(/^(AI Examiner|Student|Bot|User|NEURAL TUTOR|SCHOLAR):\s*([\s\S]*)$/i);
            if (match) {
                const role = match[1].toLowerCase();
                const isUser = ['student', 'user', 'scholar'].includes(role);
                return {
                    role: isUser ? 'User' : 'Assistant',
                    content: match[2].trim()
                };
            }
            return { role: 'Assistant', content: block.trim() };
        }).filter(item => item.content);
    };

    useEffect(() => {
        if (selectedInterview) {
            setTranscriptBlocks(parseTranscript(selectedInterview.transcript));
        } else {
            setTranscriptBlocks([]);
        }
    }, [selectedInterview]);


    const fetchData = async () => {
        setLoading(true);
        try {
            const [cardsRes, interviewRes] = await Promise.all([
                api.get('/ai/my-flashcards'),
                api.get('/ai/my-interviews')
            ]);

            if (cardsRes.data.success) setFlashcards(cardsRes.data.cards);
            if (interviewRes.data.success) setInterviews(interviewRes.data.history);
        } catch (error) {
            console.error('Revision fetch failure:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
    }, []);

    const filteredFlashcards = flashcards.filter(c => 
        c.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.courseId?.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInterviews = interviews.filter(i => 
        i.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.courseId?.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="panel-shell student-theme pb-20">
            {/* Immersive Header Engine */}
            <div className="panel-card relative overflow-hidden rounded-[3rem] p-10 md:p-14 mb-10 bg-slate-900 text-white">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl mb-8">
                        <Sparkles size={16} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Knowledge Persistence</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-none">
                        Revision <span className="text-emerald-500">Vault</span>
                    </h1>
                    <p className="max-w-2xl text-slate-400 text-sm font-bold leading-relaxed mb-10 opacity-80">
                        The neural repository of your learning journey. Revisit AI-synthesized knowledge cards and analyze your past viva performances to solidify mastery.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={() => setActiveTab('flashcards')}
                            className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'flashcards' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                            <Zap size={16} /> Flashcards Registry
                        </button>
                        <button 
                            onClick={() => setActiveTab('interviews')}
                            className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'interviews' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                            <History size={16} /> Viva Archives
                        </button>
                    </div>
                </div>
            </div>

            {/* Matrix Search Engine */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="SEARCH ARCHIVES..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border-2 border-slate-100 rounded-[2rem] pl-16 pr-8 py-5 text-xs font-black uppercase tracking-widest focus:border-emerald-500 focus:outline-none transition-all shadow-sm group-hover:shadow-md"
                    />
                </div>
                <div className="flex items-center gap-4 bg-slate-100/50 p-2 rounded-[2rem]">
                    <div className="px-6 py-3 bg-white rounded-[1.5rem] text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                        Showing {activeTab === 'flashcards' ? filteredFlashcards.length : filteredInterviews.length} Items
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center text-center">
                    <Loader2 className="text-emerald-500 animate-spin mb-6" size={48} />
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing with Knowledge Matrix...</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {activeTab === 'flashcards' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredFlashcards.length === 0 ? (
                                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <AlertCircle className="mx-auto text-slate-200 mb-6" size={64} />
                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">No knowledge cards synchronized yet</p>
                                </div>
                            ) : (
                                filteredFlashcards.map((card, i) => (
                                    <div key={i} className="panel-card bg-white p-8 rounded-[2.5rem] hover:scale-[1.02] transition-all group flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                                    Flashcard
                                                </div>
                                                <Zap size={16} className="text-emerald-300 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 opacity-60">
                                                {card.courseId?.courseTitle || 'Neural Asset'}
                                            </p>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-8">
                                                {card.question}
                                            </h3>
                                        </div>
                                        
                                        <div className="overflow-hidden max-h-0 group-hover:max-h-[500px] transition-all duration-700 opacity-0 group-hover:opacity-100">
                                            <div className="pt-6 border-t border-slate-50">
                                                <p className="text-sm font-bold text-slate-600 leading-relaxed italic bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                                                    {card.answer}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-center text-[10px] font-black text-emerald-500 uppercase tracking-widest group-hover:hidden animate-pulse">
                                            Hover to Reveal Synapse
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredInterviews.length === 0 ? (
                                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <AlertCircle className="mx-auto text-slate-200 mb-6" size={64} />
                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">No viva archives located</p>
                                </div>
                            ) : (
                                filteredInterviews.map((interview, i) => (
                                    <div key={i} className="panel-card bg-white p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-500/10 transition-all group flex flex-col gap-6">
                                        <div className="flex items-center justify-between">
                                            <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${interview.overallScore >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                Score: {interview.overallScore}/100
                                            </div>

                                            <Mic size={16} className="text-blue-300" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">
                                                {interview.courseId?.courseTitle || 'Course Module'}
                                            </p>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                                                {interview.moduleTitle}
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                <p className="text-[11px] font-bold text-slate-600 line-clamp-1 uppercase tracking-tight">
                                                    {interview.strengths?.[0] || 'Strategic Consistency'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <AlertCircle size={14} className="text-amber-500" />
                                                <p className="text-[11px] font-bold text-slate-600 line-clamp-1 uppercase tracking-tight">
                                                    {interview.weaknesses?.[0] || 'Neural Gap Identified'}
                                                </p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => setSelectedInterview(interview)}
                                            className="w-full py-4 bg-slate-900 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            View Analysis <ChevronRight size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Analysis Deep-Dive Engine (Modal) */}
            {selectedInterview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setSelectedInterview(null)}
                            className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-all z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-10 md:p-14 bg-slate-900 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-3 bg-white/5 px-5 py-2 rounded-xl mb-6">
                                    <Mic size={14} className="text-blue-400" />
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Viva Archival Record</span>
                                </div>
                                <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase">{selectedInterview.moduleTitle}</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedInterview.courseId?.courseTitle}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="panel-card bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Strengths</h4>
                                    </div>
                                    {renderInsightList(
                                        selectedInterview.strengths,
                                        'emerald',
                                        'No strengths were saved for this practice session.'
                                    )}

                                </div>
                                <div className="panel-card bg-amber-50 p-8 rounded-[2rem] border border-amber-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                                            <AlertCircle size={16} />
                                        </div>
                                        <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Neural Gaps</h4>
                                    </div>
                                    {renderInsightList(
                                        selectedInterview.weaknesses,
                                        'amber',
                                        'No neural gaps were captured for this practice session.'
                                    )}

                                </div>
                                <div className="panel-card bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                                            <Zap size={16} />
                                        </div>
                                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Score Pulse</h4>
                                    </div>
                                    <div className="text-4xl font-black text-blue-900 tracking-tighter">
                                        {selectedInterview.overallScore}<span className="text-lg opacity-40">/100</span>
                                    </div>

                                </div>
                            </div>

                            <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 relative group">
                                <Sparkles className="absolute top-8 right-8 text-slate-200 group-hover:text-emerald-500/40 transition-colors" size={32} />
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 border-b border-slate-200 pb-4">Logic Optimization Suggestions</h4>
                                <div className="prose prose-slate prose-sm max-w-none">
                                    <ReactMarkdown>
                                        {Array.isArray(selectedInterview.suggestions) 
                                            ? selectedInterview.suggestions.map(s => `* ${s}`).join('\n')
                                            : selectedInterview.suggestions}
                                    </ReactMarkdown>
                                </div>

                            </div>

                            <div>
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8">Performance Transcript</h4>
                                <div className="space-y-8">
                                    {transcriptBlocks.map((entry, i) => (
                                        <div key={i} className={`flex ${entry.role === 'User' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-8 rounded-[2rem] ${entry.role === 'User' ? 'bg-slate-900 text-white rounded-tr-none shadow-2xl' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'}`}>
                                                <p className="text-[9px] font-black uppercase tracking-widest mb-3 opacity-40">{entry.role === 'User' ? 'SCHOLAR' : 'NEURAL TUTOR'}</p>
                                                <p className="text-sm font-bold leading-relaxed">{entry.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-white z-10">
                            <button 
                                onClick={() => setSelectedInterview(null)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                                Close Analysis
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevisionVault;


