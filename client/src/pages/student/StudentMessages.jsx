import React from 'react';
import NexusChat from '../../components/common/NexusChat.jsx';

const StudentMessages = () => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Communication Matrix</p>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Neural Exchange</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 max-w-lg">Direct encrypted signals with faculty and institutional administration.</p>
                </div>
            </div>

            <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <NexusChat panel="student" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <h3 className="text-xl font-black tracking-tight mb-3 uppercase">Priority Protocol</h3>
                    <p className="text-blue-100 text-xs font-medium leading-relaxed opacity-80">Our institutional support nodes monitor this channel 24/7 for high-fidelity signal resolution.</p>
                </div>
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <h3 className="text-xl font-black tracking-tight mb-3 uppercase">Searchable Archives</h3>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed opacity-80">All transmissions are indexed for rapid retrieval and cross-panel synchronization.</p>
                </div>
            </div>
        </div>
    );
};

export default StudentMessages;




