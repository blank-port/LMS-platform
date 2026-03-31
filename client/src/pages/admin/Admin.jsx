import React, { useContext, useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { AppContext } from '../../context/AppContextObject.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const Admin = () => {
  const { user, navigate, logout, settings, updateBatchSettings } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const location = useLocation();

  const toggleGroup = (title) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

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
        { path: '/admin/system-setting', icon: '⚙️', label: 'System Setting' },
        { path: '/admin/activation', icon: '🔑', label: 'Activation' },
        { path: '/admin/general-setting', icon: '🛠️', label: 'General Setting' },
        { path: '/admin/commission', icon: '💸', label: 'Commission' },
        { path: '/admin/email-setup', icon: '📧', label: 'Email Setup' },
        { path: '/admin/email-template', icon: '📝', label: 'Email Template' },
        { path: '/admin/payment-method', icon: '💳', label: 'Payment Method Setting' },
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
        { path: '/admin/payout-account', icon: '🏦', label: 'Payout Account' },
        { path: '/admin/cookie-gdpr', icon: '🍪', label: 'Cookie/GDPR Setting' },
        { path: '/admin/sms-settings', icon: '📱', label: 'Sms Settings' },
        { path: '/admin/analytics-tool', icon: '📊', label: 'Analytics Tool' },
        { path: '/admin/pusher-setting', icon: '🔔', label: 'Pusher Setting' },
        { path: '/admin/module-manager', icon: '🧩', label: 'Module Manager' },
        { path: '/admin/about-update', icon: '🔄', label: 'About & Update' },
      ]
    }
  ];

  // Auto-expand group if a child route is active
  useEffect(() => {
    menuGroups.forEach(group => {
      const hasActiveChild = group.items.some(item => location.pathname === item.path);
      if (hasActiveChild) {
        setExpandedGroups(prev => ({ ...prev, [group.title]: true }));
      }
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
    <div className="min-h-screen bg-[var(--background)]">
      {/* Executive Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500">
              <span className="text-white font-black text-lg">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[var(--text-main)] tracking-tighter leading-none">PRISMED</span>
              <span className="text-[10px] font-black text-purple-400 tracking-[0.3em] uppercase leading-none mt-1">Command Hub</span>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors md:flex hidden"
          >
            <div className="w-5 h-0.5 bg-gray-400 mb-1 transition-all"></div>
            <div className="w-3 h-0.5 bg-gray-400 mb-1 transition-all"></div>
            <div className="w-5 h-0.5 bg-gray-400 transition-all"></div>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="md:flex hidden flex-col items-end">
            <span className="text-sm font-black text-[var(--text-main)] leading-none">{user?.name}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Executive Administrator</span>
          </div>
          <div className="relative group">
            <div className="w-12 h-12 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <button
            onClick={logout}
            className="md:flex hidden px-5 py-2.5 bg-gray-800 hover:bg-red-900/20 text-gray-400 hover:text-red-400 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest"
          >
            Terminate Session
          </button>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Navigation Nexus */}
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-500 border-r border-[var(--border)] bg-[var(--surface)] h-[calc(100vh-80px)] sticky top-20 overflow-y-auto overflow-x-hidden no-scrollbar md:block hidden shrink-0`}>
          <div className="p-6 space-y-4">
            <NavLink to="/admin" end
              className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all duration-300 mb-6 ${isActive
                ? 'bg-indigo-600 text-white shadow-xl shadow-black/10/10'
                : 'text-gray-400 hover:bg-[var(--background)]'}`}>
              <span className="text-xl">📊</span>
              Strategic Overview
            </NavLink>

            {menuGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className={`w-full flex items-center justify-between px-5 py-3 rounded-xl text-sm font-black transition-all duration-300 ${expandedGroups[group.title] ? 'text-[var(--text-main)] bg-[var(--background)]/50' : 'text-gray-400 hover:text-[var(--text-main)] hover:bg-[var(--background)]/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{group.icon}</span>
                    <span className="uppercase tracking-[0.1em]">{group.title}</span>
                  </div>
                  <motion.span
                    animate={{ rotate: expandedGroups[group.title] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[10px]"
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
                      className="overflow-hidden pl-4 border-l-2 border-[var(--border)] ml-7 space-y-1"
                    >
                      {group.items.map((item) => (
                        <NavLink key={item.path} to={item.path}
                          className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${isActive
                            ? 'bg-purple-900/40 text-purple-300'
                            : 'text-gray-400 hover:bg-[var(--background)] hover:text-[var(--text-main)] hover:translate-x-1'}`}>
                          <span className="text-base opacity-70">{item.icon}</span>
                          <span className="tracking-tight">{item.label}</span>
                        </NavLink>
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

