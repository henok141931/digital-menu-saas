import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users (Super Admin gets all, Admin gets their restaurant's users)
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'ADMIN') {
      query.restaurantId = req.user.restaurantId;
    } else if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const users = await User.find(query)
      .select('-password')
      .populate('restaurantId', 'name slug')
      .sort({ createdAt: -1 });
      
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, restaurantId } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admins can only update users within their own restaurant
    if (req.user.role === 'ADMIN') {
      if (user.restaurantId.toString() !== req.user.restaurantId.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this user' });
      }
      // Admins cannot change someone to SUPER_ADMIN, and cannot change restaurantId
      if (role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Cannot elevate to SUPER_ADMIN' });
      }
    }

    // Update fields
    if (username) user.username = username;
    if (role) user.role = role;
    
    // Only SUPER_ADMIN can change a user's restaurant assignment
    if (restaurantId && req.user.role === 'SUPER_ADMIN') {
      user.restaurantId = restaurantId;
    }

    // Update password if provided
    if (password) {
      user.password = password; // The pre-save hook in the User model will hash it
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      role: updatedUser.role,
      restaurantId: updatedUser.restaurantId,
    });
  } catch (error) {
    // Check for duplicate username
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admins can only delete users within their own restaurant
    if (req.user.role === 'ADMIN') {
      if (user.restaurantId.toString() !== req.user.restaurantId.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this user' });
      }
    }
    
    // Prevent deleting oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
