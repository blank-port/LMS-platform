import React, { useState, useEffect, useContext } from 'react';
import {
  PresentationChartLineIcon,
  VariableIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const AnalyticsTool = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    analytics_live_tracking: true,
    analytics_fragments: [
      { name: 'Google Tag Manager', id: 'GTM-XXXXXXX', enabled: true },
      { name: 'Facebook Pixel', id: 'PX-9928341', enabled: true },
      { name: 'Hotjar Behavioral', id: 'HJ-0012', enabled: false },
    ]
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
             📊
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Analytics Nexus</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Engagement Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Tracking:</span>
          <div 
            onClick={() => handleSave({ analytics_live_tracking: !settings.analytics_live_tracking })}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.analytics_live_tracking ? 'bg-green-500' : 'bg-gray-300'}`}
          >
             <div className={`absolute top-1 w-4 h-4 bg-[var(--surface)] rounded-full transition-all ${settings.analytics_live_tracking ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Global Tracking Fragments" icon={CodeBracketIcon}>
          <div className="flex flex-col gap-6">
             {settings.analytics_fragments.map((fragment, index) => (
               <div key={fragment.name} className="flex flex-col gap-3 p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] group hover:border-purple-200 transition-all">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">{fragment.name}</span>
                     <div 
                      onClick={() => {
                        const updated = [...settings.analytics_fragments];
                        updated[index].enabled = !updated[index].enabled;
                        handleSave({ analytics_fragments: updated });
                      }}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${fragment.enabled ? 'bg-purple-600' : 'bg-gray-200'}`}
                     >
                        <div className={`absolute top-1 w-3 h-3 bg-[var(--surface)] rounded-full transition-all ${fragment.enabled ? 'right-1' : 'left-1'}`}></div>
                     </div>
                  </div>
                  <input
                    type="text"
                    value={fragment.id}
                    onChange={(e) => {
                      const updated = [...settings.analytics_fragments];
                      updated[index].id = e.target.value;
                      setSettings({ ...settings, analytics_fragments: updated });
                    }}
                    onBlur={() => handleSave()}
                    className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-mono text-xs font-bold text-gray-500"
                  />
               </div>
             ))}
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full translate-x-12 -translate-y-12 blur-3xl"></div>
             <PresentationChartLineIcon className="w-8 h-8 text-purple-400 mb-6" />
             <h3 className="text-2xl font-black italic">Behavioral Insight</h3>
             <p className="text-gray-400 font-medium text-sm mt-2 leading-relaxed">System is currently aggregating over 45k distinct interaction events per hour. Precision mapping is operational.</p>
             <div className="mt-8 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Telemetry Synchronized</span>
             </div>
          </div>

          <Card title="Conversion Protocols" icon={CursorArrowRaysIcon}>
             <div className="flex flex-col gap-4">
                {[
                  { label: 'Event Logging (SPA)', status: 'Active' },
                  { label: 'Heatmap Accumulation', status: 'Paused' },
                ].map(p => (
                   <div key={p.label} className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                      <span className="text-sm font-bold text-[var(--text-muted)]">{p.label}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${p.status === 'Active' ? 'text-green-400' : 'text-gray-400'}`}>{p.status}</span>
                   </div>
                ))}
                <button className="mt-4 w-full py-4 bg-purple-900/20 text-purple-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-100 transition-all">
                   Deploy Custom Script
                </button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTool;




