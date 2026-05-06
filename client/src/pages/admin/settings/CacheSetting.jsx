import React, { useState, useEffect, useContext } from 'react';
import { 
  CircleStackIcon, 
  TrashIcon, 
  BoltIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const CacheSetting = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    system_cache_driver: 'Redis (Recommended)',
    auto_purge_on_deploy: true,
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
             🗄️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Cache Protocol</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / System Performance</p>
          </div>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95">
          <TrashIcon className="w-5 h-5" />
          Purge Global Cache
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Optimization Targets" icon={CircleStackIcon}>
          <div className="flex flex-col gap-4">
             {[
               { name: 'Application Cache', size: '124 MB', icon: BoltIcon },
               { name: 'View/Template Cache', size: '18 MB', icon: ArrowPathIcon },
               { name: 'Route Cache', size: '2.4 MB', icon: CheckCircleIcon },
               { name: 'Config Cache', size: '0.8 MB', icon: ShieldCheckIcon },
             ].map((item) => (
               <div key={item.name} className="flex items-center justify-between p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] hover:border-purple-200 transition-all group">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--surface)] rounded-xl flex items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors shadow-sm">
                       <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="font-bold text-[var(--text-main)]">{item.name}</h4>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pulse Status: Synchronized</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-[var(--text-muted)]">{item.size}</span>
                    <button className="p-2 hover:bg-[var(--surface)] rounded-lg text-gray-400 hover:text-red-500 transition-all outline-none">
                       <TrashIcon className="w-5 h-5" />
                    </button>
                 </div>
               </div>
             ))}
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <div className="bg-purple-600 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10">
               <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">High-Availability Mode</span>
               <h3 className="text-2xl font-black mt-2">Redis Cluster Integrated</h3>
               <p className="text-purple-100 font-bold text-sm mt-2 opacity-80 leading-relaxed">System latency currently operating at 14ms. Persistence layer is fully operational.</p>
               <div className="mt-8 flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                 <span className="text-xs font-black uppercase tracking-widest">Optimal Node Health</span>
               </div>
            </div>
          </div>

          <Card title="Cache Directives" icon={ShieldCheckIcon}>
             <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Cache Driver</label>
                  <select 
                    value={settings.system_cache_driver}
                    onChange={(e) => handleSave({ system_cache_driver: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]"
                  >
                    <option>Redis (Recommended)</option>
                    <option>Memcached</option>
                    <option>File Persistence</option>
                    <option>Array (Testing Only)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-900/20 rounded-xl border border-purple-800/30">
                  <span className="text-sm font-bold text-purple-700">Auto-Purge on Deployment</span>
                  <div 
                    onClick={() => handleSave({ auto_purge_on_deploy: !settings.auto_purge_on_deploy })}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.auto_purge_on_deploy ? 'bg-purple-600' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-[var(--surface)] rounded-full transition-all ${settings.auto_purge_on_deploy ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CacheSetting;




