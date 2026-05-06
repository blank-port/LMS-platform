import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { 
    TicketIcon, 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    UserIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';

const ManageCoupons = () => {
    const { token } = useContext(AppContext);
    const [coupons, setCoupons] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        code: '',
        couponType: 'common',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: 0,
        maxUses: '',
        maxUsesPerUser: 1,
        validFrom: '',
        validTo: '',
        applicableCourses: [],
        status: 'active'
    });



    useEffect(() => {
        fetchCoupons();
        fetchCourses();
    }, [page]);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get(`/coupon?page=${page}`);
            if (data.success) {
                setCoupons(data.coupons);
                setTotalPages(data.pages);
            }
        } catch (error) { toast.error('Failed to fetch coupons'); }
        setLoading(false);
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/course/all');
            if (data.success) setCourses(data.courses);
        } catch (error) {}
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const action = editingId ? 'Updating' : 'Creating';
        const loadingToast = toast.loading(`${action} Coupon...`);
        try {
            const url = editingId ? `/coupon/${editingId}` : '/coupon';
            const method = editingId ? 'put' : 'post';
            const { data } = await api[method](url, form);
            
            if (data.success) {
                toast.update(loadingToast, { render: `Coupon ${action.toLowerCase()}ed successfully`, type: "success", isLoading: false, autoClose: 3000 });
                fetchCoupons();
                setShowModal(false);
            }
        } catch (error) {
            toast.update(loadingToast, { render: error.response?.data?.message || 'Operation failed', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const { data } = await api.delete(`/coupon/${id}`);
            if (data.success) {
                toast.success('Coupon deleted');
                fetchCoupons();
            }
        } catch (error) { toast.error('Delete failed'); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-gray-800/20 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Synchronizing Discount Matrix...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Promotional Protocols</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Coupon Engine & Incentive Governance</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setForm({
                            code: '', couponType: 'common', discountType: 'percentage',
                            discountValue: '', minPurchase: 0, maxUses: '', maxUsesPerUser: 1,
                            validFrom: '', validTo: '', applicableCourses: [], status: 'active'
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/10"
                >
                    <PlusIcon className="w-4 h-4" />
                    Deploy Coupon
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Coupon Code</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Discount</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Validity</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Usage</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {coupons.map((coupon) => (
                                <tr key={coupon._id} className="group hover:bg-[var(--background)]/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-400 font-black">
                                                <TicketIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-main)] tracking-tight">{coupon.code}</p>
                                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{coupon.couponType} Coupon</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-[var(--text-main)]">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-500">Min: ₹{coupon.minPurchase}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                {new Date(coupon.validFrom).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
                                                <span className="w-3"></span>
                                                to {new Date(coupon.validTo).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="w-full bg-[var(--background)] h-1.5 rounded-full overflow-hidden mb-1 max-w-[100px]">
                                            <div 
                                                className="bg-purple-600 h-full rounded-full" 
                                                style={{ width: `${coupon.maxUses ? (coupon.usedCount / coupon.maxUses) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                            {coupon.usedCount} / {coupon.maxUses || '∞'} Used
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                                            coupon.status === 'active' ? 'bg-green-900/20 text-green-400' : 
                                            coupon.status === 'expired' ? 'bg-red-900/20 text-red-400' : 
                                            'bg-gray-800 text-gray-400'
                                        }`}>
                                            {coupon.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingId(coupon._id);
                                                    setForm({
                                                        ...coupon,
                                                        validFrom: coupon.validFrom.split('T')[0],
                                                        validTo: coupon.validTo.split('T')[0],
                                                        applicableCourses: coupon.applicableCourses.map(c => c._id || c)
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-purple-400 transition-all"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(coupon._id)}
                                                className="p-2 hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {coupons.length === 0 && (
                        <div className="p-20 text-center opacity-30">
                            <TicketIcon className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest">No Active Incentives</p>
                        </div>
                    )}
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
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-2xl border border-[var(--border)] shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)]">{editingId ? 'Recalibrate Protocol' : 'Deploy New Protocol'}</h2>
                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mt-1">Coupon Configuration Suite</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Coupon Code</label>
                                    <div className="relative">
                                        <TicketIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input 
                                            type="text" required value={form.code}
                                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                            className="w-full pl-12 pr-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm font-bold"
                                            placeholder="e.g. SAVE50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Coupon Type</label>
                                    <select 
                                        value={form.couponType}
                                        onChange={(e) => setForm({ ...form, couponType: e.target.value })}
                                        className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="common">Common (Everyone)</option>
                                        <option value="single">Single Use (One time total)</option>
                                        <option value="personalized">Personalized (Specific user)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Discount Type</label>
                                    <div className="flex bg-[var(--background)] rounded-2xl p-1 border border-[var(--border)]">
                                        <button 
                                            type="button"
                                            onClick={() => setForm({ ...form, discountType: 'percentage' })}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.discountType === 'percentage' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                        >Percentage</button>
                                        <button 
                                            type="button"
                                            onClick={() => setForm({ ...form, discountType: 'fixed' })}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.discountType === 'fixed' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                        >Fixed Amount</button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Discount Value</label>
                                    <div className="relative">
                                        <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input 
                                            type="number" required value={form.discountValue}
                                            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-bold"
                                            placeholder={form.discountType === 'percentage' ? '50 (%)' : '500 (₹)'}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Valid From</label>
                                    <input 
                                        type="date" required value={form.validFrom}
                                        onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                                        className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-bold text-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Valid To</label>
                                    <input 
                                        type="date" required value={form.validTo}
                                        onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                                        className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-bold text-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Max Total Uses</label>
                                    <input 
                                        type="number" value={form.maxUses}
                                        onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                                        className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-bold"
                                        placeholder="Empty for ∞"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Min Purchase (₹)</label>
                                    <input 
                                        type="number" value={form.minPurchase}
                                        onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                                        className="w-full px-6 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl outline-none text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-purple-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/20 mt-4">
                                {editingId ? 'Authorize Update' : 'Initialize Protocol'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCoupons;




