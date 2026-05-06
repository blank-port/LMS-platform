import { useContext, useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { AppContext } from '../../context/AppContextObject.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationBell from '../../components/admin/NotificationBell'
import { 
  Users, BookOpen, HelpCircle, Award, BarChart3, 
  ClipboardCheck, ShoppingCart, Layout, Trophy, 
  MessageSquare, Settings, ShieldCheck, HardDrive,
  Activity, Zap, LogOut, ChevronRight, Search, Menu, X,
  PlusCircle, Star, RadioTower
} from 'lucide-react'

const menuGroups = [
  {
    title: 'Users & Identity',
    icon: Users,
    items: [
      { path: '/admin/users', icon: Users, label: 'Students' },
      { path: '/admin/instructors', icon: Zap, label: 'Instructors' },
      { path: '/admin/staff', icon: ShieldCheck, label: 'Staff' },
      { path: '/admin/institutes', icon: HardDrive, label: 'Institutes' },
      { path: '/admin/departments', icon: Layout, label: 'Departments' },
      { path: '/admin/roles', icon: ShieldCheck, label: 'Roles' },
      { path: '/admin/delete-requests', icon: X, label: 'Delete Requests' },
    ]
  },
  {
    title: 'Course Management',
    icon: BookOpen,
    items: [
      { path: '/admin/courses', icon: BookOpen, label: 'Course Inventory' },
      { path: '/admin/categories', icon: Layout, label: 'Categories' },
      { path: '/admin/sub-categories', icon: Activity, label: 'Sub-Categories' },
      { path: '/admin/levels', icon: BarChart3, label: 'Difficulty Levels' },
      { path: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
      { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ]
  },
  {
    title: 'Assessment Lab',
    icon: HelpCircle,
    items: [
      { path: '/admin/question-group', icon: Layout, label: 'Question Groups' },
      { path: '/admin/question-bank', icon: HardDrive, label: 'Question Bank' },
      { path: '/admin/add-question', icon: PlusCircle, label: 'Add Question' },
      { path: '/admin/question-import', icon: Activity, label: 'Question Import' },
      { path: '/admin/add-quiz', icon: PlusCircle, label: 'Add Quiz' },
      { path: '/admin/quiz-setup', icon: Settings, label: 'Quiz Setup' },
      { path: '/admin/quiz-reports', icon: BarChart3, label: 'Quiz Reports' },
    ]
  },
  {
    title: 'Certification',
    icon: Award,
    items: [
      { path: '/admin/certificates', icon: Award, label: 'Certificates' },
      { path: '/admin/add-certificate', icon: PlusCircle, label: 'Add Certificate' },
      { path: '/admin/certificate-fonts', icon: Activity, label: 'Certificate Fonts' },
      { path: '/admin/certificate-settings', icon: Settings, label: 'Certificate Settings' },
    ]
  },
  {
    title: 'Live Operations',
    icon: RadioTower,
    items: [
      { path: '/admin/live-classes', icon: RadioTower, label: 'Live Classes' },
      { path: '/admin/push-notifications', icon: Zap, label: 'Notifications' },
    ]
  },
  {
    title: 'Platform Analytics',
    icon: BarChart3,
    items: [
      { path: '/admin/report-admin-revenue', icon: BarChart3, label: 'Admin Revenue' },
      { path: '/admin/report-instructor-revenue', icon: Zap, label: 'Instructor Revenue' },
      { path: '/admin/report-course-stats', icon: Activity, label: 'Course Statistics' },
      { path: '/admin/report-institution', icon: HardDrive, label: 'Institution Reports' },
      { path: '/admin/report-performance', icon: Zap, label: 'User Performance' },
    ]
  },
  {
    title: 'Financial Operations',
    icon: ShoppingCart,
    items: [
      { path: '/admin/referral', icon: Users, label: 'Referrals' },
      { path: '/admin/referrals-ledger', icon: HardDrive, label: 'Referrals Ledger' },
      { path: '/admin/payments', icon: ShoppingCart, label: 'Payments' },
      { path: '/admin/cod-approvals', icon: ShieldCheck, label: 'COD Approvals' },
      { path: '/admin/instructor-payouts', icon: Zap, label: 'Instructor Payouts' },
      { path: '/admin/coupons', icon: Activity, label: 'Coupons' },
    ]
  },
  {
    title: 'CMS & Content',
    icon: Layout,
    items: [
      { path: '/admin/cms', icon: Layout, label: 'CMS Manager' },
      { path: '/admin/homepage-builder', icon: Layout, label: 'Homepage Builder' },
      { path: '/admin/blogs', icon: MessageSquare, label: 'Blog Posts' },
    ]
  },
  {
    title: 'Gamification',
    icon: Trophy,
    items: [
      { path: '/admin/gamification', icon: Settings, label: 'Gamification Config' },
      { path: '/admin/badges', icon: Award, label: 'Badges' },
      { path: '/admin/gamification-history', icon: Activity, label: 'Activity History' },
    ]
  },
  {
    title: 'Moderation & Q&A',
    icon: MessageSquare,
    items: [
      { path: '/admin/communication', icon: Zap, label: 'Communication' },
      { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
      { path: '/admin/comments', icon: MessageSquare, label: 'Comments' },
      { path: '/admin/qa', icon: HelpCircle, label: 'Course Q&A' },
      { path: '/admin/reviews', icon: Star, label: 'Reviews' },
    ]
  },
  {
    title: 'Settings',
    icon: Settings,
    items: [
      { path: '/admin/settings-hub', icon: Layout, label: 'Admin Settings' },
    ]
  }
];

const Admin = () => {
  const { user, navigate, logout } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const location = useLocation();

  const toggleGroup = (title) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const toggleSubGroup = (title) => {
    setExpandedGroups(prev => ({
      ...prev,
      [`sub_${title}`]: !prev[`sub_${title}`]
    }));
  };

  useEffect(() => {
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.isSubGroup) {
          const hasActiveSubChild = item.children.some(child => location.pathname === child.path);
          if (hasActiveSubChild) {
            setExpandedGroups(prev => ({
              ...prev,
              [group.title]: true,
              [`sub_${item.label}`]: true
            }));
          }
        } else if (location.pathname === item.path) {
          setExpandedGroups(prev => ({ ...prev, [group.title]: true }));
        }
      });
    });
  }, [location.pathname]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] student-theme">
        <div className="text-center max-w-md p-12 glass-premium rounded-[3rem] shadow-2xl">
          <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ShieldCheck size={48} className="text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Access Denied</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-bold opacity-60">High-level administrative credentials are required to interface with the platform management system.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] hover:scale-105 transition-all duration-500 shadow-2xl shadow-emerald-900/20 uppercase tracking-[0.2em] text-[11px]"
          >
            Authenticate Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] admin-theme font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-slate-400/10 blur-[120px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 h-24 bg-white border-b border-slate-100 z-50 flex items-center justify-between px-10 shadow-sm">
        <div className="flex items-center gap-6">
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500">
               <ShieldCheck size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">PrismEd</span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Command Center</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <NotificationBell />
          <div className="h-10 w-[1px] bg-slate-200 mx-2" />
          <div className="flex items-center gap-4 bg-white/50 p-2 pr-6 rounded-2xl border border-white/50">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200 shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">{user.name}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Platform Admin</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-lg shadow-rose-500/10 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <div className="flex pt-24 min-h-screen">
        <aside className="w-96 bg-white/40 backdrop-blur-3xl border-r border-white/20 h-[calc(100vh-96px)] fixed top-24 left-0 bottom-0 z-40 overflow-y-auto custom-scrollbar p-8">
          <div className="space-y-6">
            {menuGroups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.title} className="space-y-4">
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className={`w-full flex items-center justify-between px-8 py-4 rounded-[1.2rem] transition-all duration-300 group ${expandedGroups[group.title] ? 'bg-white/80 text-slate-900 shadow-lg border border-white/50' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-2.5 rounded-xl transition-all duration-500 ${expandedGroups[group.title] ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/50 text-slate-400'}`}>
                          <Icon size={18} className={`transition-all duration-500 ${expandedGroups[group.title] ? 'scale-110' : 'group-hover:scale-110'}`} />
                      </div>
                      <span className="uppercase tracking-[0.25em] text-[10.5px] font-black">{group.title}</span>
                    </div>
                    <ChevronRight size={16} className={`transition-transform duration-500 opacity-40 ${expandedGroups[group.title] ? 'rotate-90 text-emerald-500 opacity-100' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {expandedGroups[group.title] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-2 mt-4"
                      >
                        {group.items.map((item) => (
                          <div key={item.label || item.path}>
                            {item.isSubGroup ? (
                              <div className="space-y-4">
                                <button
                                  onClick={() => toggleSubGroup(item.label)}
                                  className={`w-full flex items-center justify-between px-8 py-4 rounded-2xl transition-all duration-500 ${expandedGroups[`sub_${item.label}`] ? 'text-emerald-600 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                  <div className="flex items-center gap-5">
                                    <span className="uppercase text-[10.5px] font-black tracking-[0.2em]">{item.label}</span>
                                  </div>
                                  <ChevronRight size={14} className={`transition-transform duration-500 ${expandedGroups[`sub_${item.label}`] ? 'rotate-90' : ''}`} />
                                </button>

                                <AnimatePresence>
                                  {expandedGroups[`sub_${item.label}`] && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden space-y-3 mt-3"
                                    >
                                      {item.children.map((child) => (
                                        <NavLink key={child.path} to={child.path}
                                          className={({ isActive }) => `block px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isActive
                                            ? 'text-emerald-600 bg-emerald-500/10 shadow-sm'
                                            : 'text-slate-400 hover:text-emerald-500 hover:translate-x-2'}`}>
                                          <span className="truncate">{child.label}</span>
                                        </NavLink>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              <NavLink to={item.path}
                                className={({ isActive }) => `flex items-center gap-5 px-8 py-4 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isActive
                                  ? 'bg-emerald-500/10 text-emerald-600 shadow-inner'
                                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/30 hover:translate-x-2'}`}>
                                {({ isActive }) => (
                                  <>
                                    <item.icon size={18} className={`transition-all duration-500 ${isActive ? 'scale-110 opacity-100' : 'opacity-40'}`} />
                                    <span className="truncate leading-none">{item.label}</span>
                                  </>
                                )}
                              </NavLink>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 ml-96 p-12 min-h-[calc(100vh-96px)] overflow-x-hidden relative bg-white/20">
          <div className="absolute top-[-20%] right-[-20%] w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;


