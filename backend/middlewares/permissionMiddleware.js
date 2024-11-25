// middlewares/permissionMiddleware.js
const User = require('../models/User');
const Role = require('../models/Role');

const checkPermission = (permission) => async (req, res, next) => {
  try {
    const userId = req.user._id; // Assuming the user's ID is stored in req.user
    const user = await User.findById(userId).populate('roles');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if any of the user's roles have the required permission
    const hasPermission = user.roles.some(role => role.permissions.includes(permission));

    if (!hasPermission) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next(); // User has permission, proceed with the request
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { checkPermission };
