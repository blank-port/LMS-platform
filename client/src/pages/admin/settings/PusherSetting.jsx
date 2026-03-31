import React, { useState, useEffect, useContext } from 'react';
import { 
  SignalIcon, 
  KeyIcon, 
  ServerIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

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

const FormField = ({ label, value, onChange, placeholder, tooltip, type = "text", onBlur }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
      {tooltip && <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />}
    </div>
    <input 
      type={type} 
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]" 
    />
  </div>
);

const PusherSetting = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    pusher_active: true,
    pusher_app_id: '',
    pusher_app_key: '',
    pusher_app_secret: '',
    pusher_cluster: 'ap2',
    pusher_encrypted: true
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
    // Sensitive keys enabled for secrets
    await updateBatchSettings(combined, true);
    setLoading(false);
  };


  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             📡
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Real-Time Pulse</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Live Connectivity</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-purple-900/20 text-purple-700 rounded-2xl font-black text-[10px] uppercase border border-purple-800/30">
           <BoltIcon className="w-4 h-4 animate-pulse" />
           Websocket Link: {settings.pusher_active ? 'Active' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Pusher Fragment" icon={SignalIcon}>
          <div className="flex flex-col gap-6">
             <FormField 
              label="App ID" 
              value={settings.pusher_app_id}
              onChange={(v) => setSettings({ ...settings, pusher_app_id: v })}
              onBlur={() => handleSave()}
              placeholder="1234567" 
             />
             <FormField 
              label="App Key" 
              value={settings.pusher_app_key}
              onChange={(v) => setSettings({ ...settings, pusher_app_key: v })}
              onBlur={() => handleSave()}
              placeholder="xxxxxxxxxxxxxxxxxxxx" 
             />
             <FormField 
              label="App Secret" 
              type="password"
              value={settings.pusher_app_secret}
              onChange={(v) => setSettings({ ...settings, pusher_app_secret: v })}
              onBlur={() => handleSave()}
              placeholder="••••••••••••••••••••" 
             />
             <div className="grid grid-cols-2 gap-4">
                <FormField 
                  label="Cluster" 
                  value={settings.pusher_cluster}
                  onChange={(v) => setSettings({ ...settings, pusher_cluster: v })}
                  onBlur={() => handleSave()}
                  placeholder="ap2" 
                />
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Encrypted Link</label>
                   <div className="w-full h-[52px] bg-[var(--background)] rounded-xl flex items-center justify-center border border-[var(--border)]">
                      <div 
                        onClick={() => handleSave({ pusher_encrypted: !settings.pusher_encrypted })}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.pusher_encrypted ? 'bg-purple-600' : 'bg-gray-200'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 bg-[var(--surface)] rounded-full transition-all ${settings.pusher_encrypted ? 'right-1' : 'left-1'}`}></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(168,85,247,0.05)_50%,transparent_75%)] bg-[length:400%_400%] animate-[shimmer_8s_infinite]"></div>
             <ServerIcon className="w-8 h-8 text-purple-400 mb-6" />
             <h3 className="text-2xl font-black">Cluster Persistence</h3>
             <p className="text-gray-400 font-medium text-sm mt-2 leading-relaxed italic">
               {settings.pusher_active && settings.pusher_app_id && settings.pusher_app_key 
                ? `"Websockets are currently operational on the ${settings.pusher_cluster || 'ap2'} cluster. Real-time broadcasting is enabled."`
                : `"Real-time services are currently offline or pending configuration. Configure your app keys to enable live synchronization."`}
             </p>
             <div className="mt-8 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${settings.pusher_active && settings.pusher_app_id ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {settings.pusher_active && settings.pusher_app_id ? 'Node Sync Complete' : 'Connection Idle'}
                </span>
             </div>
          </div>

          <Card title="Broadcast Directives" icon={KeyIcon}>
             <div className="flex flex-col gap-4">
                {[
                  { label: 'Private Messaging Channe;', status: 'E2E ON' },
                  { label: 'Instructor Dashboard Sink', status: 'LIVE' },
                  { label: 'Global Notifications', status: 'ACTIVE' },
                ].map(p => (
                   <div key={p.label} className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                      <span className="text-sm font-bold text-[var(--text-muted)]">{p.label}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono">{p.status}</span>
                   </div>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PusherSetting;
