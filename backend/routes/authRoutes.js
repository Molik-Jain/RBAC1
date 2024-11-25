const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { comparePassword, generateToken } = require('../utils/utils');
const router = express.Router();

// Login Route (Authentication)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
    // console.log("***********************************************************")
  try {
    // Find user by email
    const user = await User.findOne({ email });
    // console.log("--------------------user------------",user)
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare entered password with stored hashed password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT Token
    // const token = jwt.sign(
    //   { id: user._id, role: user.role },
    //   process.env.JWT_SECRET, // Secret key stored in environment variables
    //   { expiresIn: '1h' } // Token expiration time
    // );
    const token = generateToken(user);

    // const token = jwt.sign(
    //     { userId: user._id, role: user.role }, // Make sure role is part of the token payload
    //     process.env.JWT_SECRET,
    //     { expiresIn: '1h' }
    //   );
      

    // Return the token
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
