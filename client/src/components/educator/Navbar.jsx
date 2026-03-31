import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';

const Navbar = () => {
  const { user, logout, navigate } = useContext(AppContext);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-2xl border-b border-slate-100 z-50 flex items-center justify-between px-8 lg:px-14 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center transform group-hover:rotate-[15deg] transition-all duration-500 shadow-lg shadow-indigo-500/10">
            <span className="text-white font-black text-lg">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-950 tracking-tighter leading-none">PRISMED</span>
            <span className="text-[10px] font-bold text-indigo-500 tracking-[0.3em] uppercase leading-none mt-1">Educator Studio</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Instructor Active</span>
        </div>

        <div className="relative group">
          <button className="flex items-center gap-3 p-1.5 bg-white border border-slate-100 rounded-xl hover:border-indigo-500/30 transition-all shadow-sm group">
            <div className="w-9 h-9 bg-gradient-to-tr from-slate-950 to-slate-800 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-inner">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-lg" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start pr-2">
              <span className="text-xs font-bold text-slate-900 leading-none">{user?.name}</span>
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter mt-1">Educator</span>
            </div>
            <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-3 w-60 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] transform origin-top-right group-hover:translate-y-0 translate-y-2">
            <div className="p-4 border-b border-slate-50 bg-slate-50/30 rounded-t-2xl">
              <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="p-2">
              <button 
                onClick={() => navigate('/educator/settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-[11px] font-bold text-slate-600 hover:text-indigo-600 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                Account Settings
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-[11px] font-bold text-slate-600 hover:text-green-600 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                Student Panel
              </button>
              <div className="h-px bg-slate-50 my-2 mx-2"></div>
              <button 
                onClick={logout} 
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-[11px] font-bold text-slate-600 hover:text-rose-600 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center text-rose-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
