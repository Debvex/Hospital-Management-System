import { Router } from 'express';
import * as controller from '../controllers/medicalrecordcontroller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(controller.list));
router.post('/', requireAuth, requireRole('doctor'), asyncHandler(controller.create));
export default router;

