import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as controller from '../controllers/authcontroller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const publicLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

router.post('/register', publicLimiter, asyncHandler(controller.register));
router.post('/login', loginLimiter, asyncHandler(controller.login));
router.post('/password-reset', publicLimiter, asyncHandler(controller.requestPasswordReset));
router.get('/me', requireAuth, asyncHandler(controller.currentUser));
router.post('/logout', requireAuth, asyncHandler(controller.logout));
router.get('/users', requireAuth, requireRole('administrator'), asyncHandler(controller.listUsers));

export default router;