import express from 'express';
import { 
    createCertificateTemplate, getCertificateTemplates, getAdminRevenue, 
    studentRequestRefund, getStudentRefunds, awardBadge, getInstructorRevenue, getPayments, getRefunds,
    debugPayments, getPayoutSettings, updatePayoutSettings,
    approveRefund, rejectRefund,
    getRefundSettings, updateRefundSettings
} from '../controllers/financeController.js';
import { adminAuth, studentAuth } from '../middlewares/authMiddleware.js';

const financeRouter = express.Router();

financeRouter.post('/certificate-template', adminAuth, createCertificateTemplate);
financeRouter.get('/certificate-templates', adminAuth, getCertificateTemplates);
financeRouter.get('/admin-revenue', adminAuth, getAdminRevenue);
financeRouter.get('/instructor-revenue/:id?', adminAuth, getInstructorRevenue);
financeRouter.get('/payments', adminAuth, getPayments);
financeRouter.get('/refunds', adminAuth, getRefunds);
financeRouter.put('/refund/:id/approve', adminAuth, approveRefund);
financeRouter.put('/refund/:id/reject', adminAuth, rejectRefund);
financeRouter.get('/debug-payments', debugPayments);
financeRouter.post('/request-refund', studentAuth, studentRequestRefund);
financeRouter.get('/my-refunds', studentAuth, getStudentRefunds);
financeRouter.post('/award-badge', adminAuth, awardBadge);

financeRouter.get('/payout-settings', adminAuth, getPayoutSettings);
financeRouter.post('/payout-settings', adminAuth, updatePayoutSettings);

financeRouter.get('/refund-settings', adminAuth, getRefundSettings);
financeRouter.post('/refund-settings', adminAuth, updateRefundSettings);

export default financeRouter;
