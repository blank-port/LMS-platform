import React from 'react';

const ManageLevels = () => {
    const levels = [
        { name: 'Beginner', icon: '🌱', label: 'SCHOLAR FOUNDATION', description: 'Entry-level conceptual induction and core principles.' },
        { name: 'Intermediate', icon: '🌿', label: 'OPERATIONAL FLUENCY', description: 'Advanced application and tactical knowledge deployment.' },
        { name: 'Advanced', icon: '🌳', label: 'STRATEGIC MASTERY', description: 'Professional system architecture and executive execution.' }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Competency Tier Stewardship</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Academic Stratification & Difficulty Governance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {levels.map((level) => (
                    <div key={level.name} className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] p-10 hover:shadow-xl hover:shadow-purple-50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                            <span className="text-9xl font-black">{level.icon}</span>
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[var(--background)] rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform shadow-sm">
                                {level.icon}
                            </div>
                            
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4">{level.label}</span>
                            <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight mb-4 uppercase">{level.name}</h3>
                            <p className="text-xs font-bold text-gray-400 leading-relaxed h-12">{level.description}</p>
                            
                            <div className="mt-10 w-full pt-8 border-t border-[var(--border)] flex items-center justify-between px-2">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Tier Authorized</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map((i, idx) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${idx <= levels.findIndex(l => l.name === level.name) ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Advisory Note */}
            <div className="p-8 bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)]">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-relaxed text-center">
                    Difficulty stratification is applied globally to all curriculum assets. Levels are hard-coded into the primary educational framework for maximum systemic stability.
                </p>
            </div>
        </div>
    );
};

export default ManageLevels;
