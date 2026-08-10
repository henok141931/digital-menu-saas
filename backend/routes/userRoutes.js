import express from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes require authentication and Admin/SuperAdmin privileges
router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

// GET /api/users -> Get all users
router.get('/', getUsers);

// PUT /api/users/:id -> Update a user
router.put('/:id', updateUser);

// DELETE /api/users/:id -> Delete a user
router.delete('/:id', deleteUser);

export default router;
