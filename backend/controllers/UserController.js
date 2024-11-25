const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

const updateUserRoles = async (req, res) => {
  const { userId } = req.params; // User ID from URL
  const { addRoles = [], removeRoles = [] } = req.body; // Default to empty arrays if not provided

  try {
    // Validate and sanitize userId
    if (!mongoose.Types.ObjectId.isValid(userId?.trim())) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    // Find the user by ID
    const user = await User.findById(userId.trim());
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate roles for addition
    const validAddRoles = [];
    for (const roleId of addRoles) {
      const trimmedRoleId = roleId.trim();
      if (mongoose.Types.ObjectId.isValid(trimmedRoleId)) {
        const roleExists = await Role.exists({ _id: trimmedRoleId });
        if (roleExists) {
          validAddRoles.push(trimmedRoleId);
        } else {
          return res.status(400).json({ message: `Role ID ${trimmedRoleId} does not exist` });
        }
      } else {
        return res.status(400).json({ message: `Invalid Role ID: ${trimmedRoleId}` });
      }
    }

    // Validate roles for removal
    const validRemoveRoles = [];
    for (const roleId of removeRoles) {
      const trimmedRoleId = roleId.trim();
      if (mongoose.Types.ObjectId.isValid(trimmedRoleId)) {
        const roleExists = await Role.exists({ _id: trimmedRoleId });
        if (roleExists) {
          validRemoveRoles.push(trimmedRoleId);
        } else {
          return res.status(400).json({ message: `Role ID ${trimmedRoleId} does not exist` });
        }
      } else {
        return res.status(400).json({ message: `Invalid Role ID: ${trimmedRoleId}` });
      }
    }

    // Check if `roles` is an array or single value
    const isArrayRoleField = Array.isArray(user.roles);

    // If the `roles` field is not an array, convert it for consistent handling
    let currentRoles = isArrayRoleField
      ? new Set(user.roles.map(roleId => roleId.toString()))
      : new Set([user.role?.toString()].filter(Boolean)); // Handle single role

    // Add roles dynamically
    validAddRoles.forEach(role => currentRoles.add(role));

    // Remove roles dynamically
    validRemoveRoles.forEach(role => currentRoles.delete(role));

    // Update user's roles
    const updatedRoles = Array.from(currentRoles);

    if (isArrayRoleField) {
      user.roles = updatedRoles;
    } else {
      user.role = updatedRoles.length > 0 ? updatedRoles[0] : null; // Handle single role
    }

    // If no roles left, change user status to 'Inactive'
    if (updatedRoles.length === 0) {
      user.status = 'Inactive';
    } else {
      // If roles exist, set status to 'Active'
      user.status = 'Active';
    }

    await user.save();

    res.json({ message: 'Roles updated successfully', user });
  } catch (error) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { updateUserRoles };
