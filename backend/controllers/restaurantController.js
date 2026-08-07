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

// @desc    Update restaurant brand color
// @route   PUT /api/restaurants/:id/color
export const updateBrandColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { brandColor, secondaryColor, paymentMethods, contactPhone, contactEmail, socialLinks } = req.body;

    if (id !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { brandColor, secondaryColor, paymentMethods, contactPhone, contactEmail, socialLinks },
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