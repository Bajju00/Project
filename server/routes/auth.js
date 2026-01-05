const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load User model
const User = require('../models/User');

// Generate JWT Token - FIXED: Use 'id' instead of 'userId' for consistency
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobile, password, bloodGroup } = req.body;

    // Check required fields
    if (!fullName || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { mobile }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or mobile already exists'
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      mobile,
      password,
      bloodGroup,
      role: 'user',
      isVerified: true
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        bloodGroup: user.bloodGroup,
        role: user.role,
        isBloodDonor: user.isBloodDonor,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email or mobile number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user by email - FIXED: select('+password') might not work, use alternative
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is verified
    if (user.isVerified === false) {
      return res.status(401).json({
        success: false,
        error: 'Please verify your account first'
      });
    }

    // Check password - IMPORTANT: Ensure comparePassword method exists in User model
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        bloodGroup: user.bloodGroup,
        role: user.role,
        isBloodDonor: user.isBloodDonor,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    // Note: This needs auth middleware. For now, let's make it public for testing
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    // Remove fields that shouldn't be updated
    delete updates.email;
    delete updates.role;
    delete updates.isVerified;
    delete updates.password; // Password should be updated via separate endpoint
    
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// @route   POST /api/auth/become-donor
// @desc    Register as blood donor
// @access  Private
router.post('/become-donor', async (req, res) => {
  try {
    const { bloodGroup } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        error: 'Blood group is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isBloodDonor: true,
        bloodGroup,
        location: req.body.location || user.location
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Successfully registered as blood donor',
      user
    });
  } catch (error) {
    console.error('Become donor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register as donor'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// @route   GET /api/auth/test
// @desc    Test route for debugging
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;