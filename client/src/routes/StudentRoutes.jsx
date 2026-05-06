import { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const Wishlist = lazy(() => import('../pages/student/Wishlist'));
const MyEnrollments = lazy(() => import('../pages/student/MyEnrollments'));
const QuizPage = lazy(() => import('../pages/student/QuizPage'));
const PurchaseHistory = lazy(() => import('../pages/student/PurchaseHistory'));
const RefundHistory = lazy(() => import('../pages/student/RefundHistory'));
const Wallet = lazy(() => import('../pages/student/Wallet'));
const RewardPoints = lazy(() => import('../pages/student/RewardPoints'));
const Referral = lazy(() => import('../pages/student/Referral'));
const Certificates = lazy(() => import('../pages/student/Certificates'));
const StudentMessages = lazy(() => import('../pages/student/StudentMessages'));
const Support = lazy(() => import('../pages/student/Support'));
const DeviceSecurity = lazy(() => import('../pages/student/DeviceSecurity'));
const Profile = lazy(() => import('../pages/student/Profile'));
const AccountSettings = lazy(() => import('../pages/student/AccountSettings'));
const Leaderboard = lazy(() => import('../pages/student/Leaderboard'));
const StudentLayout = lazy(() => import('../components/student/StudentLayout'));

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="my-courses" element={<MyEnrollments />} />
        <Route path="quizzes" element={<QuizPage />} />
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
      </Route>
      {/* Catch-all for sub-routes if needed */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default StudentRoutes;




