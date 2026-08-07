import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Enforce tenant scoping (for ADMIN and WAITER)
export const tenantScope = (req, res, next) => {
  // If SUPER_ADMIN, they can access anything
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Safely check for restaurantId in body, params, or query
  const reqRestaurantId = (req.body && req.body.restaurantId) || req.params.restaurantId || req.query.restaurantId;

  if (reqRestaurantId && reqRestaurantId.toString() !== req.user.restaurantId.toString()) {
    return res.status(403).json({
      message: 'Access denied: You can only access data for your assigned restaurant',
    });
  }

  // Also forcefully inject restaurantId into req.body if not present (to prevent admins creating items for null/other tenants)
  if (!req.body) {
    req.body = {};
  }
  if (!req.body.restaurantId) {
    req.body.restaurantId = req.user.restaurantId;
  }

  next();
};
