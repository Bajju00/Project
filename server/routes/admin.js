const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminAuth = require("../middleware/adminAuth");

// Admin Statistics (Protected)
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const User = mongoose.model("User");
    const Hospital = mongoose.model("Hospital");
    const Emergency = mongoose.model("Emergency");
    const Ambulance = mongoose.model("Ambulance");

    const totalUsers = await User.countDocuments();
    const totalHospitals = await Hospital.countDocuments({ status: "active" });
    const activeEmergencies = await Emergency.countDocuments({ status: "active" });
    const totalAmbulances = await Ambulance.countDocuments({ status: "available" });
    
    // Calculate available beds
    const hospitals = await Hospital.find({ status: "active" });
    const availableBeds = hospitals.reduce((sum, hospital) => 
      sum + (hospital.facilities?.availableBeds || 0), 0
    );

    // Today's emergencies
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEmergencies = await Emergency.countDocuments({ 
      createdAt: { $gte: today } 
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalHospitals,
        activeEmergencies,
        totalAmbulances,
        availableBeds,
        todayEmergencies
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
});

// Admin Hospitals List (Protected)
router.get("/hospitals", adminAuth, async (req, res) => {
  try {
    const Hospital = mongoose.model("Hospital");
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch hospitals" });
  }
});

// Admin Emergencies List (Protected)
router.get("/emergencies", adminAuth, async (req, res) => {
  try {
    const Emergency = mongoose.model("Emergency");
    const emergencies = await Emergency.find()
      .populate("user", "fullName email mobile")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, emergencies });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch emergencies" });
  }
});

// Admin Users List (Protected)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const User = mongoose.model("User");
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// Create or fix admin user (Public)
router.post("/create-admin", async (req, res) => {
  try {
    const User = mongoose.model("User");
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@lifelink.com" });
    if (existingAdmin && existingAdmin.role === "admin") {
      return res.json({
        success: true,
        message: "Admin already exists",
        admin: existingAdmin.email
      });
    }
    
    // Create or update admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const adminData = {
      fullName: "System Administrator",
      email: "admin@lifelink.com",
      mobile: "0000000000",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isBloodDonor: false
    };
    
    let admin;
    if (existingAdmin) {
      // Update existing user to admin
      admin = await User.findByIdAndUpdate(
        existingAdmin._id,
        { $set: adminData },
        { new: true }
      );
    } else {
      // Create new admin user
      admin = new User(adminData);
      await admin.save();
    }
    
    res.json({
      success: true,
      message: existingAdmin ? "User updated to admin" : "Admin user created",
      email: admin.email,
      role: admin.role,
      password: "admin123"
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create admin"
    });
  }
});

// Check admin user status (Public)
router.get("/check-admin", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const admin = await User.findOne({ email: "admin@lifelink.com" });
    
    if (!admin) {
      return res.json({
        exists: false,
        message: "No user found with admin@lifelink.com"
      });
    }
    
    res.json({
      exists: true,
      email: admin.email,
      role: admin.role || "none",
      isVerified: admin.isVerified,
      hasPassword: !!admin.password
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Admin Verify Endpoint (Protected)
router.get("/verify", adminAuth, (req, res) => {
  res.json({
    success: true,
    message: "Admin verified",
    user: {
      id: req.userId,
      isAdmin: true
    }
  });
});

// Add role field to all users (Protected)
router.post("/add-role-field", adminAuth, async (req, res) => {
  try {
    const User = mongoose.model("User");
    
    // Update all existing users to have 'user' role by default
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: "user" } }
    );
    
    // Set specific user as admin
    const adminResult = await User.updateOne(
      { email: "admin@lifelink.com" },
      { $set: { role: "admin" } }
    );
    
    res.json({
      success: true,
      message: "Role field added to users",
      usersUpdated: result.modifiedCount,
      adminUpdated: adminResult.modifiedCount > 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
