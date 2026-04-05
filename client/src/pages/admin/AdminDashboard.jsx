import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Users, BookOpen, IndianRupee, ShieldCheck, Zap, AlertCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { backendUrl, token, navigate } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    setHasMounted(true);
    fetchStats(); 
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setStats(data.stats);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] admin-theme">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 border-[6px] border-t-indigo-600 rounded-full animate-spin shadow-lg"></div>
      </div>
      <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing Strategic Data...</p>
    </div>
  );

  // High-Fidelity Mock Data for Visual Demo (if real time-series not provided)
  const chartData = [
    { name: 'Mon', revenue: 4000, users: 240 },
    { name: 'Tue', revenue: 3000, users: 139 },
    { name: 'Wed', revenue: 2000, users: 980 },
    { name: 'Thu', revenue: 2780, users: 390 },
    { name: 'Fri', revenue: 1890, users: 480 },
    { name: 'Sat', revenue: 2390, users: 380 },
    { name: 'Sun', revenue: 3490, users: 430 },
  ];

  const distributionData = [
    { name: 'Students', value: stats?.totalUsers || 0, color: '#6366F1' },
    { name: 'Courses', value: stats?.totalCourses || 0, color: '#06B6D4' },
    { name: 'Institutes', value: stats?.totalInstitutes || 0, color: '#8B5CF6' },
  ];

  const MetricsCard = ({ label, value, icon: Icon, trend, colorClass, isPending }) => (
    <div className={`p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden ${isPending ? 'bg-indigo-900 !border-indigo-800' : ''}`}>
      <div className={`absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${isPending ? 'text-white' : 'text-indigo-600'}`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${isPending ? 'bg-white/10 text-white' : 'bg-slate-50 text-indigo-600 border border-slate-100'}`}>
          <Icon size={20} />
        </div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isPending ? 'text-indigo-300' : 'text-slate-400'}`}>{trend}</p>
        <h3 className={`text-3xl font-black tracking-tighter mb-1.5 ${isPending ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
        <p className={`text-[11px] font-bold uppercase tracking-widest ${isPending ? 'text-indigo-200 opacity-60' : 'text-slate-400 opacity-80'}`}>{label}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-fade-in pb-20 admin-theme">
      {/* Strategic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Command Hub</h1>
          <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] opacity-80">PrismEd Strategic Operations & Intelligence Terminal</p>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 px-6 py-3.5 rounded-2xl">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">All Systems Functional</span>
        </div>
      </div>

      {/* High-Impact Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <MetricsCard label="Active Students" value={stats?.totalUsers || 0} icon={Users} trend="User Matrix" colorClass="indigo" />
        <MetricsCard label="Curriculum Assets" value={stats?.totalCourses || 0} icon={BookOpen} trend="Efficacy" colorClass="cyan" />
        <MetricsCard label="Gross Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={IndianRupee} trend="Fiscal State" colorClass="emerald" />
        <MetricsCard label="Institutes" value={stats?.totalInstitutes || 0} icon={ShieldCheck} trend="Infrastructure" colorClass="purple" />
        <MetricsCard label="Pending Tasks" value={(stats?.pendingCourses || 0) + (stats?.pendingInstructors || 0)} icon={AlertCircle} trend="High Priority" isPending={true} />
      </div>

      {/* Intelligence Surfaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Performance Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/30 overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Growth Projection</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Revenue & Engagement Matrix (7D Interval)</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Revenue</span>
              <span className="px-4 py-2 bg-cyan-50 text-cyan-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Users</span>
            </div>
          </div>

          <div className="h-80 w-full">
            {hasMounted && (
              <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="users" stroke="#06B6D4" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Action Matrix & Task Queue */}
        <div className="bg-indigo-900 rounded-[3.5rem] p-10 flex flex-col justify-between shadow-2xl shadow-indigo-900/30">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter mb-2 uppercase tracking-tighter">Action Nexus</h2>
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-12 opacity-60">Operations Queue • Priority Filtered</p>

            <div className="space-y-6">
              {[
                { label: 'Course Validation', count: stats?.pendingCourses || 0, icon: BookOpen, color: 'emerald' },
                { label: 'Instructor Access', count: stats?.pendingInstructors || 0, icon: Users, color: 'blue' },
                { label: 'Fiscal Reversal', count: 12, icon: IndianRupee, color: 'rose' }
              ].map((task, i) => {
                const TaskIcon = task.icon;
                return (
                  <div key={i} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white`}>
                        <TaskIcon size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-0.5 opacity-60">Task Matrix</p>
                        <p className="text-[13px] font-black text-white tracking-tight">{task.count} {task.label}</p>
                      </div>
                    </div>
                    <Clock size={16} className="text-indigo-400 group-hover:text-white transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/settings')}
            className="w-full h-18 bg-white text-indigo-900 rounded-[1.8rem] font-black text-[12px] uppercase tracking-[0.4em] hover:scale-[1.02] transform transition-all duration-500 shadow-2xl active:scale-95"
          >
            Terminal Settings
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;

