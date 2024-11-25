const Role = require('../models/Role'); // Import the Role model

// Middleware to authorize a user based on their role
const authorize = (...roles) => async (req, res, next) => {
  try {
    // Ensure req.user.role is present and is an ObjectId
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'User role not found in request' });
    }

    // Fetch the role from the Role model based on the user role ID
    const userRole = await Role.findById(req.user.role);
    
    // If no role found, return a 403 Forbidden error
    if (!userRole) {
      return res.status(403).json({ message: 'Role not found' });
    }

    // Check if the user's role matches one of the allowed roles
    if (!roles.includes(userRole.name)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error checking role:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authorize;
