const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

// Test protected route
router.get("/protected", auth, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed successfully",
        userId: req.userId
    });
});

// Test models status check
router.get("/models", (req, res) => {
    const models = {
        User: mongoose.models.User ? "✅ Loaded" : "❌ Not loaded",
        Hospital: mongoose.models.Hospital ? "✅ Loaded" : "❌ Not loaded",
        Emergency: mongoose.models.Emergency ? "✅ Loaded" : "❌ Not loaded",
        Ambulance: mongoose.models.Ambulance ? "✅ Loaded" : "❌ Not loaded",
        BloodRequest: mongoose.models.BloodRequest ? "✅ Loaded" : "❌ Not loaded"
    };
    
    res.json({
        success: true,
        message: "Model status check",
        models,
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

// Debug user model structure
router.get("/user-model", async (req, res) => {
  try {
    const User = mongoose.model("User");
    
    // Get schema paths
    const schemaPaths = User.schema.paths;
    const paths = Object.keys(schemaPaths)
      .filter(key => !key.startsWith("_"))
      .map(key => ({
        field: key,
        type: schemaPaths[key].instance,
        required: schemaPaths[key].isRequired || false
      }));
    
    // Check if 'role' field exists
    const hasRoleField = User.schema.path("role") !== undefined;
    
    res.json({
      success: true,
      hasRoleField,
      schemaPaths: paths,
      totalFields: paths.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Quick login test endpoint
router.post("/test-login", async (req, res) => {
    try {
        const { email = "user@example.com", password = "user123" } = req.body;
        const User = mongoose.model("User");
        
        console.log(`Debug login test for: ${email}`);
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }
        
        let passwordMatch = false;
        if (typeof user.comparePassword === "function") {
            passwordMatch = await user.comparePassword(password);
        } else {
            const bcrypt = require("bcryptjs");
            passwordMatch = await bcrypt.compare(password, user.password);
        }
        
        res.json({
            success: true,
            userExists: true,
            email: user.email,
            role: user.role || "none",
            passwordMatch: passwordMatch,
            isVerified: user.isVerified
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Initialize test data
router.post("/init", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const Hospital = mongoose.model("Hospital");
    
    console.log("🚀 Initializing test data...");
    
    // 1. Create regular test users
    const testUsers = [
      {
        fullName: "Test User",
        email: "user@example.com",
        mobile: "9876543210",
        password: await bcrypt.hash("user123", 10),
        bloodGroup: "O+",
        role: "user",
        userType: "user",
        isVerified: true,
        isBloodDonor: false,
        isAdmin: false
      },
      {
        fullName: "Blood Donor",
        email: "donor@example.com",
        mobile: "9876543211",
        password: await bcrypt.hash("donor123", 10),
        bloodGroup: "A+",
        role: "donor",
        userType: "donor",
        isVerified: true,
        isBloodDonor: true,
        isAdmin: false
      },
      {
        fullName: "Doctor",
        email: "doctor@example.com",
        mobile: "9876543212",
        password: await bcrypt.hash("doctor123", 10),
        role: "doctor",
        userType: "doctor",
        isVerified: true,
        isBloodDonor: false,
        isAdmin: false
      }
    ];
    
    // 2. Create hospital users
    const hospitalUsers = [
      {
        fullName: "City General Hospital Staff",
        email: "citygeneral@lifelink.com",
        mobile: "9876543213",
        password: await bcrypt.hash("hospital123", 10),
        role: "hospital",
        userType: "hospital",
        isVerified: true,
        isBloodDonor: false,
        isAdmin: false,
        isHospitalAdmin: true,
        hospitalName: "City General Hospital",
        hospitalId: "HOS001",
        hospitalAddress: "123 Medical Street, New Delhi",
        address: "123 Medical Street, New Delhi",
        contact: "+91 9876543213"
      },
      {
        fullName: "Medicare Center Staff",
        email: "medicare@lifelink.com",
        mobile: "9876543214",
        password: await bcrypt.hash("hospital123", 10),
        role: "hospital",
        userType: "hospital",
        isVerified: true,
        isBloodDonor: false,
        isAdmin: false,
        isHospitalAdmin: true,
        hospitalName: "Medicare Center",
        hospitalId: "HOS002",
        hospitalAddress: "456 Health Avenue, Mumbai",
        address: "456 Health Avenue, Mumbai",
        contact: "+91 9876543214"
      },
      {
        fullName: "Sunrise Medical Staff",
        email: "sunrise@lifelink.com",
        mobile: "9876543215",
        password: await bcrypt.hash("hospital123", 10),
        role: "hospital",
        userType: "hospital",
        isVerified: true,
        isBloodDonor: false,
        isAdmin: false,
        isHospitalAdmin: true,
        hospitalName: "Sunrise Medical",
        hospitalId: "HOS003",
        hospitalAddress: "789 Care Road, Bangalore",
        address: "789 Care Road, Bangalore",
        contact: "+91 9876543215"
      }
    ];
    
    // 3. Create admin user
    const adminUser = {
      fullName: "System Administrator",
      email: "admin@lifelink.com",
      mobile: "0000000000",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      userType: "admin",
      isVerified: true,
      isBloodDonor: false,
      isAdmin: true,
      isHospitalAdmin: false
    };
    
    // Clear existing test users
    const emailsToClear = [
      "user@example.com", "donor@example.com", "doctor@example.com",
      "citygeneral@lifelink.com", "medicare@lifelink.com", "sunrise@lifelink.com",
      "admin@lifelink.com"
    ];
    
    await User.deleteMany({ email: { $in: emailsToClear } });
    
    // Insert all users
    const allUsers = [...testUsers, ...hospitalUsers, adminUser];
    const createdUsers = await User.insertMany(allUsers);
    
    // Create hospitals with real data
    const adminUserCreated = createdUsers.find(u => u.email === "admin@lifelink.com");
    const cityGeneralUser = createdUsers.find(u => u.email === "citygeneral@lifelink.com");
    const medicareUser = createdUsers.find(u => u.email === "medicare@lifelink.com");
    const sunriseUser = createdUsers.find(u => u.email === "sunrise@lifelink.com");
    
    // Clear existing hospitals
    await Hospital.deleteMany({ name: { $in: ["City General Hospital", "Medicare Center", "Sunrise Medical", "Apollo Hospital"] } });
    
    // Create new hospitals
    const hospitals = [
      {
        name: "City General Hospital",
        registrationId: "HOS001",
        address: {
          fullAddress: "123 Medical Street, New Delhi"
        },
        location: {
          type: "Point",
          coordinates: [77.2099, 28.6139]
        },
        contact: {
          phone: "+91 9876543213"
        },
        facilities: {
          totalBeds: 100,
          availableBeds: 25,
          icuBeds: 20,
          availableIcuBeds: 8,
          oxygenCylinders: 50,
          availableOxygenCylinders: 18
        },
        specialties: ["Emergency", "ICU", "General Medicine"],
        status: "active",
        admin: adminUserCreated?._id
      },
      {
        name: "Medicare Center",
        registrationId: "HOS002",
        address: {
          fullAddress: "456 Health Avenue, Mumbai"
        },
        location: {
          type: "Point",
          coordinates: [72.8479, 19.0760]
        },
        contact: {
          phone: "+91 9876543214"
        },
        facilities: {
          totalBeds: 80,
          availableBeds: 15,
          icuBeds: 15,
          availableIcuBeds: 5,
          oxygenCylinders: 40,
          availableOxygenCylinders: 12
        },
        specialties: ["Cardiology", "ICU", "General Medicine"],
        status: "active",
        admin: medicareUser?._id
      },
      {
        name: "Sunrise Medical",
        registrationId: "HOS003",
        address: {
          fullAddress: "789 Care Road, Bangalore"
        },
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716]
        },
        contact: {
          phone: "+91 9876543215"
        },
        facilities: {
          totalBeds: 120,
          availableBeds: 32,
          icuBeds: 25,
          availableIcuBeds: 10,
          oxygenCylinders: 60,
          availableOxygenCylinders: 22
        },
        specialties: ["Emergency", "Neurology", "ICU", "General Medicine"],
        status: "active",
        admin: sunriseUser?._id
      },
      {
        name: "Apollo Hospital",
        registrationId: "HOS004",
        address: {
          fullAddress: "999 Premier Healthcare Complex, Delhi"
        },
        location: {
          type: "Point",
          coordinates: [77.1025, 28.5355]
        },
        contact: {
          phone: "+91 9876543216"
        },
        facilities: {
          totalBeds: 150,
          availableBeds: 40,
          icuBeds: 30,
          availableIcuBeds: 12,
          oxygenCylinders: 80,
          availableOxygenCylinders: 30
        },
        specialties: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "ICU", "General Medicine"],
        status: "active",
        admin: adminUserCreated?._id
      }
    ];
    
    await Hospital.insertMany(hospitals);
    
    res.json({
      success: true,
      message: "Test users and hospitals created successfully",
      users: createdUsers.map(u => ({
        email: u.email,
        role: u.role
      })),
      hospitals: hospitals.map(h => ({
        name: h.name,
        availableBeds: h.facilities.availableBeds,
        availableICU: h.facilities.availableIcuBeds,
        availableOxygen: h.facilities.availableOxygenCylinders
      }))
    });
    
  } catch (error) {
    console.error("Init error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all test users info
router.get("/users", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const users = await User.find({
      email: {
        $in: [
          "user@example.com", "donor@example.com", "doctor@example.com",
          "citygeneral@lifelink.com", "medicare@lifelink.com", "sunrise@lifelink.com",
          "admin@lifelink.com"
        ]
      }
    }).select("-password");
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test hospital registration
router.post("/hospital-register", async (req, res) => {
  try {
    const User = mongoose.model("User");
    
    // Create a test hospital
    const hospitalId = "HOS" + Date.now().toString().slice(-6);
    const testEmail = `testhospital${Date.now().toString().slice(-6)}@lifelink.com`;
    
    const hospitalUser = new User({
      fullName: "Test Hospital Administrator",
      email: testEmail,
      mobile: "+91 9876543210",
      password: await bcrypt.hash("test123", 10),
      role: "hospital",
      userType: "hospital",
      isHospitalAdmin: true,
      isVerified: true,
      hospitalName: "Test Hospital",
      hospitalId: hospitalId,
      hospitalAddress: "Test Address",
      address: "Test Address",
      phone: "+91 9876543210"
    });
    
    await hospitalUser.save();
    
    res.json({
      success: true,
      message: "Test hospital created",
      credentials: {
        email: testEmail,
        password: "test123",
        hospitalId: hospitalId
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
