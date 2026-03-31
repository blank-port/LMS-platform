import React, { useState, useEffect, useContext } from 'react';
import { 
  BuildingLibraryIcon, 
  CreditCardIcon, 
  PlusIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const PayoutAccount = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([
    { provider: 'Stripe Direct', id: 'acct_1029384756', type: 'Instant Payout', status: 'Verified' },
    { provider: 'PayPal Business', id: 'sb-xy123@business.example.com', type: 'Standard', status: 'Pending' },
    { provider: 'HDFC Bank', id: 'xxxx xxxx 4029', type: 'NEFT/RTGS', status: 'Verified' },
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAllSettings();
      if (data && data.length > 0) {
        const payoutSetting = data.find(s => s.key === 'payout_accounts');
        if (payoutSetting) setAccounts(payoutSetting.value);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (updatedAccounts) => {
    setLoading(true);
    await updateBatchSettings({ payout_accounts: updatedAccounts });
    setLoading(false);
  };

  const toggleStatus = (id) => {
    const updated = accounts.map(a => a.id === id ? { ...a, status: a.status === 'Verified' ? 'Pending' : 'Verified' } : a);
    setAccounts(updated);
    handleSave(updated);
  };

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             🏦
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Payout Account</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Payout Account</p>
          </div>
        </div>
        <button 
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <PlusIcon className="w-5 h-5" />
          {loading ? 'Processing...' : 'Add Fiscal Terminal'}
        </button>
      </div>

      <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm border border-purple-800/30">
              <BuildingLibraryIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Capital Disbursement</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--background)]/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fiscal Provider</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identification ID</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Channel Type</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verification Status</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-[var(--background)]/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--background)] rounded-xl flex items-center justify-center text-purple-400">
                        <CreditCardIcon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-[var(--text-main)]">{account.provider}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-mono text-gray-500">{account.id}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-purple-900/20 text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{account.type}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      account.status === 'Verified' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleStatus(account.id)}
                        className={`p-2 hover:bg-[var(--surface)] rounded-lg transition-all ${account.status === 'Verified' ? 'text-purple-400 border-purple-800/30 bg-[var(--surface)]' : 'text-gray-400 hover:text-purple-400 border-transparent hover:border-purple-800/30'}`}
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-[var(--surface)] rounded-lg text-gray-400 hover:text-[var(--text-main)] border border-transparent hover:border-[var(--border)] transition-all">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayoutAccount;
