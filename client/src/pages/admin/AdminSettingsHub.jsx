import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cog6ToothIcon, 
  CreditCardIcon, 
  ChatBubbleLeftRightIcon, 
  CpuChipIcon, 
  GlobeAltIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  BeakerIcon,
  SignalIcon,
  ScaleIcon,
  BanknotesIcon,
  MapIcon,
  LanguageIcon,
  ClockIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  HomeIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const categories = [
  {
    title: 'Operational Infrastructure',
    description: 'Core system kernel and global activation parameters.',
    icon: Cog6ToothIcon,
    color: 'purple',
    items: [
      { name: 'System Nexus', desc: 'Kernel overrides and debug verbosity.', path: '/admin/system-setting', icon: CpuChipIcon },
      { name: 'Activation Hub', desc: 'License verification and module status.', path: '/admin/activation', icon: ShieldCheckIcon },
      { name: 'Master Config', desc: 'Global site metadata and branding.', path: '/admin/general-setting', icon: Cog6ToothIcon },
      { name: 'Version Control', desc: 'System updates and migration history.', path: '/admin/about-update', icon: RocketLaunchIcon }
    ]
  },
  {
    title: 'Fiscal Parameters',
    description: 'Economic protocols and transaction settlement gateways.',
    icon: BanknotesIcon,
    color: 'emerald',
    items: [
      { name: 'Razorpay Nexus', desc: 'Primary digital settlement gateway config.', path: '/admin/razorpay-config', icon: CreditCardIcon },
      { name: 'Commission Logic', desc: 'Institutional revenue split protocols.', path: '/admin/commission', icon: ScaleIcon },
      { name: 'Currency Matrix', desc: 'Global monetary units and exchange rates.', path: '/admin/currency', icon: BanknotesIcon }
    ]
  },
  {
    title: 'Signal Hub (Communication)',
    description: 'Broadcast protocols and external notification relays.',
    icon: SignalIcon,
    color: 'blue',
    items: [
      { name: 'Email Protocol', desc: 'SMTP and transactional signal setup.', path: '/admin/email-setup', icon: ChatBubbleLeftRightIcon },
      { name: 'Signal Templates', desc: 'Automated notification blueprint design.', path: '/admin/email-template', icon: CommandLineIcon },
      { name: 'SMS Gateway', desc: 'Mobile message routing and API setup.', path: '/admin/sms-settings', icon: SignalIcon },
      { name: 'LiveKit Nexus', desc: 'Real-time classroom infrastructure.', path: '/admin/livekit-settings', icon: VideoCameraIcon },
      { name: 'Real-time Relay', desc: 'Pusher synchronization parameters.', path: '/admin/pusher-setting', icon: SignalIcon },
      { name: 'Identity Sync', desc: 'Social login and Oauth2 protocols.', path: '/admin/social-login', icon: ShieldCheckIcon }
    ]
  },
  {
    title: 'Technical Matrix',
    description: 'Developer integration and runtime optimization.',
    icon: CommandLineIcon,
    color: 'amber',
    items: [
      { name: 'Nexus Bridge (APIs)', desc: 'Third-party integration and secret keys.', path: '/admin/api-settings', icon: CpuChipIcon },
      { name: 'Cache Strategy', desc: 'Memory persistence and TTL protocols.', path: '/admin/cache-setting', icon: BeakerIcon },
      { name: 'Batch Operations', desc: 'Cron jobs and scheduled system tasks.', path: '/admin/cron-job', icon: ClockIcon },
      { name: 'Intelligence SEO', desc: 'Search engine indexing and meta mapping.', path: '/admin/seo-setup', icon: GlobeAltIcon },
      { name: 'Analytics Tool', desc: 'External tracking and event telemetry.', path: '/admin/analytics-tool', icon: GlobeAltIcon }
    ]
  },
  {
    title: 'Homepage Experience',
    description: 'Hero, trust sections, course showcase, and theme controls.',
    icon: HomeIcon,
    color: 'emerald',
    items: [
      { name: 'Homepage Builder', desc: 'Admin-editable homepage content and theme orchestration.', path: '/admin/homepage-builder', icon: HomeIcon },
      { name: 'Homepage SEO', desc: 'Indexing and metadata for the public landing experience.', path: '/admin/seo-setup', icon: GlobeAltIcon }
    ]
  },
  {
    title: 'Institutional Settings',
    description: 'Regional localization and modular governance.',
    icon: MapIcon,
    color: 'indigo',
    items: [
      { name: 'Language Engine', desc: 'Localization and scholarly translation.', path: '/admin/language', icon: LanguageIcon },
      { name: 'Geographic City', desc: 'Available operating regions for cohorts.', path: '/admin/city', icon: MapIcon },
      { name: 'Temporal Sync', desc: 'Global timezone and scheduling offset.', path: '/admin/timezone', icon: ClockIcon },
      { name: 'Module Nexus', desc: 'Platform feature toggles and extensions.', path: '/admin/module-manager', icon: Cog6ToothIcon }
    ]
  }
];

const AdminSettingsHub = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[var(--surface)] p-10 rounded-[3rem] shadow-sm border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">Command Center</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase text-xs tracking-[0.3em]">Institutional Governance & System Matrix</p>
        </div>
        <div className="flex items-center gap-4 bg-[var(--background)] px-6 py-4 rounded-2xl border border-[var(--border)] relative z-10 shadow-inner">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Protocol Synchronized</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-16">
        {categories.map((cat, idx) => (
          <div key={cat.title} className="space-y-8">
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-2xl bg-${cat.color}-900/10 text-${cat.color}-500 border border-${cat.color}-500/20`}>
                  <cat.icon className="w-8 h-8" />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">{cat.title}</h2>
                  <p className="text-sm font-bold text-gray-400 mt-1">{cat.description}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cat.items.map((item) => (
                <div 
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="group bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm hover:shadow-2xl hover:border-purple-500/30 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                >
                   {/* Background Decorative Icon */}
                   <item.icon className="absolute top-[-10%] right-[-10%] w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12" />
                   
                   <div>
                      <div className="w-12 h-12 bg-[var(--background)] rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-inner mb-6">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-black text-[var(--text-main)] mb-2 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                      <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                        {item.desc}
                      </p>
                   </div>

                   <div className="flex items-center justify-between mt-8">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Configure Matrix</span>
                      <ArrowRightIcon className="w-4 h-4 text-purple-400 group-hover:translate-x-2 transition-transform" />
                   </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Support Card */}
      <div className="bg-gray-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 border border-gray-800 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.1),transparent)]"></div>
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-amber-400 text-4xl shadow-inner border border-white/10">
               ⚠️
            </div>
            <div>
               <h4 className="text-2xl font-black italic tracking-tight">Institutional Integrity Alert</h4>
               <p className="text-gray-400 font-medium text-sm mt-2 max-w-xl leading-relaxed">
                  Modification of system matrix parameters requires high-level executive authorization. All configuration changes are recorded in the institutional audit log for fiscal accountability.
               </p>
            </div>
         </div>
         <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-purple-500 hover:text-white transition-all duration-500 shadow-xl relative z-10 active:scale-95">
            Interface Documentation
         </button>
      </div>
    </div>
  );
};

export default AdminSettingsHub;


