import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    User, Mail, Phone, FileText, Camera, Shield, Bell, Globe, 
    Save, Key, Trash2, Github, Linkedin, Twitter, Facebook, 
    Briefcase, GraduationCap, Award, Landmark, ChevronRight, Plus, X, Loader2
} from 'lucide-react';

const AccountSettings = () => {
    const { user, token, backendUrl, fetchUserData } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);

    // Form States
    const [basicInfo, setBasicInfo] = useState({
        name: '',
        email: '',
        phone: '',
        about: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    
    const [financial, setFinancial] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: ''
    });

    const [socialLinks, setSocialLinks] = useState({
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: ''
    });

    const [notifSettings, setNotifSettings] = useState({
        email: true,
        courseUpdates: true,
        assignmentReminders: true
    });

    const [language, setLanguage] = useState('English');
    const [deletePass, setDeletePass] = useState('');

    useEffect(() => {
        if (user?.requiresPasswordChange) {
            setActiveTab('password');
        }
        if (user) {
            setBasicInfo({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                about: user.about || ''
            });
            setAvatarPreview(user.avatar);
            setEducation(user.education || []);
            setExperience(user.experience || []);
            setSkills(user.skills || []);
            setFinancial(user.financial || { bankName: '', accountNumber: '', ifscCode: '' });
            setSocialLinks(user.socialLinks || { facebook: '', twitter: '', linkedin: '', instagram: '' });
            setNotifSettings(user.notificationSettings || { email: true, courseUpdates: true, assignmentReminders: true });
            setLanguage(user.language || 'English');
        }
    }, [user]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateBasic = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', basicInfo.name);
            formData.append('phone', basicInfo.phone);
            formData.append('about', basicInfo.about);
            if (avatar) formData.append('profilePicture', avatar);

            const { data } = await api.put('/user/update-account-profile', formData);

            if (data.success) {
                toast.success('Basic information updated');
                fetchUserData();
                setAvatar(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSecondary = async () => {
        setLoading(true);
        try {
            const { data } = await api.put('/user/update-secondary-details', {
                education, experience, skills, financial, socialLinks, 
                notificationSettings: notifSettings, language
            });

            if (data.success) {
                toast.success('Professional profile synchronized');
                fetchUserData();
            }
        } catch (error) {
            toast.error('Failed to sync secondary credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            const { data } = await api.put('/user/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });

            if (data.success) {
                toast.success('Password updated successfully');
                setPasswords({ current: '', new: '', confirm: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Security update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (!window.confirm('Are you absolutely sure? This action is irreversible.')) return;
        try {
            const { data } = await api.post('/user/delete-account', { password: deletePass });
            if (data.success) {
                toast.success('Account deleted Successfully');
                window.location.href = '/';
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Account termination failed');
        }
    };

    const addEducation = () => setEducation([...education, { school: '', degree: '', year: '' }]);
    const removeEducation = (index) => setEducation(education.filter((_, i) => i !== index));
    const updateEducation = (index, field, value) => {
        const updated = [...education];
        updated[index][field] = value;
        setEducation(updated);
    };

    const addExperience = () => setExperience([...experience, { company: '', role: '', duration: '' }]);
    const removeExperience = (index) => setExperience(experience.filter((_, i) => i !== index));
    const updateExperience = (index, field, value) => {
        const updated = [...experience];
        updated[index][field] = value;
        setExperience(updated);
    };

    const addSkill = () => {
        if (newSkill && !skills.includes(newSkill)) {
            setSkills([...skills, newSkill]);
            setNewSkill('');
        }
    };
    const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full text-left ${
                activeTab === id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50/50">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Sidebar Navigation */}
                <div className="lg:w-64 shrink-0 space-y-2">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Account Settings</p>
                        <ul className="space-y-1">
                            <TabButton id="basic" label="Basic Info" icon={User} />
                            <TabButton id="password" label="Password" icon={Key} />
                            <TabButton id="extra" label="Education & Work" icon={Briefcase} />
                            <TabButton id="skills" label="Skills" icon={Award} />
                            <TabButton id="financial" label="Financial" icon={Landmark} />
                            <TabButton id="social" label="Social & Contact" icon={Facebook} />
                            <TabButton id="settings" label="Preferences" icon={Bell} />
                            <TabButton id="delete" label="Delete Account" icon={Trash2} />
                        </ul>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[600px]">
                        
                        {/* BASIC INFO TAB */}
                        {activeTab === 'basic' && (
                            <form onSubmit={handleUpdateBasic} className="space-y-8">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                                    <p className="text-sm text-gray-500">Manage your primary account details and avatar</p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-10">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative w-32 h-32">
                                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} className="w-full h-full object-cover" alt="Profile" />
                                                ) : (
                                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                                                        <User size={48} />
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                                <Camera size={14} />
                                                <input type="file" className="hidden" onChange={handleAvatarChange} />
                                            </label>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profile Photo</p>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-700">Full Name</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                                value={basicInfo.name}
                                                onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-700">Phone Number</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                                value={basicInfo.phone}
                                                onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-700">Email Address (Read-only)</label>
                                            <input 
                                                type="email" 
                                                disabled
                                                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                                                value={basicInfo.email}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-700">Detailed Bio / About</label>
                                            <textarea 
                                                rows="4"
                                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm resize-none"
                                                value={basicInfo.about}
                                                onChange={(e) => setBasicInfo({...basicInfo, about: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button disabled={loading} type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </form>
                        )}

                        {/* PASSWORD TAB */}
                        {activeTab === 'password' && (
                            <form onSubmit={handleUpdatePassword} className="space-y-8 max-w-xl">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                                    <p className="text-sm text-gray-500">Update your account password regularly for better security</p>
                                </div>

                                {user?.requiresPasswordChange && (
                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 animate-pulse">
                                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-amber-900">Mandatory Security Update Required</p>
                                            <p className="text-xs text-amber-700">Your account was provisioned via AI on-boarding or external protocol. Please synchronize your local core password to continue.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">Current Password</label>
                                        <input 
                                            type="password" 
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">New Password</label>
                                        <input 
                                            type="password" 
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button disabled={loading} type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                                    Update Password
                                </button>
                            </form>
                        )}

                        {/* EDUCATION & WORK TAB */}
                        {activeTab === 'extra' && (
                            <div className="space-y-10">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Education & Work History</h3>
                                    <p className="text-sm text-gray-500">Add your professional background to improve your profile</p>
                                </div>

                                {/* Education */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-md font-bold text-indigo-600 flex items-center gap-2">
                                            <GraduationCap size={20} /> Education
                                        </h4>
                                        <button onClick={addEducation} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                                            <Plus size={14} /> Add Education
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {education.map((edu, idx) => (
                                            <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 relative group">
                                                <button onClick={() => removeEducation(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-rose-500">
                                                    <X size={18} />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <input 
                                                        placeholder="Institution Name" 
                                                        className="p-3 rounded-lg border text-sm"
                                                        value={edu.school}
                                                        onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                                                    />
                                                    <input 
                                                        placeholder="Degree / Major" 
                                                        className="p-3 rounded-lg border text-sm"
                                                        value={edu.degree}
                                                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                                    />
                                                    <input 
                                                        placeholder="Graduation Year" 
                                                        className="p-3 rounded-lg border text-sm"
                                                        value={edu.year}
                                                        onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div className="space-y-6 pt-6 ">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-md font-bold text-emerald-600 flex items-center gap-2">
                                            <Briefcase size={20} /> Work Experience
                                        </h4>
                                        <button onClick={addExperience} className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                                            <Plus size={14} /> Add Experience
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 relative group">
                                                <button onClick={() => removeExperience(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-rose-500">
                                                    <X size={18} />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <input 
                                                        placeholder="Company Name" 
                                                        className="p-3 rounded-lg border text-sm"
                                                        value={exp.company}
                                                        onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                                    />
                                                    <input 
                                                        placeholder="Job Role" 
                                                        className="p-3 rounded-lg border text-sm"
                                                        value={exp.role}
                                                        onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                                                    />
                                                    <input 
                                                        placeholder="Duration (e.g. 2021-Present)" 
                                                        className="p-3 rounded-lg border text-sm"
                                                        value={exp.duration}
                                                        onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleUpdateSecondary} disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Sync Professional Data
                                </button>
                            </div>
                        )}

                        {/* SKILLS TAB */}
                        {activeTab === 'skills' && (
                            <div className="space-y-8">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Skills & Expertise</h3>
                                    <p className="text-sm text-gray-500">List your top skills to stand out to instructors and peers</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <input 
                                            placeholder="Enter a skill (e.g. React, UX Design)" 
                                            className="flex-1 p-3 rounded-xl border border-gray-200 outline-none text-sm"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                        />
                                        <button onClick={addSkill} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
                                            Add Skill
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {skills.map((skill, idx) => (
                                            <div key={idx} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-indigo-100">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="hover:text-rose-500">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleUpdateSecondary} disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Update Skills Matrix
                                </button>
                            </div>
                        )}

                        {/* FINANCIAL TAB */}
                        {activeTab === 'financial' && (
                            <div className="space-y-8 max-w-xl">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Financial Credentials</h3>
                                    <p className="text-sm text-gray-500">Manage your payout and refund destination accounts</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">Bank Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                            value={financial.bankName}
                                            onChange={(e) => setFinancial({...financial, bankName: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">Account Number</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                            value={financial.accountNumber}
                                            onChange={(e) => setFinancial({...financial, accountNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">IFSC Code / Swift Code</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                                            value={financial.ifscCode}
                                            onChange={(e) => setFinancial({...financial, ifscCode: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button onClick={handleUpdateSecondary} disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Sync Financial Data
                                </button>
                            </div>
                        )}

                        {/* SOCIAL TAB */}
                        {activeTab === 'social' && (
                            <div className="space-y-8 max-w-xl">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Social Connections</h3>
                                    <p className="text-sm text-gray-500">Link your social handles for instructor connectivity</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                            <Facebook size={20} />
                                        </div>
                                        <input 
                                            placeholder="Facebook Profile URL" 
                                            className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                                            value={socialLinks.facebook}
                                            onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-lg flex items-center justify-center shrink-0">
                                            <Twitter size={20} />
                                        </div>
                                        <input 
                                            placeholder="Twitter Handle URL" 
                                            className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                                            value={socialLinks.twitter}
                                            onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center shrink-0">
                                            <Linkedin size={20} />
                                        </div>
                                        <input 
                                            placeholder="LinkedIn Professional URL" 
                                            className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                                            value={socialLinks.linkedin}
                                            onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button onClick={handleUpdateSecondary} disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Sync Social Links
                                </button>
                            </div>
                        )}

                        {/* PREFERENCES/SETTINGS TAB */}
                        {activeTab === 'settings' && (
                            <div className="space-y-10">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Preferences & Notifications</h3>
                                    <p className="text-sm text-gray-500">Configure your system language and alert protocols</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Notification Signals</h4>
                                        <div className="space-y-4">
                                            {[
                                                { id: 'email', label: 'Email Alerts', desc: 'Critical account updates' },
                                                { id: 'courseUpdates', label: 'Course Updates', desc: 'New content notifications' },
                                                { id: 'assignmentReminders', label: 'Deadline Logic', desc: 'Assignment expiry alerts' }
                                            ].map((n) => (
                                                <div key={n.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{n.label}</p>
                                                        <p className="text-[10px] text-gray-400">{n.desc}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setNotifSettings({...notifSettings, [n.id]: !notifSettings[n.id]})}
                                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${notifSettings[n.id] ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                                    >
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifSettings[n.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Localization</h4>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500">Preferred Language</label>
                                            <select 
                                                className="w-full p-3 rounded-xl border border-gray-200 outline-none text-sm appearance-none bg-gray-50"
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                            >
                                                <option value="English">English</option>
                                                <option value="Spanish">Español</option>
                                                <option value="French">Français</option>
                                                <option value="Hindi">हिन्दी</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleUpdateSecondary} disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Deploy Preferences
                                </button>
                            </div>
                        )}

                        {/* DELETE ACCOUNT TAB */}
                        {activeTab === 'delete' && (
                            <form onSubmit={handleDeleteAccount} className="space-y-8 max-w-xl">
                                <div className="border-b pb-4">
                                    <h3 className="text-xl font-bold text-rose-600">Terminate Account</h3>
                                    <p className="text-sm text-gray-500">Permanently remove your digital imprint from the platform</p>
                                </div>

                                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 space-y-3">
                                    <p className="text-xs font-bold text-rose-800 uppercase flex items-center gap-2">
                                        <Shield size={16} /> Danger Zone
                                    </p>
                                    <p className="text-[11px] text-rose-600 leading-relaxed font-medium">
                                        This action will delete all your enrollment history, certificates, and progress data. It cannot be undone. Enter your current password to authorize.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700">Authorization Cipher (Password)</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm"
                                        placeholder="••••••••"
                                        required
                                        value={deletePass}
                                        onChange={(e) => setDeletePass(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-rose-700 transition-colors flex items-center gap-2">
                                    <Trash2 size={18} />
                                    Confirm Account Termination
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;




