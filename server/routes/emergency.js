const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Emergency = require('../models/Emergency');
const Hospital = require('../models/Hospital');
const Ambulance = require('../models/Ambulance');
const User = require('../models/User');

// @route   POST /api/emergency/sos
// @desc    Create emergency SOS
// @access  Private
router.post('/sos', auth, async (req, res) => {
  try {
    const { location, emergencyType, description, severity } = req.body;
    
    if (!location || !emergencyType) {
      return res.status(400).json({
        success: false,
        error: 'Location and emergency type are required'
      });
    }

    // Create emergency
    const emergency = new Emergency({
      user: req.userId,
      location: {
        type: 'Point',
        coordinates: location
      },
      emergencyType,
      description,
      severity: severity || 'medium',
      status: 'pending'
    });

    await emergency.save();

    // Find nearest hospitals with available beds
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location
          },
          $maxDistance: 20000 // 20km
        }
      },
      status: 'active',
      $or: [
        { 'facilities.availableBeds': { $gt: 0 } },
        { 'facilities.availableIcuBeds': { $gt: 0 } }
      ]
    })
    .select('name address location contact facilities')
    .limit(5);

    // Find nearest available ambulances
    const ambulances = await Ambulance.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location
          },
          $maxDistance: 30000 // 30km
        }
      },
      status: 'available',
      isAvailableForEmergency: true
    })
    .select('ambulanceNumber driver location type facilities')
    .limit(3);

    // Get user info
    const user = await User.findById(req.userId).select('fullName mobile bloodGroup');

    res.status(201).json({
      success: true,
      message: 'Emergency SOS sent successfully',
      emergencyId: emergency._id,
      user: {
        name: user.fullName,
        mobile: user.mobile,
        bloodGroup: user.bloodGroup
      },
      hospitals,
      ambulances,
      instructions: [
        'Stay calm and do not move unnecessarily',
        'Share your precise location with responders',
        'Keep your phone accessible',
        'If possible, have someone wait at the entrance to guide responders'
      ]
    });
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send emergency SOS'
    });
  }
});

// @route   GET /api/emergency/:id
// @desc    Get emergency status
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('user', 'fullName mobile bloodGroup')
      .populate('acceptedByHospital', 'name address contact')
      .populate('assignedAmbulance', 'ambulanceNumber driver location');

    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }

    // Check if user owns this emergency or is admin
    if (emergency.user._id.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this emergency'
      });
    }

    res.json({
      success: true,
      emergency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emergency details'
    });
  }
});

// @route   GET /api/emergency/my
// @desc    Get user's emergencies
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const emergencies = await Emergency.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('acceptedByHospital', 'name')
      .populate('assignedAmbulance', 'ambulanceNumber')
      .limit(20);

    res.json({
      success: true,
      count: emergencies.length,
      emergencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emergencies'
    });
  }
});

// @route   PUT /api/emergency/:id/cancel
// @desc    Cancel emergency
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }

    // Check if user owns this emergency
    if (emergency.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this emergency'
      });
    }

    // Check if emergency can be cancelled
    if (['completed', 'cancelled'].includes(emergency.status)) {
      return res.status(400).json({
        success: false,
        error: `Emergency is already ${emergency.status}`
      });
    }

    emergency.status = 'cancelled';
    emergency.notes.push({
      text: 'Emergency cancelled by user',
      createdBy: 'user'
    });
    await emergency.save();

    res.json({
      success: true,
      message: 'Emergency cancelled successfully',
      emergency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel emergency'
    });
  }
});

// @route   PUT /api/emergency/:id/assign-hospital
// @desc    Assign hospital to emergency (for hospital admins)
// @access  Private (Hospital Admin)
router.put('/:id/assign-hospital', auth, async (req, res) => {
  try {
    const { hospitalId } = req.body;
    
    const emergency = await Emergency.findById(req.params.id);
    const hospital = await Hospital.findById(hospitalId);
    
    if (!emergency || !hospital) {
      return res.status(404).json({
        success: false,
        error: 'Emergency or hospital not found'
      });
    }

    // Check if user is hospital admin
    if (hospital.admin.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to assign hospital'
      });
    }

    emergency.acceptedByHospital = hospitalId;
    emergency.status = 'assigned';
    emergency.hospitalResponseTime = Math.floor(
      (Date.now() - emergency.createdAt) / 60000
    );
    emergency.notes.push({
      text: `Hospital ${hospital.name} accepted the emergency`,
      createdBy: 'hospital'
    });

    await emergency.save();

    res.json({
      success: true,
      message: 'Hospital assigned to emergency',
      emergency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to assign hospital'
    });
  }
});

module.exports = router;