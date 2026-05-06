import { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';

const Footer = () => {
  const { settings } = useContext(AppContext);
  return (
    <footer className="bg-[var(--surface)] text-[var(--text-main)] pt-24 pb-12 w-full border-t border-[var(--border)]">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-[var(--border)]">

          {/* Brand Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              {settings.site_logo_footer ? (
                 <img src={settings.site_logo_footer} alt="Logo" className="h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-emerald-500/20 text-2xl font-black italic">
                  P
                </div>
              )}
              <span className="text-2xl font-black tracking-tighter">
                {settings.site_title ? (
                  <>
                     {settings.site_title.split(' ')[0]}<span className="text-[var(--primary)]">{settings.site_title.split(' ').slice(1).join(' ')}</span>
                  </>
                ) : (
                  <>Prism<span className="text-[var(--primary)]">Ed</span></>
                )}
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-sm font-medium leading-relaxed max-w-xs">
              Empowering learners around the globe with premium, industry-focused education and world-class expert mentorship.
            </p>
            <div className="flex gap-4 mt-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all cursor-pointer">
                <Facebook size={16} />
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all cursor-pointer">
                <Twitter size={16} />
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all cursor-pointer">
                <Instagram size={16} />
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all cursor-pointer">
                <Linkedin size={16} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-8">Platform</h4>
            <ul className="flex flex-col gap-4 text-sm font-bold text-[var(--text-muted)]">
              <li><a href="/" className="hover:text-[var(--text-main)] transition-colors">Home</a></li>
              <li><a href="/course-list" className="hover:text-[var(--text-main)] transition-colors">Courses Catalog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-8">Support</h4>
            <ul className="flex flex-col gap-4 text-sm font-bold text-[var(--text-muted)]">
              <li><a href="/about" className="hover:text-[var(--text-main)] transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact Support</a></li>
              <li><a href="/faq" className="hover:text-[var(--text-main)] transition-colors">FAQs</a></li>
              <li><a href="/terms" className="hover:text-[var(--text-main)] transition-colors">Privacy & Terms</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-8">Stay Updated</h4>
            <p className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest mb-6">Subscribe to our newsletter</p>
            <div className="flex gap-2">
              <input className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)]/40 text-[var(--text-main)]" type="email" placeholder="Email Address" />
              <button className="w-12 h-12 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

        </div>
        <div className="pt-12 text-center">
            <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                &copy; {new Date().getFullYear()} {settings.site_title || 'PrismEd'} &bull; All Intelligence Rights Reserved
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


