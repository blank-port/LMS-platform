import React from 'react';
import { 
  ClockIcon, 
  GlobeAltIcon, 
  ComputerDesktopIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const Timezone = () => {
  const Card = ({ title, icon: Icon, children }) => (
    <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center gap-4">
        <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm border border-purple-800/30">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-main)]">{title}</h3>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             🕒
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Timezone</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Temporal Governance</p>
          </div>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95">
          <CheckCircleIcon className="w-5 h-5" />
          Synchronize Time
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Global Temporal Alignment" icon={GlobeAltIcon}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">System Timezone</label>
              <select className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]">
                <option>(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                <option>(UTC+00:00) London, Dublin, Casablanca</option>
                <option>(UTC-05:00) Eastern Time (US & Canada)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Date Format Protocol</label>
              <select className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]">
                <option>DD-MM-YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex items-center justify-between border border-gray-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2 block">Current Server Pulse</span>
              <h2 className="text-4xl font-black tracking-tighter tabular-nums">14:28:35 <span className="text-lg text-gray-500 font-bold ml-2">GMT+5:30</span></h2>
              <p className="text-gray-500 text-xs font-bold mt-2 uppercase tracking-widest">Friday, October 27, 2023</p>
            </div>
            <div className="relative z-10 w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl">
              🛰️
            </div>
          </div>

          <Card title="Regional Context" icon={CalendarDaysIcon}>
            <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                  <span className="text-sm font-bold text-[var(--text-muted)]">DST Compensation</span>
                  <div className="w-12 h-6 bg-purple-600 rounded-full relative">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--surface)] rounded-full"></div>
                  </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                  <span className="text-sm font-bold text-[var(--text-muted)]">NTP Synchronization</span>
                  <div className="w-12 h-6 bg-purple-600 rounded-full relative">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--surface)] rounded-full"></div>
                  </div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Timezone;
