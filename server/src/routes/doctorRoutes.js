import { Router } from 'express';
import * as controller from '../controllers/doctorController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(controller.list));
router.get('/:doctorId', requireAuth, asyncHandler(controller.getById));
export default router;