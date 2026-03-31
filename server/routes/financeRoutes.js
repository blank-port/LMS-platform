import express from 'express';
import { 
    createCertificateTemplate, getCertificateTemplates, getAdminRevenue, 
    requestRefund, awardBadge, getInstructorRevenue, getPayments, getRefunds,
    debugPayments, getPayoutSettings, updatePayoutSettings
} from '../controllers/financeController.js';
import { adminAuth, studentAuth } from '../middlewares/authMiddleware.js';

const financeRouter = express.Router();

financeRouter.post('/certificate-template', adminAuth, createCertificateTemplate);
financeRouter.get('/certificate-templates', adminAuth, getCertificateTemplates);
financeRouter.get('/admin-revenue', adminAuth, getAdminRevenue);
financeRouter.get('/instructor-revenue/:id?', adminAuth, getInstructorRevenue);
financeRouter.get('/payments', adminAuth, getPayments);
financeRouter.get('/refunds', adminAuth, getRefunds);
financeRouter.get('/debug-payments', debugPayments);
financeRouter.post('/request-refund', studentAuth, requestRefund);
financeRouter.post('/award-badge', adminAuth, awardBadge);

financeRouter.get('/payout-settings', adminAuth, getPayoutSettings);
financeRouter.post('/payout-settings', adminAuth, updatePayoutSettings);

export default financeRouter;
