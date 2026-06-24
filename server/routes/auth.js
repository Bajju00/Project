import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import protect from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lifelink_super_secret_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new patient/user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { fullName, email, password, phone, bloodGroup } = req.body;

  try {
    const userExists = await User.findOne({ email });
    const hospitalExists = await Hospital.findOne({ email });

    if (userExists || hospitalExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      bloodGroup
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        role: user.role,
        isDonor: user.isDonor,
        age: user.age,
        weight: user.weight,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register a new clinical hospital
// @route   POST /api/auth/register-hospital
// @access  Public
router.post('/register-hospital', async (req, res) => {
  const { hospitalName, email, password, contact, address, totalBeds, totalIcuBeds, totalOxygenCylinders } = req.body;

  try {
    const userExists = await User.findOne({ email });
    const hospitalExists = await Hospital.findOne({ email });

    if (userExists || hospitalExists) {
      return res.status(400).json({ message: 'Account already exists with this email' });
    }

    // Default coordinates in New Delhi (e.g. Apollo/Fortis offset)
    const latOffset = (Math.random() - 0.5) * 0.15;
    const lngOffset = (Math.random() - 0.5) * 0.15;
    const lat = 28.6139 + latOffset;
    const lng = 77.2099 + lngOffset;

    const hospital = await Hospital.create({
      name: hospitalName,
      email,
      password,
      contact: { phone: contact },
      address,
      facilities: {
        availableBeds: Number(totalBeds) || 50,
        availableIcuBeds: Number(totalIcuBeds) || 10,
        availableOxygenCylinders: Number(totalOxygenCylinders) || 20
      },
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });

    if (hospital) {
      res.status(201).json({
        _id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        contact: hospital.contact,
        address: hospital.address,
        facilities: hospital.facilities,
        location: hospital.location,
        role: 'hospital',
        token: generateToken(hospital._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid hospital data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate User/Hospital & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Try to find user
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        role: user.role,
        isDonor: user.isDonor,
        age: user.age,
        weight: user.weight,
        token: generateToken(user._id)
      });
    }

    // 2. Try to find hospital
    const hospital = await Hospital.findOne({ email });
    if (hospital && (await hospital.matchPassword(password))) {
      return res.json({
        _id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        contact: hospital.contact,
        address: hospital.address,
        facilities: hospital.facilities,
        location: hospital.location,
        role: 'hospital',
        token: generateToken(hospital._id)
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user/hospital profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'Account not found' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
      user.age = req.body.age !== undefined ? Number(req.body.age) : user.age;
      user.weight = req.body.weight !== undefined ? Number(req.body.weight) : user.weight;
      user.isDonor = req.body.isDonor !== undefined ? req.body.isDonor : user.isDonor;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        bloodGroup: updatedUser.bloodGroup,
        role: updatedUser.role,
        isDonor: updatedUser.isDonor,
        age: updatedUser.age,
        weight: updatedUser.weight,
        token: generateToken(updatedUser._id)
      });
    } else {
      // It's a hospital
      const hospital = await Hospital.findById(req.user._id);
      if (hospital) {
        hospital.name = req.body.name || hospital.name;
        hospital.contact.phone = req.body.phone || hospital.contact.phone;
        hospital.address = req.body.address || hospital.address;

        const updatedHospital = await hospital.save();
        res.json({
          _id: updatedHospital._id,
          name: updatedHospital.name,
          email: updatedHospital.email,
          contact: updatedHospital.contact,
          address: updatedHospital.address,
          facilities: updatedHospital.facilities,
          location: updatedHospital.location,
          role: 'hospital',
          token: generateToken(updatedHospital._id)
        });
      } else {
        res.status(404).json({ message: 'Account not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
