import { Router } from 'express';
import { asyncHandler } from '../lib/errors.js';
import * as controller from '../controllers/departmentcontroller.js';

const router = Router();
router.get('/', asyncHandler(controller.list));
export default router;