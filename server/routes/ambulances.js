const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

// List available ambulances
router.get("/", async (req, res) => {
  try {
    const Ambulance = mongoose.model("Ambulance");
    const ambulances = await Ambulance.find({ status: "available" });
    res.json({ success: true, ambulances });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch ambulances" });
  }
});

// Book ambulance
router.post("/book", auth, async (req, res) => {
  try {
    const { ambulanceId, patientName, location, emergencyType } = req.body;
    
    const Ambulance = mongoose.model("Ambulance");
    const ambulance = await Ambulance.findByIdAndUpdate(
      ambulanceId,
      { status: "busy", bookedBy: req.userId },
      { new: true }
    );
    
    res.json({
      success: true,
      message: "Ambulance booked successfully",
      ambulance,
      bookingId: new mongoose.Types.ObjectId()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to book ambulance" });
  }
});

module.exports = router;