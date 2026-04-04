import { useContext, useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { AppContext } from '../../context/AppContextObject.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationBell from '../../components/admin/NotificationBell'

const menuGroups = [
  {
    title: 'Users',
    icon: '👥',
    items: [
      { path: '/admin/users', icon: '🎓', label: 'Students' },
      { path: '/admin/instructors', icon: '👨‍🏫', label: 'Instructors' },
      { path: '/admin/staff', icon: '👔', label: 'Staff' },
      { path: '/admin/institutes', icon: '🏛️', label: 'Institutes' },
      { path: '/admin/departments', icon: '🏢', label: 'Departments' },
      { path: '/admin/roles', icon: '🔐', label: 'Role Management' },
      { path: '/admin/delete-requests', icon: '🗑️', label: 'Delete Requests' },
    ]
  },
  {
    title: 'Education',
    icon: '📚',
    items: [
      { path: '/admin/courses', icon: '📚', label: 'All Courses' },
      { path: '/admin/categories', icon: '🏷️', label: 'Category List' },
      { path: '/admin/sub-categories', icon: '🌿', label: 'Sub Category' },
      { path: '/admin/levels', icon: '📶', label: 'Course Levels' },
      { path: '/admin/subjects', icon: '📖', label: 'School Subjects' },
      { path: '/admin/settings', icon: '⚙️', label: 'Course Settings' },
    ]
  },
  {
    title: 'Quiz',
    icon: '📝',
    items: [
      { path: '/admin/question-group', icon: '📂', label: 'Question Group' },
      { path: '/admin/question-bank', icon: '🗄️', label: 'Question Bank' },
      { path: '/admin/add-question', icon: '➕', label: 'Add Question' },
      { path: '/admin/question-import', icon: '📥', label: 'Question Import' },
      { path: '/admin/add-quiz', icon: '📝', label: 'Add Quiz' },
      { path: '/admin/quiz-setup', icon: '🛠️', label: 'Quiz Setup' },
      { path: '/admin/quiz-reports', icon: '📊', label: 'Quiz Reports' },
    ]
  },
  {
    title: 'Certificates',
    icon: '📜',
    items: [
      { path: '/admin/certificates', icon: '📜', label: 'Certificate List' },
      { path: '/admin/add-certificate', icon: '🎨', label: 'Add Certificate' },
      { path: '/admin/certificate-fonts', icon: '🔤', label: 'Certificate Fonts' },
      { path: '/admin/certificate-settings', icon: '🔧', label: 'Certificate Settings' },
    ]
  },
  {
    title: 'Reports',
    icon: '📊',
    items: [
      { path: '/admin/report-admin-revenue', icon: '📈', label: 'Admin Revenue' },
      { path: '/admin/report-instructor-revenue', icon: '💰', label: 'Instructor Revenue' },
      { path: '/admin/report-course-stats', icon: '📉', label: 'Course Statistics' },
      { path: '/admin/report-institution', icon: '🏛️', label: 'Institution Reports' },
      { path: '/admin/report-performance', icon: '⚡', label: 'User Performance' },
    ]
  },
  {
    title: 'Enrollment',
    icon: '📋',
    items: [
      { path: '/admin/new-enroll', icon: '🖋️', label: 'New Enroll' },
      { path: '/admin/enrollments', icon: '📋', label: 'Enroll List' },
      { path: '/admin/refunds', icon: '🔄', label: 'Refund & Cancellation' },
      { path: '/admin/refund-settings', icon: '⚙️', label: 'Refund Settings' },
    ]
  },
  {
    title: 'E-Commerce',
    icon: '💳',
    items: [
      { path: '/admin/referral', icon: '🔗', label: 'Referral Settings' },
      { path: '/admin/payments', icon: '💳', label: 'Payments' },
      { path: '/admin/payment-online', icon: '🌐', label: 'Online Payment' },
      { path: '/admin/payment-offline', icon: '🤝', label: 'Offline Payment' },
      { path: '/admin/payment-bank', icon: '🏦', label: 'Bank Payment' },
      { path: '/admin/cod-approvals', icon: '✅', label: 'COD Approvals' },
      { path: '/admin/instructor-payouts', icon: '💸', label: 'Instructor Payout' },
      { path: '/admin/payout-settings', icon: '🏗️', label: 'Payout Settings' },
      { path: '/admin/coupons', icon: '🎟️', label: 'Coupons' },
    ]
  },
  {
    title: 'Content',
    icon: '📝',
    items: [
      { path: '/admin/cms', icon: '📄', label: 'Frontend CMS' },
      { path: '/admin/blogs', icon: '✍️', label: 'Blogs' },
    ]
  },
  {
    title: 'Gamification',
    icon: '🏆',
    items: [
      { path: '/admin/gamification', icon: '🏆', label: 'Settings' },
      { path: '/admin/badges', icon: '🏅', label: 'Badges' },
      { path: '/admin/gamification-history', icon: '📜', label: 'Badge History' },
    ]
  },
  {
    title: 'Communication',
    icon: '💬',
    items: [
      { path: '/admin/communication', icon: '💬', label: 'Strategic Nexus' },
      { path: '/admin/messages', icon: '✉️', label: 'Private Messages' },
      { path: '/admin/comments', icon: '🗨️', label: 'Comments' },
      { path: '/admin/qa', icon: '❓', label: 'Q&A Discussions' },
    ]
  },
  {
    title: 'Administration',
    icon: '⚙️',
    items: [
      { path: '/admin/push-notifications', icon: '🔔', label: 'Push Notifications' },
      {
        label: 'System Setting',
        icon: '⚙️',
        isSubGroup: true,
        children: [
          { path: '/admin/system-setting', icon: '⚙️', label: 'System Setting' },
          { path: '/admin/activation', icon: '🔑', label: 'Activation' },
          { path: '/admin/general-setting', icon: '🛠️', label: 'General Setting' },
          { path: '/admin/commission', icon: '💸', label: 'Commission' },
          { path: '/admin/email-setup', icon: '📧', label: 'Email Setup' },
          { path: '/admin/email-template', icon: '📝', label: 'Email Template' },
          { path: '/admin/api-settings', icon: '🔌', label: 'Api Settings' },
          { path: '/admin/vimeo-config', icon: '🎬', label: 'Vimeo Configuration' },
          { path: '/admin/vdocipher-config', icon: '🎥', label: 'VdoCipher Configuration' },
          { path: '/admin/gdrive-config', icon: '☁️', label: 'gDrive Configuration' },
          { path: '/admin/seo-setup', icon: '🔍', label: 'Homepage SEO Setup' },
          { path: '/admin/language', icon: '🌐', label: 'Language' },
          { path: '/admin/currency', icon: '💲', label: 'Currency' },
          { path: '/admin/timezone', icon: '🕒', label: 'Timezone' },
          { path: '/admin/city', icon: '🏙️', label: 'City' },
          { path: '/admin/cache-setting', icon: '🗄️', label: 'Cache Setting' },
          { path: '/admin/queue-settings', icon: '⏳', label: 'Queue Settings' },
          { path: '/admin/cron-job', icon: '🤖', label: 'Cron Job' },
          { path: '/admin/recaptcha', icon: '✅', label: 'reCaptcha' },
          { path: '/admin/social-login', icon: '👤', label: 'Social Login' },
          { path: '/admin/cookie-gdpr', icon: '🍪', label: 'Cookie/GDPR Setting' },
          { path: '/admin/sms-settings', icon: '📱', label: 'Sms Settings' },
          { path: '/admin/analytics-tool', icon: '📊', label: 'Analytics Tool' },
          { path: '/admin/pusher-setting', icon: '🔔', label: 'Pusher Setting' },
          { path: '/admin/module-manager', icon: '🧩', label: 'Module Manager' },
        ]
      }
    ]
  },
  {
    title: 'Account',
    icon: '👤',
    items: [
      { path: '/admin/my-profile', icon: '👤', label: 'My Profile' }
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

  // Auto-expand group if a child route is active
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
            })
            );
          }
        } else if (location.pathname === item.path) {
          setExpandedGroups(prev => ({ ...prev, [group.title]: true }));
        }
      });
    });
  }, [location.pathname]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center max-w-md p-10 bg-[var(--surface)] rounded-[2rem] shadow-2xl shadow-black/30 border border-[var(--border)]">
          <div className="w-20 h-20 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">Strategic Access Denied</h2>
          <p className="text-[var(--text-muted)] mb-8 leading-relaxed">High-level administrative credentials are required to access this Command Hub.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-600 transition-all duration-300 shadow-xl shadow-indigo-500/20"
          >
            Authenticate Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] admin-theme animate-fade-in">
      {/* Executive Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[var(--surface)]/70 backdrop-blur-2xl border-b border-[var(--border)] z-50 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-indigo-500/20">
              <span className="text-white font-black text-lg">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[var(--text-main)] tracking-tighter leading-none">PRISMED</span>
              <span className="text-[10px] font-black text-indigo-500 tracking-[0.3em] uppercase leading-none mt-1">Command Hub</span>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors md:flex hidden"
          >
            <div className="w-5 h-0.5 bg-slate-400 mb-1 transition-all"></div>
            <div className="w-3 h-0.5 bg-slate-400 mb-1 transition-all"></div>
            <div className="w-5 h-0.5 bg-slate-400 transition-all"></div>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <NotificationBell />
          <div className="md:flex hidden flex-col items-end">
            <span className="text-sm font-black text-[var(--text-main)] leading-none">{user?.name}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Executive Administrator</span>
          </div>
          <div className="relative group">
            <div className="w-12 h-12 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-black/10 group-hover:scale-105 transition-transform overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <button
            onClick={logout}
            className="md:flex hidden px-5 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest border border-slate-200"
          >
            Terminate Session
          </button>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Navigation Nexus */}
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-500 border-r border-[var(--border)] bg-[var(--surface)] h-[calc(100vh-80px)] sticky top-20 overflow-y-auto overflow-x-hidden no-scrollbar md:block hidden shrink-0 shadow-xl shadow-slate-200/50`}>
          <div className="p-6 space-y-4">
            <NavLink to="/admin" end
              className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all duration-300 mb-6 ${isActive
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>
              <span className="text-xl">📊</span>
              Strategic Overview
            </NavLink>

            {menuGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-black transition-all duration-300 ${expandedGroups[group.title] ? 'text-indigo-600 bg-indigo-50/50 shadow-sm border border-indigo-100/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl filter drop-shadow-sm">{group.icon}</span>
                    <span className="uppercase tracking-widest text-[11px]">{group.title}</span>
                  </div>
                  <motion.span
                    animate={{ rotate: expandedGroups[group.title] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[8px] opacity-40"
                  >
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence>
                  {expandedGroups[group.title] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden pl-4 border-l-2 border-slate-100 ml-8 my-2 space-y-1"
                    >
                      {group.items.map((item) => (
                        <div key={item.label || item.path}>
                          {item.isSubGroup ? (
                            <div className="space-y-1 mt-2">
                              <button
                                onClick={() => toggleSubGroup(item.label)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-black transition-all duration-300 ${expandedGroups[`sub_${item.label}`] ? 'text-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-indigo-500'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="opacity-70 text-sm">{item.icon}</span>
                                  <span className="tracking-tight uppercase text-[10px]">{item.label}</span>
                                </div>
                                <motion.span
                                  animate={{ rotate: expandedGroups[`sub_${item.label}`] ? 180 : 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="text-[6px] opacity-40"
                                >
                                  ▼
                                </motion.span>
                              </button>

                              <AnimatePresence>
                                {expandedGroups[`sub_${item.label}`] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden pl-4 border-l border-slate-100 ml-4 space-y-1"
                                  >
                                    {item.children.map((child) => (
                                      <NavLink key={child.path} to={child.path}
                                        className={({ isActive }) => `flex items-center gap-4 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300 ${isActive
                                          ? 'text-indigo-600 font-black bg-white shadow-sm border border-slate-100'
                                          : 'text-slate-400 hover:text-slate-700 hover:translate-x-1'}`}>
                                        <span className="text-sm opacity-50">{child.icon}</span>
                                        <span className="truncate">{child.label}</span>
                                      </NavLink>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <NavLink to={item.path}
                              className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}>
                              <span className="text-base filter drop-shadow-sm">{item.icon}</span>
                              <span className="tracking-tight">{item.label}</span>
                            </NavLink>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </aside>

        {/* Global Control Surface */}
        <main className="flex-1 p-8 min-h-[calc(100vh-80px)] overflow-x-hidden text-[var(--text-main)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
