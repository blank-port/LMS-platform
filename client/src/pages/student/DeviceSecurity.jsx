import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { ShieldCheck, Monitor, Smartphone, Globe, LogOut, Clock, Calendar, CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const DeviceSecurity = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get('/user/sessions');
            if (data.success) setSessions(data.sessions);
        } catch (error) {
            console.error('Session Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const revokeSession = async (sessionId) => {
        const actionToast = toast.loading('Terminating remote session...');
        try {
            const { data } = await api.delete(`/user/sessions/${sessionId}`);
            if (data.success) {
                toast.update(actionToast, { render: 'Session terminated from central registry.', type: "success", isLoading: false, autoClose: 3000 });
                fetchSessions();
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Revocation failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchSessions(); }, [token]);

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 text-uppercase">Neural Security Protocols</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em] opacity-80">Device Monitoring & Active Session Matrix</p>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/5">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Advanced Encryption Mode</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-blue-500/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <div className="relative z-10 text-center">
                            <ShieldAlert size={48} className="text-blue-500 mx-auto mb-8 animate-pulse" />
                            <h2 className="text-2xl font-black tracking-tighter mb-4 uppercase leading-none">Identity Guard</h2>
                            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-60 mb-8">
                                Institutional security requires active monitoring of all cognitive access points.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Identity Status</p>
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 uppercase tracking-[0.2em] text-[10px] font-black">
                            <CheckCircle size={14} /> Verified
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                   <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                       <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between">
                           <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Active Device Sessions</h3>
                           <Monitor size={20} className="text-slate-400" />
                       </div>
                       <div className="divide-y divide-slate-50">
                           {sessions.length === 0 ? (
                               <div className="py-24 text-center">
                                   <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic">Scanning neural access points... No active entries.</p>
                               </div>
                           ) : (
                               sessions.map((session, i) => (
                                   <div key={i} className="px-12 py-10 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                                       <div className="flex items-center gap-8">
                                           <div className={`w-16 h-16 rounded-[1.5rem] ${session.isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                               {session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('android') ? (
                                                  <Smartphone size={24} />
                                               ) : (
                                                  <Monitor size={24} />
                                               )}
                                           </div>
                                           <div className="space-y-1">
                                               <div className="flex items-center gap-3">
                                                  <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-tighter">{session.device}</h4>
                                                  {session.isCurrent && (
                                                     <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-lg">Current Cluster</span>
                                                  )}
                                               </div>
                                               <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                   <span className="flex items-center gap-2"><Globe size={12} /> {session.browser} • {session.ip}</span>
                                                   <span className="flex items-center gap-2"><Clock size={12} /> Last active: {new Date(session.lastActive).toLocaleTimeString()}</span>
                                               </div>
                                           </div>
                                       </div>
                                       
                                       {!session.isCurrent && (
                                           <button 
                                              onClick={() => revokeSession(session._id)}
                                              className="p-5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group/btn"
                                           >
                                              <LogOut size={20} className="group-hover/btn:-translate-x-1 transition-transform" />
                                           </button>
                                       )}
                                   </div>
                               ))
                           )}
                       </div>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceSecurity;




