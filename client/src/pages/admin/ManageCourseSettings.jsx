import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    CheckBadgeIcon, 
    VideoCameraIcon, 
    BeakerIcon, 
    ChatBubbleLeftRightIcon, 
    StarIcon, 
    EnvelopeOpenIcon 
} from '@heroicons/react/24/outline';

const ManageCourseSettings = () => {
    const { backendUrl, getHeaders, fetchAllSettings, updateBatchSettings } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        course_approval: 'Yes',
        show_seekbar: 'Yes',
        drip_content: 'Show all',
        hide_qa: 'No',
        hide_review: 'No',
        mail_before_expire: 7
    });

    const loadSettingsData = async () => {
        setLoading(true);
        try {
            const data = await fetchAllSettings();
            if (data && Array.isArray(data)) {
                const mappedSettings = {};
                data.forEach(s => {
                    if (Object.keys(settings).includes(s.key)) {
                        mappedSettings[s.key] = s.value;
                    }
                });
                setSettings(prev => ({ ...prev, ...mappedSettings }));
            }
        } catch (error) {
            toast.error('Strategic Settings Retrieval Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const success = await updateBatchSettings(settings);
        if (success) {
            toast.success('System Policies Synchronized');
        }
    };

    useEffect(() => { loadSettingsData(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Global Pedagogical Constants...</p>
        </div>
    );

    const SettingCard = ({ icon: Icon, title, description, value, field, options, type = 'select' }) => (
        <div className="bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] p-10 flex flex-col justify-between group hover:border-indigo-500/30 transition-all shadow-sm">
            <div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight mb-2 uppercase">{title}</h3>
                <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed mb-8">{description}</p>
            </div>
            {type === 'select' ? (
                <div className="relative">
                    <select 
                        value={value}
                        onChange={e => setSettings({...settings, [field]: e.target.value})}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--text-main)] outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                    >
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                </div>
            ) : (
                <div className="relative">
                    <input 
                        type="number" 
                        value={value}
                        onChange={e => setSettings({...settings, [field]: parseInt(e.target.value) || 0})}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--text-main)] outline-none focus:border-indigo-500/50 transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">{options[0]}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">System Governance</h1>
                    <p className="text-[var(--text-muted)] font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Platform-Wide Instructional Parameters & Operational Settings</p>
                </div>
                <button onClick={handleSave} 
                    className="px-10 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95">
                    💾 Persist Policies
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SettingCard 
                    icon={CheckBadgeIcon}
                    title="Course Approval"
                    description=" authorization protocol for new instructional assets. If set to 'No', deployments bypass the review nexus."
                    value={settings.course_approval}
                    field="course_approval"
                    options={['Yes', 'No']}
                />
                <SettingCard 
                    icon={VideoCameraIcon}
                    title="Show Seekbar"
                    description="Governs technical navigation interface. Disabling this restricts scholars from bypassing media segments."
                    value={settings.show_seekbar}
                    field="show_seekbar"
                    options={['Yes', 'No']}
                />
                <SettingCard 
                    icon={BeakerIcon}
                    title="Drip Content"
                    description="Defines availability logic. 'Restricted' implements linear progression based on time or mastery thresholds."
                    value={settings.drip_content}
                    field="drip_content"
                    options={['Show all', 'Restricted']}
                />
                <SettingCard 
                    icon={ChatBubbleLeftRightIcon}
                    title="Hide QA Section"
                    description="Toggles collaborative inquiry interface. Disabling removes peer discussion clusters from the student panel."
                    value={settings.hide_qa}
                    field="hide_qa"
                    options={['Yes', 'No']}
                />
                <SettingCard 
                    icon={StarIcon}
                    title="Hide Review"
                    description="Governs public evaluation feed. Disabling hides scholar feedback and ratings from public catalog assets."
                    value={settings.hide_review}
                    field="hide_review"
                    options={['Yes', 'No']}
                />
                <SettingCard 
                    icon={EnvelopeOpenIcon}
                    title="Expiry Warning"
                    description="Defines the temporal window for automated warnings. Scholars are notified prior to asset excision."
                    value={settings.mail_before_expire}
                    field="mail_before_expire"
                    options={['Days']}
                    type="input"
                />
            </div>
        </div>
    );
};

export default ManageCourseSettings;
