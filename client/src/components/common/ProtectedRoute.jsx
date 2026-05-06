import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject';
import Loading from '../student/Loading';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, token } = useContext(AppContext);
    const location = useLocation();

    // If we have a token but no user yet, show loading
    if (token && !user) {
        return <Loading />;
    }

    // If no token or user, redirect to login
    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user exists but role not allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
                <div className="text-center max-w-md p-10 glass-morph rounded-[3rem] shadow-2xl border border-white/20">
                    <div className="w-24 h-24 bg-gradient-to-tr from-red-900 to-rose-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-500/10">
                        <span className="text-5xl">🛑</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 mb-4 tracking-tighter">Strategic Access Denied</h2>
                    <p className="text-slate-500 mb-10 leading-relaxed font-bold text-xs uppercase tracking-widest opacity-60">
                        Your identity credentials do not match the required authorization level for this sector.
                    </p>
                    <button 
                        onClick={() => window.history.back()} 
                        className="bg-slate-900 text-white w-full rounded-2xl h-16 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/10"
                    >
                        Retreat to Last Node
                    </button>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;


