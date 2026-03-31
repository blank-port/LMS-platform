import React, { useState, useEffect, useContext } from 'react';
import { 
  GlobeAltIcon, 
  LanguageIcon, 
  PlusIcon, 
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const Language = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([
    { code: 'en', name: 'English', rtl: false, status: 'Default', native: 'English' },
    { code: 'ar', name: 'Arabic', rtl: true, status: 'Active', native: 'العربية' },
    { code: 'fr', name: 'French', rtl: false, status: 'Active', native: 'Français' },
    { code: 'es', name: 'Spanish', rtl: false, status: 'Active', native: 'Español' },
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAllSettings();
      if (data && data.length > 0) {
        const langSetting = data.find(s => s.key === 'system_languages');
        if (langSetting) setLanguages(langSetting.value);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (updatedLangs) => {
    setLoading(true);
    await updateBatchSettings({ system_languages: updatedLangs });
    setLoading(false);
  };

  const toggleRtl = (code) => {
    const updated = languages.map(l => l.code === code ? { ...l, rtl: !l.rtl } : l);
    setLanguages(updated);
    handleSave(updated);
  };

  const setDefault = (code) => {
    const updated = languages.map(l => ({
      ...l,
      status: l.code === code ? 'Default' : (l.status === 'Default' ? 'Active' : l.status)
    }));
    setLanguages(updated);
    handleSave(updated);
  };

  const deleteLang = (code) => {
    if (languages.find(l => l.code === code)?.status === 'Default') return;
    const updated = languages.filter(l => l.code !== code);
    setLanguages(updated);
    handleSave(updated);
  };

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             🌐
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Localization</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Language Management</p>
          </div>
        </div>
        <button 
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <PlusIcon className="w-5 h-5" />
          {loading ? 'Processing...' : 'Add Strategic Language'}
        </button>
      </div>

      <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm border border-purple-800/30">
              <LanguageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Registered Languages</h3>
          </div>
          <span className="text-xs font-black text-purple-400 bg-purple-900/20 px-4 py-1.5 rounded-full uppercase tracking-widest">
            {languages.length} Locales Active
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--background)]/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Language</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ISO Code</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">RTL Mode</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fiscal Context</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {languages.map((lang) => (
                <tr key={lang.code} className="hover:bg-[var(--background)]/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--background)] rounded-xl flex items-center justify-center text-sm font-bold text-[var(--text-muted)] group-hover:bg-[var(--surface)] transition-colors">
                        {lang.code.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-main)]">{lang.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{lang.native}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-[var(--background)] text-[var(--text-muted)] rounded-lg text-xs font-black">
                      {lang.code}-{lang.code === 'ar' ? 'SA' : 'US'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div 
                      onClick={() => toggleRtl(lang.code)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${lang.rtl ? 'bg-purple-600' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-[var(--surface)] rounded-full transition-all ${lang.rtl ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span 
                      onClick={() => setDefault(lang.code)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer ${
                        lang.status === 'Default' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {lang.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setDefault(lang.code)}
                        className={`p-2 hover:bg-[var(--surface)] rounded-lg transition-all ${lang.status === 'Default' ? 'text-purple-400 border-purple-800/30 bg-[var(--surface)]' : 'text-gray-400 hover:text-purple-400 border-transparent hover:border-purple-800/30'}`}
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteLang(lang.code)}
                        disabled={lang.status === 'Default'}
                        className="p-2 hover:bg-[var(--surface)] rounded-lg text-gray-400 hover:text-red-400 border border-transparent hover:border-red-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <XCircleIcon className="w-5 h-5" />
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

export default Language;
