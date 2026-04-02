import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';

const InstructorSettings = () => {
    const { user, backendUrl, token, setUser } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Form States
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        language: user?.language || 'English',
        dob: user?.dob || '',
        about: user?.about || '',
        headline: user?.headline || ''
    });

    const [socialLinks, setSocialLinks] = useState({
        facebook: user?.socialLinks?.facebook || '',
        twitter: user?.socialLinks?.twitter || '',
        linkedin: user?.socialLinks?.linkedin || '',
        instagram: user?.socialLinks?.instagram || ''
    });

    const [fiscalData, setFiscalData] = useState({
        bankName: user?.payoutSettings?.bankName || '',
        accountName: user?.payoutSettings?.accountName || '',
        accountNumber: user?.payoutSettings?.accountNumber || '',
        ifscCode: user?.payoutSettings?.ifscCode || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Dynamic Lists
    const [education, setEducation] = useState(user?.education || []);
    const [experience, setExperience] = useState(user?.experience || []);
    const [skills, setSkills] = useState(user?.skills || []);
    const [newSkill, setNewSkill] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAddEducation = () => {
        setEducation([...education, { institution: '', degree: '', year: '' }]);
    };

    const handleRemoveEducation = (index) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const handleEducationChange = (index, field, value) => {
        const nextEducation = [...education];
        nextEducation[index][field] = value;
        setEducation(nextEducation);
    };

    const handleAddExperience = () => {
        setExperience([...experience, { company: '', role: '', duration: '' }]);
    };

    const handleRemoveExperience = (index) => {
        setExperience(experience.filter((_, i) => i !== index));
    };

    const handleExperienceChange = (index, field, value) => {
        const nextExperience = [...experience];
        nextExperience[index][field] = value;
        setExperience(nextExperience);
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const tabs = [
        { id: 'profile', name: 'Basic Profile', icon: '👤' },
        { id: 'about', name: 'Professional Persona', icon: '📝' },
        { id: 'academic', name: 'Academic & Career', icon: '🎓' },
        { id: 'skills', name: 'Skillset Matrix', icon: '⚡' },
        { id: 'fiscal', name: 'Fiscal Protocol', icon: '💳' },
        { id: 'signal', name: 'Signal Matrix', icon: '🌐' },
        { id: 'security', name: 'Security Sanctum', icon: '🔒' }
    ];

    const handleProfileUpdate = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            // Append basic profile data
            Object.keys(profileData).forEach(key => formData.append(key, profileData[key]));
            
            // Append complex objects (stringify for form-data)
            formData.append('socialLinks', JSON.stringify(socialLinks));
            formData.append('payoutSettings', JSON.stringify(fiscalData));
            formData.append('education', JSON.stringify(education));
            formData.append('experience', JSON.stringify(experience));
            formData.append('skills', JSON.stringify(skills));
            
            // Append avatar if selected
            if (avatar) formData.append('profilePicture', avatar);

            const { data } = await axios.put(
                `${backendUrl}/api/user/profile`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('Global identity synchronized successfully');
                setUser(data.user);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        if (e) e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('New protocols do not match');
        }
        setLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.put(
                `${backendUrl}/api/user/change-password`,
                { 
                    currentPassword: passwordData.currentPassword, 
                    newPassword: passwordData.newPassword 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('Security layer updated successfully');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'security') {
            handlePasswordChange();
        } else {
            handleProfileUpdate();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-12 mt-16">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Manage your PrismEd educator identity</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Tabs Sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm sticky top-28">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all mb-1 ${
                                        activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                    }`}
                                >
                                    <span className="text-base">{tab.icon}</span>
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow">
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                            <form onSubmit={handleSubmit}>
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="relative w-24 h-24">
                                                <div className="w-24 h-24 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center text-3xl text-white font-black shadow-xl overflow-hidden">
                                                    {avatarPreview ? (
                                                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user?.name?.charAt(0)?.toUpperCase()
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900">Profile Avatar</h3>
                                                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight">Max 2MB, Square, Direct URL or Upload</p>
                                                <div className="mt-4">
                                                    <label className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 cursor-pointer transition-colors block w-fit">
                                                        Change Image
                                                        <input type="file" className="hidden" onChange={handleAvatarChange} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Identity</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Signal Protocol (Phone)</label>
                                                <input
                                                    type="text"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Lexicon (Language)</label>
                                                <select
                                                    value={profileData.language}
                                                    onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700 appearance-none"
                                                >
                                                    <option>English</option>
                                                    <option>Spanish</option>
                                                    <option>French</option>
                                                    <option>German</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Temporal Origin (DOB)</label>
                                                <input
                                                    type="date"
                                                    value={profileData.dob}
                                                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Professional Headline</label>
                                            <input
                                                type="text"
                                                value={profileData.headline}
                                                onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                placeholder="e.g. Senior Full-Stack Architect & Educator"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Narrative (Detailed Bio)</label>
                                            <textarea
                                                rows="8"
                                                value={profileData.about}
                                                onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                placeholder="Tell students about your journey..."
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'fiscal' && (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl mb-6 flex items-start gap-4">
                                            <span className="text-xl">🛡️</span>
                                            <div>
                                                <h4 className="text-[11px] font-black text-indigo-700 uppercase tracking-wider">Secure Transfer Gateway</h4>
                                                <p className="text-[10px] text-indigo-500 font-bold mt-1">Earnings are disbursed every 1st and 15th of the month. Ensure protocols are accurate.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Bank Name</label>
                                                <input
                                                    type="text"
                                                    value={fiscalData.bankName}
                                                    onChange={(e) => setFiscalData({ ...fiscalData, bankName: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Beneficiary Name</label>
                                                <input
                                                    type="text"
                                                    value={fiscalData.accountName}
                                                    onChange={(e) => setFiscalData({ ...fiscalData, accountName: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Account Number</label>
                                                <input
                                                    type="password"
                                                    value={fiscalData.accountNumber}
                                                    onChange={(e) => setFiscalData({ ...fiscalData, accountNumber: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">IFSC Vector</label>
                                                <input
                                                    type="text"
                                                    value={fiscalData.ifscCode}
                                                    onChange={(e) => setFiscalData({ ...fiscalData, ifscCode: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'academic' && (
                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-1">
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Academic Evolution (Education)</h3>
                                                <button 
                                                    type="button" 
                                                    onClick={handleAddEducation}
                                                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                                                >
                                                    + Add Record
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {education.map((edu, index) => (
                                                    <div key={index} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-4">
                                                        <input 
                                                            className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold" 
                                                            placeholder="Institution Name" 
                                                            value={edu.institution}
                                                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                                        />
                                                        <input 
                                                            className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold" 
                                                            placeholder="Degree / Qualification" 
                                                            value={edu.degree}
                                                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                        />
                                                        <input 
                                                            className="w-full md:w-32 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold" 
                                                            placeholder="Year" 
                                                            value={edu.year}
                                                            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                                                        />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveEducation(index)}
                                                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-1">
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Professional Trajectory (Experience)</h3>
                                                <button 
                                                    type="button" 
                                                    onClick={handleAddExperience}
                                                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                                                >
                                                    + Add Protocol
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {experience.map((exp, index) => (
                                                    <div key={index} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-4">
                                                        <input 
                                                            className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold" 
                                                            placeholder="Company / Organization" 
                                                            value={exp.company}
                                                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                        />
                                                        <input 
                                                            className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold" 
                                                            placeholder="Role / Designation" 
                                                            value={exp.role}
                                                            onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                                                        />
                                                        <input 
                                                            className="w-full md:w-32 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold" 
                                                            placeholder="Duration" 
                                                            value={exp.duration}
                                                            onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                                                        />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveExperience(index)}
                                                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'skills' && (
                                    <div className="space-y-6">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Instructional Skillset Matrix</label>
                                        <div className="flex flex-wrap gap-3 mb-6">
                                            {skills.map(skill => (
                                                <div key={skill} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    {skill}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="hover:text-rose-500"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                className="flex-grow px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700" 
                                                placeholder="Add new skill..." 
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleAddSkill}
                                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                                            >
                                                Inject
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="max-w-md mx-auto space-y-6 py-8">
                                        <div className="text-center mb-8">
                                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🛡️</div>
                                            <h3 className="text-lg font-black text-slate-900">Security Sanctum</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Rotate your access credentials</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Current Cipher</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">New Protocol</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Verify Protocol</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handlePasswordChange}
                                            disabled={loading}
                                            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl shadow-rose-200 disabled:opacity-50"
                                        >
                                            {loading ? 'Synchronizing...' : 'Initiate Access Rotation'}
                                        </button>
                                    </div>
                                )}

                                <div className="mt-12 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-10 py-4 bg-slate-950 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
                                    >
                                        {loading ? 'Synchronizing...' : 'Save All Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorSettings;
