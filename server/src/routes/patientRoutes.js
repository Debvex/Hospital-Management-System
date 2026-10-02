import { Router } from 'express';
import * as controller from '../controllers/patientcontroller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(controller.list));
router.get('/:patientId', requireAuth, asyncHandler(controller.getById));
router.post('/', requireAuth, requireRole('administrator', 'receptionist'), asyncHandler(controller.create));
router.patch('/:patientId', requireAuth, asyncHandler(controller.update));
export default router;

