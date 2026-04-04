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
    const { login, register, googleLogin, navigate, user, settings } = useContext(AppContext);
    const location = useLocation();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    
    // Auth States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student');
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isMounted = React.useRef(true);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    // Sync mode with URL parameter if present
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('mode') === 'register') {
            setIsRegisterMode(true);
        }
    }, [location]);

    // Redirect if already logged in
    useEffect(() => {
        if (user && isMounted.current) {
            const userRole = user.role;
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'instructor') navigate('/educator');
            else navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        if (isMounted.current) setLoading(false);
        if (result) {
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
            if (result.user.role === 'instructor') navigate('/educator');
            else navigate('/');
        }
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
                    {/* Animated background shapes for the overlay */}
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
                        {(!isRegisterMode || (settings.public_registration !== false || settings.instructor_registration !== false)) && (
                            <button 
                                onClick={() => setIsRegisterMode(!isRegisterMode)}
                                className="px-10 py-3.5 border-2 border-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all active:scale-[0.97] shadow-lg shadow-white/10"
                            >
                                {isRegisterMode ? "SIGN IN" : "SIGN UP"}
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="flex w-full h-full">
                    {/* SignIn Form (Left) */}
                    <div className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-500 ${!isRegisterMode ? 'opacity-100 z-30 translate-x-0' : 'opacity-0 z-0 translate-x-12 pointer-events-none'}`}>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-white mb-2">Welcome Back</h2>
                            <p className="text-gray-400 text-sm font-medium">Continue your learning progress</p>
                        </div>

                        <div className="flex justify-center gap-4 mb-6">
                            <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="pill" width="320" text="signin_with" />
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#121214] px-4 text-gray-500 font-bold tracking-widest italic">Or use email</span></div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
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
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                    </button>
                                )}
                            </div>
                            
                            <div className="text-right">
                                <Link to="/forgot-password" placeholder="Forgot password?" className="text-xs font-bold text-blue-500/80 hover:text-blue-400 transition-colors uppercase tracking-widest">Forgot password?</Link>
                            </div>

                            <button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20">
                                {loading ? <Loader2 className="animate-spin size-6" /> : (
                                    <>
                                        <span>SIGN IN</span>
                                        <ChevronRight className="size-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* SignUp Form (Right) */}
                    <div className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-500 ${isRegisterMode ? 'opacity-100 z-30 translate-x-0' : 'opacity-0 z-0 -translate-x-12 pointer-events-none'}`}>
                        {settings.public_registration === false && settings.instructor_registration === false ? (
                            <div className="text-center p-8 bg-blue-600/5 rounded-[2rem] border border-blue-500/20">
                                <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-white mb-4 italic">Access Governance Engaged</h3>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    Public registration is currently offline by administrative order. Please contact the institution for institutional credentials.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-extrabold text-white mb-2">Create Account</h2>
                                    <p className="text-gray-400 text-sm font-medium">Join thousands of students learning online</p>
                                </div>
                                
                                <div className="flex justify-center gap-4 mb-6">
                                    <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="pill" width="100%" text="signup_with" />
                                </div>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                    <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#121214] px-4 text-gray-500 font-bold tracking-widest italic">Or use email</span></div>
                                </div>

                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input 
                                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                                            placeholder="Full Name" required
                                            className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium h-12 placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input 
                                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email Address" required
                                            className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium h-12 placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input 
                                            type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password" required
                                            className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-12 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium h-12 placeholder:text-gray-600"
                                        />
                                        {password && (
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm Password" required
                                            className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-12 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium h-12 placeholder:text-gray-600"
                                        />
                                        {confirmPassword && (
                                            <button 
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <Star className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input 
                                            type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)}
                                            placeholder="Referral Code (Optional)"
                                            className="w-full bg-white/[0.05] border border-white/10 text-white pl-11 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium h-12 placeholder:text-gray-600"
                                        />
                                    </div>
                                    
                                    <div className="flex gap-2 p-1.5 bg-white/[0.03] rounded-xl border border-white/10">
                                        {settings.public_registration !== false && (
                                            <button type="button" onClick={() => setRole('student')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${role === 'student' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}>STUDENT</button>
                                        )}
                                        {settings.instructor_registration !== false && (
                                            <button type="button" onClick={() => setRole('instructor')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${role === 'instructor' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}>INSTRUCTOR</button>
                                        )}
                                    </div>

                                    {(role === 'student' && settings.public_registration === false) || (role === 'instructor' && settings.instructor_registration === false) ? (
                                        <div className="text-[10px] font-bold text-blue-500 text-center uppercase tracking-widest mt-2">{role} Registration Offline</div>
                                    ) : (
                                        <button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20">
                                            {loading ? <Loader2 className="animate-spin size-5" /> : "CREATE ACCOUNT"}
                                        </button>
                                    )}
                                </form>
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
                        <h2 className="text-3xl font-black text-white italic">{isRegisterMode ? "Sign Up" : "Sign In"}</h2>
                    </div>
                    
                    <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
                        {isRegisterMode && (
                            <input 
                                type="text" value={name} onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name" required
                                className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 rounded-2xl outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                            />
                        )}
                        <input 
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email" required
                            className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 rounded-2xl outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                        />
                        <div className="relative group">
                            <input 
                                type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password" required
                                className="w-full bg-white/[0.03] border border-white/5 text-white pl-6 pr-14 py-4 rounded-2xl outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                            />
                            {password && (
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            )}
                        </div>
                        {isRegisterMode && (
                            <div className="relative group">
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password" required
                                    className="w-full bg-white/[0.03] border border-white/5 text-white pl-6 pr-14 py-4 rounded-2xl outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                />
                                {confirmPassword && (
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {isRegisterMode && (
                            <input 
                                type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)}
                                placeholder="Referral Code (Optional)"
                                className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 rounded-2xl outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                            />
                        )}
                        
                        {isRegisterMode && (
                            <div className="flex gap-2 p-1.5 bg-white/[0.02] rounded-xl border border-white/5">
                                <button type="button" onClick={() => setRole('student')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'student' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>STUDENT</button>
                                <button type="button" onClick={() => setRole('instructor')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'instructor' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>INSTRUCTOR</button>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all active:scale-[0.98]">
                            {loading ? <Loader2 className="animate-spin size-6 mx-auto" /> : (isRegisterMode ? "CREATE ACCOUNT" : "SIGN IN")}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-gray-500 text-sm font-medium">
                        {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{' '}
                        <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="text-white font-black hover:text-blue-400 underline underline-offset-4 transition-colors px-1">
                            {isRegisterMode ? "SignIn" : "SignUp"}
                        </button>
                    </div>
                </div>
                
                <div className="flex justify-center text-center">
                   <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="pill" width="300" />
                </div>
            </div>
        </div>
    );
};

export default Login;
