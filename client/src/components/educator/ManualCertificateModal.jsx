import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X, Upload, CheckCircle, ShieldAlert } from 'lucide-react';

const ManualCertificateModal = ({ isOpen, onClose, student, courseId, courseTitle }) => {
    const { backendUrl, token } = useContext(AppContext);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Fundamental credential asset required');
            return;
        }

        const formData = new FormData();
        formData.append('userId', student._id);
        formData.append('courseId', courseId);
        formData.append('certificate', file);

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/certificate/manual-issue`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                toast.success('Credential Synchronized & Issued Successfully');
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Encryption/Transmission Failure');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0C132B]/80 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl shadow-indigo-500/20 border border-indigo-100 overflow-hidden relative animate-in zoom-in-95 duration-500">
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-500 transition-all z-20"
                >
                    <X size={24} />
                </button>

                <div className="p-12 md:p-16">
                    <div className="flex flex-col items-center text-center mb-12">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                            <Upload size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-[#0C132B] tracking-tighter mb-2">Manual Credential Release</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed max-w-xs">Pshing a custom endorsement for {student.name}</p>
                    </div>

                    <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 mb-10">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-3 py-1 bg-white rounded-lg border border-indigo-100">Target Module</span>
                        </div>
                        <p className="text-sm font-black text-[#0C132B] truncate">{courseTitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="relative group">
                            <input 
                                type="file" 
                                accept="application/pdf,image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required
                            />
                            <div className="bg-white border-2 border-dashed border-indigo-200 rounded-[2rem] p-12 text-center group-hover:border-indigo-500 group-hover:bg-indigo-50/10 transition-all">
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle className="text-emerald-500 mb-2" size={32} />
                                        <span className="text-xs font-black text-gray-900 truncate max-w-[240px]">{file.name}</span>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Asset Ready for Injection</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-2xl mb-2">📄</span>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Inject PDF/Image Asset</span>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Official Institutional Endorsement Only</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-6 bg-amber-50 rounded-2xl border border-amber-100 mb-10">
                            <ShieldAlert className="text-amber-500 flex-shrink-0" size={20} />
                            <p className="text-[9px] font-bold text-amber-900 leading-relaxed uppercase tracking-wide">Warning: Manual overrides bypass curriculum validation. Verification will be tagged as 'Instructor Endorsed'.</p>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0C132B] text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/10 disabled:opacity-50"
                        >
                            {loading ? 'Initializing Byte Stream...' : 'Finalize & Issue Credential'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManualCertificateModal;
