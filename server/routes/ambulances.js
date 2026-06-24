import express from 'express';
import Ambulance from '../models/Ambulance.js';
import Booking from '../models/Booking.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all ambulances
// @route   GET /api/ambulances
// @access  Public
router.get('/', async (req, res) => {
  try {
    const ambulances = await Ambulance.find({}).populate('hospitalId', 'name address contact');
    res.json(ambulances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register a new fleet ambulance
// @route   POST /api/ambulances
// @access  Private (Hospital Admin)
router.post('/', protect, async (req, res) => {
  const { number, type, driver, phone, locationName, equipment } = req.body;

  try {
    const ambulanceExists = await Ambulance.findOne({ number });
    if (ambulanceExists) {
      return res.status(400).json({ message: 'Ambulance vehicle already registered with this number' });
    }

    // Default coordinates with a random offset near New Delhi
    const latOffset = (Math.random() - 0.5) * 0.15;
    const lngOffset = (Math.random() - 0.5) * 0.15;
    const lat = 28.6139 + latOffset;
    const lng = 77.2099 + lngOffset;

    const parsedEquipment = equipment 
      ? (Array.isArray(equipment) ? equipment : equipment.split(',').map(item => item.trim())) 
      : ['Oxygen Port', 'Basic First Aid Kit'];

    const ambulance = await Ambulance.create({
      number,
      type,
      driver,
      phone,
      locationName,
      location: [lat, lng],
      equipment: parsedEquipment,
      hospitalId: req.user._id // Linked to the authenticated hospital
    });

    res.status(201).json(ambulance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Dispatch/Book an ambulance
// @route   POST /api/ambulances/book
// @access  Private (Authenticated User)
router.post('/book', protect, async (req, res) => {
  const { ambulanceId, patientName, phone, location, emergencyType, handoverNotes } = req.body;

  try {
    const ambulance = await Ambulance.findById(ambulanceId);

    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance vehicle not found' });
    }

    if (ambulance.status === 'busy') {
      return res.status(400).json({ message: 'Ambulance is currently on active dispatch' });
    }

    // Create the booking entry
    const booking = await Booking.create({
      ambulanceId: ambulance._id,
      ambulanceNumber: ambulance.number,
      type: ambulance.type,
      patientName,
      phone,
      location,
      emergencyType,
      handoverNotes,
      status: 'Dispatched',
      userId: req.user._id,
      hospitalId: ambulance.hospitalId
    });

    // Mark ambulance as busy
    ambulance.status = 'busy';
    await ambulance.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get booking history/active dispatches
// @route   GET /api/ambulances/bookings
// @access  Private
router.get('/bookings', protect, async (req, res) => {
  try {
    let bookings;
    
    // Check if the requester is a hospital or user
    const isHospital = req.user.role === 'hospital' || (req.user.name && !req.user.fullName);
    
    if (isHospital) {
      bookings = await Booking.find({ hospitalId: req.user._id, status: { $ne: 'Completed' } })
        .populate('userId', 'fullName email phone')
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ userId: req.user._id })
        .populate('ambulanceId')
        .sort({ createdAt: -1 });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Resolve booking / Release vehicle
// @route   PUT /api/ambulances/bookings/:id/resolve
// @access  Private (Hospital Admin)
router.put('/bookings/:id/resolve', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(bookingId || req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking dispatch not found' });
    }

    // Mark booking as completed
    booking.status = 'Completed';
    await booking.save();

    // Release the ambulance back to available
    const ambulance = await Ambulance.findById(booking.ambulanceId);
    if (ambulance) {
      ambulance.status = 'available';
      await ambulance.save();
    }

    // Delete or keep? In mock database we filtered out resolved dispatches. Let's return success.
    res.json({ message: 'Intake resolved, ambulance released to fleet', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
