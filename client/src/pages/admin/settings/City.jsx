import React, { useState, useEffect, useContext } from 'react';
import { 
  BuildingOffice2Icon, 
  MapIcon, 
  PlusIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';

const City = () => {
  const { fetchAllSettings, updateBatchSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([
    { name: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400001', status: 'Active' },
    { name: 'New York', state: 'New York', country: 'USA', zip: '10001', status: 'Active' },
    { name: 'London', state: 'Greater London', country: 'UK', zip: 'EC1A', status: 'Active' },
    { name: 'Dubai', state: 'Dubai', country: 'UAE', zip: '00000', status: 'Active' },
  ]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAllSettings();
      if (data && data.length > 0) {
        const citySetting = data.find(s => s.key === 'system_cities');
        if (citySetting) setCities(citySetting.value);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (updatedCities) => {
    setLoading(true);
    await updateBatchSettings({ system_cities: updatedCities });
    setLoading(false);
  };

  const toggleStatus = (name) => {
    const updated = cities.map(c => c.name === name ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c);
    setCities(updated);
    handleSave(updated);
  };

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.country.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             🏙️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Regional Cities</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Geopolitical Governance</p>
          </div>
        </div>
        <button 
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <PlusIcon className="w-5 h-5" />
          {loading ? 'Processing...' : 'Add Strategic City'}
        </button>
      </div>

      <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm border border-purple-800/30">
              <MapIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Geospatial Nexus</h3>
          </div>
          
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filter cities..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-12 pr-6 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--background)]/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">City Name</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">State / Province</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Country</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Postal Zone</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredCities.map((city) => (
                <tr key={city.name} className="hover:bg-[var(--background)]/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--background)] rounded-xl flex items-center justify-center text-purple-400 group-hover:bg-[var(--surface)] transition-colors">
                        <BuildingOffice2Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-[var(--text-main)]">{city.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[var(--text-muted)]">{city.state}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">{city.country}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs font-black text-gray-400">{city.zip}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleStatus(city.name)}
                        className={`p-2 hover:bg-[var(--surface)] rounded-lg transition-all ${city.status === 'Active' ? 'text-purple-400 border-purple-800/30 bg-[var(--surface)]' : 'text-gray-400 hover:text-purple-400 border-transparent hover:border-purple-800/30'}`}
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

export default City;




