import React, { useState, useEffect, useContext } from 'react';
import { 
  EnvelopeIcon, 
  ServerIcon, 
  KeyIcon, 
  UserCircleIcon,
  ShieldCheckIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
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

const FormField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
    <input 
      type={type} 
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-[var(--text-main)] placeholder:text-gray-300"
    />
  </div>
);

const EmailSetup = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_encryption: 'TLS',
    smtp_user: '',
    smtp_pass: '',
    from_email: '',
    from_name: ''
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
             📧
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Email Setup</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Communication Protocols</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-[var(--background)] hover:bg-[var(--background)] text-[var(--text-muted)] rounded-2xl font-bold transition-all active:scale-95">
            <PaperAirplaneIcon className="w-5 h-5" />
            Send Test Email
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Saving...' : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Save Config
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="SMTP Server Configuration" icon={ServerIcon}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormField label="Mail Host" value={settings.smtp_host} onChange={(v) => handleChange('smtp_host', v)} placeholder="smtp.gmail.com" />
            </div>
            <FormField label="Mail Port" value={settings.smtp_port} onChange={(v) => handleChange('smtp_port', v)} placeholder="587" />
            <FormField label="Encryption" value={settings.smtp_encryption} onChange={(v) => handleChange('smtp_encryption', v)} placeholder="TLS / SSL" />
            <div className="md:col-span-2">
              <FormField label="Mail Username" value={settings.smtp_user} onChange={(v) => handleChange('smtp_user', v)} placeholder="your-email@gmail.com" />
            </div>
            <div className="md:col-span-2">
              <FormField label="Mail Password" value={settings.smtp_pass} onChange={(v) => handleChange('smtp_pass', v)} type="password" placeholder="••••••••••••" />
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card title="Sender Information" icon={UserCircleIcon}>
            <div className="flex flex-col gap-6">
              <FormField label="From Email" value={settings.from_email} onChange={(v) => handleChange('from_email', v)} placeholder="notifications@prismed.com" />
              <FormField label="From Name" value={settings.from_name} onChange={(v) => handleChange('from_name', v)} placeholder="PrismEd LMS Notifications" />
            </div>
          </Card>

          <div className="bg-purple-600 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-xl shadow-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">Encryption Status</h4>
                <p className="text-purple-100 text-sm">{settings.smtp_encryption && settings.smtp_encryption.toUpperCase() !== 'NONE' ? settings.smtp_encryption.toUpperCase() + ' Verified' : 'Insecure Connection'}</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-[var(--surface)] text-purple-400 rounded-full text-xs font-black uppercase tracking-widest">
              {settings.smtp_encryption && settings.smtp_encryption.toUpperCase() !== 'NONE' ? 'Secure' : 'Unsafe'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSetup;




