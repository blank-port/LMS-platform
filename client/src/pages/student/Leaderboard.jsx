import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { Trophy, Medal, Crown, Star, Shield, Award, Search, TrendingUp } from 'lucide-react';
import BadgeIcon from '../../components/common/BadgeIcon.jsx';

const Leaderboard = () => {
    const { backendUrl, token, user } = useContext(AppContext);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (token) {
            fetchLeaderboard();
        }
    }, [token]);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/gamification/leaderboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error('Failed to load leaderboard');
        }
        setLoading(false);
    };

    const filteredLeaderboard = leaderboard.filter(scholar => 
        scholar.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Crown size={24} className="text-yellow-400 drop-shadow-lg" />;
            case 1: return <Medal size={24} className="text-gray-300 drop-shadow-lg" />;
            case 2: return <Medal size={24} className="text-amber-600 drop-shadow-lg" />;
            default: return <span className="text-lg font-black text-gray-300">#{index + 1}</span>;
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-400 font-black uppercase text-[10px] tracking-widest animate-pulse transition-all">Synchronizing Global Rankings...</div>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Global Scholastic Rankings</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Star size={12} className="text-indigo-500" /> Top 50 Intelligence Earners
                    </p>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Locate Scholar..."
                        className="bg-white border-2 border-gray-100 rounded-2xl pl-16 pr-8 py-4 w-full md:w-[350px] font-black text-[10px] uppercase tracking-widest outline-none focus:border-indigo-500 focus:ring-4 ring-indigo-500/5 transition-all shadow-xl shadow-gray-200/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Podium (Top 3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                {leaderboard.slice(0, 3).map((scholar, i) => {
                    const positions = ['order-2 md:order-1 scale-90', 'order-1 md:order-2 scale-100', 'order-3 md:order-3 scale-90'];
                    const colors = ['bg-indigo-50 border-indigo-100', 'bg-gradient-to-br from-[#0C132B] to-[#16213e] text-white', 'bg-amber-50 border-amber-100'];
                    return (
                        <div key={scholar._id} className={`${positions[i]} ${colors[i]} rounded-[3.5rem] p-10 text-center shadow-2xl relative overflow-hidden transition-transform hover:-translate-y-2`}>
                            {i === 1 && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="mb-6 relative">
                                    <img 
                                        src={scholar.avatar || 'https://placehold.co/150'} 
                                        alt={scholar.name} 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                                    />
                                    <div className="absolute -bottom-2 translate-x-[60%] right-1/2 w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                                        {getRankIcon(i)}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black tracking-tight line-clamp-1">{scholar.name}</h3>
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${i === 1 ? 'text-indigo-400' : 'text-gray-400'}`}>
                                    Level {scholar.gamification?.level || 1} • {scholar.gamification?.badges?.length || 0} Badges
                                </p>
                                <div className={`mt-8 px-6 py-2 rounded-full font-black text-[11px] uppercase tracking-widest ${i === 1 ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 shadow-sm border border-indigo-50'}`}>
                                    {scholar.gamification?.totalPoints?.toLocaleString() || 0} PTS
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* General Rankings Table */}
            <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-6 mb-10 pb-6 border-b border-gray-100 px-6">
                    <span className="col-span-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</span>
                    <span className="col-span-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scholar Entity</span>
                    <span className="col-span-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mastery</span>
                    <span className="col-span-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Achievements</span>
                    <span className="col-span-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Intel Capital</span>
                </div>

                <div className="space-y-4">
                    {filteredLeaderboard.slice(3).map((scholar, i) => (
                        <div 
                            key={scholar._id} 
                            className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-[2.5rem] transition-all hover:bg-gray-50 group ${scholar._id === user._id ? 'bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-lg' : 'bg-white border border-gray-50/50'}`}
                        >
                            <div className="col-span-1 flex items-center md:items-start">
                                <span className="text-xl font-black text-gray-200 group-hover:text-indigo-500 transition-colors tracking-tighter italic">#{i + 4}</span>
                            </div>

                            <div className="col-span-5 flex items-center gap-6">
                                <img 
                                    src={scholar.avatar || 'https://via.placeholder.com/150'} 
                                    alt={scholar.name} 
                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md group-hover:rotate-6 transition-transform"
                                />
                                <div>
                                    <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight italic">
                                        {scholar.name} {scholar._id === user._id && <span className="text-[10px] font-black text-indigo-500 bg-indigo-100/50 px-2 py-0.5 rounded ml-2">YOU</span>}
                                    </p>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">Verified Scholar Node</p>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="text-emerald-400" />
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Level {scholar.gamification?.level || 1}</span>
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                                {scholar.gamification?.badges?.slice(0, 3).map((badge, j) => (
                                    <div key={j} className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-sm shadow-sm border border-indigo-100/50 group-hover:scale-110 transition-transform cursor-help overflow-hidden p-1" title={badge.title}>
                                        <BadgeIcon icon={badge.icon} className="w-full h-full" />
                                    </div>
                                ))}
                                {scholar.gamification?.badges?.length > 3 && (
                                    <span className="text-[10px] font-black text-indigo-400 ml-2">+{scholar.gamification.badges.length - 3} More</span>
                                )}
                            </div>

                            <div className="col-span-2 text-right">
                                <p className="text-lg font-black text-indigo-900 tracking-tighter">{scholar.gamification?.totalPoints?.toLocaleString() || 0}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Points</p>
                            </div>
                        </div>
                    ))}
                    
                    {filteredLeaderboard.length === 0 && (
                        <div className="text-center py-24 text-gray-300 italic text-sm font-black uppercase tracking-widest">
                            No scholars detected in current data stream.
                        </div>
                    )}
                </div>
            </div>

            {/* Gamification Protocol Footer */}
            <div className="bg-indigo-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl backdrop-blur-xl border border-white/10">📈</div>
                    <div>
                        <h4 className="text-xl font-black tracking-tight">Rise Through The Ranks</h4>
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-1 italic">Maintain active engagement to secure your spot in the global treasury.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl flex flex-col items-center">
                        <span className="text-2xl font-black tracking-tighter italic">500:1</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Conversion Ratio</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl flex flex-col items-center">
                        <span className="text-2xl font-black tracking-tighter italic">Top 50</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Scholar Visibility</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
