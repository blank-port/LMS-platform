import express from 'express';
import { createInstitute, getInstitutes, createDepartment, getDepartments, createRole, getRoles, assignUserToInstitute } from '../controllers/auditController.js';
import { adminAuth } from '../middlewares/authMiddleware.js';

const auditRouter = express.Router();

// Role-based protection should be added here
auditRouter.post('/institute/create', adminAuth, createInstitute);
auditRouter.get('/institute/all', adminAuth, getInstitutes);
auditRouter.post('/department/create', adminAuth, createDepartment);
auditRouter.get('/department/:instituteId', adminAuth, getDepartments);
auditRouter.post('/role/create', adminAuth, createRole);
auditRouter.get('/role/all', adminAuth, getRoles);
auditRouter.post('/institute/assign', adminAuth, assignUserToInstitute);

export default auditRouter;
