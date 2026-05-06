// Administrative Module Hub - Governance Layer
import React, { useState, useEffect, useContext } from 'react';
import { 
  SquaresPlusIcon, 
  RectangleStackIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const ModuleManager = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([
    { name: 'Virtual Classroom (v3.2)', desc: 'Real-time whiteboard and multi-user video conferencing integration.', status: 'Active', type: 'Core' },
    { name: 'Gamification Engine (v1.4)', desc: 'Reward student engagement with badges and achievement points.', status: 'Active', type: 'Extension' },
    { name: 'Enterprise CRM (v2.0)', desc: 'Advanced student relationship management and lead tracking.', status: 'Inactive', type: 'Strategic' },
    { name: 'AI Tutor Bot (v0.8-beta)', desc: 'Automated student support using large language model processing.', status: 'Active', type: 'Experimental' },
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAllSettings();
      if (data && data.length > 0) {
        const moduleSetting = data.find(s => s.key === 'system_modules');
        if (moduleSetting) setModules(moduleSetting.value);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (updatedModules) => {
    setLoading(true);
    await updateBatchSettings({ system_modules: updatedModules });
    setLoading(false);
  };

  const toggleModule = (name) => {
    const updated = modules.map(m => m.name === name ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m);
    setModules(updated);
    handleSave(updated);
  };

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             🧩
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Module Nexus</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Structural Modularity</p>
          </div>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95">
          <SquaresPlusIcon className="w-5 h-5" />
          Install Strategic Module
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         {modules.map((mod) => (
           <div key={mod.name} className="bg-[var(--surface)] rounded-[2rem] p-8 border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/20 rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start justify-between relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[var(--background)] rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                       <RectangleStackIcon className="w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-[var(--text-main)]">{mod.name}</h3>
                       <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">{mod.type} Infrastructure</span>
                    </div>
                 </div>
                 <div 
                  onClick={() => toggleModule(mod.name)}
                  className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${mod.status === 'Active' ? 'bg-purple-600' : 'bg-gray-200'}`}
                 >
                    <div className={`absolute top-1 w-5 h-5 bg-[var(--surface)] rounded-full transition-all ${mod.status === 'Active' ? 'right-1' : 'left-1'}`}></div>
                 </div>
              </div>

              <p className="mt-6 text-gray-500 font-medium text-sm leading-relaxed relative z-10">
                {mod.desc}
              </p>

              <div className="mt-8 pt-6 border-t border-[var(--border)] flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${mod.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{mod.status}</span>
                 </div>
                 <button 
                  onClick={() => handleSave(modules)}
                  className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest hover:text-purple-700"
                 >
                    <ArrowPathIcon className="w-4 h-4" />
                    {loading ? 'Syncing...' : 'Sync Logic'}
                 </button>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex items-center justify-between border border-gray-800">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-amber-400 text-3xl">
               <ExclamationCircleIcon className="w-8 h-8" />
            </div>
            <div>
               <h4 className="text-xl font-black">Sub-System Registry</h4>
               <p className="text-gray-400 font-medium text-sm mt-1">Found {modules.filter(m => m.status !== 'Active').length} inactive module requiring architectural migration.</p>
            </div>
         </div>
         <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all">
            Resolve Migration
         </button>
      </div>
    </div>
  );
};

export default ModuleManager;




