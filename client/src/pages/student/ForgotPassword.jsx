import { useState } from 'react';
import api from '@/utils/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Loader2, Mail, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/user/forgot-password', { email });
            if (data.success) {
                setSubmitted(true);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
                <div className="border-b border-white/10 px-8 py-6">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors">
                        <ArrowLeft className="size-4" />
                        Back to sign in
                    </Link>
                </div>

                <div className="px-8 py-10">
                    <div className="mb-8">
                        <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                            {submitted ? <ShieldCheck className="size-7" /> : <Mail className="size-7" />}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">
                            {submitted ? 'Check your inbox' : 'Recover your account'}
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            {submitted
                                ? 'We have dispatched a 6-digit recovery code. Please check your inbox and enter it to reset your password.'
                                : 'Enter your email address and we will dispatch a secure OTP (One-Time Password) to reset your account.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                disabled={loading || submitted}
                                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-11 pr-4 text-white outline-none transition focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || submitted}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-white shadow-lg shadow-blue-900/30 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="size-5 animate-spin" /> : 'Dispatch Recovery Code'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;




