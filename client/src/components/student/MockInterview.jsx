import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/utils/api';
import { Mic, Send, Bot, User, Award, ShieldAlert, ChevronLeft, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const parseSection = (text, heading) => {
    const regex = new RegExp(`${heading}[:\\s]*([\\s\\S]*?)(?=\\n\\s*(Strengths|Weaknesses|Suggestions|Score)[:\\s]|$)`, 'i');
    const match = text.match(regex);
    if (!match?.[1]) return [];

    return match[1]
        .split('\n')
        .map((line) => line.replace(/^[-*?]\s*/, '').trim())
        .filter(Boolean);
};

const extractPerformance = (text) => {
    const scoreMatch = text.match(/score[^0-9]{0,10}(\d{1,3})/i);
    if (!scoreMatch) return null;

    return {
        overallScore: Math.min(100, Number(scoreMatch[1])),
        strengths: parseSection(text, 'Strengths'),
        weaknesses: parseSection(text, 'Weaknesses'),
        suggestions: parseSection(text, 'Suggestions')
    };
};

const MockInterview = () => {
    const { courseId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [course, setCourse] = useState(null);
    const [interviewActive, setInterviewActive] = useState(false);
    const [performance, setPerformance] = useState(null);
    const chatRef = useRef(null);
    const hasSavedFeedbackRef = useRef(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/course/${courseId}`);
                if (data.success) setCourse(data.course);
            } catch (error) {
                console.error('Course fetch failed:', error);
            }
        };
        fetchCourse();
    }, [courseId]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const startInterview = async () => {
        setInterviewActive(true);
        setPerformance(null);
        hasSavedFeedbackRef.current = false;
        setMessages([{
            role: 'bot',
            text: `Welcome to the Viva Session for **${course?.courseTitle}**. I am PrismBot, your examiner today. I will be testing your conceptual understanding. \n\nAre you ready to begin?`
        }]);
    };

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        
        if (!course || !course.courseTitle) {
            toast.error("Curriculum synchronization in progress. Please wait.");
            return;
        }

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const history = messages.map(m => ({
                role: m.role === 'bot' ? 'assistant' : 'user',
                content: m.text
            }));

            const { data } = await api.post('/ai/interview-chat', {
                moduleTitle: course?.courseTitle,
                history,
                input
            });

            if (data.success) {
                const botMsg = { role: 'bot', text: data.text };
                setMessages(prev => [...prev, botMsg]);

                const extractedPerformance = extractPerformance(data.text);
                if (extractedPerformance && !hasSavedFeedbackRef.current) {
                    const transcript = [...messages, userMsg, botMsg]
                        .map((message) => `${message.role === 'bot' ? 'AI Examiner' : 'Student'}: ${message.text}`)
                        .join('\n\n');

                    setPerformance(extractedPerformance);
                    hasSavedFeedbackRef.current = true;

                    try {
                        await api.post('/ai/interview-result', {
                            courseId,
                            moduleTitle: course?.courseTitle,
                            transcript,
                            overallScore: extractedPerformance.overallScore,
                            strengths: extractedPerformance.strengths,
                            weaknesses: extractedPerformance.weaknesses,
                            suggestions: extractedPerformance.suggestions
                        });
                    } catch (saveError) {
                        console.error('Interview feedback persistence failed:', saveError);
                    }
                }
            }
        } catch (error) {
            console.error('Interview fetch failure:', error);
            setMessages(prev => [...prev, { role: 'bot', text: "System desync. Connection lost." }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!interviewActive) {
        return (
            <div className="panel-shell flex items-center justify-center min-h-[80vh]">
                <div className="max-w-2xl w-full bg-slate-900 rounded-[3rem] p-12 text-center relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-8 group-hover:scale-110 transition-transform duration-700">
                            <Mic size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">AI Viva Chamber</h1>
                        <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.4em] mb-10">Cognitive Validation Protocol</p>
                        
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 mb-10 text-left">
                            <h3 className="text-sm font-black text-white uppercase mb-4 flex items-center gap-2">
                                <ShieldAlert size={16} className="text-amber-500" />
                                Protocol Calibration
                            </h3>
                            <ul className="space-y-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                <li>- Active assessment of conceptual depth.</li>
                                <li>- Difficulty scales based on response quality.</li>
                                <li>- Final performance analytics generated after 7 rounds.</li>
                                <li>- Privacy: Results remain in your personal matrix.</li>
                            </ul>
                        </div>

                        <button 
                            onClick={startInterview}
                            className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all shadow-[0_20px_50px_rgba(5,150,105,0.3)] flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Play size={16} fill="currentColor" />
                            Initiate Viva
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="panel-shell h-[85vh] flex flex-col bg-slate-950 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <button onClick={() => setInterviewActive(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-white tracking-tighter uppercase">{course?.courseTitle}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Active Voice Sync</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Progress</p>
                        <div className="flex gap-1 mt-1">
                            {messages.filter(m => m.role === 'user').map((_, i) => (
                                <div key={i} className="w-4 h-1 bg-emerald-500 rounded-full" />
                            ))}
                            {[...Array(Math.max(0, 7 - messages.filter(m => m.role === 'user').length))].map((_, i) => (
                                <div key={i} className="w-4 h-1 bg-white/10 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Space */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
                {messages.map((msg, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                                {msg.role === 'bot' ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
                            </div>
                            <div className={`p-6 rounded-[2rem] text-sm leading-relaxed ${msg.role === 'bot' ? 'bg-slate-900 text-gray-200 rounded-tl-none border border-white/5' : 'bg-indigo-600 text-white rounded-tr-none shadow-xl'}`}>
                                {msg.text.split('\n').map((line, j) => (
                                    <p key={j} className={j > 0 ? 'mt-3' : ''}>{line}</p>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div className="bg-slate-900 p-5 rounded-[2rem] rounded-tl-none border border-white/5 flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Node */}
            <div className="p-8 bg-slate-900/50 border-t border-white/5">
                <div className="max-w-4xl mx-auto relative">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Neural response entry..."
                        className="w-full h-16 bg-slate-800 border border-white/10 rounded-2xl px-8 pr-32 text-white text-sm focus:border-emerald-500 focus:outline-none transition-all placeholder:text-gray-600 placeholder:uppercase placeholder:font-black placeholder:text-[10px] placeholder:tracking-[0.2em]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                        <button className="w-10 h-10 rounded-xl bg-white/5 text-gray-400 hover:text-emerald-400 transition-colors flex items-center justify-center">
                            <Mic size={18} />
                        </button>
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-all disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockInterview;


