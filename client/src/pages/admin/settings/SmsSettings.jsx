import React, { useState, useEffect, useContext } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  DevicePhoneMobileIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CogIcon
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

const FormField = ({ label, value, onChange, placeholder, tooltip, onBlur }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
      {tooltip && <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />}
    </div>
    <input 
      type="text" 
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]" 
    />
  </div>
);

const SmsSettings = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    sms_gateway_active: true,
    sms_twilio_sid: '',
    sms_twilio_token: '',
    sms_twilio_sender: '',
    sms_otp_enabled: true,
    sms_enrollment_enabled: true,
    sms_payout_enabled: false
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
    // Sensitive keys enabled for tokens
    await updateBatchSettings(combined, true);
    setLoading(false);
  };


  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             📱
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">SMS Gateway</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Telecommunication</p>
          </div>
        </div>
        <button 
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          {loading ? 'Dispatching...' : 'Dispatch Test SMS'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Twilio Infrastructure" icon={DevicePhoneMobileIcon}>
          <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between p-4 bg-purple-900/20 rounded-2xl border border-purple-800/30">
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${settings.sms_gateway_active ? 'bg-purple-600 animate-pulse' : 'bg-gray-300'}`}></div>
                   <span className="text-xs font-black text-purple-900 uppercase tracking-widest">
                    {settings.sms_gateway_active ? 'Gateway Active' : 'Gateway Offline'}
                   </span>
                </div>
                <div 
                  onClick={() => handleSave({ sms_gateway_active: !settings.sms_gateway_active })}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.sms_gateway_active ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-[var(--surface)] rounded-full transition-all ${settings.sms_gateway_active ? 'right-1' : 'left-1'}`}></div>
                </div>
             </div>
             
             <FormField 
              label="Account SID" 
              value={settings.sms_twilio_sid}
              onChange={(v) => setSettings({ ...settings, sms_twilio_sid: v })}
              onBlur={() => handleSave()}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
             />
             <FormField 
              label="Auth Token" 
              value={settings.sms_twilio_token}
              onChange={(v) => setSettings({ ...settings, sms_twilio_token: v })}
              onBlur={() => handleSave()}
              placeholder="••••••••••••••••••••••••••••••••" 
             />
             <FormField 
              label="Sender Phone Number" 
              value={settings.sms_twilio_sender}
              onChange={(v) => setSettings({ ...settings, sms_twilio_sender: v })}
              onBlur={() => handleSave()}
              placeholder="+1 (555) 000-0000" 
             />
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card title="Operational Directives" icon={ChatBubbleLeftRightIcon}>
             <div className="flex flex-col gap-4">
                {[
                  { key: 'sms_otp_enabled', label: 'OTP Authentication' },
                  { key: 'sms_enrollment_enabled', label: 'Enrollment Confirmations' },
                  { key: 'sms_payout_enabled', label: 'Payout Alerts' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                     <span className="text-sm font-bold text-[var(--text-muted)]">{item.label}</span>
                     <div 
                      onClick={() => handleSave({ [item.key]: !settings[item.key] })}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings[item.key] ? 'bg-purple-600' : 'bg-gray-200'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-[var(--surface)] rounded-full transition-all ${settings[item.key] ? 'right-1' : 'left-1'}`}></div>
                     </div>
                  </div>
                ))}
             </div>
          </Card>

          <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex items-center gap-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-purple-500/30 transition-all"></div>
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
                💬
             </div>
             <div>
                <h4 className="text-xl font-black">Message Ledger</h4>
                <p className="text-gray-400 font-medium text-sm mt-1">1,204 messages dispatched this bill cycle.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsSettings;




