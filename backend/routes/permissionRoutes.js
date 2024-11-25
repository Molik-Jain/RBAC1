const express = require('express');
const Permission = require('../models/Permission');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const router = express.Router();

// Create a new permission (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;

    // Create a new permission
    const permission = new Permission({
      name,
      description,
    });

    await permission.save();
    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all permissions (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get permission by ID (Admin only)
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    res.json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update permission (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;

    // Fetch the existing permission to retain any fields that are not being updated
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    // Update only the fields that have new values
    if (name) permission.name = name; // Only update if a new name is provided
    if (description) permission.description = description; // Only update if a new description is provided

    // Save the updated permission
    await permission.save();

    res.json(permission);
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete permission (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    res.json({ message: 'Permission deleted' });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
