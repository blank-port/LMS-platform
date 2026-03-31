import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { ShoppingBag, Award, BookOpen, ChevronRight, Download } from 'lucide-react';

const TABS = [
    { key: 'purchase_history', label: 'Purchase History', icon: ShoppingBag },
    { key: 'certificates', label: 'My Certificates', icon: Award },
    { key: 'topics', label: 'My Topics', icon: BookOpen },
];

const InstructorMyPanel = () => {
    const { backendUrl, token, currency } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('purchase_history');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            const { data: res } = await axios.get(`${backendUrl}/api/instructor/my-panel?tab=${tab}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.success) setData(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchData(activeTab); }, [activeTab]);

    const handleTabSwitch = (tab) => { setActiveTab(tab); };

    const renderPurchaseHistory = () => (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">#</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Course</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Amount</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Method</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.length === 0 ? (
                        <tr><td colSpan={6} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No purchase history found</td></tr>
                    ) : data.map((item, i) => (
                        <tr key={item._id || i} className="hover:bg-gray-50/30 transition-colors group">
                            <td className="px-8 py-6 text-[10px] font-black text-gray-300">#{i + 1}</td>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                    {item.course?.courseThumbnail && (
                                        <img src={item.course.courseThumbnail} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                    )}
                                    <span className="text-sm font-bold text-gray-900 line-clamp-1">{item.course?.courseTitle || 'N/A'}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-sm font-black text-gray-900">{currency}{item.amount}</td>
                            <td className="px-8 py-6">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full">{item.paymentMethod}</span>
                            </td>
                            <td className="px-8 py-6">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span>
                            </td>
                            <td className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCertificates = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.length === 0 ? (
                <div className="col-span-full bg-white p-20 rounded-[3rem] border border-dashed border-gray-100 text-center">
                    <div className="text-6xl mb-6 opacity-10">🏆</div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">No Certificates Yet</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Complete courses to earn certificates</p>
                </div>
            ) : data.map((cert, i) => (
                <div key={cert._id || i} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center relative">
                        <Award size={48} className="text-white/20" />
                        <div className="absolute bottom-4 left-6">
                            <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Certificate</span>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="font-black text-gray-900 text-sm mb-2 tracking-tight line-clamp-2">{cert.courseId?.courseTitle || 'Course'}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">ID: {cert.certificateId || 'N/A'}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <span className="text-[10px] font-black text-gray-300">{new Date(cert.issueDate).toLocaleDateString()}</span>
                            {cert.pdfUrl && (
                                <a href={cert.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800">
                                    <Download size={12} /> Download
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTopics = () => (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">#</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Course</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Subject</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Lectures</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No topics found</td></tr>
                    ) : data.map((topic, i) => (
                        <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                            <td className="px-8 py-5 text-[10px] font-black text-gray-300">#{i + 1}</td>
                            <td className="px-8 py-5 text-sm font-bold text-gray-900">{topic.courseTitle}</td>
                            <td className="px-8 py-5">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">{topic.subject}</span>
                            </td>
                            <td className="px-8 py-5 text-right text-sm font-black text-gray-900">{topic.totalLectures}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="p-8 lg:p-12 bg-gray-50/30 min-h-screen font-inter">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Personal Workspace</p>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">My Panel</h1>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-10 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-gray-100 w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabSwitch(tab.key)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                            activeTab === tab.key
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {activeTab === 'purchase_history' && renderPurchaseHistory()}
                    {activeTab === 'certificates' && renderCertificates()}
                    {activeTab === 'topics' && renderTopics()}
                </>
            )}
        </div>
    );
};

export default InstructorMyPanel;
