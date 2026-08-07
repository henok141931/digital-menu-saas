import express from 'express';
import { submitFeedback, getFeedback } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to submit feedback
router.post('/', submitFeedback);

// Protected route for Admins to view feedback
router.get('/:restaurantId', protect, authorize('ADMIN', 'SUPER_ADMIN'), getFeedback);

export default router;
