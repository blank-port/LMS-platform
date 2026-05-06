import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, BookOpen, IndianRupee, ShieldCheck, AlertCircle, ChevronRight, Download } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { navigate } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    const timer = setTimeout(() => setHasMounted(true), 100);
    fetchStats(); 
    return () => clearTimeout(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      if (data.success) setStats(data.stats);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.warning("No data available for export.");
      return;
    }
    // Deep extract keys for nested objects if needed, but here we assume flat or simple
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    }).join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} report exported.`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] admin-theme">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 border-[6px] border-t-[var(--primary)] rounded-full animate-spin shadow-lg"></div>
      </div>
      <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing Platform Data...</p>
    </div>
  );

  const MetricsCard = ({ label, value, icon: Icon, trend, colorClass, isPending, onClick }) => (
    <div 
        onClick={onClick}
        className={`metric-tile p-8 cursor-pointer ${isPending ? 'bg-slate-900 !border-slate-800' : ''}`}>
      <div className={`absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${isPending ? 'text-white' : 'text-[var(--primary)]'}`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${isPending ? 'bg-white/10 text-white' : 'bg-slate-50 text-[var(--primary)] border border-slate-100'}`}>
          <Icon size={20} />
        </div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isPending ? 'text-slate-300' : 'text-slate-400'}`}>{trend}</p>
        <h3 className={`text-3xl font-black tracking-tighter mb-1.5 ${isPending ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
        <p className={`text-[11px] font-bold uppercase tracking-widest ${isPending ? 'text-slate-200 opacity-60' : 'text-slate-400 opacity-80'}`}>{label}</p>
      </div>
    </div>
  );

  return (
    <div className="panel-shell animate-fade-in admin-theme">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Admin Dashboard</h1>
          <p className="text-[11px] font-black text-[var(--primary)] uppercase tracking-[0.4em] opacity-80">PrismEd Platform Management & Operations</p>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 px-6 py-3.5 rounded-2xl">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">All Systems Functional</span>
        </div>
      </div>

      {/* High-Impact Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <MetricsCard label="Active Students" value={stats?.activeUsers || 0} icon={Users} trend="7D Window" colorClass="indigo" onClick={() => navigate('/admin/users')} />
        <MetricsCard label="Total Courses" value={stats?.totalCourses || 0} icon={BookOpen} trend="Portfolio" colorClass="cyan" onClick={() => navigate('/admin/courses')} />
        <MetricsCard label="Gross Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={IndianRupee} trend="Fiscal State" colorClass="emerald" onClick={() => navigate('/admin/payments')} />
        <MetricsCard label="Enrollments" value={stats?.totalEnrollments || 0} icon={ShieldCheck} trend="Throughput" colorClass="purple" onClick={() => navigate('/admin/enrollments')} />
        <MetricsCard label="Pending Tasks" value={(stats?.pendingCourses || 0) + (stats?.pendingInstructors || 0)} icon={AlertCircle} trend="Moderation" isPending={true} onClick={() => navigate('/admin/courses')} />
      </div>

      {/* Intelligence Surfaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Growth Projection Area Chart */}
        <div className="panel-card lg:col-span-2 overflow-hidden rounded-[2.5rem] p-8 md:p-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Analysis</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Revenue & User Acquisition Trends (7D Window)</p>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex gap-2 mb-2">
                    <span className="px-4 py-2 bg-slate-100 text-[var(--primary)] text-[10px] font-black rounded-lg uppercase tracking-widest">Revenue Flow</span>
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-widest">New Users</span>
                </div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Daily Velocity: +₹{stats?.todayRevenue || 0}</span>
            </div>
          </div>

          <div className="h-80 w-full">
            {hasMounted && (
              <ResponsiveContainer width="100%" height="100%" minHeight={320} minWidth={0} debounce={100}>
              <AreaChart data={stats?.growthTimeSeries || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0F766E" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="users" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Operational Nexus & Task Queue */}
        <div className="bg-slate-900 rounded-[3.5rem] p-10 flex flex-col justify-between shadow-2xl shadow-slate-900/30">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter mb-2 uppercase">Moderation Queue</h2>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-12 opacity-60">High-Priority Actions Required</p>

            <div className="space-y-6">
              {[
                { label: 'Course Pipeline', count: stats?.pendingCourses || 0, icon: BookOpen, path: '/admin/courses' },
                { label: 'Instructor Access', count: stats?.pendingInstructors || 0, icon: Users, path: '/admin/instructors' },
                { label: 'Fiscal Settling', count: stats?.pendingPayouts || 0, icon: IndianRupee, path: '/admin/instructor-payouts' }
              ].map((task, i) => {
                const TaskIcon = task.icon;
                return (
                  <div key={i} onClick={() => navigate(task.path)} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white`}>
                        <TaskIcon size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5 opacity-60">Operations</p>
                        <p className="text-[13px] font-black text-white tracking-tight">{task.count} {task.label}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-white transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/settings-hub')}
            className="w-full h-18 bg-white text-slate-900 rounded-[1.8rem] font-black text-[12px] uppercase tracking-[0.4em] hover:scale-[1.02] transform transition-all duration-500 shadow-2xl active:scale-95 mt-10"
          >
            System Settings
          </button>
        </div>
      </div>

      {/* Performance Leaders Matrix - Phase 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Top Courses Ranking */}
        <div className="panel-card rounded-[2.5rem] p-8 md:p-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Top Courses</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Knowledge Assets by Revenue</p>
                </div>
                <button 
                  onClick={() => exportToCSV(stats?.topPerformers?.topCourses, 'Top_Courses')}
                  className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:bg-white transition-all shadow-sm"
                  title="Export to CSV"
                >
                  <Download size={16} />
                </button>
            </div>
            <div className="space-y-6">
                {stats?.topPerformers?.topCourses?.map((course, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-sm font-black text-[var(--primary)] border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                #{i+1}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base font-black text-slate-800 tracking-tight leading-none mb-1 group-hover:text-[var(--primary)] transition-colors truncate max-w-[200px]">{course.title}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{course.enrollments} Students</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-black text-slate-900 tracking-tighter">₹{course.revenue?.toLocaleString()}</span>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Gross Yield</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Top Instructors Ranking */}
        <div className="panel-card rounded-[2.5rem] p-8 md:p-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Top Educators</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High-Performance Instructors</p>
                </div>
                <button 
                  onClick={() => exportToCSV(stats?.topPerformers?.topInstructors, 'Top_Instructors')}
                  className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white transition-all shadow-sm"
                  title="Export to CSV"
                >
                  <Download size={16} />
                </button>
            </div>
            <div className="space-y-6">
                {stats?.topPerformers?.topInstructors?.map((instructor, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-cyan-100 hover:bg-white transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-sm font-black text-emerald-600 border border-slate-100 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                                #{i+1}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base font-black text-slate-800 tracking-tight leading-none mb-1 group-hover:text-emerald-600 transition-colors">{instructor.name}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{instructor.email}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-black text-slate-900 tracking-tighter">₹{instructor.revenue?.toLocaleString()}</span>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Platform Gross</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="panel-card rounded-[3rem] p-10 mt-10">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Recent Activity</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Platform activity & financial updates</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                      onClick={() => exportToCSV(stats?.recentActivity, 'Platform_Activity')}
                      className="h-12 px-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-white transition-all shadow-sm"
                    >
                      <Download size={14} />
                      Export Feed
                    </button>
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Status</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats?.recentActivity?.map((act, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 opacity-[0.03] -mr-8 -mt-8 rotate-12 transition-transform group-hover:rotate-0 duration-700 ${
                            act.type === 'USER' ? 'text-indigo-600' : act.type === 'TRANSACTION' ? 'text-emerald-600' : 'text-purple-600'
                        }`}>
                            {act.type === 'USER' ? <Users size={100} /> : act.type === 'TRANSACTION' ? <IndianRupee size={100} /> : <BookOpen size={100} />}
                        </div>
                        
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg ${
                                    act.type === 'USER' ? 'bg-indigo-50 text-indigo-600' : act.type === 'TRANSACTION' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                                }`}>
                                    {act.type} Node
                                </span>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            <h4 className="text-sm font-black text-slate-800 tracking-tight mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-1">{act.title}</h4>
                            <p className="text-[11px] font-bold text-slate-400 leading-tight mb-4 flex-1 line-clamp-2">{act.detail}</p>
                            
                            <div className="pt-4 border-t border-slate-50 mt-auto">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Verified Origin</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No recent activity detected.</p>
                </div>
            )}
      </div>
    </div>
  );
};
export default AdminDashboard;


