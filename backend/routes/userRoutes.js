const express = require('express');
const User = require('../models/User');
const authenticate = require('../middlewares/authMiddleware'); // Auth middleware
const authorize = require('../middlewares/roleMiddleware'); // Role-based authorization
const { hashPassword } = require('../utils/utils');
const { validateUserInput, isValidObjectId } = require('../utils/validation');
const Role = require('../models/Role');
const { updateUserRoles } = require('../controllers/UserController');

const router = express.Router();
module.exports = router;



router.patch('/:userId', authenticate, authorize('admin'), updateUserRoles); // Endpoint to assign roles


// Create a new user (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { username, email, password, role, status } = req.body;
    const { isValid, errors } = await validateUserInput(req.body);
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    // Find the role by its name (not string) to get the ObjectId
    const foundRole = await Role.findOne({ name: role });
    if (!foundRole) {
      return res.status(400).json({ message: 'Role does not exist' });
    }

    // Create user with hashed password and role ObjectId
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: foundRole._id,  // Store the ObjectId
      status,  // Add the status field
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Get all users (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().populate('role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (User or Admin)
router.get('/:id', authenticate, async (req, res) => {
  try {
 
    
    const user = await User.findById(req.params.id).populate('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.user.role !== 'admin' && req.user._id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user details (Admin or same user)
router.put('/:id', authenticate, async (req, res) => {
  const { username, email, password, role, status } = req.body;

  try {
    // Check if role is provided as a name (like 'admin')
    let roleId = role;
    if (role && typeof role === 'string') {
      // Find the role by name (or however roles are structured in your DB)
      const foundRole = await Role.findOne({ name: role });
      if (!foundRole) {
        return res.status(400).json({ message: 'Invalid role name' });
      }
      roleId = foundRole._id; // Use the ObjectId
    }

    const updatedFields = { username, email, role: roleId, status };
    if (password) {
      updatedFields.password = await hashPassword(password);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true }).populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role.name !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Delete user (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
