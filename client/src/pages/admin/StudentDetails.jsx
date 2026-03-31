import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    UserIcon, 
    AcademicCapIcon, 
    BriefcaseIcon, 
    KeyIcon, 
    CurrencyDollarIcon, 
    ShareIcon,
    ArrowLeftIcon,
    IdentificationIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, token } = useContext(AppContext);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/admin/users/${id}`, getHeaders());
                if (data.success) {
                    setStudent(data.user);
                } else {
                    toast.error(data.message);
                    navigate('/admin/users');
                }
            } catch (error) {
                toast.error('Identity Retrieval Failure');
                navigate('/admin/users');
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Decrypting Profile Data...</p>
        </div>
    );

    if (!student) return null;

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-[var(--surface)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-lg font-black text-[var(--text-main)] truncate">{value || 'N/A'}</p>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, subtitle }) => (
        <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">{title}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            {/* Header / Actions */}
            <div className="flex items-center justify-between bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex items-center justify-center hover:bg-gray-800 transition-all text-gray-500"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Identity Dossier</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Institutional Node: {student.institute?.name || 'Central Command'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">Print Record</button>
                    <button onClick={() => navigate(`/admin/users`) } className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/10">Manage Directory</button>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Basic Info & Avatar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-[3rem] text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-all"></div>
                        <div className="w-32 h-32 bg-[var(--surface)] rounded-[2.5rem] p-1 mx-auto mb-6 shadow-2xl relative z-10">
                            {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover rounded-[2.2rem]" />
                            ) : (
                                <div className="w-full h-full bg-[var(--background)] flex items-center justify-center rounded-[2.2rem]">
                                    <span className="text-4xl font-black text-gray-400">{student.name?.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight z-10 relative">{student.name}</h2>
                        <p className="text-purple-400 text-xs font-black uppercase tracking-[0.2em] mt-2 z-10 relative">Scholar / Student</p>
                        
                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-center gap-8 z-10 relative">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase">Courses</p>
                                <p className="text-lg font-black text-white">{student.enrolledCourses?.length || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase">Balance</p>
                                <p className="text-lg font-black text-white">₹{student.walletBalance?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] space-y-6">
                        <SectionHeader icon={IdentificationIcon} title="Basic Credentials" subtitle="Primary Identity Factors" />
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-gray-500">
                                <EnvelopeIcon className="w-5 h-5 opacity-40 shrink-0" />
                                <span className="text-sm font-bold text-[var(--text-main)] truncate">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                                <PhoneIcon className="w-5 h-5 opacity-40 shrink-0" />
                                <span className="text-sm font-bold text-[var(--text-main)]">{student.phone || 'No direct comms linked'}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                                <MapPinIcon className="w-5 h-5 opacity-40 shrink-0" />
                                <span className="text-sm font-bold text-[var(--text-main)]">{student.language || 'English (Standard)'}</span>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-[var(--border)]">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">About User</h4>
                            <p className="text-xs text-[var(--text-main)] leading-relaxed font-bold">
                                {student.about || 'This identity has not yet provided a biographical record in their settings.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Tabs / Detailed Data */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Education Section */}
                    <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)]">
                        <SectionHeader icon={AcademicCapIcon} title="Academic History" subtitle="Institutional Qualifications" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.education && student.education.length > 0 ? student.education.map((edu, idx) => (
                                <div key={idx} className="p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] border-l-4 border-l-purple-500">
                                    <h4 className="font-black text-[var(--text-main)] text-sm mb-1">{edu.school}</h4>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{edu.degree}</p>
                                    <p className="text-[10px] font-black text-purple-400 mt-3">Graduated: {edu.year}</p>
                                </div>
                            )) : (
                                <div className="col-span-full py-10 text-center opacity-50">
                                    <p className="text-xs font-bold uppercase tracking-widest">No Academic Records Available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Experience Section */}
                    <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)]">
                        <SectionHeader icon={BriefcaseIcon} title="Professional Lifecycle" subtitle="Work Experience & Internships" />
                        <div className="space-y-4">
                            {student.experience && student.experience.length > 0 ? student.experience.map((exp, idx) => (
                                <div key={idx} className="flex items-start gap-6 p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-700 font-black text-gray-400">
                                        {exp.company?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-black text-[var(--text-main)] text-sm">{exp.role}</h4>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{exp.duration}</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-purple-400 uppercase tracking-tight">{exp.company}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center opacity-50">
                                    <p className="text-xs font-bold uppercase tracking-widest">Global Experience Graph Empty</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Skills */}
                        <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)]">
                            <SectionHeader icon={KeyIcon} title="Expertise Matrix" subtitle="Skill Set & Competencies" />
                            <div className="flex flex-wrap gap-2">
                                {student.skills && student.skills.length > 0 ? student.skills.map((skill, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-purple-900/20 text-purple-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-800">
                                        {skill}
                                    </span>
                                )) : (
                                    <p className="text-[10px] font-bold text-gray-400 uppercase italic">No specialized skills indexed.</p>
                                )}
                            </div>
                        </div>

                        {/* Financial */}
                        <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)]">
                            <SectionHeader icon={CurrencyDollarIcon} title="Fiscal Parameters" subtitle="Banking & Disbursement Links" />
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Merchant Bank</span>
                                    <span className="text-[var(--text-main)]">{student.financial?.bankName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Nexus Account</span>
                                    <span className="text-[var(--text-main)]">{student.financial?.accountNumber || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">IFSC / Swift</span>
                                    <span className="text-[var(--text-main)]">{student.financial?.ifscCode || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Section */}
                    <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)]">
                        <SectionHeader icon={ShareIcon} title="Social Communication Hub" subtitle="External Network Synchronization" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {['facebook', 'twitter', 'linkedin', 'instagram'].map(platform => {
                                const url = student.socialLinks?.[platform];
                                return (
                                    <a 
                                        key={platform}
                                        href={url ? (url.startsWith('http') ? url : `https://${url}`) : '#'}
                                        target={url ? "_blank" : "_self"}
                                        rel="noreferrer"
                                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${url ? 'bg-purple-50/50 border-purple-800/30 text-purple-400 hover:scale-105 shadow-sm' : 'bg-[var(--background)] border-[var(--border)] text-gray-300 cursor-not-allowed opacity-50'}`}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest uppercase">{platform}</span>
                                        {url ? <span className="text-[8px] font-bold text-purple-400 truncate w-full text-center">Connected</span> : <span className="text-[8px] font-bold text-gray-400">Link Pending</span>}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
