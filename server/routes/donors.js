import express from 'express';
import Donor from '../models/Donor.js';
import User from '../models/User.js';
import BloodStock from '../models/BloodStock.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all donors
// @route   GET /api/donors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const donors = await Donor.find({}).sort({ createdAt: -1 });
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register a new blood donor volunteer
// @route   POST /api/donors
// @access  Private (Authenticated User)
router.post('/', protect, async (req, res) => {
  const { name, bloodGroup, phone, address, lastDonated } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set coordinates
    const latOffset = (Math.random() - 0.5) * 0.15;
    const lngOffset = (Math.random() - 0.5) * 0.15;
    const lat = 28.6139 + latOffset;
    const lng = 77.2099 + lngOffset;

    const donor = await Donor.create({
      name: name || user.fullName,
      bloodGroup: bloodGroup || user.bloodGroup,
      phone: phone || user.phone,
      address,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      lastDonated: lastDonated || 'Never',
      userId: req.user._id
    });

    // Mark user as a donor
    user.isDonor = true;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    await user.save();

    res.status(201).json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get global blood stock reserves
// @route   GET /api/donors/blood-stocks
// @access  Public
router.get('/blood-stocks', async (req, res) => {
  try {
    let stock = await BloodStock.findOne({});
    if (!stock) {
      // Create default if none exists
      stock = await BloodStock.create({});
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update global blood stock reserves
// @route   PUT /api/donors/blood-stocks
// @access  Private (Hospital Admin)
router.put('/blood-stocks', protect, async (req, res) => {
  try {
    let stock = await BloodStock.findOne({});
    if (!stock) {
      stock = new BloodStock({});
    }

    // Apply updates
    const groups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    groups.forEach(g => {
      if (req.body[g] !== undefined) {
        stock[g] = Number(req.body[g]);
      }
    });

    const updatedStock = await stock.save();
    res.json(updatedStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
