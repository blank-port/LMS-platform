import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import SafeImage from '../common/SafeImage.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import { Phone, Mail, Heart, Layout, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { user, isEducator, navigate, logout, settings } = useContext(AppContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav
      className={`sticky top-0 z-50 border-b py-2 text-[var(--text-main)] bg-white transition-all duration-300 ${isHome && !isScrolled
        ? 'border-white/20 shadow-none'
        : 'border-[var(--border)] shadow-lg'
        }`}
    >
      <div className="hidden border-b border-[var(--border)]/70 lg:block">
        <div className="container mx-auto flex justify-between px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)] md:px-12 lg:px-24">
          <div className="flex gap-6">
            <span className="flex items-center gap-2 font-bold"><Phone size={12} className="text-[var(--primary)]" /> +1 234 567 890</span>
            <span className="flex items-center gap-2 font-bold"><Mail size={12} className="text-[var(--primary)]" /> support@prismed.com</span>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="transition-colors hover:text-[var(--text-main)]">About Us</Link>
            <Link to="/contact" className="transition-colors hover:text-[var(--text-main)]">Contact</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-1 flex items-center justify-between px-6 md:px-12 lg:px-24">
        <div onClick={() => navigate('/')} className="group flex cursor-pointer items-center gap-3">
          {settings.site_logo_header ? (
            <img src={settings.site_logo_header} alt="Logo" className="h-10 object-contain" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-2xl font-black italic text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:rotate-0 rotate-3">
              P
            </div>
          )}
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-[var(--text-main)] via-[var(--text-main)] to-slate-400 bg-clip-text text-xl font-extrabold tracking-tighter text-transparent md:text-2xl leading-none">
              {settings.site_title ? (
                <>
                  {settings.site_title.split(' ')[0]}
                  <span className="text-[var(--primary)]">{settings.site_title.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>Prism<span className="text-[var(--primary)]">Ed</span></>
              )}
            </span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-tight text-[var(--primary)]/80">Shaping Skills</span>
          </div>
        </div>

        <div className="hidden items-center gap-10 lg:flex">
          <Link to="/" className={`text-sm font-semibold transition-all hover:text-[var(--primary)] ${location.pathname === '/' ? 'text-[var(--primary)]' : 'text-[var(--text-main)]/80'}`}>Home</Link>
          {!settings.hide_search && (
            <Link to="/course-list" className={`text-sm font-semibold transition-all hover:text-[var(--primary)] ${location.pathname.startsWith('/course-list') ? 'text-[var(--primary)]' : 'text-[var(--text-main)]/80'}`}>Explore</Link>
          )}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {user ? (
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden items-center gap-5 text-xs font-bold uppercase tracking-[0.2em] md:flex">
                {isEducator && (
                  <button onClick={() => navigate('/educator')} className="border-b-2 border-transparent pb-1 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]">Teaching</button>
                )}
                {user.role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="border-b-2 border-transparent pb-1 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]">Admin</button>
                )}
                <Link to={user.role === 'admin' ? '/admin' : isEducator ? '/educator' : '/student'} className="border-b-2 border-transparent pb-1 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]">Dashboard</Link>
              </div>

              {user.role !== 'admin' && (
                <Link to="/student/wishlist" className="relative rounded-xl p-2 transition-all hover:bg-rose-500/10" title="View Wishlist">
                  <Heart className="w-5 h-5 text-rose-500" />
                  {user.wishlist?.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-rose-500 text-[8px] font-black text-white shadow-lg">
                      {user.wishlist.length}
                    </span>
                  )}
                </Link>
              )}

              <NotificationDropdown />

              <div className="group relative">
                <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pr-3 shadow-sm transition-all hover:border-emerald-500/30">
                  {user.avatar ? (
                    <SafeImage src={user.avatar} alt="Profile" className="h-8 w-8 rounded-full object-cover border border-gray-100" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden text-xs font-semibold text-gray-700 sm:block">{user.name.split(' ')[0]}</span>
                </button>

                <div className="invisible absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xl opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100 z-[100]">
                  <div className="border-b border-gray-100 p-4">
                    <p className="truncate text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="truncate text-[10px] text-gray-500">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/student/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-[var(--primary)]">
                      My Profile
                    </Link>
                    <Link to="/student/account-settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-[var(--primary)]">
                      Account Settings
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-rose-600 transition-colors hover:bg-rose-50">
                      <LogOut size={14} />
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
                className="hidden text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-main)] transition-colors hover:text-[var(--primary)] md:block"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-xl bg-[var(--primary)] px-7 py-2.5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-[var(--primary-hover)] active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-main)] lg:hidden"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full w-full border-t border-[var(--border)] bg-[var(--surface)] p-6 lg:hidden">
          <div className="flex flex-col gap-6 font-medium text-[var(--text-main)]/80">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/course-list" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            {user && (
              <>
                <Link to={user.role === 'admin' ? '/admin' : isEducator ? '/educator' : '/student'} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left flex items-center gap-2 text-rose-500">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


