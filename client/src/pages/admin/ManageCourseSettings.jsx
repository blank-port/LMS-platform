import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageCourseSettings = () => {
    const { backendUrl, getHeaders } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        autoApproveCourses: false,
        enableGuestCheckout: true,
        defaultCourseExpiry: 365,
        enableCourseComments: true,
        maxStudentPerCourse: 0, // 0 for unlimited
        enableInstructorPayouts: true
    });

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/settings/course`, getHeaders());
            if (data.success) setSettings(data.settings);
        } catch (error) {
            console.error('Settings retrieval failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const actionToast = toast.loading('Synchronizing Global Course Policies...');
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/settings/course`, settings, getHeaders());
            if (data.success) {
                toast.update(actionToast, { render: 'Global policies synchronized.', type: "success", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Policy synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Calibrating Global Pedagogical Constants...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Global Course Policy Governance</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Platform-Wide Instructional Parameters & Operational Settings</p>
                </div>
                <button onClick={handleSave} 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-purple-600 transition-all shadow-2xl shadow-black/10">
                    💾 Persist Policies
                </button>
            </div>

            <div className="bg-[var(--surface)] rounded-[3rem] shadow-sm border border-[var(--border)] p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Approval & Access */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] border-b border-purple-50 pb-4">Acquisition & Approval</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-[var(--text-main)]">Auto-Authorize Assets</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Bypass manual review for instructor deployments</p>
                            </div>
                            <input type="checkbox" className="w-6 h-6 rounded-lg accent-purple-600" checked={settings.autoApproveCourses} onChange={e => setSettings({...settings, autoApproveCourses: e.target.checked})} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-[var(--text-main)]">Guest Learning Flux</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Allow unauthenticated checkout protocols</p>
                            </div>
                            <input type="checkbox" className="w-6 h-6 rounded-lg accent-purple-600" checked={settings.enableGuestCheckout} onChange={e => setSettings({...settings, enableGuestCheckout: e.target.checked})} />
                        </div>
                    </div>

                    {/* Engagement & Payouts */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] border-b border-purple-50 pb-4">Engagement & Fiscal Flow</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-[var(--text-main)]">Collaborative Feedback</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enable comment streams on curriculum assets</p>
                            </div>
                            <input type="checkbox" className="w-6 h-6 rounded-lg accent-purple-600" checked={settings.enableCourseComments} onChange={e => setSettings({...settings, enableCourseComments: e.target.checked})} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-[var(--text-main)]">Instructor Remuneration</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enable automated payout synchronization</p>
                            </div>
                            <input type="checkbox" className="w-6 h-6 rounded-lg accent-purple-600" checked={settings.enableInstructorPayouts} onChange={e => setSettings({...settings, enableInstructorPayouts: e.target.checked})} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-[var(--border)]">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Expiration (Days)</label>
                        <input type="number" className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm" value={settings.defaultCourseExpiry} onChange={e => setSettings({...settings, defaultCourseExpiry: parseInt(e.target.value)})} />
                        <p className="text-[9px] font-bold text-gray-400 uppercase italic">Time-to-excision for scholar access protocols.</p>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Scholar Density</label>
                        <input type="number" className="w-full px-8 py-5 border border-[var(--border)] rounded-3xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm" value={settings.maxStudentPerCourse} onChange={e => setSettings({...settings, maxStudentPerCourse: parseInt(e.target.value)})} />
                        <p className="text-[9px] font-bold text-gray-400 uppercase italic">Capacity limit per asset (0 for infinite flux).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCourseSettings;
