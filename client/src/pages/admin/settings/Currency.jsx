import React, { useState, useEffect, useContext } from 'react';
import { 
  CurrencyDollarIcon, 
  ArrowsRightLeftIcon, 
  PlusIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const Currency = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: '1.00', status: 'Active' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: '83.20', status: 'Default' },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: '0.92', status: 'Active' },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: '0.78', status: 'Active' },
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAllSettings();
      if (data && data.length > 0) {
        const currSetting = data.find(s => s.key === 'system_currencies');
        if (currSetting) setCurrencies(currSetting.value);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (updatedCurrencies) => {
    setLoading(true);
    await updateBatchSettings({ system_currencies: updatedCurrencies });
    setLoading(false);
  };

  const setDefault = (code) => {
    const updated = currencies.map(c => ({
      ...c,
      status: c.code === code ? 'Default' : (c.status === 'Default' ? 'Active' : c.status)
    }));
    setCurrencies(updated);
    handleSave(updated);
  };

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             💵
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Currency</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Fiscal Governance</p>
          </div>
        </div>
        <button 
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <PlusIcon className="w-5 h-5" />
          {loading ? 'Processing...' : 'Add Strategic Currency'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Card */}
        <div className="lg:col-span-1 bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-purple-500/30 transition-all"></div>
          <ChartBarIcon className="w-8 h-8 text-purple-400 mb-6" />
          <h4 className="text-xl font-black mb-2">Exchange Dynamics</h4>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-8">System Base: {currencies.find(c => c.status === 'Default')?.code || 'INR'} ({currencies.find(c => c.status === 'Default')?.symbol || '₹'})</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-bold">Auto-Update</span>
              <span className="text-xs font-black text-green-400 uppercase">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-bold">Providers</span>
              <span className="text-xs font-black text-white uppercase tracking-tighter">Fixer.io, OpenExchange</span>
            </div>
          </div>
        </div>

        {/* Currency Table */}
        <div className="lg:col-span-2 bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm border border-purple-800/30">
              <CurrencyDollarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Fiscal Nexus</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--background)]/50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Currency</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Symbol</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Exchange Rate</th>
                  <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {currencies.map((curr) => (
                  <tr key={curr.code} className="hover:bg-[var(--background)]/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-main)]">{curr.name}</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{curr.code}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-lg font-black text-purple-400">{curr.symbol}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <ArrowsRightLeftIcon className="w-4 h-4 text-gray-300" />
                        <span className="font-mono text-sm font-bold text-[var(--text-muted)]">{curr.rate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span 
                        onClick={() => setDefault(curr.code)}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                        curr.status === 'Default' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-[var(--background)] text-gray-500 hover:bg-gray-200'
                      }`}>
                        {curr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Currency;




