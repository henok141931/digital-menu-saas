import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        restaurantId: user.restaurantId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private/SUPER_ADMIN or ADMIN (Admins can only create waiters for their restaurant)
export const registerUser = async (req, res) => {
  try {
    const { username, password, role, restaurantId } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Role check logic can be added here if needed, but assuming tenantScope middleware handles basic checks.

    const user = await User.create({
      username,
      password,
      role,
      restaurantId,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      restaurantId: user.restaurantId,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
