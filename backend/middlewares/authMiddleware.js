const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if the user is authenticated
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied, no token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from the database and populate the role field if necessary
    const user = await User.findById(decoded.id).populate('role');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach the full user object to req.user
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;
