const express = require('express');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const { hashPassword } = require('../utils/utils');
const User = require('../models/User');
const { updateRolePermissions } = require('../controllers/roleController');

const router = express.Router();

// Route to update permissions for a role
router.patch('/role/:id/permissions', authenticate, authorize('admin'), updateRolePermissions);

// Create a new user and assign a role (Admin only)
router.post('/create-user', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { username, email, password, roleId } = req.body; // `roleId` is the ObjectId of the role

    // Ensure the role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Hash password before saving
    const hashedPassword = await hashPassword(password);

    // Create the new user with the assigned role
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role._id, // Assigning the ObjectId of the role to the user
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;


// Create a new role (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, permissions } = req.body;

    // Convert permission names to ObjectIds
    const permissionDocs = await Permission.find({ name: { $in: permissions } });

    // Ensure all permissions exist
    if (permissionDocs.length !== permissions.length) {
      return res.status(400).json({ message: 'Some permissions not found' });
    }

    // Extract permission ObjectIds from the documents
    const permissionIds = permissionDocs.map(permission => permission._id);

    // Create the role with the permission ObjectIds
    const role = new Role({
      name,
      permissions: permissionIds
    });

    await role.save();
    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all roles (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get role by ID (Admin only)
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update role (Admin only)
router.put('/:roleId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { permissions } = req.body;

    // Fetch the permission documents based on permission names
    const permissionDocs = await Permission.find({ name: { $in: permissions } });
    console.log("per:", permissionDocs);

    // Ensure all permissions exist
    if (permissionDocs.length !== permissions.length) {
      return res.status(400).json({ message: 'Some permissions not found' });
    }

    // Fetch the current permissions of the role
    const currentRole = await Role.findById(req.params.roleId).populate('permissions');
    if (!currentRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check for duplicate permissions
    const duplicatePermissions = permissions.filter(permission => 
      currentRole.permissions.some(existingPermission => existingPermission.name === permission)
    );

    if (duplicatePermissions.length > 0) {
      return res.status(400).json({ message: `Permissions already exist: ${duplicatePermissions.join(', ')}` });
    }

    // Update the role with the new permission ObjectIds
    const role = await Role.findByIdAndUpdate(
      req.params.roleId,
      { permissions: [...currentRole.permissions.map(permission => permission._id), ...permissionDocs.map(permission => permission._id)] },
      { new: true }
    );

    res.status(200).json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Delete role (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
