import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { AppContext } from '../../context/AppContextObject.jsx';
import { ShieldCheck, Award, Calendar, BookOpen, User, CheckCircle, XCircle } from 'lucide-react';
import Loading from '../../components/student/Loading';

const CertificateVerification = () => {
    const { certificateId } = useParams();
    const { backendUrl } = useContext(AppContext);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await api.get(`/certificate/verify/${certificateId}`);
                if (data.success) {
                    setCertificate(data.certificate);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Verification system offline.');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [certificateId, backendUrl]);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-[var(--background)] py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20">
                         <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4 uppercase italic">Credential Validation</h1>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Strategic Verification Protocol 2.1</p>
                </div>

                {error ? (
                    <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-rose-100 animate-in fade-in zoom-in duration-500">
                        <XCircle size={64} className="text-rose-500 mx-auto mb-6 opacity-20" />
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Validation Failure</h2>
                        <p className="text-gray-400 text-sm mb-10">{error}</p>
                        <hr className="mb-10 border-gray-50" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">The provided ID does not match any authenticated record in the PrismEd distributed ledger.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <div className="bg-indigo-600 p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="relative z-10">
                                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-6" />
                                <h2 className="text-white text-2xl font-black tracking-tight uppercase">Successfully Authenticated</h2>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2">Verified Professional Credentials</p>
                            </div>
                        </div>

                        <div className="p-12 space-y-10">
                            <div className="flex items-start gap-8">
                                <div className="p-5 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0">
                                    <Award size={28} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Achieved Endorsement</p>
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight">{certificate.courseId?.courseTitle}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Scholar Name</p>
                                        <p className="text-sm font-black text-gray-900">{certificate.userId?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Issue Date</p>
                                        <p className="text-sm font-black text-gray-900">{new Date(certificate.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-50" />

                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Blockchain ID / Verified Node</p>
                                    <code className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg tracking-widest">{certificate.certificateId}</code>
                                </div>
                                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-full border border-emerald-100">
                                    <ShieldCheck size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Institutional Integrity Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Validated by PrismEd Learning Systems • Cloud Infrastructure</p>
                </div>
            </div>
        </div>
    );
};

export default CertificateVerification;




