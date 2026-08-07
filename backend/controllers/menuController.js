import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';

// @desc    Create a new category for a restaurant
// @route   POST /api/menu/categories
export const createCategory = async (req, res) => {
  try {
    const { restaurantId, name, sortOrder } = req.body;

    const category = await Category.create({
      restaurantId,
      name,
      sortOrder: sortOrder || 0,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu/items
export const createMenuItem = async (req, res) => {
  try {
    const { restaurantId, categoryId, name, description, price, imageUrl, sortOrder, dietaryTags } = req.body;

    const menuItem = await MenuItem.create({
      restaurantId,
      categoryId,
      name,
      description,
      price,
      imageUrl: imageUrl || null,
      sortOrder: sortOrder || 0,
      dietaryTags: dietaryTags || [],
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get full menu (categories + items) for a restaurant
// @route   GET /api/menu/:restaurantId
export const getFullMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const categories = await Category.find({ restaurantId, isActive: true }).sort({ sortOrder: 1 });
    const items = await MenuItem.find({ restaurantId, isAvailable: true }).sort({ sortOrder: 1 });

    res.status(200).json({ categories, items });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete a category (and its associated items)
// @route   DELETE /api/menu/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this category' });
    }

    await Category.findByIdAndDelete(id);
    await MenuItem.deleteMany({ categoryId: id }); // Cascading delete

    res.status(200).json({ message: 'Category and its items deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/items/:id
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (item.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await MenuItem.findByIdAndDelete(id);

    res.status(200).json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/menu/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sortOrder, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this category' });
    }

    category.name = name || category.name;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/items/:id
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, sortOrder, isAvailable, dietaryTags, categoryId } = req.body;

    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (item.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    item.name = name || item.name;
    if (description !== undefined) item.description = description;
    item.price = price || item.price;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (sortOrder !== undefined) item.sortOrder = sortOrder;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;
    if (dietaryTags !== undefined) item.dietaryTags = dietaryTags;
    if (categoryId !== undefined) item.categoryId = categoryId;

    const updatedItem = await item.save();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};