import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContextObject.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import {
    Mail, Lock, ArrowRight, Loader2, GraduationCap,
    User as UserIcon, ShieldCheck, ChevronRight, Star,
    Eye, EyeOff
} from 'lucide-react';

const Login = () => {
    const { login, register, googleLogin, verifyOtp, resendOtp, navigate, user, settings } = useContext(AppContext);
    const location = useLocation();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [isOtpMode, setIsOtpMode] = useState(false);

    // Auth States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student');
    const [referralCode, setReferralCode] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const isMounted = React.useRef(true);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            isMounted.current = false;
        };
    }, []);

    // Sync mode with URL parameter if present
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('mode') === 'register') {
            setIsRegisterMode(true);
        }
    }, [location]);

    // Redirect if already logged in (and not in OTP mode)
    useEffect(() => {
        if (user && !isOtpMode && isMounted.current) {
            const userRole = user.role;
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'instructor') navigate('/educator');
            else navigate('/');
        }
    }, [user, navigate, isOtpMode]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        if (isMounted.current) setLoading(false);
        if (result) {
            if (result.verifyEmail) {
                setEmail(result.verifyEmail);
                setIsOtpMode(true);
                return;
            }
            const userRole = result.user.role;
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'instructor') navigate('/educator');
            else navigate('/');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        setLoading(true);
        const result = await register(name, email, password, role, referralCode);
        if (isMounted.current) setLoading(false);
        if (result) {
            if (result.verifyEmail) {
                setEmail(result.verifyEmail);
                setIsOtpMode(true);
                return;
            }
            if (result.user.role === 'instructor') navigate('/educator');
            else navigate('/');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await verifyOtp(email, otp);
        if (isMounted.current) setLoading(false);
        if (result) {
            const userRole = result.user.role;
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'instructor') navigate('/educator');
            else navigate('/');
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        await resendOtp(email);
        if (isMounted.current) setLoading(false);
    };

    const handleGoogleSuccess = async (response) => {
        setLoading(true);
        const result = await googleLogin(response.credential);
        if (isMounted.current) setLoading(false);
        if (result) {
            const userRole = result.user.role;
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'instructor') navigate('/educator');
            else navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans selection:bg-blue-500/30 px-4">
            {/* Dark background particles */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Container for the sliding UI */}
            <div className="w-full max-w-[900px] h-[640px] relative z-10 bg-[#121214] rounded-[2.5rem] shadow-2xl shadow-black/80 border border-white/5 overflow-hidden hidden md:flex">

                {/* Overlay (Sliding Part) */}
                <motion.div
                    initial={false}
                    animate={{ x: isRegisterMode ? '0%' : '100%' }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute top-0 bottom-0 w-1/2 h-full z-40 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center text-center p-12 text-white overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-white/20 blur-[80px] rounded-full" />
                        <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-black/20 blur-[80px] rounded-full" />
                    </div>

                    <div className="relative z-10">
                        <GraduationCap className="w-20 h-20 mb-8 mx-auto" />
                        <h2 className="text-4xl font-black mb-4 tracking-tight">
                            {isRegisterMode ? "Welcome Back!" : "New Here?"}
                        </h2>
                        <p className="text-white/80 text-lg mb-10 font-medium leading-relaxed">
                            {isRegisterMode
                                ? "To keep connected with us please login with your personal info"
                                : settings.public_registration === false && settings.instructor_registration === false
                                    ? "Registration is currently restricted to invited scholars only."
                                    : "Enter your personal details and start your journey with us"}
                        </p>
                        {(!isRegisterMode || (settings.public_registration !== false || settings.instructor_registration !== false)) && !isOtpMode && (
                            <button
                                onClick={() => setIsRegisterMode(!isRegisterMode)}
                                className="px-10 py-3.5 border-2 border-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all active:scale-[0.97] shadow-lg shadow-white/10"
                            >
                                {isRegisterMode ? "SIGN IN" : "SIGN UP"}
                            </button>
                        )}
                        {isOtpMode && (
                            <button
                                onClick={() => {setIsOtpMode(false); setIsRegisterMode(false);}}
                                className="px-10 py-3.5 border-2 border-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all active:scale-[0.97] shadow-lg shadow-white/10 uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="flex w-full h-full relative">
                    
                    {/* SignIn Form Area (Left) */}
                    <div className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-500 ${!isRegisterMode ? 'opacity-100 z-30 translate-x-0' : 'opacity-0 z-0 translate-x-12 pointer-events-none'}`}>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-white mb-2">{isOtpMode ? "Verify Email" : "Welcome Back"}</h2>
                            <p className="text-gray-400 text-sm font-medium">{isOtpMode ? "Complete authentication" : "Continue your learning progress"}</p>
                        </div>

                        {!isOtpMode && (
                            <>
                                <div className="flex justify-center gap-4 mb-6 min-h-[50px]">
                                    <GoogleLogin 
                                        onSuccess={handleGoogleSuccess} 
                                        onError={() => toast.error("Google Login Failed")}
                                        theme="filled_black" 
                                        shape="pill" 
                                        width={320} 
                                        text="signin_with" 
                                        use_fedcm_for_prompt={true}
                                        locale="en"
                                    />
                                </div>
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                    <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#121214] px-4 text-gray-500 font-bold tracking-widest italic">Or use email</span></div>
                                </div>
                            </>
                        )}

                        <AnimatePresence mode="wait">
                            {isOtpMode ? (
                                <motion.form 
                                    key="otp-signin"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    onSubmit={handleVerifyOtp} 
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-4">
                                        <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">6-digit passcode sent to <span className="text-blue-400">{email}</span></p>
                                    </div>
                                    <input
                                        type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)}
                                        placeholder="000000" required
                                        className="w-full bg-white/[0.05] border border-white/10 text-white text-center text-3xl tracking-[1rem] pl-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-black h-20 placeholder:text-gray-800"
                                    />
                                    <button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20">
                                        {loading ? <Loader2 className="animate-spin size-6 mx-auto" /> : "VERIFY IDENTITY"}
                                    </button>
                                    <div className="text-center pt-2">
                                        <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[10px] font-black text-gray-500 hover:text-blue-400 uppercase tracking-[0.2em]">Resend OTP</button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.form 
                                    key="login-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleLogin} className="space-y-6"
                                >
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email Address" required
                                            className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium h-14 placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password" required
                                            className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-12 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium h-14 placeholder:text-gray-600"
                                        />
                                        {password && (
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                                                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <Link to="/forgot-password" className="text-xs font-bold text-blue-500/80 hover:text-blue-400 uppercase tracking-widest">Forgot password?</Link>
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20">
                                        {loading ? <Loader2 className="animate-spin size-6" /> : <><span>SIGN IN</span><ChevronRight className="size-4" /></>}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SignUp Form Area (Right) */}
                    <div className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-500 ${isRegisterMode ? 'opacity-100 z-30 translate-x-0' : 'opacity-0 z-0 -translate-x-12 pointer-events-none'}`}>
                        {settings.public_registration === false && settings.instructor_registration === false ? (
                            <div className="text-center p-8 bg-blue-600/5 rounded-[2rem] border border-blue-500/20">
                                <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-white mb-4 italic">Access Governance Engaged</h3>
                                <p className="text-gray-400 font-medium leading-relaxed">Public registration is offline.</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-extrabold text-white mb-2">{isOtpMode ? "Verify Identity" : "Create Account"}</h2>
                                    <p className="text-gray-400 text-sm font-medium">{isOtpMode ? "Final step in onboarding" : "Join thousands of students"}</p>
                                </div>

                                {!isOtpMode && (
                                    <>
                                        <div className="flex justify-center gap-4 mb-6 min-h-[50px]">
                                            <GoogleLogin 
                                                onSuccess={handleGoogleSuccess} 
                                                onError={() => toast.error("Google Registration Failed")}
                                                theme="filled_black" shape="pill" width={320} text="signup_with" use_fedcm_for_prompt={true} locale="en"
                                            />
                                        </div>
                                        <div className="relative my-4">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#121214] px-4 text-gray-500 font-bold tracking-widest italic">Or use email</span></div>
                                        </div>
                                    </>
                                )}

                                <AnimatePresence mode="wait">
                                    {isOtpMode ? (
                                        <motion.form 
                                            key="otp-signup" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                                            onSubmit={handleVerifyOtp} className="space-y-6"
                                        >
                                            <div className="text-center mb-4"><ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-4" /></div>
                                            <input
                                                type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)}
                                                placeholder="000000" required
                                                className="w-full bg-white/[0.05] border border-white/10 text-white text-center text-3xl tracking-[1rem] pl-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-black h-20"
                                            />
                                            <button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20">
                                                {loading ? <Loader2 className="animate-spin size-6 mx-auto" /> : "VERIFY IDENTITY"}
                                            </button>
                                            <div className="text-center pt-2">
                                                <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[10px] font-black text-gray-500 hover:text-blue-400 uppercase tracking-[0.2em]">Resend OTP</button>
                                            </div>
                                        </motion.form>
                                    ) : (
                                        <motion.form 
                                            key="signup-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleRegister} className="space-y-4"
                                        >
                                            <div className="relative group">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500" />
                                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 h-12 placeholder:text-gray-600" />
                                            </div>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500" />
                                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-4 py-2.5 rounded-xl h-12 placeholder:text-gray-600" />
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-12 py-2.5 rounded-xl h-12" />
                                            </div>
                                            <div className="relative group">
                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm" required className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-12 py-2.5 rounded-xl h-12" />
                                            </div>
                                            {(settings.public_registration !== false || settings.instructor_registration !== false) && (
                                                <div className="flex gap-2 p-1.5 bg-white/[0.03] rounded-xl border border-white/10">
                                                    {settings.public_registration !== false && <button type="button" onClick={() => setRole('student')} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg ${role === 'student' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>STUDENT</button>}
                                                    {settings.instructor_registration !== false && <button type="button" onClick={() => setRole('instructor')} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg ${role === 'instructor' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>INSTRUCTOR</button>}
                                                </div>
                                            )}
                                            <button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20">
                                                {loading ? <Loader2 className="animate-spin size-5 mx-auto" /> : "CREATE ACCOUNT"}
                                            </button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile View - Standard Stack */}
            <div className="md:hidden w-full max-w-sm space-y-6 relative z-10">
                <div className="bg-[#121214] rounded-[2rem] p-8 border border-white/5">
                    <div className="text-center mb-10 mt-4">
                        <GraduationCap className="w-14 h-14 text-blue-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-white italic">{isOtpMode ? "Verify Email" : (isRegisterMode ? "Sign Up" : "Sign In")}</h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {isOtpMode ? (
                            <motion.form 
                                key="mobile-otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                onSubmit={handleVerifyOtp} className="space-y-6"
                            >
                                <div className="text-center"><ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-4" /><p className="text-gray-400 text-xs">A code was sent to {email}</p></div>
                                <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" className="w-full bg-white/[0.03] border border-white/5 text-white text-center text-3xl tracking-[1rem] py-6 rounded-2xl font-black" />
                                <button type="submit" disabled={loading} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold">{loading ? <Loader2 className="animate-spin size-6 mx-auto" /> : "VERIFY IDENTITY"}</button>
                                <div className="text-center"><button type="button" onClick={handleResendOtp} className="text-blue-500 font-bold text-xs">Resend OTP</button></div>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="mobile-auth" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4"
                            >
                                {isRegisterMode && <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 rounded-2xl" />}
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 rounded-2xl" />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 rounded-2xl" />
                                {isRegisterMode && <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 rounded-2xl" />}
                                <button type="submit" disabled={loading} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest">{loading ? <Loader2 className="animate-spin size-6 mx-auto" /> : (isRegisterMode ? "CREATE ACCOUNT" : "SIGN IN")}</button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {!isOtpMode && (
                        <div className="mt-8 text-center text-gray-500 text-sm font-medium">
                            {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{' '}
                            <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="text-white font-black hover:text-blue-400 underline underline-offset-4 px-1">{isRegisterMode ? "SignIn" : "SignUp"}</button>
                        </div>
                    )}
                    {isOtpMode && (
                        <div className="mt-8 text-center"><button onClick={() => setIsOtpMode(false)} className="text-gray-500 font-bold text-xs uppercase tracking-widest underline decoration-white/20 underline-offset-4">Change Email</button></div>
                    )}
                </div>
                {!isOtpMode && (
                    <div className="flex justify-center text-center min-h-[50px]">
                        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Auth Failed")} theme="filled_black" shape="pill" width={300} text={isRegisterMode ? "signup_with" : "signin_with"} use_fedcm_for_prompt={true} locale="en" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
