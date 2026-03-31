import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Camera, Shield, Save, Key } from 'lucide-react';

const Profile = () => {
    const { user, token, backendUrl, fetchUserData } = useContext(AppContext);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [image, setImage] = useState(null);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [changingPass, setChangingPass] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        if (image) formData.append('image', image);

        try {
            const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (data.success) {
                toast.success('Profile status synchronized!');
                fetchUserData();
                setImage(null);
            }
        } catch (error) {
            toast.error('Synchronization failure.');
        }
        setLoading(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('Security protocols mismatch.');
        }
        setChangingPass(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/change-password`, {
                currentPassword: passwords.current,
                newPassword: passwords.new
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success('Security layer upgraded!');
                setPasswords({ current: '', new: '', confirm: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unauthorized access delta.');
        }
        setChangingPass(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Identity Nexus</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage your professional profile and security protocols</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-10">
                    <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-gray-200/40 border border-gray-50 flex flex-col items-center text-center">
                        <div className="relative group mb-8">
                            <div className="w-40 h-40 bg-gray-50 rounded-[3rem] p-1 shadow-2xl overflow-hidden border-4 border-white ring-8 ring-gray-50/50">
                                <img
                                    src={image ? URL.createObjectURL(image) : user?.imageUrl || 'https://via.placeholder.com/150'}
                                    className="w-full h-full object-cover rounded-[2.5rem]"
                                />
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-[3rem] opacity-0 group-hover:opacity-100 cursor-pointer transition-all backdrop-blur-sm">
                                <Camera size={24} />
                                <input type="file" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
                            </label>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter">{user?.name}</h2>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{user?.role || 'Learner'}</p>

                        <div className="w-full mt-10 pt-10 border-t border-gray-50 flex flex-col gap-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>Account Status</span>
                                <span className="text-emerald-500 flex items-center gap-2 italic font-black text-xs uppercase ml-1"><Shield size={12} /> Active</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>Verification</span>
                                <span className="text-indigo-500 flex items-center gap-2 italic font-black text-xs uppercase ml-1"><Key size={12} /> Tier 1</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings Forms */}
                <div className="lg:col-span-2 space-y-10">
                    {/* General Settings */}
                    <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-gray-200/40 border border-gray-50">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Core Identification</h3>
                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">Full Legal Name</label>
                                    <div className="flex items-center gap-4 bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 focus-within:ring-4 ring-indigo-500/5 transition-all">
                                        <User size={18} className="text-gray-300" />
                                        <input
                                            type="text"
                                            className="bg-transparent border-none outline-none text-xs font-black text-gray-900 w-full"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">Broadcast Address (Email)</label>
                                    <div className="flex items-center gap-4 bg-gray-100 px-8 py-5 rounded-2xl border border-gray-100 cursor-not-allowed opacity-50">
                                        <Mail size={18} className="text-gray-300" />
                                        <input
                                            type="email"
                                            readOnly
                                            className="bg-transparent border-none outline-none text-xs font-black text-gray-900 w-full"
                                            value={email}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#0C132B] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/10 flex items-center gap-3 disabled:opacity-50"
                            >
                                <Save size={16} /> {loading ? 'Saving Changes...' : 'Synchronize Identity'}
                            </button>
                        </form>
                    </div>

                    {/* Security Protocol */}
                    <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-gray-200/40 border border-gray-50">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Security Protocol Override</h3>
                        <form onSubmit={handleChangePassword} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">Current Cipher</label>
                                    <div className="flex items-center gap-4 bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 focus-within:ring-4 ring-indigo-500/5 transition-all">
                                        <Lock size={18} className="text-gray-300" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-transparent border-none outline-none text-xs font-black text-gray-900 w-full"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">New Sequence</label>
                                    <div className="flex items-center gap-4 bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 focus-within:ring-4 ring-indigo-500/5 transition-all">
                                        <Lock size={18} className="text-indigo-400" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-transparent border-none outline-none text-xs font-black text-gray-900 w-full"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">Confirm Sequence</label>
                                    <div className="flex items-center gap-4 bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100 focus-within:ring-4 ring-indigo-500/5 transition-all">
                                        <Lock size={18} className="text-indigo-400" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-transparent border-none outline-none text-xs font-black text-gray-900 w-full"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={changingPass}
                                className="bg-rose-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 flex items-center gap-3 disabled:opacity-50"
                            >
                                <Shield size={16} /> {changingPass ? 'Upgrading...' : 'Update Security Layer'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
