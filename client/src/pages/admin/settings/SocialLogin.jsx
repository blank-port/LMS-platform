import React from 'react';
import { 
  UsersIcon, 
  GlobeAltIcon, 
  KeyIcon, 
  LinkIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Card = ({ title, icon: Icon, children, color }) => (
  <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
    <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center ${color} shadow-sm border border-gray-100`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-main)]">{title}</h3>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={true} readOnly />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--surface)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
      </label>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const FormField = ({ label, type = "text", placeholder, tooltip }) => (
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
      placeholder={placeholder}
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
    />
  </div>
);

const SocialLogin = () => {

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             👤
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Social Login</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Authentication Methods</p>
          </div>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95">
          <CheckCircleIcon className="w-5 h-5" />
          Update Auth Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Google Authentication" icon={GlobeAltIcon} color="text-red-500">
          <div className="flex flex-col gap-6">
            <FormField label="Client ID" placeholder="283920-xyz.apps.googleusercontent.com" />
            <FormField label="Client Secret" type="password" placeholder="••••••••••••••••" />
            <FormField label="Redirect URL" placeholder="https://prismed.com/auth/google/callback" tooltip="URL where Google will redirect users after login" />
          </div>
        </Card>

        <Card title="Facebook Authentication" icon={UsersIcon} color="text-blue-400">
          <div className="flex flex-col gap-6">
            <FormField label="App ID" placeholder="1029384756" />
            <FormField label="App Secret" type="password" placeholder="••••••••••••••••" />
            <FormField label="Redirect URL" placeholder="https://prismed.com/auth/facebook/callback" />
          </div>
        </Card>

        <div className="lg:col-span-2 bg-purple-900/20 p-8 rounded-[2rem] border border-purple-800/30 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[var(--surface)] rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-purple-800/30">
                🔗
              </div>
              <div>
                <h4 className="text-xl font-black text-[var(--text-main)]">OAuth Unified Handshake</h4>
                <p className="font-bold text-gray-500 text-sm mt-1">Both providers successfully mapped to the system's global identity manager.</p>
              </div>
           </div>
           <div className="flex items-center gap-2 text-purple-400 font-black uppercase tracking-widest text-xs">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
              System Ready
           </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLogin;
