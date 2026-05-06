import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Zap, Sparkles, Target, ChevronRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const StudyPlanner = () => {
    const [directive, setDirective] = useState('');
    const [weaknesses, setWeaknesses] = useState('');
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('directive'); // directive | weaknesses

    const fetchAIIntelligence = async () => {
        setLoading(true);
        try {
            // Fetch independently so one failure doesn't block the other
            const dirPromise = api.get('/ai/study-directive').catch(() => null);
            const weakPromise = api.get('/ai/weakness-analysis').catch(() => null);
            const [dirRes, weakRes] = await Promise.all([dirPromise, weakPromise]);
            
            if (dirRes?.data?.success) setDirective(dirRes.data.data?.directive || dirRes.data.directive || '');
            if (weakRes?.data?.success) setWeaknesses(weakRes.data.data?.analysis || weakRes.data.analysis || '');
        } catch (error) {
            console.error('AI Intelligence fetch failure:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAIIntelligence();
    }, []);

    return (
        <div className="panel-card bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden group">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] -ml-20 -mb-20"></div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Zap size={16} />
                            </div>
                            <h3 className="text-xl font-black tracking-tighter uppercase">AI Pulse Controller</h3>
                        </div>
                        <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.3em]">Neural Learning Orchestration</p>
                    </div>

                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                        <button 
                            onClick={() => setTab('directive')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'directive' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Directives
                        </button>
                        <button 
                            onClick={() => setTab('weaknesses')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'weaknesses' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Neural Gaps
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <Loader2 className="text-emerald-500 animate-spin mb-4" size={32} />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">Syncing with learning matrix...</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {tab === 'directive' ? (
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 relative group/card hover:border-emerald-500/30 transition-all duration-500">
                                    <Sparkles className="absolute top-6 right-6 text-emerald-500/40 group-hover/card:rotate-12 transition-transform" size={24} />
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-emerald-400">
                                        <ReactMarkdown>{directive || "Syncing study directive..."}</ReactMarkdown>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Calculated Strategy</span>
                                        </div>
                                        <button className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest group/btn">
                                            View Full Plan <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-[2rem] p-8 md:p-10 relative">
                                    <Target className="absolute top-6 right-6 text-indigo-400/40" size={24} />
                                    <div className="prose prose-invert prose-sm max-w-none prose-h3:text-indigo-400 prose-ul:list-none prose-li:border-l-2 prose-li:border-indigo-500/30 prose-li:pl-4 prose-li:mb-4">
                                        <ReactMarkdown>{weaknesses || "No critical gaps detected in neural sync."}</ReactMarkdown>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest leading-relaxed">
                                            *These insights are derived from your recent quiz performances and assignment feedback analysis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyPlanner;


