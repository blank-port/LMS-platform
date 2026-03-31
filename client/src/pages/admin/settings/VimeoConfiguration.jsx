import React, { useState, useEffect, useContext } from 'react';
import { 
  VideoCameraIcon, 
  ServerStackIcon, 
  ArrowUpTrayIcon, 
  KeyIcon,
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

const FormField = ({ label, value, onChange, type = "text", placeholder, tooltip, onBlur }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
      {tooltip && (
        <div className="group relative">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <input 
      type={type} 
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
    />
  </div>
);

const VimeoConfiguration = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    vimeo_client_id: '',
    vimeo_client_secret: '',
    vimeo_access_token: '',
    vimeo_upload_type: 'Direct Upload (Chunked)'
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
             🎬
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Vimeo Config</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Video Infrastructure</p>
          </div>
        </div>
        <button 
          onClick={() => handleSave()}
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <CheckCircleIcon className="w-5 h-5" />
          {loading ? 'Archiving...' : 'Save Vimeo Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Vimeo API Credentials" icon={KeyIcon}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Vimeo Client ID" 
              value={settings.vimeo_client_id}
              onChange={(v) => setSettings({ ...settings, vimeo_client_id: v })}
              onBlur={() => handleSave()}
              placeholder="1029384" 
            />
            <FormField 
              label="Vimeo Secret" 
              type="password" 
              value={settings.vimeo_client_secret}
              onChange={(v) => setSettings({ ...settings, vimeo_client_secret: v })}
              onBlur={() => handleSave()}
              placeholder="••••••••••••••••" 
            />
            <div className="md:col-span-2">
              <FormField 
                label="Vimeo Access Token" 
                type="password" 
                value={settings.vimeo_access_token}
                onChange={(v) => setSettings({ ...settings, vimeo_access_token: v })}
                onBlur={() => handleSave()}
                placeholder="••••••••••••••••••••••••" 
              />
            </div>
          </div>
        </Card>

        <Card title="Upload Strategy" icon={ArrowUpTrayIcon}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Upload Type</label>
              <select 
                value={settings.vimeo_upload_type}
                onChange={(e) => handleSave({ vimeo_upload_type: e.target.value })}
                className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)] bg-[var(--surface)]"
              >
                <option>Direct Upload (Chunked)</option>
                <option>Pull from URL</option>
                <option>Select from Vimeo Library</option>
              </select>
            </div>
            
            <div className="p-4 bg-blue-900/20 rounded-2xl border border-blue-100 flex items-start gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
              <p className="text-xs font-bold text-blue-700 leading-relaxed">
                Direct upload allows instructors to push large video assets directly to your Vimeo Pro account without consuming local server bandwidth.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VimeoConfiguration;
