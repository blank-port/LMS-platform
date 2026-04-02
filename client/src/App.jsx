import { useContext, useEffect } from 'react'
import { Route, Routes, useMatch, useNavigate } from 'react-router-dom'
import { AppContext } from './context/AppContextObject.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pusher from 'pusher-js';

// Student Imports
import Navbar from './components/student/Navbar'
import Home from './pages/student/Home'
import CourseDetails from './pages/student/CourseDetails'
import CoursesList from './pages/student/CoursesList'
import Login from './pages/student/Login'
import Register from './pages/student/Register'
import MyEnrollments from './pages/student/MyEnrollments'
import Player from './pages/student/Player'
import Loading from './components/student/Loading'
import StudentDashboard from './pages/student/StudentDashboard'
import QuizPage from './pages/student/QuizPage'
import StudentLayout from './components/student/StudentLayout'
import Assignments from './pages/student/Assignments'
import Wallet from './pages/student/Wallet'
import Support from './pages/student/Support'
import Certificates from './pages/student/Certificates'
import Profile from './pages/student/Profile'
import AccountSettings from './pages/student/AccountSettings'
import Leaderboard from './pages/student/Leaderboard'

// Educator Imports
// Educator Imports
import Educator from './pages/educator/Educator';
import Dashboard from './pages/educator/Dashboard';
import AddCourse from './pages/educator/AddCourse';
import MyCourses from './pages/educator/MyCourses';
import EnrolledStudents from './pages/educator/StudentsEnrolled';
import InstructorCommunication from './pages/educator/InstructorCommunication';
import InstructorQuestionBank from './pages/educator/InstructorQuestionBank';
import InstructorQuizReports from './pages/educator/InstructorQuizReports';
import CreateQuiz from './pages/educator/CreateQuiz';
import InstructorSettings from './pages/educator/InstructorSettings';
import InstructorMyPanel from './pages/educator/InstructorMyPanel';
import InstructorPayouts from './pages/educator/InstructorPayouts';
import InstructorRevenue from './pages/educator/InstructorRevenue';
import InstructorCourseStats from './pages/educator/InstructorCourseStats';
import InstructorQA from './pages/educator/InstructorQA';
import InstructorCourseSettings from './pages/educator/InstructorCourseSettings';
import InstructorQuestionGroup from './pages/educator/InstructorQuestionGroup';
import InstructorAddQuestion from './pages/educator/InstructorAddQuestion';
import InstructorQuestionImport from './pages/educator/InstructorQuestionImport';

// Admin Imports
import Admin from './pages/admin/Admin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageInstructors from './pages/admin/ManageInstructors';
import ManageStaff from './pages/admin/ManageStaff';
import ManageInstitutes from './pages/admin/ManageInstitutes';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageRoles from './pages/admin/ManageRoles';
import ManageDeleteRequests from './pages/admin/ManageDeleteRequests';
import ManageLevels from './pages/admin/ManageLevels';
import ManageSubjects from './pages/admin/ManageSubjects';
import AdminSettings from './pages/admin/AdminSettings';
import ManageCourseSettings from './pages/admin/ManageCourseSettings';
import ManageQuestionGroups from './pages/admin/ManageQuestionGroups';
import QuestionBank from './pages/admin/QuestionBank';
import AddQuestion from './pages/admin/AddQuestion';
import QuestionImport from './pages/admin/QuestionImport';
import ManageQuizSetup from './pages/admin/ManageQuizSetup';
import ManageQuizList from './pages/admin/ManageQuizList';
import ManageSubCategories from './pages/admin/ManageSubCategories';
import ManageQuizReports from './pages/admin/ManageQuizReports';
import ManageCertificates from './pages/admin/ManageCertificates';
import ManageCertificateFonts from './pages/admin/ManageCertificateFonts';
import ManageCertificateSettings from './pages/admin/ManageCertificateSettings';
import ManageFinancials from './pages/admin/ManageFinancials';
import InstructorRevenueReport from './pages/admin/InstructorRevenueReport';
import CourseStatsReport from './pages/admin/CourseStatsReport';
import ManageReviews from './pages/admin/ManageReviews';
import InstitutionReport from './pages/admin/InstitutionReport';
import UserPerformanceReport from './pages/admin/UserPerformanceReport';
import NewEnrollment from './pages/admin/NewEnrollment';
import ManageEnrollments from './pages/admin/ManageEnrollments';
import RefundSettings from './pages/admin/RefundSettings';
import ManageInstructorPayouts from './pages/admin/ManageInstructorPayouts';
import ManageECommerce from './pages/admin/ManageECommerce';
import ManagePayments from './pages/admin/ManagePayments';
import PayoutSettings from './pages/admin/PayoutSettings';
import ManageGamification from './pages/admin/ManageGamification';
import ManageBadges from './pages/admin/ManageBadges';
import GamificationHistory from './pages/admin/GamificationHistory';
import ManageCommunication from './pages/admin/ManageCommunication';
import ManageMessages from './pages/admin/ManageMessages';
import ManageQA from './pages/admin/ManageQA';
import ManageComments from './pages/admin/ManageComments';
import ManagePushNotifications from './pages/admin/ManagePushNotifications';
import CommunicationSettings from './pages/admin/settings/CommunicationSettings';
import ManageCoupons from './pages/admin/ManageCoupons';
import StudentDetails from './pages/admin/StudentDetails';
import AdminProfile from './pages/admin/AdminProfile';


