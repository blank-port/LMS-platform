import React, { useState } from 'react';
import { 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  BanknotesIcon, 
  WalletIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const PaymentMethodSetting = () => {
  const [activeGateway, setActiveGateway] = useState('stripe');

  const gateways = [
    { id: 'stripe', name: 'Stripe', icon: CreditCardIcon, color: 'text-indigo-600', bg: 'bg-indigo-900/20' },
    { id: 'paypal', name: 'PayPal', icon: CurrencyDollarIcon, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { id: 'razorpay', name: 'RazorPay', icon: BanknotesIcon, color: 'text-purple-400', bg: 'bg-purple-900/20' },
    { id: 'paystack', name: 'PayStack', icon: GlobeAltIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'bank', name: 'Bank Transfer', icon: BanknotesIcon, color: 'text-[var(--text-muted)]', bg: 'bg-[var(--background)]' },
    { id: 'wallet', name: 'Wallet System', icon: WalletIcon, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  const Card = ({ title, icon: Icon, children }) => (
    <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm border border-purple-800/30">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-main)]">{title}</h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={true} />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--surface)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
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
             💳
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Payment Methods</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / E-Commerce Settings</p>
          </div>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95">
          <CheckCircleIcon className="w-5 h-5" />
          Update Gateways
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {gateways.map((gw) => (
            <button
              key={gw.id}
              onClick={() => setActiveGateway(gw.id)}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                activeGateway === gw.id 
                ? 'bg-[var(--surface)] border-purple-800/30 shadow-md translate-x-2' 
                : 'bg-white/50 border-transparent hover:bg-[var(--surface)] hover:border-[var(--border)]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gw.bg} ${gw.color}`}>
                  <gw.icon className="w-5 h-5" />
                </div>
                <span className={`font-bold ${activeGateway === gw.id ? 'text-[var(--text-main)]' : 'text-gray-500'}`}>{gw.name}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${activeGateway === gw.id ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <Card title={`${activeGateway.charAt(0).toUpperCase() + activeGateway.slice(1)} Configuration`} icon={ShieldCheckIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <div className="flex items-center gap-4 p-4 bg-amber-900/20 rounded-2xl border border-amber-800/30">
                  <ExclamationCircleIcon className="w-6 h-6 text-amber-400" />
                  <p className="text-sm font-bold text-amber-700">Ensure your webhooks are pointed to: <code className="bg-white/50 px-2 py-1 rounded">https://api.prismed.com/webhooks/{activeGateway}</code></p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Public Key / Client ID</label>
                <input 
                  type="text" 
                  placeholder={`pk_test_...`}
                  className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Secret Key / Token</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••••••"
                  className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Environment</label>
                <select className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]">
                  <option>Sandbox (Testing)</option>
                  <option>Live (Production)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Currency Overlay</label>
                <select className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-muted)]">
                  <option>INR (Indian Rupee)</option>
                  <option>USD (US Dollar)</option>
                  <option>EUR (Euro)</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
                  🚀
                </div>
                <div>
                  <h4 className="text-xl font-black">Enable Wallet Transaction Bypass?</h4>
                  <p className="text-gray-400 font-bold text-sm mt-1">Allow students to skip gateway fees using pre-loaded wallet credit.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={true} />
                <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[var(--surface)] after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSetting;
