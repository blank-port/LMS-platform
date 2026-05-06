import React, { useState, useEffect, useContext } from 'react';
import {
  ShieldCheckIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const CookieGDPRSetting = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    gdpr_cookie_consent: true,
    gdpr_data_portability: true,
    gdpr_right_to_forget: false,
    cookie_policy_url: '/cookie-policy',
    privacy_protocol_summary: ''
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
             🍪
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Privacy Nexus</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Compliance Governance</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-green-900/20 text-green-700 rounded-2xl font-black text-[10px] uppercase border border-green-800/30">
           <CheckCircleIcon className="w-4 h-4" />
           GDPR Compliant
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Consent Mechanism" icon={ShieldCheckIcon}>
          <div className="flex flex-col gap-6">
             {[
               { key: 'gdpr_cookie_consent', name: 'Cookie Consent Banner', desc: 'Display a professional notice for user tracking permission.' },
               { key: 'gdpr_data_portability', name: 'GDPR Data Portability', desc: 'Allow users to export their profile data in JSON format.' },
               { key: 'gdpr_right_to_forget', name: 'Right to be Forgotten', desc: 'Automate account deletion and PII purging protocols.' },
             ].map((item) => (
               <div key={item.key} className="flex items-start justify-between p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                  <div className="flex-1">
                     <h4 className="font-bold text-[var(--text-main)]">{item.name}</h4>
                     <p className="text-xs text-gray-500 font-medium mt-1">{item.desc}</p>
                  </div>
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

        <div className="flex flex-col gap-8">
          <Card title="Policy Artifacts" icon={DocumentTextIcon}>
             <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Cookie Policy URL</label>
                   <input
                      type="text"
                      value={settings.cookie_policy_url}
                      onChange={(e) => setSettings({ ...settings, cookie_policy_url: e.target.value })}
                      onBlur={() => handleSave()}
                      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]"
                   />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Privacy Protocol Summary</label>
                   <textarea
                      rows={4}
                      value={settings.privacy_protocol_summary}
                      onChange={(e) => setSettings({ ...settings, privacy_protocol_summary: e.target.value })}
                      onBlur={() => handleSave()}
                      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-[var(--text-muted)] text-sm"
                      placeholder="Enter a brief summary of how you handle user data..."
                   ></textarea>
                </div>
             </div>
          </Card>

          <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex items-center gap-6 group">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-red-400 text-3xl">
                <NoSymbolIcon className="w-8 h-8" />
             </div>
             <div>
                <h4 className="text-xl font-black">Zero-Knowledge Mode</h4>
                <p className="text-gray-400 font-medium text-sm mt-1">Telemetry is anonymized before cloud synchronization.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieGDPRSetting;




