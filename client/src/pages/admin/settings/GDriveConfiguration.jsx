import React, { useState, useEffect, useContext } from 'react';
import { 
  CloudIcon, 
  KeyIcon, 
  LinkIcon,
  CheckCircleIcon,
  InformationCircleIcon
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

const GDriveConfiguration = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    gdrive_client_id: '',
    gdrive_client_secret: '',
    gdrive_redirect_url: ''
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
             ☁️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">gDrive Configuration</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Cloud Infrastructure</p>
          </div>
        </div>
        <button 
          onClick={() => handleSave()}
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <CheckCircleIcon className="w-5 h-5" />
          {loading ? 'Processing...' : 'Update Cloud Credentials'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Google Drive Fragment" icon={CloudIcon}>
          <div className="flex flex-col gap-6">
             <FormField 
              label="Client ID" 
              value={settings.gdrive_client_id}
              onChange={(v) => setSettings({ ...settings, gdrive_client_id: v })}
              onBlur={() => handleSave()}
              placeholder="728392-xyz.apps.googleusercontent.com" 
             />
             <FormField 
              label="Client Secret" 
              type="password"
              value={settings.gdrive_client_secret}
              onChange={(v) => setSettings({ ...settings, gdrive_client_secret: v })}
              onBlur={() => handleSave()}
              placeholder="••••••••••••••••••••" 
             />
             <FormField 
              label="Redirect URL" 
              value={settings.gdrive_redirect_url}
              onChange={(v) => setSettings({ ...settings, gdrive_redirect_url: v })}
              onBlur={() => handleSave()}
              placeholder="https://prismed.com/auth/gdrive/callback" 
             />
          </div>
        </Card>

        <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex items-center gap-6 relative overflow-hidden group">
           <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(168,85,247,0.05)_50%,transparent_75%)] bg-[length:400%_400%] animate-[shimmer_8s_infinite]"></div>
           <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
              📂
           </div>
           <div>
              <h4 className="text-xl font-black italic">Strategic Storage</h4>
              <p className="text-gray-400 font-medium text-sm mt-1">Google Drive is currently mapped for high-frequency document orchestration.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GDriveConfiguration;
