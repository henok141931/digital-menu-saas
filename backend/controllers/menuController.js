import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import DietaryTag from '../models/DietaryTag.js';

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

// @desc    Get all categories, items, and dietary tags for a restaurant
// @route   GET /api/menu/:restaurantId
export const getFullMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const categories = await Category.find({ restaurantId, isActive: true }).sort({ sortOrder: 1 });
    const items = await MenuItem.find({ restaurantId, isAvailable: true }).sort({ sortOrder: 1 });
    const tags = await DietaryTag.find({ restaurantId });

    res.status(200).json({ categories, items, tags });
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

    if (req.user.role !== 'SUPER_ADMIN' && category.restaurantId.toString() !== req.user.restaurantId.toString()) {
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

    if (req.user.role !== 'SUPER_ADMIN' && item.restaurantId.toString() !== req.user.restaurantId.toString()) {
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

    if (req.user.role !== 'SUPER_ADMIN' && category.restaurantId.toString() !== req.user.restaurantId.toString()) {
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

    if (req.user.role !== 'SUPER_ADMIN' && item.restaurantId.toString() !== req.user.restaurantId.toString()) {
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

// @desc    Create a dietary tag
// @route   POST /api/menu/tags
export const createDietaryTag = async (req, res) => {
  try {
    const { name, restaurantId } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Tag name is required' });
    }

    const newTag = await DietaryTag.create({ name, restaurantId });
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete a dietary tag
// @route   DELETE /api/menu/tags/:id
export const deleteDietaryTag = async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: id };
    if (req.user.role !== 'SUPER_ADMIN') {
      query.restaurantId = req.user.restaurantId;
    }
    const tag = await DietaryTag.findOneAndDelete(query);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    const updateQuery = {};
    if (req.user.role !== 'SUPER_ADMIN') {
      updateQuery.restaurantId = req.user.restaurantId;
    }
    
    // Remove this tag string from all menu items in this restaurant
    await MenuItem.updateMany(
      updateQuery,
      { $pull: { dietaryTags: tag.name } }
    );

    res.status(200).json({ message: 'Tag removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Update a dietary tag
// @route   PUT /api/menu/tags/:id
export const updateDietaryTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const query = { _id: id };
    if (req.user.role !== 'SUPER_ADMIN') {
      query.restaurantId = req.user.restaurantId;
    }
    const tag = await DietaryTag.findOne(query);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    const oldName = tag.name;
    tag.name = name || tag.name;
    const updatedTag = await tag.save();

    if (oldName !== updatedTag.name) {
      const updateQuery = {};
      if (req.user.role !== 'SUPER_ADMIN') {
        updateQuery.restaurantId = req.user.restaurantId;
      }
      
      // Update this tag string in all menu items that used the old tag name
      await MenuItem.updateMany(
        updateQuery,
        { $set: { "dietaryTags.$[elem]": updatedTag.name } },
        { arrayFilters: [{ "elem": oldName }] }
      );
    }

    res.status(200).json(updatedTag);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Bulk upload menu items from CSV
// @route   POST /api/menu/bulk
export const bulkUploadMenu = async (req, res) => {
  try {
    const { items } = req.body;
    const restaurantId = req.user.restaurantId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for upload' });
    }

    let itemsCreated = 0;
    let categoriesCreated = 0;
    const errors = [];

    // Cache to prevent duplicate creations in the same loop
    const categoryCache = {};
    const tagCache = {};

    let index = 0;
    for (const rawRow of items) {
      // Normalize keys to lowercase to avoid case-sensitivity issues
      const row = Object.keys(rawRow).reduce((acc, key) => {
        acc[key.trim().toLowerCase()] = rawRow[key];
        return acc;
      }, {});
      
      const rowNum = index + 1; // 1-based index for humans
      index++;

      if (!row.category || !row.itemname) {
        errors.push(`Row ${rowNum}: Missing 'Category' or 'ItemName'`);
        continue; // Skip invalid rows
      }

      let categoryId;
      const categoryName = row.category.trim();

      // Check if we already created it in this loop
      if (categoryCache[categoryName]) {
        categoryId = categoryCache[categoryName];
      } else {
        // Find existing category in DB
        let category = await Category.findOne({ restaurantId, name: categoryName });
        
        if (!category) {
          category = await Category.create({
            restaurantId,
            name: categoryName,
            sortOrder: categoriesCreated // simple sort order
          });
          categoriesCreated++;
        }
        
        categoryId = category._id;
        categoryCache[categoryName] = categoryId;
      }

      // Parse price, default to 0 if invalid
      let parsedPrice = parseFloat(row.price);
      if (isNaN(parsedPrice)) parsedPrice = 0;

      // Parse dietary tags and auto-create them if missing
      let parsedTags = [];
      if (row.dietarytags) {
        const rawTags = row.dietarytags.split(',').map(tag => tag.trim()).filter(t => t);
        for (const tagName of rawTags) {
          if (!tagCache[tagName]) {
            let existingTag = await DietaryTag.findOne({ restaurantId, name: tagName });
            if (!existingTag) {
              await DietaryTag.create({ restaurantId, name: tagName });
            }
            tagCache[tagName] = true;
          }
          parsedTags.push(tagName);
        }
      }

      // Create item
      try {
        await MenuItem.create({
          restaurantId,
          categoryId,
          name: row.itemname.trim(),
          description: row.description ? row.description.trim() : '',
          price: parsedPrice,
          dietaryTags: parsedTags,
          sortOrder: itemsCreated,
          imageUrl: null
        });
        itemsCreated++;
      } catch (err) {
        errors.push(`Row ${rowNum}: Failed to create item '${row.itemname}' - ${err.message}`);
      }
    } // end for loop

    res.status(201).json({ 
      success: true,
      message: `Bulk upload processed. Created ${categoriesCreated} new categories and ${itemsCreated} items.`,
      categoriesCreated,
      itemsCreated,
      errors
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Bulk delete menu items
// @route   POST /api/menu/items/bulk-delete
export const bulkDeleteMenuItems = async (req, res) => {
  try {
    const { itemIds } = req.body;
    const restaurantId = req.user.restaurantId;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: 'No item IDs provided' });
    }

    const result = await MenuItem.deleteMany({
      _id: { $in: itemIds },
      restaurantId
    });

    res.status(200).json({ 
      message: `Successfully deleted ${result.deletedCount} items.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};