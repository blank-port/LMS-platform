import React, { useState, useEffect, useContext } from 'react';
import { 
  VideoCameraIcon, 
  CloudIcon, 
  KeyIcon, 
  LockClosedIcon,
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

const FormField = ({ label, value, onChange, type = "text", placeholder, tooltip }) => (
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
      placeholder={placeholder}
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-[var(--text-main)] placeholder:text-gray-300"
    />
  </div>
);

const ApiSettings = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    vdocipher_key: '',
    vimeo_client_id: '',
    vimeo_client_secret: '',
    vimeo_access_token: '',
    gdrive_email: '',
    gdrive_key: ''
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

  const handleSave = async () => {
    setLoading(true);
    // Passing isSensitive: true for API settings
    const success = await updateBatchSettings(settings, true);
    setLoading(false);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };


  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             🔑
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">API Settings</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Cloud & Integration</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Synchronizing...' : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Synchronize APIs
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Video Infrastructure" icon={VideoCameraIcon}>
          <div className="flex flex-col gap-8">
             <div className="flex flex-col gap-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">VdoCipher Integration</span>
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="API Secret Key" value={settings.vdocipher_key} onChange={(v) => handleChange('vdocipher_key', v)} type="password" placeholder="••••••••••••••••" tooltip="Your VdoCipher API key for secure video playback" />
                </div>
             </div>
             
             <div className="w-full h-px bg-[var(--background)]"></div>

             <div className="flex flex-col gap-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Vimeo Integration</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Client ID" value={settings.vimeo_client_id} onChange={(v) => handleChange('vimeo_client_id', v)} placeholder="283920" />
                  <FormField label="Client Secret" value={settings.vimeo_client_secret} onChange={(v) => handleChange('vimeo_client_secret', v)} type="password" placeholder="••••••••" />
                  <div className="md:col-span-2">
                    <FormField label="Access Token" value={settings.vimeo_access_token} onChange={(v) => handleChange('vimeo_access_token', v)} type="password" placeholder="••••••••••••••••" />
                  </div>
                </div>
             </div>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card title="Cloud Storage & CDN" icon={CloudIcon}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Google Drive</span>
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Client Email" value={settings.gdrive_email} onChange={(v) => handleChange('gdrive_email', v)} placeholder="drive-acc@project.iam.gserviceaccount.com" />
                  <FormField label="Private Key" value={settings.gdrive_key} onChange={(v) => handleChange('gdrive_key', v)} type="password" placeholder="••••••••••••••••" />
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-[var(--background)] rounded-[2rem] p-8 border border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-400">
                <LockClosedIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-main)]">End-to-End Encryption</h4>
                <p className="text-gray-500 text-sm">All API keys are salted and AES-256 encrypted.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
