import { Router } from 'express';
import * as adminController from '../controllers/admincontroller.js';
import * as controller from '../controllers/systemController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();
router.get('/dashboard/summary', requireAuth, requireRole('administrator', 'receptionist'), asyncHandler(controller.dashboard));
router.get('/audit-logs', requireAuth, requireRole('administrator'), asyncHandler(controller.auditLogs));
router.post('/admin/reset-demo', requireAuth, requireRole('administrator'), asyncHandler(controller.resetDemo));
router.get('/admin/registration-requests', requireAuth, requireRole('administrator'), asyncHandler(adminController.listRegistrationRequests));
router.patch('/admin/registration-requests/:requestId', requireAuth, requireRole('administrator'), asyncHandler(adminController.reviewRegistration));
router.get('/admin/users', requireAuth, requireRole('administrator'), asyncHandler(adminController.listStaff));
router.patch('/admin/users/:userId/active', requireAuth, requireRole('administrator'), asyncHandler(adminController.updateStaffStatus));
router.get('/admin/departments', requireAuth, requireRole('administrator'), asyncHandler(adminController.departments));
router.post('/admin/departments', requireAuth, requireRole('administrator'), asyncHandler(adminController.createDepartmentHandler));
router.patch('/admin/departments/:departmentId/active', requireAuth, requireRole('administrator'), asyncHandler(adminController.updateDepartmentStatus));
export default router;

