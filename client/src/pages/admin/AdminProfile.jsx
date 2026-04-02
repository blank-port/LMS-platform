import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    User, Mail, Phone, Camera, Shield, Save, Key, Loader2
} from 'lucide-react';

const AdminProfile = () => {
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

    useEffect(() => {
        if (user) {
            setBasicInfo({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                about: user.about || ''
            });
            setAvatarPreview(user.avatar);
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

            const { data } = await axios.put(`${backendUrl}/api/user/update-account-profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Admin profile updated');
                fetchUserData();
                setAvatar(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            const { data } = await axios.put(`${backendUrl}/api/user/change-password`, {
                currentPassword: passwords.current,
                newPassword: passwords.new
            }, {
                headers: { Authorization: `Bearer ${token}` }
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

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                activeTab === id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
        >
            <Icon size={16} />
            {label.toUpperCase()}
        </button>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Executive Profile</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Manage your administrative identity and security</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-4">
                <TabButton id="basic" label="Identity" icon={User} />
                <TabButton id="password" label="Security" icon={Key} />
            </div>

            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] p-8 md:p-12">
                {activeTab === 'basic' && (
                    <form onSubmit={handleUpdateBasic} className="space-y-12">
                        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-40 h-40">
                                    <div className="w-full h-full rounded-[2rem] overflow-hidden border-8 border-[var(--background)] shadow-2xl shadow-black/10 transition-transform hover:scale-105 duration-500">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} className="w-full h-full object-cover" alt="Profile" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                                                <span className="text-5xl font-black">{basicInfo.name?.charAt(0)?.toUpperCase()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-all shadow-xl shadow-indigo-500/30 transform hover:rotate-12">
                                        <Camera size={20} />
                                        <input type="file" className="hidden" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Executive Avatar</span>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Identity</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 focus:bg-[var(--surface)] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
                                            value={basicInfo.name}
                                            onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Protocol (Phone)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 focus:bg-[var(--surface)] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
                                            value={basicInfo.phone}
                                            placeholder="+1 234 567 890"
                                            onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Access (Email - Persistent)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200" size={16} />
                                        <input 
                                            type="email" 
                                            disabled
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 font-bold text-sm cursor-not-allowed"
                                            value={basicInfo.email}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Professional Narrative (Bio)</label>
                                    <textarea 
                                        rows="4"
                                        className="w-full p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 focus:bg-[var(--surface)] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm resize-none"
                                        placeholder="Enter your administrative biography..."
                                        value={basicInfo.about}
                                        onChange={(e) => setBasicInfo({...basicInfo, about: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button disabled={loading} type="submit" className="h-16 px-10 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-indigo-600 transition-all flex items-center gap-3">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Synchronize Identity
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'password' && (
                    <form onSubmit={handleUpdatePassword} className="space-y-12 max-w-2xl mx-auto py-8">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-rose-100 transform -rotate-6">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Protocol Rotation</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Initialize access credential update sequence</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Authorization Cipher</label>
                                <input 
                                    type="password" 
                                    className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 focus:bg-[var(--surface)] focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-sm"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Protocol Identifier</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 focus:bg-[var(--surface)] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm New Protocol</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 focus:bg-[var(--surface)] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <button disabled={loading} type="submit" className="w-full h-16 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-3">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                            Authenticate Protocol Update
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminProfile;
