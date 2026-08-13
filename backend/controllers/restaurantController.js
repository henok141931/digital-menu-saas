import Restaurant from '../models/Restaurant.js';

// @desc    Create a new restaurant
// @route   POST /api/restaurants
export const createRestaurant = async (req, res) => {
  try {
    const { name, slug, description, currency } = req.body;

    // Check if a restaurant with this URL slug already exists
    const existingRestaurant = await Restaurant.findOne({ slug });
    if (existingRestaurant) {
      return res.status(400).json({ message: 'A restaurant with this URL slug already exists' });
    }

    // Create and save the new restaurant to MongoDB
    const restaurant = await Restaurant.create({
      name,
      slug,
      description,
      currency,
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get a restaurant by its URL slug (for the public digital menu)
// @route   GET /api/restaurants/:slug
export const getRestaurantBySlug = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { slug: req.params.slug, isActive: true },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Update restaurant settings
// @route   PUT /api/restaurants/:id
export const updateRestaurantSettings = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check authorization: Must be SUPER_ADMIN or the admin of this specific restaurant
    if (req.user.role !== 'SUPER_ADMIN' && id !== req.user.restaurantId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }

    // Build update object dynamically to only update provided fields
    const updateData = {};
    const allowedFields = ['brandColor', 'secondaryColor', 'coverImageUrl', 'paymentMethods', 'contactPhone', 'contactEmail', 'socialLinks', 'enableAmharic'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all restaurants (Super Admin only)
// @route   GET /api/restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete a restaurant and its associated data
// @route   DELETE /api/restaurants/:id
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete restaurants' });
    }

    const restaurant = await Restaurant.findByIdAndDelete(id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Cascade delete related entities
    await import('../models/User.js').then(m => m.default.deleteMany({ restaurantId: id }));
    await import('../models/Category.js').then(m => m.default.deleteMany({ restaurantId: id }));
    await import('../models/MenuItem.js').then(m => m.default.deleteMany({ restaurantId: id }));
    await import('../models/DietaryTag.js').then(m => m.default.deleteMany({ restaurantId: id }));
    await import('../models/Feedback.js').then(m => m.default.deleteMany({ restaurantId: id }));

    res.status(200).json({ message: 'Restaurant and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};