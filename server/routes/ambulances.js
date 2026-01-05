const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Ambulance = require('../models/Ambulance');
const Emergency = require('../models/Emergency');

// @route   GET /api/ambulances/nearby
// @desc    Get nearby ambulances
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const ambulances = await Ambulance.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      status: 'available',
      isAvailableForEmergency: true
    })
    .select('ambulanceNumber driver location type facilities hospital')
    .populate('hospital', 'name address')
    .limit(10);

    res.json({
      success: true,
      count: ambulances.length,
      ambulances
    });
  } catch (error) {
    console.error('Get nearby ambulances error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ambulances'
    });
  }
});

// @route   POST /api/ambulances/request
// @desc    Request ambulance
// @access  Private
router.post('/request', auth, async (req, res) => {
  try {
    const { ambulanceId, emergencyId, pickupLocation, destination } = req.body;
    
    const ambulance = await Ambulance.findById(ambulanceId);
    const emergency = await Emergency.findById(emergencyId);
    
    if (!ambulance || !emergency) {
      return res.status(404).json({
        success: false,
        error: 'Ambulance or emergency not found'
      });
    }

    // Check if ambulance is available
    if (ambulance.status !== 'available') {
      return res.status(400).json({
        success: false,
        error: 'Ambulance is not available'
      });
    }

    // Check if user owns the emergency
    if (emergency.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to request ambulance for this emergency'
      });
    }

    // Update ambulance status
    ambulance.status = 'on_duty';
    ambulance.currentEmergency = emergencyId;
    ambulance.totalAssignments += 1;
    await ambulance.save();

    // Update emergency status
    emergency.assignedAmbulance = ambulanceId;
    emergency.status = 'dispatched';
    emergency.ambulanceResponseTime = Math.floor(
      (Date.now() - emergency.createdAt) / 60000
    );
    emergency.notes.push({
      text: `Ambulance ${ambulance.ambulanceNumber} dispatched`,
      createdBy: 'system'
    });
    await emergency.save();

    res.json({
      success: true,
      message: 'Ambulance requested successfully',
      ambulance: {
        id: ambulance._id,
        number: ambulance.ambulanceNumber,
        driver: ambulance.driver,
        estimatedArrival: 'Calculating...'
      },
      emergency: {
        id: emergency._id,
        status: emergency.status
      }
    });
  } catch (error) {
    console.error('Request ambulance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request ambulance'
    });
  }
});

// @route   GET /api/ambulances/:id/track
// @desc    Track ambulance
// @access  Private
router.get('/:id/track', auth, async (req, res) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id)
      .populate('currentEmergency', 'status location')
      .populate('hospital', 'name location');
    
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        error: 'Ambulance not found'
      });
    }

    // Mock tracking data (in real app, this would come from GPS)
    const trackingData = {
      ambulanceId: ambulance._id,
      ambulanceNumber: ambulance.ambulanceNumber,
      driver: ambulance.driver,
      currentLocation: ambulance.location,
      status: ambulance.status,
      speed: ambulance.status === 'on_duty' ? '60 km/h' : '0 km/h',
      estimatedArrival: ambulance.status === 'on_duty' ? '15 minutes' : null,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      tracking: trackingData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to track ambulance'
    });
  }
});

// @route   PUT /api/ambulances/:id/status
// @desc    Update ambulance status (for drivers/admins)
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, location } = req.body;
    
    const ambulance = await Ambulance.findById(req.params.id);
    
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        error: 'Ambulance not found'
      });
    }

    // Check if user is driver or admin
    const isDriver = ambulance.driver.phone === req.user.mobile;
    if (!isDriver && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update ambulance status'
      });
    }

    // Update status
    if (status) {
      ambulance.status = status;
      
      // If marking as available, clear current emergency
      if (status === 'available') {
        ambulance.currentEmergency = null;
      }
    }
    
    // Update location if provided
    if (location) {
      ambulance.location = {
        type: 'Point',
        coordinates: location
      };
    }

    ambulance.updatedAt = Date.now();
    await ambulance.save();

    res.json({
      success: true,
      message: 'Ambulance status updated',
      ambulance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update ambulance status'
    });
  }
});

module.exports = router;