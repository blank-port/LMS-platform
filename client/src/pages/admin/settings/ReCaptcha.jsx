import React, { useState, useEffect, useContext } from 'react';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
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
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
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
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)] placeholder:text-gray-300 shadow-sm"
    />
  </div>
);

const reCaptcha = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    recaptcha_active: true,
    recaptcha_site_key: '',
    recaptcha_secret_key: '',
    recaptcha_threshold: 0.5
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
    // Sensitive keys enabled for secret key
    await updateBatchSettings(combined, true);
    setLoading(false);
  };


  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             🛡️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Security Vault</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Cryptographic Governance</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-2 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
           <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Protection Depth:</span>
           <button className="px-6 py-2 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-purple-100">Maximum</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Google reCaptcha v3" icon={ShieldCheckIcon}>
          <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between p-4 bg-purple-900/20 rounded-2xl border border-purple-800/30 mb-2">
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${settings.recaptcha_active ? 'bg-purple-600 animate-pulse' : 'bg-gray-300'}`}></div>
                   <span className="text-sm font-bold text-purple-900 font-black uppercase tracking-widest">
                    {settings.recaptcha_active ? 'Bot Mitigation Active' : 'Mitigation Offline'}
                   </span>
                </div>
                <div 
                  onClick={() => handleSave({ recaptcha_active: !settings.recaptcha_active })}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.recaptcha_active ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-[var(--surface)] rounded-full transition-all ${settings.recaptcha_active ? 'right-1' : 'left-1'}`}></div>
                </div>
             </div>
             
             <FormField 
                label="Site Key" 
                value={settings.recaptcha_site_key}
                onChange={(v) => setSettings({ ...settings, recaptcha_site_key: v })}
                onBlur={() => handleSave()}
                placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" 
                tooltip="Generated in Google Cloud Console"
             />
             <FormField 
                label="Secret Key" 
                type="password"
                value={settings.recaptcha_secret_key}
                onChange={(v) => setSettings({ ...settings, recaptcha_secret_key: v })}
                onBlur={() => handleSave()}
                placeholder="••••••••••••••••••••••••••••••••" 
                tooltip="Sensitive: Do not expose in client-side code"
             />

             <div className="flex flex-col gap-2 pt-4">
                <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Pass Threshold (0.0 - 1.0)</label>
                <div className="flex items-center gap-4">
                   <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={settings.recaptcha_threshold || 0.5} 
                    onChange={(e) => handleSave({ recaptcha_threshold: parseFloat(e.target.value) })}
                    className="flex-1 accent-purple-600 h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer" 
                   />
                   <span className="font-black text-purple-400 bg-purple-900/20 px-4 py-2 rounded-xl border border-purple-800/30">{settings.recaptcha_threshold || 0.5}</span>
                </div>
             </div>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
             <LockClosedIcon className="w-8 h-8 text-purple-400 mb-6" />
             <h3 className="text-2xl font-black">Identity Verification</h3>
             <p className="text-gray-400 font-medium text-sm mt-2 leading-relaxed italic">"Invisible reCaptcha allows valid users to pass without interruption while maintaining high-fidelity barrier protocols for automated entities."</p>
             <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-black">AI</div>)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Filtered over 12k sessions today</span>
             </div>
          </div>

          <Card title="Cryptographic Anchors" icon={KeyIcon}>
             <div className="flex flex-col gap-4">
                <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] flex items-start gap-3">
                   <InformationCircleIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                   <p className="text-xs text-gray-500 font-bold leading-relaxed">System is currently utilizing SHA-256 for all HMAC signatures within the challenge payload.</p>
                </div>
                <button 
                  disabled={loading}
                  className="w-full py-4 bg-[var(--surface)] border-2 border-dashed border-[var(--border)] hover:border-purple-400 hover:bg-purple-900/20 transition-all rounded-2xl text-gray-400 hover:text-purple-400 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                   <ArrowPathIcon className="w-4 h-4" />
                   {loading ? 'Rotating...' : 'Rotate Security Tokens'}
                </button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default reCaptcha;
