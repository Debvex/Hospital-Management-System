import { Router } from 'express';
import * as controller from '../controllers/billingcontroller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(controller.list));
router.post('/', requireAuth, requireRole('administrator', 'receptionist'), asyncHandler(controller.create));
router.patch('/:invoiceId/mark-paid', requireAuth, requireRole('administrator', 'receptionist'), asyncHandler(controller.markPaid));
export default router;