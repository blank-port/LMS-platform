import React, { useState, useEffect, useContext } from 'react';
import { 
  KeyIcon, 
  CheckCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const Activation = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    system_activation_status: 'Unverified',
    system_purchase_code: ''
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

  const handleActivate = async () => {
    setLoading(true);
    // Simulate activation logic
    const status = settings.system_purchase_code.length > 10 ? 'Verified' : 'Failed';
    await updateBatchSettings({ 
      system_activation_status: status,
      system_purchase_code: settings.system_purchase_code
    });
    setSettings(prev => ({ ...prev, system_activation_status: status }));
    setLoading(false);
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
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Activation</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Activation Governance</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase border ${
          settings.system_activation_status === 'Verified' 
          ? 'bg-green-900/20 text-green-700 border-green-800/30' 
          : 'bg-amber-900/20 text-amber-700 border-amber-800/30'
        }`}>
           {settings.system_activation_status === 'Verified' ? <CheckCircleIcon className="w-4 h-4" /> : <ExclamationTriangleIcon className="w-4 h-4" />}
           Status: {settings.system_activation_status}
        </div>
      </div>

      <div className="bg-[var(--surface)] p-12 rounded-[2rem] shadow-sm border border-[var(--border)] flex flex-col items-center">
         <div className="w-24 h-24 bg-purple-900/20 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <ShieldCheckIcon className="w-12 h-12 text-purple-400" />
         </div>
         
         <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-black text-[var(--text-main)] mb-2">Platform Verification</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">Enter your Envato Market purchase code to unlock premium features and official cloud synchronization fragments.</p>
            
            <div className="flex flex-col gap-6">
               <div className="flex flex-col gap-2 text-left">
                  <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Purchase Code</label>
                  <div className="relative">
                     <KeyIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input 
                        type="text" 
                        value={settings.system_purchase_code}
                        onChange={(e) => setSettings({ ...settings, system_purchase_code: e.target.value })}
                        placeholder="e.g. 8234-x821-9231-1029"
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border border-[var(--border)] focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-mono font-bold text-[var(--text-muted)]"
                     />
                  </div>
               </div>
               
               <button 
                onClick={handleActivate}
                disabled={loading}
                className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-purple-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
               >
                  {loading ? 'Verifying Entropy...' : 'Authorize Terminal'}
               </button>
               
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                  * By authorizing, you agree to the strategic license protocols and telemetry data synchronization agreements.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Activation;
