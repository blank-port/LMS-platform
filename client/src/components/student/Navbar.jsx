import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import SafeImage from '../common/SafeImage.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';

const Navbar = () => {
  const location = useLocation();
  const { user, isEducator, navigate, logout, settings } = useContext(AppContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[var(--surface)] dark:bg-[#0C132B]/95 text-[var(--text-main)] dark:text-white py-3 shadow-lg border-b border-[var(--border)] dark:border-white/5 backdrop-blur-md bg-opacity-95">
      {/* Top Bar (Optional but premium) */}
      <div className="hidden lg:block border-b border-[var(--border)] dark:border-white/5 py-1.5 px-24">
        <div className="container mx-auto flex justify-between text-[11px] font-medium text-[var(--text-muted)] dark:text-white/50 uppercase tracking-widest">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><span className="text-indigo-400">📞</span> +1 234 567 890</span>
            <span className="flex items-center gap-1.5"><span className="text-indigo-400">✉️</span> support@prismed.com</span>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-[var(--text-main)] dark:hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-[var(--text-main)] dark:hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between mt-2">
        {/* Logo & Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {settings.site_logo_header ? (
            <img src={settings.site_logo_header} alt="Logo" className="h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#7C32FF] to-[#6366F1] rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-lg shadow-indigo-500/20">
              <span className="text-2xl font-black italic">P</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-[var(--text-main)] via-[var(--text-main)] to-gray-400 dark:from-white dark:to-gray-400 bg-clip-text text-transparent leading-none">
              {settings.site_title ? (
                <>
                  {settings.site_title.split(' ')[0]}<span className="text-[#7C32FF]">{settings.site_title.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>Prism<span className="text-[#7C32FF]">Ed</span></>
              )}
            </span>
            <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-tighter mt-0.5">Shaping Skills</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10 font-medium">
          <Link to="/" className={`text-sm tracking-wide transition-all hover:text-[#7C32FF] ${location.pathname === '/' ? 'text-[#7C32FF]' : 'text-[var(--text-main)]/80 dark:text-white/80'}`}>Home</Link>
          {!settings.hide_search && (
            <Link to="/course-list" className={`text-sm tracking-wide transition-all hover:text-[#7C32FF] ${location.pathname.startsWith('/course-list') ? 'text-[#7C32FF]' : 'text-[var(--text-main)]/80 dark:text-white/80'}`}>Explore</Link>
          )}
          <Link to="/features" className="text-sm tracking-wide text-[var(--text-main)]/80 dark:text-white/80 transition-all hover:text-[#7C32FF]">Features</Link>
          {!settings.hide_ecommerce && (
            <Link to="/pricing" className="text-sm tracking-wide text-[var(--text-main)]/80 dark:text-white/80 transition-all hover:text-[#7C32FF]">Pricing</Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
                {isEducator && (
                  <button onClick={() => navigate('/educator')} className="hover:text-[#7C32FF] border-b-2 border-transparent hover:border-[#7C32FF] pb-1 transition-all">Teaching</button>
                )}
                {user.role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="text-indigo-400 border-b-2 border-transparent hover:border-indigo-400 pb-1 transition-all">Admin Panel</button>
                )}
                <Link to={user.role === 'admin' ? '/admin' : isEducator ? '/educator' : '/dashboard'} className="hover:text-[#7C32FF] border-b-2 border-transparent hover:border-[#7C32FF] pb-1 transition-all">Dashboard</Link>
              </div>

              {/* Notification Hub */}
              <NotificationDropdown />

              <div className="relative group">
                <button 
                  className="flex items-center gap-2 bg-white dark:bg-white/5 p-1 pr-3 rounded-full border border-gray-200 dark:border-white/10 hover:border-indigo-500/30 transition-all shadow-sm"
                >
                  {user.avatar ? (
                    <SafeImage src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] transform origin-top-right group-hover:translate-y-1">
                  <div className="p-4 border-b border-gray-100 dark:border-white/5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/student/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                      👤 My Profile
                    </Link>
                    <Link to="/student/account-settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                      ⚙️ Account Settings
                    </Link>
                    <hr className="my-2 border-gray-100 dark:border-white/5" />
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs text-rose-600 transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="hidden md:block text-sm font-bold uppercase tracking-widest hover:text-[#7C32FF] transition-colors text-[var(--text-main)] dark:text-white"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-[#7C32FF] hover:bg-[#6825E6] text-white px-7 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 bg-[var(--background)] dark:bg-white/5 rounded-xl flex items-center justify-center border border-[var(--border)] dark:border-white/10 text-[var(--text-main)] dark:text-white"
          >
            <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay (Basic) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[var(--surface)] dark:bg-[#0C132B] border-t border-[var(--border)] dark:border-white/5 p-6 animate-fadeInDown">
          <div className="flex flex-col gap-6 font-medium text-white/80">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/course-list" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            {user && (
              <>
                <Link to={user.role === 'admin' ? '/admin' : isEducator ? '/educator' : '/dashboard'} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left text-red-400">Sign Out</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
