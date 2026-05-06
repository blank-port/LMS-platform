import React from 'react';
import NexusChat from '../../components/common/NexusChat.jsx';

const ManageMessages = () => {
    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        <p className="text-[9px] font-black text-[#0C132B]/40 uppercase tracking-[0.3em]">Global Communications</p>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-[#0C132B] tracking-tighter">Strategic Relay</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 max-w-lg">Overwatch and engage in high-fidelity encrypted discourse across the entire scholar network.</p>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
                <NexusChat panel="admin" />
            </div>
        </div>
    );
};

export default ManageMessages;




