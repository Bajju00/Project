const express = require('express');
const router = express.Router();
const path = require('path');

// Load models with error handling
let User;
try {
  User = require('../models/User');
} catch (error) {
  User = require(path.join(__dirname, '../models/User'));
}

const { auth } = require('../middleware/auth');

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const allowedUpdates = ['fullName', 'bloodGroup', 'address', 'emergencyContacts', 'profilePhoto'];
    const updates = {};
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/users/donors
// @desc    Get blood donors
// @access  Public
router.get('/donors', async (req, res) => {
  try {
    const { bloodGroup, lat, lng, maxDistance = 50000 } = req.query;
    
    let query = { isBloodDonor: true, isVerified: true };
    
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    let donors;
    
    if (lat && lng) {
      donors = await User.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(maxDistance)
          }
        }
      }).select('fullName bloodGroup location address mobile createdAt');
    } else {
      donors = await User.find(query)
        .select('fullName bloodGroup location address mobile createdAt')
        .limit(50);
    }

    res.json({
      success: true,
      count: donors.length,
      donors
    });
  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch donors'
    });
  }
});

// @route   POST /api/users/emergency-contacts
// @desc    Add emergency contact
// @access  Private
router.post('/emergency-contacts', auth, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone are required'
      });
    }

    const user = await User.findById(req.userId);
    user.emergencyContacts.push({ name, phone, relationship });
    await user.save();

    res.json({
      success: true,
      message: 'Emergency contact added',
      emergencyContacts: user.emergencyContacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add emergency contact'
    });
  }
});

// @route   DELETE /api/users/emergency-contacts/:id
// @desc    Remove emergency contact
// @access  Private
router.delete('/emergency-contacts/:contactId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.emergencyContacts = user.emergencyContacts.filter(
      contact => contact._id.toString() !== req.params.contactId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Emergency contact removed',
      emergencyContacts: user.emergencyContacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove emergency contact'
    });
  }
});

module.exports = router;