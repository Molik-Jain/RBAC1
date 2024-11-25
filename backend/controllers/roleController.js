const mongoose = require('mongoose');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const updateRolePermissions = async (req, res) => {
  const { id: roleId } = req.params; // Role ID from URL
  const { addPermissions, removePermissions } = req.body; // Arrays for additions and removals

  try {
    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }

    // Validate and find permissions for addition
    const permissionsToAdd = await Permission.find({
      $or: [
        { _id: { $in: addPermissions?.filter(id => mongoose.Types.ObjectId.isValid(id)) || [] } },
        { name: { $in: addPermissions?.filter(id => typeof id === 'string') || [] } }
      ]
    });

    // Validate and find permissions for removal
    const permissionsToRemove = await Permission.find({
      $or: [
        { _id: { $in: removePermissions?.filter(id => mongoose.Types.ObjectId.isValid(id)) || [] } },
        { name: { $in: removePermissions?.filter(id => typeof id === 'string') || [] } }
      ]
    });

    const permissionIdsToAdd = permissionsToAdd.map(permission => permission._id.toString());
    const permissionIdsToRemove = permissionsToRemove.map(permission => permission._id.toString());

    // Find the role by ID
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Convert existing permissions to strings for comparison
    const currentPermissions = role.permissions.map(id => id.toString());

    // Add new permissions (avoid duplicates)
    const updatedPermissions = [
      ...currentPermissions,
      ...permissionIdsToAdd.filter(id => !currentPermissions.includes(id)) // Only add new permissions
    ];

    // Remove specified permissions
    const finalPermissions = updatedPermissions.filter(
      id => !permissionIdsToRemove.includes(id) // Exclude permissions marked for removal
    );

    // Update role permissions
    role.permissions = [...new Set(finalPermissions)]; // Ensure no duplicates
    await role.save();

    res.json({ message: 'Permissions updated successfully', role });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { updateRolePermissions };
