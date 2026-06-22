const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

// List blood donors
router.get("/donors", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const donors = await User.find({ 
      isBloodDonor: true,
      isVerified: true 
    }).select("fullName bloodGroup email mobile");
    
    res.json({ success: true, donors });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch donors" });
  }
});

// Register as blood donor
router.post("/donor-register", auth, async (req, res) => {
  try {
    const User = mongoose.model("User");
    const user = await User.findByIdAndUpdate(
      req.userId,
      { isBloodDonor: true, bloodGroup: req.body.bloodGroup },
      { new: true }
    );
    
    res.json({
      success: true,
      message: "Registered as blood donor successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to register as donor" });
  }
});

module.exports = router;