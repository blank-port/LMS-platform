import React, { useState, useEffect, useContext } from 'react';
import {
  RocketLaunchIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const AboutUpdate = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    system_version: 'v4.2.0 Stable',
    system_environment: 'Production Alpha',
    system_license: 'Enterprise Strategic'
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

  const handleSync = async () => {
    setLoading(true);
    // Simulate architectural sync / update check
    await updateBatchSettings({ last_sync: new Date().toISOString() });
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
             🛡️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">System Core</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Platform Evolution</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-green-900/20 text-green-700 rounded-2xl font-black text-[10px] uppercase border border-green-800/30">
           <CheckCircleIcon className="w-4 h-4" />
           Version: {settings.system_version}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <div className="bg-gray-900 rounded-[2rem] p-10 text-white relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent)] opacity-60"></div>
             <RocketLaunchIcon className="w-12 h-12 text-purple-400 mb-8" />
             <h3 className="text-3xl font-black">Structural Integrity</h3>
             <p className="text-gray-400 font-medium text-base mt-4 leading-relaxed">PrismEd Enterprise Edition. Optimized for high-frequency academic transactions and institutional scaling.</p>
             <div className="mt-10 flex items-center gap-6">
                <div className="flex flex-col">
                   <span className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Environment</span>
                   <span className="text-white font-bold text-sm">{settings.system_environment}</span>
                </div>
                <div className="w-px h-8 bg-gray-800"></div>
                <div className="flex flex-col">
                   <span className="text-gray-500 font-black text-[10px] uppercase tracking-widest">License</span>
                   <span className="text-purple-400 font-bold text-sm italic">{settings.system_license}</span>
                </div>
             </div>
          </div>

          <Card title="Update Protocol" icon={ArrowPathIcon}>
             <div className="flex flex-col gap-6">
                <div className="p-6 bg-purple-900/20 rounded-2xl border border-purple-800/30 flex items-start gap-4">
                   <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm">
                      <InformationCircleIcon className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-purple-900 italic">Cloud Synchronized</h4>
                      <p className="text-xs text-purple-700 font-medium mt-1 leading-relaxed">System is currently up to date. Structural integrity confirmed.</p>
                   </div>
                </div>
                <button 
                  onClick={handleSync}
                  disabled={loading}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-purple-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                   <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                   {loading ? 'Synchronizing...' : 'Force Architectural Sync'}
                </button>
             </div>
          </Card>
        </div>

        <Card title="Changelog Artifacts" icon={DocumentTextIcon}>
           <div className="flex flex-col gap-6">
              {[
                { version: 'v4.2.0', date: 'OCT 2023', change: 'Redesigned Administrative Command Hub with 28 specialized governance sub-modules.' },
                { version: 'v4.1.5', date: 'SEP 2023', change: 'Integrated high-fidelity Wallet & Commission engine for fiscal scalability.' },
                { version: 'v4.0.0', date: 'AUG 2023', change: 'Platform architectural migration to Node.js/React Enterprise Stack.' },
              ].map((log) => (
                <div key={log.version} className="relative pl-8 border-l-2 border-[var(--border)] group transition-all hover:border-purple-200">
                   <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-gray-200 group-hover:bg-purple-600 transition-colors"></div>
                   <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-purple-400 tracking-tighter">{log.version}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{log.date}</span>
                   </div>
                   <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">{log.change}</p>
                </div>
              ))}
              <button className="mt-4 text-xs font-black text-gray-400 hover:text-purple-400 uppercase tracking-widest transition-colors flex items-center gap-2">
                 View Historical Ledger
                 <ShieldCheckIcon className="w-4 h-4" />
              </button>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutUpdate;
