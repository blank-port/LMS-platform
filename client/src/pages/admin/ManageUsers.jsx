import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
    const { backendUrl, token } = useContext(AppContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterInstitute, setFilterInstitute] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ 
        name: '', email: '', password: '', role: 'student', institute: '',
        phone: '', about: '', education: [], experience: [], skills: [],
        financial: { bankName: '', accountNumber: '', ifscCode: '' },
        socialLinks: { facebook: '', twitter: '', linkedin: '', instagram: '' }
    });
    const [editingId, setEditingId] = useState(null);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        fetchUsers();
        fetchInstitutes();
    }, [page]);

    const fetchInstitutes = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/audit/institute/all`, getHeaders());
            if (data.success) setInstitutes(data.institutes);
        } catch (error) { console.error('Institute retrieval failure'); }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/users?role=student&page=${page}`, getHeaders())
            if (data.success) {
                setUsers(data.users);
                setTotalPages(data.pages);
            }
        } catch (error) {
            toast.error('Identity Retrieval Failure');
        }
        setLoading(false);
    };

    const handleCSVImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const dataToImport = [];

            for (let i = 1; i < lines.length; i++) {
                const [name, email, password] = lines[i].split(',');
                if (name && email) {
                    dataToImport.push({ name: name.trim(), email: email.trim(), password: password?.trim() || 'password123' });
                }
            }

            try {
                const importToast = toast.loading(`Synchronizing ${dataToImport.length} Identities...`);
                for (const user of dataToImport) {
                    await axios.post(backendUrl + '/api/user/register', user);
                }
                toast.update(importToast, { render: 'Batch Identity Synchronization completed.', type: "success", isLoading: false, autoClose: 3000 });
                fetchUsers();
            } catch (error) {
                toast.error('Synchronization abort.');
            }
        };
        reader.readAsText(file);
    };

    const handleSave = async () => {
        const actionToast = toast.loading(editingId ? 'Updating Identity...' : 'Initializing New Identity...');
        try {
            if (editingId) {
                const { data } = await axios.put(`${backendUrl}/api/admin/users/${editingId}`, form, getHeaders());
                if (data.success) {
                    toast.update(actionToast, { render: 'Identity calibrated successfully.', type: "success", isLoading: false, autoClose: 3000 });
                    fetchUsers();
                }
            } else {
                const { data } = await axios.post(`${backendUrl}/api/admin/users`, form, getHeaders());
                if (data.success) {
                    toast.update(actionToast, { render: 'New identity deployed.', type: "success", isLoading: false, autoClose: 3000 });
                    fetchUsers();
                }
                else toast.error(data.message);
            }
            setShowModal(false);
            setEditingId(null);
            setForm({ 
                name: '', email: '', password: '', role: 'student', institute: '',
                phone: '', about: '', education: [], experience: [], skills: [],
                financial: { bankName: '', accountNumber: '', ifscCode: '' },
                socialLinks: { facebook: '', twitter: '', linkedin: '', instagram: '' }
            });
        } catch (error) {
            toast.update(actionToast, { render: 'Calibration failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleEdit = (user) => {
        setForm({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            institute: user.institute?._id || user.institute || '',
            phone: user.phone || '',
            about: user.about || '',
            education: user.education || [],
            experience: user.experience || [],
            skills: user.skills || [],
            financial: user.financial || { bankName: '', accountNumber: '', ifscCode: '' },
            socialLinks: user.socialLinks || { facebook: '', twitter: '', linkedin: '', instagram: '' }
        });
        setEditingId(user._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Proceed with permanent identity erasure? This action is irreversible.')) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/users/${id}`, getHeaders());
            if (data.success) { toast.success('Identity erased from repository.'); fetchUsers(); }
        } catch (error) { toast.error('Erasure failed.'); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Synchronizing Human Capital...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Human Capital Stewardship</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Personnel Management & Identity Governance</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={filterInstitute}
                        onChange={(e) => setFilterInstitute(e.target.value)}
                        className="px-6 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-[var(--text-main)]"
                    >
                        <option value="">All Institutional Nodes</option>
                        {institutes.map(inst => <option key={inst._id} value={inst._id}>{inst.name}</option>)}
                    </select>
                    <label className="px-6 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-[var(--background)] transition-all flex items-center gap-3 text-[var(--text-main)]">
                        📥 Batch Sync
                        <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                    </label>
                    <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ 
                        name: '', email: '', password: '', role: 'student', institute: '',
                        phone: '', about: '', education: [], experience: [], skills: [],
                        financial: { bankName: '', accountNumber: '', ifscCode: '' },
                        socialLinks: { facebook: '', twitter: '', linkedin: '', instagram: '' }
                    }); }}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-xl shadow-black/10/10">
                        + Deploy Identity
                    </button>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descriptor</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Identity Hub & Node</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Level</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Strategic Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {users.filter(u => !filterInstitute || u.institute?._id === filterInstitute || u.institute === filterInstitute).map((user) => (
                                <tr key={user._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all" onClick={() => navigate(`/admin/student-profile/${user._id}`)}>
                                            <div className="w-12 h-12 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-black/10/10 group-hover:scale-105 transition-transform border border-white/10 overflow-hidden">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-main)] tracking-tight">{user.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider italic">ID: {user._id.slice(-8).toUpperCase()} {user.phone && `| ${user.phone}`}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 hidden md:table-cell">
                                        <p className="text-xs font-bold text-[var(--text-muted)] tracking-tight mb-1">{user.email}</p>
                                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.1em]">{user.institute?.name || 'CENTRAL COMMAND'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-red-900/20 text-red-400' :
                                                user.role === 'instructor' ? 'bg-purple-900/20 text-purple-400' :
                                                    'bg-blue-900/20 text-blue-400'}`}>
                                            {user.role === 'admin' ? 'Executive' : user.role === 'instructor' ? 'Educator' : 'Scholar'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(user)} className="h-9 px-4 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[var(--background)] transition-all shadow-sm">Calibrate</button>
                                            <button onClick={() => handleDelete(user._id)} className="w-9 h-9 flex items-center justify-center bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">✕</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Protocol */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-[var(--surface)] p-6 rounded-[2rem] border border-[var(--border)]">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-6 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-[var(--border)] transition-all"
                        >Prev</button>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-[var(--border)] transition-all"
                        >Next</button>
                    </div>
                </div>
            )}

            {/* Identity Calibration Surface (Modal) */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-900/10 border border-[var(--border)] animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-[var(--surface)] z-10 py-2">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">{editingId ? 'Identity Calibration' : 'Identity Deployment'}</h2>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mt-1">Personnel Oversight Suite</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-[var(--background)] rounded-full text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Left Column: Basic Info */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-[var(--border)] pb-2">Core Identity</h3>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Designation</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)] outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" placeholder="Full Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Communication Endpoint</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)] outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" placeholder="email@nexus.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)] outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" placeholder="+1 (555) 000-0000" />
                                </div>
                                {!editingId && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Token</label>
                                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)] outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm" placeholder="••••••••" />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Strategic Role</label>
                                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                                            className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)] outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm appearance-none">
                                            <option value="student">Scholar (Student)</option>
                                            <option value="instructor">Educator (Instructor)</option>
                                            <option value="admin">Executive (Admin)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Allocate Node</label>
                                        <select value={form.institute} onChange={(e) => setForm({ ...form, institute: e.target.value })}
                                            className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)] outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-black text-[var(--text-main)] text-sm appearance-none">
                                            <option value="">Central Command</option>
                                            {institutes.map(inst => <option key={inst._id} value={inst._id}>{inst.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biography / About</label>
                                    <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })}
                                        className="w-full px-5 py-4 border border-[var(--border)] rounded-2xl bg-[var(--background)] outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm h-32 resize-none" placeholder="User specialized background..." />
                                </div>
                            </div>

                            {/* Right Column: Professional & Social */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-[var(--border)] pb-2">Professional Credentials</h3>
                                
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Parameters</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={form.financial?.bankName} onChange={(e) => setForm({ ...form, financial: { ...form.financial, bankName: e.target.value } })}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] outline-none text-[11px] font-bold text-[var(--text-main)]" placeholder="Bank Name" />
                                        <input type="text" value={form.financial?.accountNumber} onChange={(e) => setForm({ ...form, financial: { ...form.financial, accountNumber: e.target.value } })}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] outline-none text-[11px] font-bold text-[var(--text-main)]" placeholder="A/C Number" />
                                        <input type="text" value={form.financial?.ifscCode} onChange={(e) => setForm({ ...form, financial: { ...form.financial, ifscCode: e.target.value } })}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] outline-none text-[11px] font-bold text-[var(--text-main)]" placeholder="IFSC / Swift" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Social Network Vectors</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={form.socialLinks?.facebook} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value } })}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] outline-none text-[11px] font-bold text-[var(--text-main)]" placeholder="Facebook URL" />
                                        <input type="text" value={form.socialLinks?.twitter} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] outline-none text-[11px] font-bold text-[var(--text-main)]" placeholder="Twitter URL" />
                                        <input type="text" value={form.socialLinks?.linkedin} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] outline-none text-[11px] font-bold text-[var(--text-main)]" placeholder="LinkedIn URL" />
                                        <input type="text" value={form.socialLinks?.instagram} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })}
                                            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] outline-none text-[11px] font-bold text-[var(--text-main)]" placeholder="Instagram URL" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Education Records ({form.education?.length || 0})</p>
                                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                                        {form.education?.map((edu, idx) => (
                                            <div key={idx} className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] text-[9px] font-bold text-[var(--text-muted)]">
                                                {edu.school} | {edu.degree} ({edu.year})
                                            </div>
                                        ))}
                                        {(!form.education || form.education.length === 0) && <p className="text-[9px] text-gray-400 italic">No academic history provided.</p>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skill Set Matrix</p>
                                    <div className="flex flex-wrap gap-2">
                                        {form.skills?.map((skill, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-purple-900/20 text-purple-400 rounded-md text-[9px] font-black uppercase">{skill}</span>
                                        ))}
                                        {(!form.skills || form.skills.length === 0) && <p className="text-[9px] text-gray-400 italic">No skills cataloged.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button onClick={handleSave} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl hover:bg-purple-600 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10">
                                {editingId ? 'Comit Calibration' : 'Initialize Deployment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;

