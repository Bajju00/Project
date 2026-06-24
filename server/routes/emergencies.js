import express from 'express';
import Emergency from '../models/Emergency.js';

const router = express.Router();

// @desc    Trigger emergency SOS alert
// @route   POST /api/emergencies
// @access  Public (so anybody can run a fast SOS trigger without login if necessary)
router.post('/', async (req, res) => {
  const { location, emergencyType } = req.body;

  if (!location || !Array.isArray(location) || location.length !== 2) {
    return res.status(400).json({ message: 'Valid coordinates [lng, lat] required' });
  }

  try {
    const emergency = await Emergency.create({
      location,
      emergencyType: emergencyType || 'SOS alert trigger'
    });

    res.status(201).json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
