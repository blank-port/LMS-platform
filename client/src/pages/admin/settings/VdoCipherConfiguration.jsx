import React, { useState, useEffect, useContext } from 'react';
import { 
  VideoCameraIcon, 
  KeyIcon, 
  ShieldCheckIcon,
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

const VdoCipherConfiguration = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    vdocipher_active: true,
    vdocipher_api_secret: '',
    vdocipher_playback_policy: 'restricted'
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
             🎥
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">VdoCipher Config</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Video DRM</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-purple-900/20 text-purple-700 rounded-2xl font-black text-[10px] uppercase border border-purple-800/30">
           <ShieldCheckIcon className="w-4 h-4 animate-pulse" />
           DRM Status: {settings.vdocipher_active ? 'Active' : 'Bypassed'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="VdoCipher Fragment" icon={VideoCameraIcon}>
          <div className="flex flex-col gap-6">
             <FormField 
              label="API Secret Key" 
              type="password"
              value={settings.vdocipher_api_secret}
              onChange={(v) => setSettings({ ...settings, vdocipher_api_secret: v })}
              onBlur={() => handleSave()}
              placeholder="••••••••••••••••••••" 
             />
             <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Playback Policy</label>
                <select 
                  value={settings.vdocipher_playback_policy}
                  onChange={(e) => handleSave({ vdocipher_playback_policy: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)] bg-[var(--surface)]"
                >
                   <option value="restricted">Restricted (Signed URLs)</option>
                   <option value="public">Public Access</option>
                   <option value="enterprise">Enterprise (Watermarked)</option>
                </select>
             </div>
          </div>
        </Card>

        <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex flex-col justify-between border border-gray-800 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full translate-x-32 -translate-y-32 blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
           <div>
              <KeyIcon className="w-10 h-10 text-purple-400 mb-6" />
              <h4 className="text-2xl font-black italic mb-2 tracking-tight">Strategic Protection</h4>
              <p className="text-gray-400 font-medium text-sm leading-relaxed">System is currently utilizing high-fidelity DRM protocols for video asset isolation and institutional security.</p>
           </div>
           
           <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Integrity Verified</span>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors">
                 Rotate Secrets
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VdoCipherConfiguration;




