import express from 'express';
import {
  createRestaurant,
  getRestaurantBySlug,
  updateRestaurantSettings,
  getAllRestaurants
} from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/restaurants -> Gets all restaurants (SUPER_ADMIN only)
router.get('/', protect, authorize('SUPER_ADMIN'), getAllRestaurants);

// POST /api/restaurants -> Creates a new restaurant (SUPER_ADMIN only)
router.post('/', protect, authorize('SUPER_ADMIN'), createRestaurant);

// GET /api/restaurants/:slug -> Fetches a restaurant by its slug
router.get('/:slug', getRestaurantBySlug);

// GET /api/restaurants/id/:id -> Fetches a restaurant by its ID
router.get('/id/:id', async (req, res) => {
  try {
    const restaurant = await import('../models/Restaurant.js').then(m => m.default.findById(req.params.id));
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/restaurants/:id -> Updates settings (Admin only)
router.put('/:id', protect, authorize('SUPER_ADMIN', 'ADMIN'), updateRestaurantSettings);

export default router;