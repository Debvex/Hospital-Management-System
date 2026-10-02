import { Router } from 'express';
import * as controller from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(controller.list));
router.post('/', requireAuth, asyncHandler(controller.create));
router.patch('/:appointmentId', requireAuth, asyncHandler(controller.updateStatus));
router.post('/:appointmentId/cancel', requireAuth, asyncHandler(controller.cancel));
export default router;