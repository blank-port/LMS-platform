import React, { useState, useEffect, useContext } from 'react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  PlayIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const CronJob = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([
    { name: 'Subscription Renewal', schedule: '0 0 * * *', lastRun: '2 hours ago', status: 'Running' },
    { name: 'Database Cleanup', schedule: '0 2 * * 0', lastRun: '5 days ago', status: 'Pending' },
    { name: 'Daily Analytics Report', schedule: '30 23 * * *', lastRun: '14 hours ago', status: 'Running' },
    { name: 'Email Queue Processor', schedule: '*/5 * * * *', lastRun: '2 minutes ago', status: 'Running' },
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAllSettings();
      if (data && data.length > 0) {
        const cronSetting = data.find(s => s.key === 'system_cron_jobs');
        if (cronSetting) setJobs(cronSetting.value);
      }
    };
    loadSettings();
  }, []);

  const handleManualExecute = async () => {
    setLoading(true);
    // Simulated manual execution logic
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleSave = async (updatedJobs) => {
    setLoading(true);
    await updateBatchSettings({ system_cron_jobs: updatedJobs });
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             🗓️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Cron Nexus</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Scheduled Operations</p>
          </div>
        </div>
        <button 
          onClick={handleManualExecute}
          disabled={loading}
          className={`flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Initializing Cycle...' : (
            <>
              <PlayIcon className="w-5 h-5" />
              Execute Manual Cycle
            </>
          )}
        </button>
      </div>

      <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm border border-purple-800/30">
            <CalendarDaysIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-main)]">Task Manifest</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--background)]/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Strategic Task</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Execution Schedule</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Origin</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {jobs.map((job) => (
                <tr key={job.name} className="hover:bg-[var(--background)]/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                       <span className="font-bold text-[var(--text-main)]">{job.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <code className="px-3 py-1 bg-[var(--background)] rounded-lg text-xs font-black text-gray-500 font-mono italic">
                      {job.schedule}
                    </code>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-gray-400">
                       <ClockIcon className="w-4 h-4" />
                       <span className="text-xs font-bold">{job.lastRun}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      job.status === 'Running' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-purple-500/20 transition-colors">
               🚀
            </div>
            <div>
               <h4 className="text-xl font-black">Performance Audit</h4>
               <p className="text-gray-400 font-medium text-sm mt-1">Average execution time is 1.2s across all tasks.</p>
            </div>
         </div>
         <div className="bg-[var(--surface)] rounded-[2rem] p-8 border border-[var(--border)] flex items-center gap-6 group hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-3xl group-hover:bg-purple-100 transition-colors">
               📊
            </div>
            <div>
               <h4 className="text-xl font-black text-[var(--text-main)]">Resource Logging</h4>
               <p className="text-gray-400 font-medium text-sm mt-1">Detailed execution telemetry is currently enabled.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CronJob;




