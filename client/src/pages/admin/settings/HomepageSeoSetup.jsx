import React, { useState, useEffect, useContext } from 'react';
import { 
  MagnifyingGlassIcon, 
  GlobeAltIcon, 
  HashtagIcon, 
  PhotoIcon,
  CheckCircleIcon,
  InformationCircleIcon
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

const FormField = ({ label, value, onChange, type = "text", placeholder, isTextarea }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
    {isTextarea ? (
      <textarea 
        rows={4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-[var(--text-main)] placeholder:text-gray-300"
      />
    ) : (
      <input 
        type={type} 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-[var(--text-main)] placeholder:text-gray-300"
      />
    )}
  </div>
);

const HomepageSEOSetup = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    meta_title: '',
    meta_keywords: '',
    meta_description: '',
    og_title: ''
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
    const success = await updateBatchSettings(settings);
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
             🔍
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Homepage SEO</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Search Engine Marketing</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Updating...' : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Update SEO Vault
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Structural Meta Governance" icon={MagnifyingGlassIcon}>
          <div className="flex flex-col gap-6">
            <FormField label="Meta Title" value={settings.meta_title} onChange={(v) => handleChange('meta_title', v)} placeholder="PrismEd - The Ultimate Strategic LMS Platform" />
            <FormField label="Meta Keywords" value={settings.meta_keywords} onChange={(v) => handleChange('meta_keywords', v)} placeholder="lms, education, strategic learning, react lms" />
            <FormField label="Meta Description" value={settings.meta_description} onChange={(v) => handleChange('meta_description', v)} isTextarea={true} placeholder="The leading institutional knowledge exchange ecosystem designed for elite scholars and instructors." />
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card title="OpenGraph / Social Card" icon={PhotoIcon}>
            <div className="flex flex-col gap-6">
              <div className="p-6 border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center gap-4 group hover:border-purple-200 transition-all cursor-pointer">
                <div className="w-20 h-20 bg-[var(--background)] rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-purple-400 transition-colors">
                  <PhotoIcon className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-black text-[var(--text-main)]">Upload OG Image</span>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Recommended: 1200 x 630 px</p>
                </div>
              </div>
              <FormField label="OG Title Override" value={settings.og_title} onChange={(v) => handleChange('og_title', v)} placeholder="Join the PrismEd Strategic Nexus" />
            </div>
          </Card>

          <div className="bg-amber-600 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-xl shadow-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">Organic Indexing</h4>
                <p className="text-amber-100 text-sm">Sitemap.xml Auto-Generated</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-[var(--surface)] text-amber-400 rounded-full text-xs font-black uppercase tracking-widest">
              Live
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageSEOSetup;
