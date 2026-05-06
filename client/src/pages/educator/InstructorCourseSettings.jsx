import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    CheckBadgeIcon, 
    VideoCameraIcon, 
    BeakerIcon, 
    ChatBubbleLeftRightIcon, 
    StarIcon, 
    EnvelopeOpenIcon 
} from '@heroicons/react/24/outline';

const InstructorCourseSettings = () => {
    const { fetchAllSettings } = useContext(AppContext);
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
            const { data } = await api.get('/setting/public');
            if (data && data.success && data.settings) {
                const publicSettings = data.settings;
                const mappedSettings = {};
                Object.keys(settings).forEach(key => {
                    if (publicSettings[key] !== undefined) {
                        mappedSettings[key] = publicSettings[key];
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

    useEffect(() => { loadSettingsData(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Course Parameters...</p>
        </div>
    );

    const SettingCard = ({ icon: Icon, title, description, value }) => (
        <div className="bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] p-10 flex flex-col justify-between group hover:border-indigo-500/30 transition-all shadow-sm">
            <div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight mb-2 uppercase">{title}</h3>
                <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed mb-8">{description}</p>
            </div>
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-black text-indigo-500 text-center">
                {value.toUpperCase()}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">Course Settings</h1>
                    <p className="text-[var(--text-muted)] font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Dashboard | Education | Course Settings</p>
                </div>
            </div>

            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl mb-8">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Notice: Course governance policies are managed by platform administrators. These settings apply to all instructional assets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SettingCard 
                    icon={CheckBadgeIcon}
                    title="Course Approval"
                    description="Administrative authorization protocol for new instructional assets."
                    value={settings.course_approval}
                />
                <SettingCard 
                    icon={VideoCameraIcon}
                    title="Show Seekbar"
                    description="Governs technical navigation interface for scholars."
                    value={settings.show_seekbar}
                />
                <SettingCard 
                    icon={BeakerIcon}
                    title="Drip Content"
                    description="Defines curriculum availability logic."
                    value={settings.drip_content}
                />
                <SettingCard 
                    icon={ChatBubbleLeftRightIcon}
                    title="QA Section"
                    description="Collaborative inquiry interface status."
                    value={settings.hide_qa === 'Yes' ? 'Disabled' : 'Enabled'}
                />
                <SettingCard 
                    icon={StarIcon}
                    title="Review Board"
                    description="Public evaluation feed and rating system status."
                    value={settings.hide_review === 'Yes' ? 'Disabled' : 'Enabled'}
                />
                <SettingCard 
                    icon={EnvelopeOpenIcon}
                    title="Expiry Warning"
                    description="Temporal window for automated scholar notifications."
                    value={`${settings.mail_before_expire} Days`}
                />
            </div>
        </div>
    );
};

export default InstructorCourseSettings;




