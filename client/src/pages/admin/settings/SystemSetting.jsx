import React, { useState, useEffect, useContext } from 'react';
import { 
  Cog6ToothIcon, 
  ShieldCheckIcon, 
  ArrowPathIcon,
  CpuChipIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const SystemSetting = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    debug_mode: true,
    cache_ttl: 3600,
    system_log_retention: 30
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

  const handleSave = async (newSettings = {}) => {
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
             ⚙️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">System Nexus</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Core Matrix</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-purple-900/20 text-purple-700 rounded-2xl font-black text-[10px] uppercase border border-purple-800/30">
           <CpuChipIcon className="w-4 h-4 animate-spin-slow" />
           Kernel Status: Verified Stable
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Operational Overrides" icon={Cog6ToothIcon}>
          <div className="flex flex-col gap-8">
             <div className="flex items-center justify-between p-6 bg-[var(--background)] rounded-[1.5rem] border border-[var(--border)]">
                <div>
                   <h4 className="font-black text-[var(--text-main)]">Maintenance Mode</h4>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Isolate public traffic</p>
                </div>
                <div 
                  onClick={() => handleSave({ maintenance_mode: !settings.maintenance_mode })}
                  className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${settings.maintenance_mode ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                   <div className={`absolute top-1 w-5 h-5 bg-[var(--surface)] rounded-full transition-all ${settings.maintenance_mode ? 'right-1' : 'left-1'}`}></div>
                </div>
             </div>

             <div className="flex items-center justify-between p-6 bg-[var(--background)] rounded-[1.5rem] border border-[var(--border)]">
                <div>
                   <h4 className="font-black text-[var(--text-main)]">Debug Verbosity</h4>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">High-fidelity log stream</p>
                </div>
                <div 
                  onClick={() => handleSave({ debug_mode: !settings.debug_mode })}
                  className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${settings.debug_mode ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                   <div className={`absolute top-1 w-5 h-5 bg-[var(--surface)] rounded-full transition-all ${settings.debug_mode ? 'right-1' : 'left-1'}`}></div>
                </div>
             </div>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card title="Structural Retention" icon={ShieldCheckIcon}>
             <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider italic">Cache TTL (Seconds)</label>
                   <input 
                      type="number" 
                      value={settings.cache_ttl}
                      onChange={(e) => setSettings({ ...settings, cache_ttl: e.target.value })}
                      onBlur={() => handleSave()}
                      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]"
                   />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider italic">Log Retention (Days)</label>
                   <input 
                      type="number" 
                      value={settings.system_log_retention}
                      onChange={(e) => setSettings({ ...settings, system_log_retention: e.target.value })}
                      onBlur={() => handleSave()}
                      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]"
                   />
                </div>
             </div>
          </Card>

          <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(168,85,247,0.05)_50%,transparent_75%)] bg-[length:400%_400%] animate-[shimmer_8s_infinite]"></div>
             <ArrowPathIcon className="w-10 h-10 text-purple-400 mb-6" />
             <h4 className="text-2xl font-black italic">Strategic Integrity</h4>
             <p className="text-gray-400 font-medium text-sm mt-2 leading-relaxed italic">"The system core is currently executing at peak institutional efficiency with 99.99% uptime fragments."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSetting;