// Administration Settings
import SystemSetting from './pages/admin/settings/SystemSetting';
import Activation from './pages/admin/settings/Activation';
import GeneralSetting from './pages/admin/settings/GeneralSetting';
import Commission from './pages/admin/settings/Commission';
import EmailSetup from './pages/admin/settings/EmailSetup';
import EmailTemplate from './pages/admin/settings/EmailTemplate';
import ApiSettings from './pages/admin/settings/ApiSettings';
import VimeoConfiguration from './pages/admin/settings/VimeoConfiguration';
import VdoCipherConfiguration from './pages/admin/settings/VdoCipherConfiguration';
import GDriveConfiguration from './pages/admin/settings/GDriveConfiguration';
import HomepageSeoSetup from './pages/admin/settings/HomepageSeoSetup';
import Language from './pages/admin/settings/Language';
import Currency from './pages/admin/settings/Currency';
import Timezone from './pages/admin/settings/Timezone';
import City from './pages/admin/settings/City';
import CacheSetting from './pages/admin/settings/CacheSetting';
import QueueSettings from './pages/admin/settings/QueueSettings';
import CronJob from './pages/admin/settings/CronJob';
import ReCaptcha from './pages/admin/settings/ReCaptcha';
import SocialLogin from './pages/admin/settings/SocialLogin';
import CookieGdprSetting from './pages/admin/settings/CookieGdprSetting';
import SmsSettings from './pages/admin/settings/SmsSettings';
import AnalyticsTool from './pages/admin/settings/AnalyticsTool';
import PusherSetting from './pages/admin/settings/PusherSetting';
import ModuleManager from './pages/admin/settings/ModuleManager';
import AboutUpdate from './pages/admin/settings/AboutUpdate';
import ManageCourses from './pages/admin/ManageCourses';
import ManageCategories from './pages/admin/ManageCategories';
import ManageCMS from './pages/admin/ManageCMS';
import ManageBlogs from './pages/admin/ManageBlogs';


const App = () => {
    const context = useContext(AppContext);
    const { settings, user } = context || {};
    const navigate = useNavigate();
    const isEducatorRoute = useMatch('/educator/*');
    const isAdminRoute = useMatch('/admin/*');

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
    if (!settings.pusher_app_key || !settings.pusher_active) return;
    
    const pusher = new Pusher(settings.pusher_app_key, {
      cluster: settings.pusher_cluster || 'ap2',
      forceTLS: true
    });

    // Strategy 1: Private Protocol (Direct Messages & Moderation)
    if (user && user._id) {
       const channel = pusher.subscribe(`user-${user._id}`);
       channel.bind('new-message', (data) => {
         toast.info(`Strategic Message from ${data.sender}: ${data.content}`, { 
           onClick: () => navigate('/student/messages'),
           position: "bottom-right",
           autoClose: 5000
         });
       });
       channel.bind('comment-status-update', (data) => {
         toast.success(`Discourse Protocol Calibrated: ${data.status.toUpperCase()}`, {
           position: "bottom-right"
         });
       });
    }

    // Strategy 2: Modular Protocol (Course Discussions)
    if (user && user.enrolledCourses?.length > 0) {
      user.enrolledCourses.forEach(id => {
        const courseChannel = pusher.subscribe(`course-${id}`);
        courseChannel.bind('new-discussion', (data) => {
            if (data.author !== user.name) {
                toast.info(`Scholar Interaction (${data.type}): ${data.author} posted in course node.`, {
                    position: "bottom-right"
                });
            }
        });
      });
    }

    return () => {
      pusher.disconnect();
    };
  }, [settings, user, navigate]);

  return (
    <div className="text-[var(--text-main)] min-h-screen bg-[var(--background)]">
      <ToastContainer />
      {!isEducatorRoute && !isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/loading/:path" element={<Loading />} />

        {/* Unified Student Panel Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="my-courses" element={<MyEnrollments />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="quizzes" element={<QuizPage />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="support" element={<Support />} />
          <Route path="profile" element={<Profile />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>

        {/* Legacy / Direct Routes for Compatibility */}
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/quiz/:courseId" element={<QuizPage />} />

        {/* Educator Routes */}
        <Route path='/educator' element={<Educator />}>
          <Route index element={<Dashboard />} />
          <Route path='add-course' element={<AddCourse />} />
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
        </Route>

        {/* Admin Routes */}
        <Route path='/admin' element={<Admin />}>
          <Route index element={<AdminDashboard />} />

          <Route path='users' element={<ManageUsers />} />
          <Route path='instructors' element={<ManageInstructors />} />
          <Route path='staff' element={<ManageStaff />} />
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
          <Route path='system-setting' element={<AdminSettings />} />

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
          <Route path='report-institution' element={<InstitutionReport />} />
          <Route path='report-performance' element={<UserPerformanceReport />} />
          <Route path='push-notifications' element={<ManagePushNotifications />} />

          <Route path='new-enroll' element={<NewEnrollment />} />
          <Route path='enrollments' element={<ManageEnrollments />} />
          <Route path='refunds' element={<ManageFinancials type="refunds" />} />
          <Route path='refund-settings' element={<RefundSettings />} />

          <Route path='referral' element={<ManageECommerce />} />
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
          <Route path='my-profile' element={<AdminProfile />} />

        </Route>
      </Routes>
    </div>
  )
}

export default App
