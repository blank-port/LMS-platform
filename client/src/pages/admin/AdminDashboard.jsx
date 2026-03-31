import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';

const AdminDashboard = () => {
  const { backendUrl, token, navigate } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

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
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Synchronizing Intelligence...</p>
    </div>
  );

  const statCards = [
    { label: 'Strategic Users', value: stats?.totalUsers || 0, icon: '👥', trend: 'Global Matrix', color: 'bg-[var(--surface)]' },
    { label: 'Knowledge Assets', value: stats?.totalCourses || 0, icon: '📚', trend: 'Curriculum Efficacy', color: 'bg-[var(--surface)]' },
    { label: 'Gross Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', trend: 'Fiscal Growth', color: 'bg-[var(--surface)]' },
    { label: 'Authorized Institutes', value: stats?.totalInstitutes || 0, icon: '🏛️', trend: 'Network Density', color: 'bg-[var(--surface)]' },
    { label: 'Pending Approvals', value: (stats?.pendingCourses || 0) + (stats?.pendingInstructors || 0), icon: '⏳', trend: 'High Priority', color: 'bg-gray-900', isDark: true },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Executive Header */}
      <div className="flex items-end justify-between border-b border-[var(--border)] pb-10">
        <div>
          <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter">Strategic Command</h1>
          <p className="text-gray-500 font-bold mt-4 uppercase text-[10px] tracking-[0.4em]">Integrated Academic Operations & Fiscal Intelligence Terminal</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System State: Optimal</span>
          </div>
        </div>
      </div>

      {/* Metrics Surface */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.isDark ? 'bg-gray-900 text-white col-span-1 lg:col-span-1' : 'bg-[var(--surface)]'} rounded-[2.5rem] p-8 shadow-sm border ${card.isDark ? 'border-gray-800' : 'border-[var(--border)]'} hover:shadow-2xl hover:shadow-purple-50 transition-all group relative overflow-hidden`}>
            <div className="relative z-10">
              <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-4 group-hover:translate-x-1 transition-transform">{card.trend}</p>
              <p className="text-3xl font-black tracking-tighter mb-1">{card.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Infrastructure & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-[var(--surface)] rounded-[3.5rem] border border-[var(--border)] p-12 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
            <span className="text-[15rem] font-black leading-none">PRISMED</span>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Institutional Efficacy</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Cross-Departmental Performance Analytics</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 h-64 items-end px-2">
              {[80, 45, 90, 60, 30, 75, 55, 100].map((h, i) => (
                <div key={i} className="relative group/bar flex flex-col items-center">
                  <div style={{ height: `${h}%` }} className="w-full bg-[var(--background)] rounded-2xl group-hover:bg-purple-900/30 transition-all relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-purple-600/10 group-hover:bg-purple-600/30 transition-all" style={{ height: '40%' }}></div>
                  </div>
                  <span className="text-[8px] font-black text-gray-300 mt-4 uppercase tracking-tighter">NODE 0{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-[3.5rem] border border-[var(--border)] p-12 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight mb-2 uppercase tracking-tighter">Action Matrix</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">High-Priority Operations Required</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-[var(--background)] rounded-3xl border border-[var(--border)] group hover:border-purple-200 hover:bg-[var(--surface)] transition-all">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Knowledge Assets</p>
                  <p className="text-sm font-black text-[var(--text-main)]">{stats?.pendingCourses || 0} Awaiting Validation</p>
                </div>
                <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors text-lg border border-[var(--border)]">⏳</div>
              </div>

              <div className="flex items-center justify-between p-6 bg-[var(--background)] rounded-3xl border border-[var(--border)] group hover:border-purple-200 hover:bg-[var(--surface)] transition-all">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fiscal Reversal</p>
                  <p className="text-sm font-black text-[var(--text-main)]">12 Pending Refunds</p>
                </div>
                <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-red-500 group-hover:text-white transition-colors text-lg border border-[var(--border)]">💰</div>
              </div>

              <div className="flex items-center justify-between p-6 bg-[var(--background)] rounded-3xl border border-[var(--border)] group hover:border-purple-200 hover:bg-[var(--surface)] transition-all">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Scholar Discourse</p>
                  <p className="text-sm font-black text-[var(--text-main)]">8 Unresolved Q&A</p>
                </div>
                <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors text-lg border border-[var(--border)]">💬</div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button className="w-full h-16 bg-gray-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-purple-600 shadow-2xl transition-all">Execute Global Audit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

