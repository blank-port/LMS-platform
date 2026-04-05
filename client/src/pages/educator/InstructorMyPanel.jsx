import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { 
    ShoppingBag, Award, BookOpen, ChevronRight, 
    Download, RotateCcw, Share2, Monitor, Wallet, Star
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TABS = [
    { key: 'purchase_history', label: 'Purchase History', icon: ShoppingBag },
    { key: 'refund_cancellation', label: 'Refund & Cancellation', icon: RotateCcw },
    { key: 'referral', label: 'Referral', icon: Share2 },
    { key: 'logged_in_device', label: 'Logged In Device', icon: Monitor },
    { key: 'certificates', label: 'My Certificate', icon: Award },
    { key: 'deposit', label: 'Deposit', icon: Wallet },
    { key: 'topics', label: 'My Topics', icon: BookOpen },
    { key: 'reviews', label: 'Student Reviews', icon: Star },
];

const InstructorMyPanel = () => {
    const { backendUrl, token, currency } = useContext(AppContext);
    const location = useLocation();
    const queryTab = new URLSearchParams(location.search).get('tab');
    
    const [activeTab, setActiveTab] = useState(queryTab || 'purchase_history');
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

    useEffect(() => { 
        if (queryTab && queryTab !== activeTab) {
            setActiveTab(queryTab);
        }
    }, [queryTab]);

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
                    ) : (Array.isArray(data) ? data : []).map((item, i) => (
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
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                    item.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                                    item.status === 'pending_approval' ? 'bg-amber-50 text-amber-600 animate-pulse' : 
                                    'bg-gray-50 text-gray-400'
                                }`}>
                                    {item.status === 'pending_approval' ? 'Awaiting Approval' : item.status}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderRefunds = () => (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Course</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Reason</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Amount</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.length === 0 ? (
                        <tr><td colSpan={5} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No refund requests found</td></tr>
                    ) : (Array.isArray(data) ? data : []).map((refund, i) => (
                        <tr key={refund._id || i} className="hover:bg-gray-50/30 transition-colors">
                            <td className="px-8 py-6">
                                <span className="text-sm font-bold text-gray-900">{refund.courseId?.courseTitle || 'Course'}</span>
                            </td>
                            <td className="px-8 py-6 text-sm text-gray-500">{refund.reason}</td>
                            <td className="px-8 py-6 text-sm font-black text-gray-900">{currency}{refund.amount}</td>
                            <td className="px-8 py-6">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                    refund.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                                    refund.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                }`}>{refund.status}</span>
                            </td>
                            <td className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(refund.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderReferral = () => (
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[3rem] text-white shadow-xl shadow-indigo-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter mb-2">Invite your friends & earn!</h3>
                        <p className="text-indigo-100 text-sm opacity-80">Share your referral link and get rewards for every successful signup.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col gap-2 min-w-[300px]">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Referral Code</span>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-black tracking-widest">{data?.referralCode || '...' }</span>
                            <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-50 transition-all">COPY LINK</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Referred Users</h3>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">User</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Date Joined</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Commission</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {!data?.referees?.length ? (
                            <tr><td colSpan={3} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No referrals yet</td></tr>
                        ) : data.referees.map((ref, i) => (
                            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px] text-gray-500 overflow-hidden">
                                            {ref.user?.profilePicture ? <img src={ref.user.profilePicture} className="w-full h-full object-cover" alt="" /> : ref.user?.name?.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{ref.user?.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm text-gray-500">{new Date(ref.user?.createdAt || Date.now()).toLocaleDateString()}</td>
                                <td className="px-8 py-5 text-right font-black text-emerald-600">{currency}{ref.commission || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDevices = () => (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-8 border-b border-gray-50">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <Monitor size={18} className="text-indigo-600" />
                    Active Sessions
                </h3>
            </div>
            <div className="divide-y divide-gray-50">
                {(Array.isArray(data) ? data : []).map((device, i) => (
                    <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <Monitor size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900">{device.device}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{device.ip} • {device.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gray-300">{new Date(device.lastLogin).toLocaleString()}</span>
                            {device.current ? (
                                <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">Current Device</span>
                            ) : (
                                <button className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">Logout</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDeposit = () => (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Transaction ID</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Amount</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No deposits found</td></tr>
                    ) : (Array.isArray(data) ? data : []).map((tx, i) => (
                        <tr key={tx._id || i} className="hover:bg-gray-50/30 transition-colors">
                            <td className="px-8 py-6">
                                <span className="text-xs font-black text-gray-900 font-mono tracking-tighter">#{tx._id?.substring(0, 12).toUpperCase()}</span>
                            </td>
                            <td className="px-8 py-6 font-black text-emerald-600">+{currency}{tx.amount}</td>
                            <td className="px-8 py-6">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{tx.status}</span>
                            </td>
                            <td className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCertificates = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(data) ? data : []).length === 0 ? (
                <div className="col-span-full bg-white p-20 rounded-[3rem] border border-dashed border-gray-100 text-center">
                    <div className="text-6xl mb-6 opacity-10">🏆</div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">No Certificates Yet</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Complete courses to earn certificates</p>
                </div>
            ) : (Array.isArray(data) ? data : []).map((cert, i) => (
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
                    {(Array.isArray(data) ? data : []).length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No topics found</td></tr>
                    ) : (Array.isArray(data) ? data : []).map((topic, i) => (
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

    const renderReviews = () => (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Global Feedback Activity</h3>
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Student</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Course</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Rating</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Comment</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {(Array.isArray(data) ? data : []).length === 0 ? (
                        <tr><td colSpan={5} className="px-8 py-16 text-center text-gray-300 font-bold text-sm">No reviews collected yet.</td></tr>
                    ) : (Array.isArray(data) ? data : []).map((rev, i) => (
                        <tr key={rev._id || i} className="hover:bg-gray-50/30 transition-colors">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <img src={rev.userId?.profilePicture || `https://ui-avatars.com/api/?name=${rev.userId?.name}&background=random`} className="w-8 h-8 rounded-full border border-gray-100" alt="" />
                                    <span className="text-sm font-bold text-gray-900">{rev.userId?.name || 'Unknown'}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-xs font-bold text-gray-500 line-clamp-1 max-w-[200px]">{rev.courseId?.courseTitle}</td>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, index) => (
                                        <Star key={index} size={12} className={index < rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                                    ))}
                                </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-gray-600 max-w-md break-words">{rev.comment || 'No comment provided.'}</td>
                            <td className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</td>
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
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Personal Workspace</p>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">My Panel</h1>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-10 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-gray-100 w-fit max-w-full">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabSwitch(tab.key)}
                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-500 ${
                            activeTab === tab.key
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]'
                                : 'text-gray-400 hover:text-indigo-600 hover:bg-white transition-all'
                        }`}
                    >
                        <tab.icon size={14} className={`${activeTab === tab.key ? 'opacity-100' : 'opacity-40'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Synchronizing Data</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'purchase_history' && renderPurchaseHistory()}
                    {activeTab === 'refund_cancellation' && renderRefunds()}
                    {activeTab === 'referral' && renderReferral()}
                    {activeTab === 'logged_in_device' && renderDevices()}
                    {activeTab === 'certificates' && renderCertificates()}
                    {activeTab === 'deposit' && renderDeposit()}
                    {activeTab === 'topics' && renderTopics()}
                    {activeTab === 'reviews' && renderReviews()}
                </div>
            )}
        </div>
    );
};

export default InstructorMyPanel;
