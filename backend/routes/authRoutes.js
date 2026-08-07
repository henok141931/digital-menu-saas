import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import { protect, authorize, tenantScope } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);

// Only admins and super admins can register new users (like waiters)
router.post('/register', protect, authorize('SUPER_ADMIN', 'ADMIN'), tenantScope, registerUser);

export default router;
