import Feedback from '../models/Feedback.js';

// @desc    Submit new feedback (Public)
// @route   POST /api/feedback
export const submitFeedback = async (req, res) => {
  try {
    const { restaurantId, rating, comment, customerName } = req.body;
    
    if (!restaurantId || !rating) {
      return res.status(400).json({ message: 'Restaurant ID and rating are required' });
    }

    const feedback = await Feedback.create({
      restaurantId,
      rating,
      comment,
      customerName: customerName || 'Anonymous',
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all feedback for a restaurant (Admin)
// @route   GET /api/feedback/:restaurantId
export const getFeedback = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Check if user is authorized for this restaurant
    if (restaurantId !== req.user.restaurantId.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this feedback' });
    }

    const feedbacks = await Feedback.find({ restaurantId }).sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
