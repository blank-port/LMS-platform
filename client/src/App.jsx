import { useContext, useEffect, lazy, Suspense } from 'react'
import { Route, Routes, useMatch, useNavigate, Navigate, useParams } from 'react-router-dom'
import { AppContext } from './context/AppContextObject.jsx';
import { toast } from 'react-toastify';
import Pusher from 'pusher-js';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import ScrollBackground from './components/common/ScrollBackground.jsx';

// Student Imports
const Navbar = lazy(() => import('./components/student/Navbar'));
const Home = lazy(() => import('./pages/student/Home'));
const CourseDetails = lazy(() => import('./pages/student/CourseDetails'));
const CoursesList = lazy(() => import('./pages/student/CoursesList'));
const Login = lazy(() => import('./pages/student/Login'));
const Register = lazy(() => import('./pages/student/Register'));
const MyEnrollments = lazy(() => import('./pages/student/MyEnrollments'));
const Player = lazy(() => import('./pages/student/Player'));
import Loading from './components/student/Loading'
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const QuizPage = lazy(() => import('./pages/student/QuizPage'));
const StudentLayout = lazy(() => import('./components/student/StudentLayout'));
const Assignments = lazy(() => import('./pages/student/Assignments'));
const Wallet = lazy(() => import('./pages/student/Wallet'));
const Support = lazy(() => import('./pages/student/Support'));
const Certificates = lazy(() => import('./pages/student/Certificates'));
const Profile = lazy(() => import('./pages/student/Profile'));
const AccountSettings = lazy(() => import('./pages/student/AccountSettings'));
const Leaderboard = lazy(() => import('./pages/student/Leaderboard'));
const PurchaseHistory = lazy(() => import('./pages/student/PurchaseHistory'));
const RefundHistory = lazy(() => import('./pages/student/RefundHistory'));
const Referral = lazy(() => import('./pages/student/Referral'));
const RewardPoints = lazy(() => import('./pages/student/RewardPoints'));
const DeviceSecurity = lazy(() => import('./pages/student/DeviceSecurity'));
const StudentMessages = lazy(() => import('./pages/student/StudentMessages'));
const Wishlist = lazy(() => import('./pages/student/Wishlist'));
const ForgotPassword = lazy(() => import('./pages/student/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/student/ResetPassword'));
const RevisionVault = lazy(() => import('./pages/student/RevisionVault'));

// Educator Imports
const Instructor = lazy(() => import('./pages/educator/Instructor'));
const Dashboard = lazy(() => import('./pages/educator/Dashboard'));
const AddCourse = lazy(() => import('./pages/educator/AddCourse'));
const MyCourses = lazy(() => import('./pages/educator/MyCourses'));
const EnrolledStudents = lazy(() => import('./pages/educator/StudentsEnrolled'));
const InstructorCommunication = lazy(() => import('./pages/educator/InstructorCommunication'));
const InstructorQuestionBank = lazy(() => import('./pages/educator/InstructorQuestionBank'));
const InstructorQuizReports = lazy(() => import('./pages/educator/InstructorQuizReports'));
const CreateQuiz = lazy(() => import('./pages/educator/CreateQuiz'));
const InstructorSettings = lazy(() => import('./pages/educator/InstructorSettings'));
const InstructorMyPanel = lazy(() => import('./pages/educator/InstructorMyPanel'));
const InstructorPayouts = lazy(() => import('./pages/educator/InstructorPayouts'));
const InstructorRevenue = lazy(() => import('./pages/educator/InstructorRevenue'));
const InstructorCourseStats = lazy(() => import('./pages/educator/InstructorCourseStats'));
const InstructorQA = lazy(() => import('./pages/educator/InstructorQA'));
const InstructorCourseSettings = lazy(() => import('./pages/educator/InstructorCourseSettings'));
const InstructorQuestionGroup = lazy(() => import('./pages/educator/InstructorQuestionGroup'));
const InstructorAddQuestion = lazy(() => import('./pages/educator/InstructorAddQuestion'));
const InstructorQuestionImport = lazy(() => import('./pages/educator/InstructorQuestionImport'));
const ManageSubmissions = lazy(() => import('./pages/educator/ManageSubmissions'));
const LiveSessions = lazy(() => import('./pages/educator/LiveSessions'));
const ManageCohorts = lazy(() => import('./pages/educator/ManageCohorts'));
const InstructorBlogs = lazy(() => import('./pages/educator/InstructorBlogs'));
const EducatorAttendance = lazy(() => import('./pages/educator/EducatorAttendance'));
const ManageReferrals = lazy(() => import('./pages/admin/ManageReferrals'));
const CertificateVerification = lazy(() => import('./pages/common/CertificateVerification'));
const CohortDetails = lazy(() => import('./pages/student/CohortDetails'));
const LiveClassroom = lazy(() => import('./pages/common/LiveClassroom'));

