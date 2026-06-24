import express from 'express';
import Hospital from '../models/Hospital.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get aggregated stats of all hospitals
// @route   GET /api/hospitals/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const hospitals = await Hospital.find({});
    const totalBeds = hospitals.reduce((sum, h) => sum + (h.facilities?.availableBeds || 0), 0);
    const totalIcu = hospitals.reduce((sum, h) => sum + (h.facilities?.availableIcuBeds || 0), 0);
    const totalOxygen = hospitals.reduce((sum, h) => sum + (h.facilities?.availableOxygenCylinders || 0), 0);

    res.json({
      count: hospitals.length,
      availableBeds: totalBeds,
      availableIcuBeds: totalIcu,
      availableOxygenCylinders: totalOxygen
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update hospital resource counts (beds, oxygen, etc.)
// @route   PUT /api/hospitals/resources
// @access  Private (Hospital admin)
router.put('/resources', protect, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user._id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital facility not found' });
    }

    const { availableBeds, availableIcuBeds, availableOxygenCylinders } = req.body;

    hospital.facilities = {
      availableBeds: availableBeds !== undefined ? Number(availableBeds) : hospital.facilities.availableBeds,
      availableIcuBeds: availableIcuBeds !== undefined ? Number(availableIcuBeds) : hospital.facilities.availableIcuBeds,
      availableOxygenCylinders: availableOxygenCylinders !== undefined ? Number(availableOxygenCylinders) : hospital.facilities.availableOxygenCylinders
    };

    const updatedHospital = await hospital.save();
    res.json(updatedHospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
