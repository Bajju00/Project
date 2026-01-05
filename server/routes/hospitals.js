const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Hospital = require('../models/Hospital');

// @route   GET /api/hospitals
// @desc    Get all hospitals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'active' })
      .select('name address location contact facilities specialties')
      .sort({ 'facilities.availableBeds': -1 });

    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hospitals'
    });
  }
});

// @route   GET /api/hospitals/nearby
// @desc    Get nearby hospitals
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50000, minBeds = 0 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      status: 'active',
      'facilities.availableBeds': { $gte: parseInt(minBeds) }
    })
    .select('name address location contact facilities specialties status lastUpdated')
    .limit(20);

    // Calculate distance for each hospital
    const hospitalsWithDistance = hospitals.map(hospital => {
      const hospitalObj = hospital.toObject();
      // Simple distance calculation (approximate)
      const hospitalLat = hospital.location.coordinates[1];
      const hospitalLng = hospital.location.coordinates[0];
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        hospitalLat,
        hospitalLng
      );
      
      return {
        ...hospitalObj,
        distance: distance.toFixed(1) + ' km'
      };
    });

    res.json({
      success: true,
      count: hospitalsWithDistance.length,
      hospitals: hospitalsWithDistance
    });
  } catch (error) {
    console.error('Get nearby hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby hospitals'
    });
  }
});

// @route   GET /api/hospitals/:id
// @desc    Get hospital by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hospital'
    });
  }
});

// @route   PUT /api/hospitals/:id/status
// @desc    Update hospital status (beds, ICU, etc.)
// @access  Private (Hospital Admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { 
      availableBeds, 
      availableIcuBeds, 
      availableOxygenCylinders,
      availableVentilators,
      status 
    } = req.body;

    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    // Check if user is hospital admin
    if (hospital.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this hospital'
      });
    }

    // Update fields
    if (availableBeds !== undefined) {
      hospital.facilities.availableBeds = Math.max(0, parseInt(availableBeds));
    }
    if (availableIcuBeds !== undefined) {
      hospital.facilities.availableIcuBeds = Math.max(0, parseInt(availableIcuBeds));
    }
    if (availableOxygenCylinders !== undefined) {
      hospital.facilities.availableOxygenCylinders = Math.max(0, parseInt(availableOxygenCylinders));
    }
    if (availableVentilators !== undefined) {
      hospital.facilities.availableVentilators = Math.max(0, parseInt(availableVentilators));
    }
    if (status) {
      hospital.status = status;
    }

    hospital.lastUpdated = Date.now();
    await hospital.save();

    res.json({
      success: true,
      message: 'Hospital status updated',
      hospital
    });
  } catch (error) {
    console.error('Update hospital status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update hospital status'
    });
  }
});

// @route   GET /api/hospitals/search/:query
// @desc    Search hospitals
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    
    const hospitals = await Hospital.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'address.city': { $regex: query, $options: 'i' } },
        { 'address.state': { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    })
    .select('name address location contact facilities specialties')
    .limit(20);

    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;