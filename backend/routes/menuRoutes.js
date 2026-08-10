import express from 'express';
import {
  createCategory,
  createMenuItem,
  getFullMenu,
  deleteCategory,
  deleteMenuItem,
  updateCategory,
  updateMenuItem,
  bulkUploadMenu
} from '../controllers/menuController.js';
import { protect, authorize, tenantScope } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/menu/categories -> Adds a category (Admin only)
router.post('/categories', protect, authorize('SUPER_ADMIN', 'ADMIN'), tenantScope, createCategory);

// DELETE /api/menu/categories/:id -> Deletes a category (Admin only)
router.delete('/categories/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), deleteCategory);

// PUT /api/menu/categories/:id -> Updates a category (Admin only)
router.put('/categories/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), updateCategory);

// POST /api/menu/items -> Adds a menu item (Admin only)
router.post('/items', protect, authorize('SUPER_ADMIN', 'ADMIN'), tenantScope, createMenuItem);

// POST /api/menu/bulk -> Bulk uploads menu items (Admin only)
router.post('/bulk', protect, authorize('SUPER_ADMIN', 'ADMIN'), tenantScope, bulkUploadMenu);

// DELETE /api/menu/items/:id -> Deletes a menu item (Admin only)
router.delete('/items/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), deleteMenuItem);

// PUT /api/menu/items/:id -> Updates a menu item (Admin only)
router.put('/items/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), updateMenuItem);

// GET /api/menu/:restaurantId -> Fetches the full menu for a restaurant (Public)
router.get('/:restaurantId', getFullMenu);

export default router;