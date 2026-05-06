import React, { useState, useEffect, useContext } from 'react';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const Commission = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    global_commission_percentage: 20,
    instructor_revenue_share: 80,
    tax_deduction_percentage: 0,
    platform_fee_fixed: 0
  });

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAllSettings();
      if (data && data.length > 0) {
        const settingsMap = {};
        data.forEach(s => settingsMap[s.key] = s.value);
        
        // Handle Key Alignment for older settings if they exist
        if (settingsMap.admin_commission_percentage && !settingsMap.global_commission_percentage) {
            settingsMap.global_commission_percentage = settingsMap.admin_commission_percentage;
        }

        setSettings(prev => ({ 
            ...prev, 
            ...settingsMap,
            // Derived instructor revenue share logic override
            instructor_revenue_share: 100 - (Number(settingsMap.global_commission_percentage) || 20)
        }));
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
             💸
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Commission Rates</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Fiscal Governance</p>
          </div>
        </div>
        <button 
          onClick={() => handleSave()}
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <CheckCircleIcon className="w-5 h-5" />
          {loading ? 'Processing...' : 'Update Fiscal Split'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Revenue Distribution" icon={CurrencyDollarIcon}>
           <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Admin Commission</label>
                    <span className="text-purple-400 font-black">{settings.global_commission_percentage}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={settings.global_commission_percentage}
                    onChange={(e) => {
                      const admin = parseInt(e.target.value);
                      setSettings({ ...settings, global_commission_percentage: admin, instructor_revenue_share: 100 - admin });
                    }}
                    className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer accent-purple-600"
                 />
              </div>

              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Instructor Revenue Share</label>
                    <span className="text-green-400 font-black">{settings.instructor_revenue_share}%</span>
                 </div>
                 <input 
                    type="range" 
                    disabled
                    value={settings.instructor_revenue_share}
                    className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-not-allowed accent-green-500 opacity-50"
                 />
              </div>
           </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card title="Deduction Protocols" icon={UserGroupIcon}>
             <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Tax Deduction (%)</label>
                   <input 
                      type="number" 
                      value={settings.tax_deduction_percentage}
                      onChange={(e) => setSettings({ ...settings, tax_deduction_percentage: e.target.value })}
                      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]"
                   />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Fixed Platform Fee ($)</label>
                   <input 
                      type="number" 
                      value={settings.platform_fee_fixed}
                      onChange={(e) => setSettings({ ...settings, platform_fee_fixed: e.target.value })}
                      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]"
                   />
                </div>
             </div>
          </Card>

          <div className="bg-purple-900 rounded-[2rem] p-8 text-white flex items-center gap-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
             <AcademicCapIcon className="w-12 h-12 text-purple-400" />
             <div>
                <h4 className="text-xl font-black italic">Strategic Yield</h4>
                <p className="text-purple-200 font-medium text-sm mt-1">Split engine is optimized for institutional solvency.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commission;




