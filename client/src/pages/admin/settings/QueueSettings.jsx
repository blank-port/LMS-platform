import React, { useState, useEffect, useContext } from 'react';
import { 
  QueueListIcon, 
  CpuChipIcon, 
  PlayIcon, 
  PauseIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const QueueSettings = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    queue_driver: 'Redis (BullMQ)',
    max_concurrent_workers: 5,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAllSettings();
      if (data && data.length > 0) {
        const settingsMap = {};
        data.forEach(s => settingsMap[s.key] = s.value);
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (newSettings) => {
    const combined = { ...settings, ...newSettings };
    setSettings(combined);
    setLoading(true);
    await updateBatchSettings(combined);
    setLoading(false);
  };

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
             ⏳
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Queue Engine</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Background Processing</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-[var(--background)] hover:bg-[var(--background)] text-[var(--text-muted)] rounded-2xl font-bold transition-all active:scale-95">
            <PauseIcon className="w-5 h-5" />
            Pause Workers
          </button>
          <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95">
            <PlayIcon className="w-5 h-5" />
            Resume Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Worker Pulse */}
        <div className="lg:col-span-1 bg-gray-900 rounded-[2rem] p-8 text-white flex flex-col justify-between border border-gray-800 shadow-xl">
           <div>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Operational Throughput</span>
              <div className="mt-4 flex items-baseline gap-2">
                 <h2 className="text-5xl font-black tracking-tighter">98 <span className="text-xl text-gray-500 font-bold">%</span></h2>
              </div>
              <p className="text-gray-500 text-xs font-bold mt-2 uppercase tracking-widest">Health Index: Excellent</p>
           </div>
           
           <div className="mt-12 space-y-6">
              {[
                { label: 'Active Jobs', value: '14' },
                { label: 'Pending Jobs', value: '1,204' },
                { label: 'Failed (24h)', value: '3', color: 'text-red-400' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                   <span className="text-sm text-gray-500 font-bold">{stat.label}</span>
                   <span className={`text-sm font-black tabular-nums ${stat.color || 'text-white'}`}>{stat.value}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card title="Worker Infrastructure" icon={CpuChipIcon}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Default Driver</label>
                  <select 
                    value={settings.queue_driver}
                    onChange={(e) => handleSave({ queue_driver: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]"
                  >
                    <option>Redis (BullMQ)</option>
                    <option>Amazon SQS</option>
                    <option>Database Persistence</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Max Concurrent Workers</label>
                  <input 
                    type="number" 
                    value={settings.max_concurrent_workers}
                    onChange={(e) => handleSave({ max_concurrent_workers: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]" 
                  />
                </div>
             </div>
          </Card>

          <div className="bg-amber-900/20 p-6 rounded-[2rem] border border-amber-800/30 flex items-start gap-4">
             <div className="w-12 h-12 bg-[var(--surface)] rounded-xl flex items-center justify-center text-amber-400 shadow-sm">
                <ExclamationCircleIcon className="w-6 h-6" />
             </div>
             <div className="flex-1">
                <h4 className="font-bold text-amber-900">Retries Protocol</h4>
                <p className="text-sm text-amber-700 font-medium mt-1 leading-relaxed">Failed jobs will be retried up to 3 times with exponential backoff (starting at 5s) before being moved to the Dead Letter Queue.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueSettings;