// Admin Imports
const Admin = lazy(() => import('./pages/admin/Admin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageInstructors = lazy(() => import('./pages/admin/ManageInstructors'));
const ManageStaff = lazy(() => import('./pages/admin/ManageStaff'));
const ManageLiveClasses = lazy(() => import('./pages/admin/ManageLiveClasses'));
const ManageInstitutes = lazy(() => import('./pages/admin/ManageInstitutes'));
const ManageDepartments = lazy(() => import('./pages/admin/ManageDepartments'));
const ManageRoles = lazy(() => import('./pages/admin/ManageRoles'));
const ManageDeleteRequests = lazy(() => import('./pages/admin/ManageDeleteRequests'));
const ManageLevels = lazy(() => import('./pages/admin/ManageLevels'));
const ManageSubjects = lazy(() => import('./pages/admin/ManageSubjects'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const ManageCourseSettings = lazy(() => import('./pages/admin/ManageCourseSettings'));
const ManageQuestionGroups = lazy(() => import('./pages/admin/ManageQuestionGroups'));
const QuestionBank = lazy(() => import('./pages/admin/QuestionBank'));
const AddQuestion = lazy(() => import('./pages/admin/AddQuestion'));
const QuestionImport = lazy(() => import('./pages/admin/QuestionImport'));
const ManageQuizSetup = lazy(() => import('./pages/admin/ManageQuizSetup'));
const ManageQuizList = lazy(() => import('./pages/admin/ManageQuizList'));
const ManageSubCategories = lazy(() => import('./pages/admin/ManageSubCategories'));
const ManageQuizReports = lazy(() => import('./pages/admin/ManageQuizReports'));
const ManageCertificates = lazy(() => import('./pages/admin/ManageCertificates'));
const ManageCertificateFonts = lazy(() => import('./pages/admin/ManageCertificateFonts'));
const ManageCertificateSettings = lazy(() => import('./pages/admin/ManageCertificateSettings'));
const ManageFinancials = lazy(() => import('./pages/admin/ManageFinancials'));
const InstructorRevenueReport = lazy(() => import('./pages/admin/InstructorRevenueReport'));
const CourseStatsReport = lazy(() => import('./pages/admin/CourseStatsReport'));
const ManageReviews = lazy(() => import('./pages/admin/ManageReviews'));
const InstitutionReport = lazy(() => import('./pages/admin/InstitutionReport'));
const UserPerformanceReport = lazy(() => import('./pages/admin/UserPerformanceReport'));
const NewEnrollment = lazy(() => import('./pages/admin/NewEnrollment'));
const ManageEnrollments = lazy(() => import('./pages/admin/ManageEnrollments'));
const RefundSettings = lazy(() => import('./pages/admin/RefundSettings'));
const ManageInstructorPayouts = lazy(() => import('./pages/admin/ManageInstructorPayouts'));
const ManageECommerce = lazy(() => import('./pages/admin/ManageECommerce'));
const ManagePayments = lazy(() => import('./pages/admin/ManagePayments'));
const PayoutSettings = lazy(() => import('./pages/admin/PayoutSettings'));
const ManageGamification = lazy(() => import('./pages/admin/ManageGamification'));
const ManageBadges = lazy(() => import('./pages/admin/ManageBadges'));
const GamificationHistory = lazy(() => import('./pages/admin/GamificationHistory'));
const ManageCommunication = lazy(() => import('./pages/admin/ManageCommunication'));
const ManageMessages = lazy(() => import('./pages/admin/ManageMessages'));
const ManageQA = lazy(() => import('./pages/admin/ManageQA'));
const ManageComments = lazy(() => import('./pages/admin/ManageComments'));
const ManagePushNotifications = lazy(() => import('./pages/admin/ManagePushNotifications'));
const CommunicationSettings = lazy(() => import('./pages/admin/settings/CommunicationSettings'));
const ManageCoupons = lazy(() => import('./pages/admin/ManageCoupons'));
const StudentDetails = lazy(() => import('./pages/admin/StudentDetails'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const ManageCodOrders = lazy(() => import('./pages/admin/ManageCodOrders'));
const AdminSettingsHub = lazy(() => import('./pages/admin/AdminSettingsHub'));

// Administration Settings
const SystemSetting = lazy(() => import('./pages/admin/settings/SystemSetting'));
const Activation = lazy(() => import('./pages/admin/settings/Activation'));
const GeneralSetting = lazy(() => import('./pages/admin/settings/GeneralSetting'));
const Commission = lazy(() => import('./pages/admin/settings/Commission'));
const EmailSetup = lazy(() => import('./pages/admin/settings/EmailSetup'));
const EmailTemplate = lazy(() => import('./pages/admin/settings/EmailTemplate'));
const ApiSettings = lazy(() => import('./pages/admin/settings/ApiSettings'));
const VimeoConfiguration = lazy(() => import('./pages/admin/settings/VimeoConfiguration'));
const VdoCipherConfiguration = lazy(() => import('./pages/admin/settings/VdoCipherConfiguration'));
const GDriveConfiguration = lazy(() => import('./pages/admin/settings/GDriveConfiguration'));
const HomepageSeoSetup = lazy(() => import('./pages/admin/settings/HomepageSeoSetup'));
const HomepageBuilder = lazy(() => import('./pages/admin/settings/HomepageBuilder'));
const Language = lazy(() => import('./pages/admin/settings/Language'));
const Currency = lazy(() => import('./pages/admin/settings/Currency'));
const Timezone = lazy(() => import('./pages/admin/settings/Timezone'));
const City = lazy(() => import('./pages/admin/settings/City'));
const CacheSetting = lazy(() => import('./pages/admin/settings/CacheSetting'));
const QueueSettings = lazy(() => import('./pages/admin/settings/QueueSettings'));
const CronJob = lazy(() => import('./pages/admin/settings/CronJob'));
const ReCaptcha = lazy(() => import('./pages/admin/settings/ReCaptcha'));
const SocialLogin = lazy(() => import('./pages/admin/settings/SocialLogin'));
const CookieGdprSetting = lazy(() => import('./pages/admin/settings/CookieGdprSetting'));
const SmsSettings = lazy(() => import('./pages/admin/settings/SmsSettings'));
const AnalyticsTool = lazy(() => import('./pages/admin/settings/AnalyticsTool'));
const PusherSetting = lazy(() => import('./pages/admin/settings/PusherSetting'));
const ModuleManager = lazy(() => import('./pages/admin/settings/ModuleManager'));
const LiveKitSettings = lazy(() => import('./pages/admin/settings/LiveKitSettings'));
const AboutUpdate = lazy(() => import('./pages/admin/settings/AboutUpdate'));
const ManageCourses = lazy(() => import('./pages/admin/ManageCourses'));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories'));
const ManageCMS = lazy(() => import('./pages/admin/ManageCMS'));
const ManageBlogs = lazy(() => import('./pages/admin/ManageBlogs'));
const AIChatWidget = lazy(() => import('./components/common/AIChatWidget'));


const PlayerRedirect = () => {
  const { courseId } = useParams();
  return <Navigate to={`/student/player/${courseId}`} replace />;
};

const MockInterview = lazy(() => import('./components/student/MockInterview.jsx'));

const App = () => {
  const context = useContext(AppContext);
  const { settings, user } = context || {};
  const navigate = useNavigate();
  const isEducator = !!useMatch('/educator/*');
  const isAdmin = !!useMatch('/admin/*');

  useEffect(() => {
    if (settings?.site_title) {
      document.title = settings.site_title;
    }
    if (settings?.site_favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.site_favicon;
    }
  }, [settings?.site_title, settings?.site_favicon]);

  // Strategic Real-time Relay (Module 5: Notifications)
  useEffect(() => {
    if (!settings?.pusher_app_key || !settings?.pusher_active) return;
    if (!user?._id) return;

    let pusher;
    try {
      pusher = new Pusher(settings.pusher_app_key, {
        cluster: settings.pusher_cluster || 'ap2',
        forceTLS: true
      });

      // Strategy 1: Private Protocol (Direct Messages & Moderation)
      const channel = pusher.subscribe(`user-${user._id}`);
      channel.bind('new-message', (data) => {
        toast.info(`New message from ${data.sender}: ${data.content}`, {
          onClick: () => navigate('/student/messages'),
          position: "bottom-right",
          autoClose: 5000
        });
      });
      channel.bind('comment-status-update', (data) => {
        toast.success(`Comment status: ${data.status?.toUpperCase()}`, {
          position: "bottom-right"
        });
      });

      // Strategy 2: Modular Protocol (Course Discussions)
      if (Array.isArray(user.enrolledCourses) && user.enrolledCourses.length > 0) {
        user.enrolledCourses.forEach(id => {
          const courseChannel = pusher.subscribe(`course-${id}`);
          courseChannel.bind('new-discussion', (data) => {
            if (data.author !== user.name) {
              toast.info(`${data.author} posted in course discussion.`, {
                position: "bottom-right"
              });
            }
          });
        });
      }
    } catch (err) {
      console.warn('Pusher initialization skipped:', err.message);
    }

    return () => {
      if (pusher) pusher.disconnect();
    };
  }, [settings?.pusher_app_key, settings?.pusher_active, user?._id, navigate]);
  
  // Prism Security Shield: Enforce Mandatory Password Update
  useEffect(() => {
    if (user?.requiresPasswordChange && 
        window.location.pathname !== '/student/account-settings' && 
        window.location.pathname !== '/login' && 
        window.location.pathname !== '/register' &&
        !isAdmin && !isEducator) {
          
      toast.warning('Security Protocol: Please update your password to unlock full platform access.', {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        toastId: 'security-shield-warn'
      });
      navigate('/student/account-settings');
    }
  }, [user?.requiresPasswordChange, navigate, isAdmin, isEducator]);

    return (
    <div className="text-[var(--text-main)] min-h-screen">
      <ScrollBackground />
      {!isEducator && !isAdmin && <Navbar />}
      <Suspense fallback={<Loading />}><Routes>
        {/* Public Infrastructure Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/loading/:path" element={<Loading />} />

        {/* Unified Student Dashboard Protocol */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']} />}>
          <Route element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<Navigate to="/student" replace />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="my-courses" element={<MyEnrollments />} />
            <Route path="quizzes" element={<QuizPage />} />
            <Route path="revision" element={<RevisionVault />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="mock-interview/:courseId" element={<MockInterview />} />
            <Route path="player/:courseId" element={<Player />} />
            <Route path="purchase-history" element={<PurchaseHistory />} />
            <Route path="refunds" element={<RefundHistory />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="rewards" element={<RewardPoints />} />
            <Route path="referral" element={<Referral />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="messages" element={<StudentMessages />} />
            <Route path="support" element={<Support />} />
            <Route path="security" element={<DeviceSecurity />} />
            <Route path="profile" element={<Profile />} />
            <Route path="account-settings" element={<AccountSettings />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="cohort/:cohortId" element={<CohortDetails />} />
            <Route path="live-session/:sessionId" element={<LiveClassroom />} />
          </Route>
        </Route>

        {/* Legacy Route Redirection Layer (SEO & External Continuity) */}
        <Route path="/dashboard" element={<Navigate to="/student" replace />} />
        <Route path="/my-enrollments" element={<Navigate to="/student/my-courses" replace />} />
        <Route path="/player/:courseId" element={<PlayerRedirect />} />
        <Route path="/quiz/:courseId" element={<Navigate to="/student/quizzes" replace />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />

        {/* Educator Governance Suite */}
        <Route path='/educator' element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
          <Route element={<Instructor />}>
            <Route index element={<Dashboard />} />
            <Route path='add-course' element={<AddCourse />} />
            <Route path='edit-course/:id' element={<AddCourse />} />
            <Route path='my-courses' element={<MyCourses />} />
            <Route path='course-settings' element={<InstructorCourseSettings />} />

            <Route path='question-group' element={<InstructorQuestionGroup />} />
            <Route path='add-question' element={<InstructorAddQuestion />} />
            <Route path='question-bank' element={<InstructorQuestionBank />} />
            <Route path='question-import' element={<InstructorQuestionImport />} />
            <Route path='create-quiz' element={<CreateQuiz />} />

            <Route path='student-enrolled/:courseId' element={<EnrolledStudents />} />
            <Route path='students-enrolled' element={<EnrolledStudents />} />
            <Route path='communication' element={<InstructorCommunication />} />
            <Route path='quiz-reports' element={<InstructorQuizReports />} />
            <Route path='settings' element={<InstructorSettings />} />
            <Route path='my-panel' element={<InstructorMyPanel />} />
            <Route path='payouts' element={<InstructorPayouts />} />
            <Route path='revenue' element={<InstructorRevenue />} />
            <Route path='course-stats' element={<InstructorCourseStats />} />
            <Route path='qa' element={<InstructorQA />} />
            <Route path='manage-cohorts' element={<ManageCohorts />} />
            <Route path='live-sessions' element={<LiveSessions />} />
            <Route path='live-session/:sessionId' element={<LiveClassroom />} />
            <Route path='blogs' element={<InstructorBlogs />} />
            <Route path='attendance/:sessionId' element={<EducatorAttendance />} />
            <Route path='manage-submissions' element={<ManageSubmissions />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path='/admin' element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<Admin />}>
            <Route index element={<AdminDashboard />} />

            <Route path='users' element={<ManageUsers />} />
            <Route path='instructors' element={<ManageInstructors />} />
            <Route path='staff' element={<ManageStaff />} />
            <Route path='live-classes' element={<ManageLiveClasses />} />
            <Route path='institutes' element={<ManageInstitutes />} />
            <Route path='departments' element={<ManageDepartments />} />
            <Route path='roles' element={<ManageRoles />} />
            <Route path='delete-requests' element={<ManageDeleteRequests />} />
            <Route path='student-profile/:id' element={<StudentDetails />} />

            <Route path='courses' element={<ManageCourses />} />
            <Route path='categories' element={<ManageCategories />} />
            <Route path='sub-categories' element={<ManageSubCategories />} />
            <Route path='levels' element={<ManageLevels />} />
            <Route path='subjects' element={<ManageSubjects />} />
            <Route path='settings' element={<ManageCourseSettings />} />
            <Route path='settings-hub' element={<AdminSettingsHub />} />
            <Route path='razorpay-config' element={<AdminSettings />} />

            <Route path='question-group' element={<ManageQuestionGroups />} />
            <Route path='question-bank' element={<QuestionBank />} />
            <Route path='add-quiz' element={<ManageQuizSetup />} />
            <Route path='quiz-setup' element={<ManageQuizList />} />
            <Route path='quiz-reports' element={<ManageQuizReports />} />

            <Route path='certificates' element={<ManageCertificates />} />
            <Route path='add-certificate' element={<ManageCertificates />} />
            <Route path='certificate-fonts' element={<ManageCertificateFonts />} />
            <Route path='certificate-settings' element={<ManageCertificateSettings />} />

            <Route path='report-admin-revenue' element={<ManageFinancials type="revenue" />} />
            <Route path='report-instructor-revenue' element={<InstructorRevenueReport />} />
            <Route path='report-course-stats' element={<CourseStatsReport />} />
            <Route path='reviews' element={<ManageReviews />} />
            <Route path='manage-reviews' element={<Navigate to="/admin/reviews" replace />} />
            <Route path='report-institution' element={<InstitutionReport />} />
            <Route path='report-performance' element={<UserPerformanceReport />} />
            <Route path='push-notifications' element={<ManagePushNotifications />} />

            <Route path='new-enroll' element={<NewEnrollment />} />
            <Route path='enrollments' element={<ManageEnrollments />} />
            <Route path='refunds' element={<ManageFinancials type="refunds" />} />
            <Route path='refund-settings' element={<RefundSettings />} />

            <Route path='referral' element={<ManageECommerce />} />
            <Route path='referrals-ledger' element={<ManageReferrals />} />
            <Route path='cod-approvals' element={<ManageCodOrders />} />
            <Route path='payments' element={<ManagePayments title="Global Revenue Streams" method="all" />} />
            <Route path='payment-online' element={<ManagePayments title="Online Transaction Nexus" method="online" />} />
            <Route path='payment-offline' element={<ManagePayments title="Offline Fiscal Protocols" method="offline" />} />
            <Route path='payment-bank' element={<ManagePayments title="Bank Transfer Verification" method="bank" />} />
            <Route path='coupons' element={<ManageCoupons />} />
            <Route path='instructor-payouts' element={<ManageInstructorPayouts />} />
            <Route path='payout-settings' element={<PayoutSettings />} />


            <Route path='gamification' element={<ManageGamification />} />
            <Route path='badges' element={<ManageBadges />} />
            <Route path='gamification-history' element={<GamificationHistory />} />

            <Route path='communication' element={<ManageCommunication />} />
            <Route path='comm-settings' element={<CommunicationSettings />} />
            <Route path='messages' element={<ManageMessages />} />
            <Route path='comments' element={<ManageComments />} />
            <Route path='qa' element={<ManageQA />} />
            <Route path='cms' element={<ManageCMS />} />
            <Route path='blogs' element={<ManageBlogs />} />
            <Route path='add-question' element={<AddQuestion />} />
            <Route path='question-import' element={<QuestionImport />} />

            <Route path='system-setting' element={<SystemSetting />} />
            <Route path='activation' element={<Activation />} />
            <Route path='general-setting' element={<GeneralSetting />} />
            <Route path='commission' element={<Commission />} />
            <Route path='email-setup' element={<EmailSetup />} />
            <Route path='email-template' element={<EmailTemplate />} />
            <Route path='api-settings' element={<ApiSettings />} />
            <Route path='vimeo-config' element={<VimeoConfiguration />} />
            <Route path='vdocipher-config' element={<VdoCipherConfiguration />} />
            <Route path='gdrive-config' element={<GDriveConfiguration />} />
            <Route path='seo-setup' element={<HomepageSeoSetup />} />
            <Route path='homepage-builder' element={<HomepageBuilder />} />
            <Route path='language' element={<Language />} />
            <Route path='currency' element={<Currency />} />
            <Route path='timezone' element={<Timezone />} />
            <Route path='city' element={<City />} />
            <Route path='cache-setting' element={<CacheSetting />} />
            <Route path='queue-settings' element={<QueueSettings />} />
            <Route path='cron-job' element={<CronJob />} />
            <Route path='recaptcha' element={<ReCaptcha />} />
            <Route path='social-login' element={<SocialLogin />} />
            <Route path='cookie-gdpr' element={<CookieGdprSetting />} />
            <Route path='sms-settings' element={<SmsSettings />} />
            <Route path='analytics-tool' element={<AnalyticsTool />} />
            <Route path='pusher-setting' element={<PusherSetting />} />
            <Route path='module-manager' element={<ModuleManager />} />
            <Route path='about-update' element={<AboutUpdate />} />
            {/* Add LiveKit Settings Route */}
            <Route path='livekit-settings' element={<LiveKitSettings />} />
            <Route path='my-profile' element={<AdminProfile />} />

          </Route>
        </Route>
        {/* Public Verification Protocol */}
        <Route path='/verify-certificate/:certificateId' element={<CertificateVerification />} />
      </Routes></Suspense>
      <AIChatWidget />
    </div>
  )
}

export default App


