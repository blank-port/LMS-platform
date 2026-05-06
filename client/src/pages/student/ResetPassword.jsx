import { useState } from 'react';
import api from '@/utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck, Mail } from 'lucide-react';

const ResetPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post('/user/reset-password', { email, otp, newPassword: password });
            if (data.success) {
                setCompleted(true);
                toast.success(data.message);
                setTimeout(() => navigate('/login'), 1200);
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
                            {completed ? <ShieldCheck className="size-7" /> : <Lock className="size-7" />}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">
                            {completed ? 'Identity Secured' : 'Verify & Reset Password'}
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            {completed
                                ? 'Your account protocol has been synchronized. Redirecting you to sign in.'
                                : 'Enter your 6-digit recovery code and choose a new password to unlock your PrismEd account.'}
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
                                disabled={loading || completed}
                                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-11 pr-4 text-white outline-none transition focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="OTP Code"
                                required
                                disabled={loading || completed}
                                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-11 pr-4 text-white outline-none transition focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 uppercase tracking-[0.2em]"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New password"
                                required
                                disabled={loading || completed}
                                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-11 pr-12 text-white outline-none transition focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                disabled={loading || completed}
                                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-11 pr-12 text-white outline-none transition focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((value) => !value)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || completed}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-white shadow-lg shadow-blue-900/30 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="size-5 animate-spin" /> : 'Update password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;




