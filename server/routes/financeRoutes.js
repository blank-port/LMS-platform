import express from 'express';
import { 
    getAdminRevenue, studentRequestRefund, getStudentRefunds, awardBadge, getInstructorRevenue, 
    getPayments, getRefunds, debugPayments, getPayoutSettings, updatePayoutSettings,
    approveRefund, rejectRefund, getRefundSettings, updateRefundSettings
} from '../controllers/financeController.js';
import { 
    getCertificateTemplates, createCertificateTemplate, updateCertificateTemplate, deleteCertificateTemplate 
} from '../controllers/adminController.js';
import {
    getCertificateFonts, createCertificateFont, deleteCertificateFont,
    getCertificateSettings, updateCertificateSettings
} from '../controllers/certificateController.js';
import { adminAuth, studentAuth, instructorAuth } from '../middlewares/authMiddleware.js';

const financeRouter = express.Router();

// Certificate Governance (Standardized & Centralized)
financeRouter.post('/certificate-template', adminAuth, createCertificateTemplate);
financeRouter.get('/certificate-templates', instructorAuth, getCertificateTemplates);
financeRouter.put('/certificate-template/:id', adminAuth, updateCertificateTemplate);
financeRouter.delete('/certificate-template/:id', adminAuth, deleteCertificateTemplate);

financeRouter.get('/certificate-fonts', adminAuth, getCertificateFonts);
financeRouter.post('/certificate-font', adminAuth, createCertificateFont);
financeRouter.delete('/certificate-font/:id', adminAuth, deleteCertificateFont);

financeRouter.get('/certificate-settings', adminAuth, getCertificateSettings);
financeRouter.post('/certificate-settings', adminAuth, updateCertificateSettings);

// Fiscal Revenue & Reporting
financeRouter.get('/admin-revenue', adminAuth, getAdminRevenue);
financeRouter.get('/instructor-revenue/:id?', adminAuth, getInstructorRevenue);
financeRouter.get('/payments', adminAuth, getPayments);
financeRouter.get('/refunds', adminAuth, getRefunds);
financeRouter.get('/debug-payments', adminAuth, debugPayments);

// Refund Moderation
financeRouter.put('/refund/:id/approve', adminAuth, approveRefund);
financeRouter.put('/refund/:id/reject', adminAuth, rejectRefund);
financeRouter.get('/refund-settings', adminAuth, getRefundSettings);
financeRouter.post('/refund-settings', adminAuth, updateRefundSettings);

// Student Fiscal Actions
financeRouter.post('/request-refund', studentAuth, studentRequestRefund);
financeRouter.get('/my-refunds', studentAuth, getStudentRefunds);

// Gamification
financeRouter.post('/award-badge', adminAuth, awardBadge);

// Remuneration Policies
financeRouter.get('/payout-settings', adminAuth, getPayoutSettings);
financeRouter.post('/payout-settings-admin', adminAuth, updatePayoutSettings);

export default financeRouter;
