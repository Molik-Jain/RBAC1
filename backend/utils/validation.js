const mongoose = require('mongoose');
const Role = require('../models/Role');

// Function to validate ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Function to validate user input fields
const validateUserInput = async (data) => {
    const errors = {};
    const { username, email, password, role, status } = data;
  
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      errors.username = 'Username is required and must be a valid string.';
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = 'Email is required and must be a valid email address.';
    }
  
    if (!password || password.length < 6) {
      errors.password = 'Password is required and must be at least 6 characters.';
    }
  
    if (!role || typeof role !== 'string') {
      errors.role = 'Role is required and must be a valid string.';
    } else {
      // Check if the role exists in the database by role name
      const foundRole = await Role.findOne({ name: role });
      if (!foundRole) {
        errors.role = 'Role does not exist.';
      }
    }
  
    if (!status || (status !== 'Active' && status !== 'Inactive')) {
      errors.status = 'Status must be either "active" or "inactive".';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };
  
  

module.exports = {
    isValidObjectId,
    validateUserInput,
};
