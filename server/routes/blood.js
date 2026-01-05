const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

// @route   POST /api/blood/request
// @desc    Create blood request
// @access  Private
router.post('/request', auth, async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      bloodGroup,
      unitsRequired,
      hospitalId,
      urgency,
      requiredBy,
      purpose,
      contactPerson
    } = req.body;

    // Validate hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    const bloodRequest = new BloodRequest({
      patientName,
      patientAge,
      bloodGroup,
      unitsRequired,
      hospital: hospitalId,
      requestedBy: req.user.id,
      location: hospital.location,
      urgency: urgency || 'normal',
      requiredBy: requiredBy ? new Date(requiredBy) : undefined,
      purpose,
      contactPerson
    });

    await bloodRequest.save();

    // Populate for response
    await bloodRequest.populate('hospital', 'name address contact');
    await bloodRequest.populate('requestedBy', 'fullName mobile');

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      bloodRequest
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create blood request'
    });
  }
});

// @route   GET /api/blood/requests
// @desc    Get blood requests
// @access  Public
router.get('/requests', async (req, res) => {
  try {
    const { bloodGroup, status, urgent } = req.query;
    
    let query = { status: { $in: ['pending', 'partial'] } };
    
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (urgent === 'true') {
      query.urgency = { $in: ['urgent', 'critical'] };
    }

    const bloodRequests = await BloodRequest.find(query)
      .populate('hospital', 'name address')
      .populate('requestedBy', 'fullName')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: bloodRequests.length,
      bloodRequests
    });
  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blood requests'
    });
  }
});

// @route   GET /api/blood/donors
// @desc    Get blood donors near location
// @access  Public
router.get('/donors', async (req, res) => {
  try {
    const { bloodGroup, lat, lng, maxDistance = 50000 } = req.query;
    
    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        error: 'Blood group is required'
      });
    }

    let query = {
      isBloodDonor: true,
      isVerified: true,
      bloodGroup
    };

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
      })
      .select('fullName bloodGroup location address mobile createdAt')
      .limit(20);
    } else {
      donors = await User.find(query)
        .select('fullName bloodGroup location address mobile createdAt')
        .limit(20);
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

// @route   POST /api/blood/register-donor
// @desc    Register as blood donor
// @access  Private
router.post('/register-donor', auth, async (req, res) => {
  try {
    const { bloodGroup, location } = req.body;
    
    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        error: 'Blood group is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        isBloodDonor: true,
        bloodGroup,
        location: location || user.location
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Successfully registered as blood donor',
      user
    });
  } catch (error) {
    console.error('Register donor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register as donor'
    });
  }
});

// @route   PUT /api/blood/requests/:id/fulfill
// @desc    Mark blood request as fulfilled
// @access  Private
router.put('/requests/:id/fulfill', auth, async (req, res) => {
  try {
    const { donorId, unitsDonated } = req.body;
    
    const bloodRequest = await BloodRequest.findById(req.params.id);
    const donor = await User.findById(donorId);
    
    if (!bloodRequest || !donor) {
      return res.status(404).json({
        success: false,
        error: 'Blood request or donor not found'
      });
    }

    // Check if user is the requester or hospital admin
    const isRequester = bloodRequest.requestedBy.toString() === req.user.id;
    if (!isRequester && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this request'
      });
    }

    // Add donor to request
    bloodRequest.donorsFound.push({
      donor: donorId,
      unitsDonated: parseInt(unitsDonated) || 1,
      donationDate: new Date()
    });

    // Update fulfilled units
    bloodRequest.unitsFulfilled += parseInt(unitsDonated) || 1;

    // Update status if fully fulfilled
    if (bloodRequest.unitsFulfilled >= bloodRequest.unitsRequired) {
      bloodRequest.status = 'fulfilled';
    } else {
      bloodRequest.status = 'partial';
    }

    await bloodRequest.save();

    res.json({
      success: true,
      message: 'Blood request updated',
      bloodRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update blood request'
    });
  }
});

module.exports = router;