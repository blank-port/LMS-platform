import React, { useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Award, Download, ShieldCheck, ExternalLink, Award as AwardIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

const Certificates = () => {
    const { user, enrolledCourses } = useContext(AppContext);
    const certificateRef = useRef(null);

    const completedCourses = enrolledCourses.filter(e => e.progress === 100);

    const downloadCertificate = async (courseName, date) => {
        const id = toast.loading('Synchronizing credential nodes...');
        try {
            const element = certificateRef.current;
            element.style.display = 'block';
            
            // Update hidden template content
            element.querySelector('#cert-course').innerText = courseName.toUpperCase();
            element.querySelector('#cert-date').innerText = new Date(date).toLocaleDateString();
            element.querySelector('#cert-student').innerText = user.name.toUpperCase();
            element.querySelector('#cert-id').innerText = `ID: PRISM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#0C132B'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
            
            element.style.display = 'none';
            toast.update(id, { render: 'Credential successfully synchronized!', type: 'success', isLoading: false, autoClose: 3000 });
        } catch (error) {
            toast.update(id, { render: 'Encryption failure during transmission.', type: 'error', isLoading: false, autoClose: 3000 });
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Credential Nexus</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Validated certifications of your academic mastery</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {completedCourses.length === 0 ? (
                    <div className="col-span-full bg-white rounded-[3.5rem] p-24 text-center border border-dashed border-gray-100 flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 grayscale opacity-20">🏅</div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">No Endorsements Detected</h2>
                        <p className="text-gray-400 text-xs font-medium max-w-sm mb-12">Complete any enrolled course to 100% to unlock your professional certification.</p>
                        <button className="bg-[#0C132B] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Resume Learning Flow</button>
                    </div>
                ) : (
                    completedCourses.map((enrollment, index) => (
                        <div key={index} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/40 border border-gray-50 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-[1.5rem] flex items-center justify-center mb-8">
                                <Award size={32} />
                            </div>

                            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2 line-clamp-2">{enrollment.courseId.courseTitle}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                                <ShieldCheck size={14} className="text-emerald-500" /> Verified Completion
                            </p>

                            <div className="mt-auto pt-10 border-t border-gray-50 flex items-center justify-between">
                                <div>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Issued Date</p>
                                    <p className="text-[10px] font-black text-gray-900">{new Date(enrollment.updatedAt).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    onClick={() => downloadCertificate(enrollment.courseId.courseTitle, enrollment.updatedAt)}
                                    className="p-4 bg-[#0C132B] text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/10"
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Hidden Certificate Template for PDF Generation */}
            <div 
                ref={certificateRef}
                style={{ display: 'none', position: 'absolute', left: '-9999px', width: '1122px', height: '794px' }}
                className="bg-[#0C132B] p-24 text-white font-sans overflow-hidden"
            >
                <div className="border-[15px] border-indigo-600/20 h-full w-full relative p-20 flex flex-col items-center justify-center text-center">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl">
                             <AwardIcon size={48} className="text-white" />
                        </div>
                        
                        <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-xs mb-6">Credential of Academic Mastery</p>
                        <h1 className="text-6xl font-black tracking-tighter mb-10 border-y py-8 border-white/5 w-full">CERTIFICATE OF ACHIEVEMENT</h1>
                        
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">This hereby certifies that</p>
                        <h2 id="cert-student" className="text-5xl font-black text-indigo-400 mb-12 uppercase tracking-tight italic">STUDENT NAME</h2>
                        
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">Has successfully synchronized with the curriculum of</p>
                        <h3 id="cert-course" className="text-2xl font-black border-b-2 border-indigo-600/30 pb-4 mb-20 max-w-2xl">COURSE TITLE GOES HERE</h3>
                        
                        <div className="flex items-center justify-between w-full mt-20">
                            <div className="text-left">
                                <p className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1">Verification Node</p>
                                <p id="cert-id" className="text-[10px] font-black tracking-widest">ID: PRISM-827364521</p>
                            </div>
                            <div className="text-center bg-white/5 px-10 py-6 rounded-[2rem] border border-white/5">
                                <p className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1">Issue Timestamp</p>
                                <p id="cert-date" className="text-xs font-black tracking-widest">01 / 01 / 2024</p>
                            </div>
                            <div className="text-right">
                                <div className="w-24 h-24 bg-indigo-600/10 rounded-full border-2 border-indigo-600/20 flex items-center justify-center italic font-black text-indigo-600/30 text-lg">
                                    SEAL
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificates;
