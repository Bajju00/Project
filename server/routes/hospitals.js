const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Get all hospitals
router.get("/", async (req, res) => {
    try {
        const Hospital = mongoose.model("Hospital");
        
        // Mock data for testing if DB not connected
        if (mongoose.connection.readyState !== 1) {
            const mockHospitals = [
              {
                _id: "1",
                name: "City General Hospital",
                address: "123 Medical Street, New Delhi",
                facilities: {
                  availableBeds: 25,
                  availableIcuBeds: 8,
                  availableOxygenCylinders: 18
                }
              },
              {
                _id: "2",
                name: "Medicare Center",
                address: "456 Health Avenue, Mumbai",
                facilities: {
                  availableBeds: 15,
                  availableIcuBeds: 5,
                  availableOxygenCylinders: 12
                }
              },
              {
                _id: "3",
                name: "Sunrise Medical",
                address: "789 Care Road, Bangalore",
                facilities: {
                  availableBeds: 32,
                  availableIcuBeds: 10,
                  availableOxygenCylinders: 22
                }
              },
              {
                _id: "4",
                name: "Apollo Hospital",
                address: "999 Premier Healthcare Complex, Delhi",
                facilities: {
                  availableBeds: 40,
                  availableIcuBeds: 12,
                  availableOxygenCylinders: 30
                }
              },
              
            ];
            
            return res.json({
                success: true,
                message: "Using mock data",
                count: mockHospitals.length,
                hospitals: mockHospitals
            });
        }
        
        const hospitals = await Hospital.find({ status: "active" })
          .select("name address location facilities specialties status")
          .limit(20);

        // Transform to match expected frontend format
        const transformedHospitals = hospitals.map(h => ({
          _id: h._id,
          name: h.name,
          address: h.address?.fullAddress || h.address,
          facilities: {
            availableBeds: h.facilities?.availableBeds ?? 0,
            availableIcuBeds: h.facilities?.availableIcuBeds ?? 0,
            availableOxygenCylinders: h.facilities?.availableOxygenCylinders ?? 0
          },
          specialties: h.specialties,
          status: h.status
        }));

        res.json({
          success: true,
          count: transformedHospitals.length,
          hospitals: transformedHospitals
        });
    } catch (error) {
        console.error("Get hospitals error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch hospitals"
        });
    }
});

// Get nearby hospitals
router.get("/nearby", async (req, res) => {
    try {
        const { lat, lng, maxDistance = 50000 } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: "Latitude and longitude are required"
            });
        }
        
        // Mock response for now
        const mockHospitals = [
            {
                id: 1,
                name: "City General Hospital",
                address: "123 Medical Street",
                availableBeds: 15,
                availableICU: 5,
                distance: "2.3 km",
                coordinates: [parseFloat(lng) + 0.01, parseFloat(lat) + 0.01]
            },
            {
                id: 2,
                name: "Medicare Center",
                address: "456 Health Avenue",
                availableBeds: 8,
                availableICU: 2,
                distance: "3.1 km",
                coordinates: [parseFloat(lng) - 0.02, parseFloat(lat) + 0.02]
            }
        ];
        
        res.json({
            success: true,
            message: "Nearby hospitals (mock data)",
            userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
            count: mockHospitals.length,
            hospitals: mockHospitals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch nearby hospitals"
        });
    }
});

// Hospital Registration
router.post("/register", async (req, res) => {
  try {
    console.log("🏥 Hospital registration request received:", req.body);
    
    if (!mongoose.models.User) {
      console.error("❌ User model not loaded");
      return res.status(500).json({
        success: false,
        error: "Server configuration error. Please contact administrator."
      });
    }
    
    const User = mongoose.model("User");
    let Hospital;
    
    try {
      Hospital = mongoose.model("Hospital");
    } catch (error) {
      console.log("Hospital model not found, using User collection only");
    }
    
    const { 
      hospitalName, 
      email, 
      password, 
      contact, 
      address, 
      totalBeds = 50, 
      totalIcuBeds = 10, 
      totalOxygenCylinders = 20 
    } = req.body;
    
    console.log("Processing registration for:", hospitalName);
    
    // Validate required fields
    const requiredFields = ["hospitalName", "email", "password", "contact", "address"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }
    
    // Check if hospital already exists (by email)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Hospital with this email already exists"
      });
    }
    
    // Generate unique hospital ID
    const hospitalId = "HOS" + Date.now().toString().slice(-6);
    
    // Create hospital user account
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const hospitalUserData = {
      fullName: `${hospitalName} Administrator`,
      email: email.toLowerCase(),
      mobile: contact,
      password: hashedPassword,
      role: "hospital",
      userType: "hospital",
      isHospitalAdmin: true,
      isAdmin: false,
      isVerified: true,
      isBloodDonor: false,
      hospitalName: hospitalName,
      hospitalId: hospitalId,
      hospitalAddress: address,
      address: address,
      phone: contact,
      contact: contact,
      createdAt: new Date()
    };
    
    console.log("Creating hospital user with data:", { ...hospitalUserData, password: "HIDDEN" });
    
    const hospitalUser = new User(hospitalUserData);
    await hospitalUser.save();
    
    // Create hospital record in Hospital collection if model exists
    if (Hospital) {
      try {
        const hospitalRecord = new Hospital({
          name: hospitalName,
          email: email.toLowerCase(),
          contact: contact,
          address: address,
          hospitalId: hospitalId,
          totalBeds: parseInt(totalBeds),
          availableBeds: parseInt(totalBeds),
          totalIcuBeds: parseInt(totalIcuBeds),
          availableIcuBeds: parseInt(totalIcuBeds),
          totalOxygenCylinders: parseInt(totalOxygenCylinders),
          availableOxygenCylinders: parseInt(totalOxygenCylinders),
          status: "active",
          facilities: {
            emergency: true,
            ambulance: true,
            bloodBank: true,
            icu: true,
            oxygen: true
          },
          coordinates: {
            lat: 0,
            lng: 0
          },
          createdAt: new Date()
        });
        
        await hospitalRecord.save();
        console.log("✅ Hospital record created in Hospital collection");
      } catch (hospitalError) {
        console.error("Error creating hospital record:", hospitalError);
        // Continue even if Hospital collection fails
      }
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        id: hospitalUser._id,
        role: "hospital",
        hospitalId: hospitalId
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );
    
    console.log("✅ Hospital registration successful:", hospitalName);
    
    res.status(201).json({
      success: true,
      message: `Hospital ${hospitalName} registered successfully!`,
      token: token,
      hospital: {
        id: hospitalUser._id,
        hospitalId: hospitalId,
        hospitalName: hospitalName,
        email: email,
        contact: contact,
        address: address,
        role: "hospital",
        isHospitalAdmin: true,
        totalBeds: parseInt(totalBeds),
        totalIcuBeds: parseInt(totalIcuBeds),
        totalOxygenCylinders: parseInt(totalOxygenCylinders)
      }
    });
    
  } catch (error) {
    console.error("❌ Hospital registration error:", error);
    
    // Handle specific errors
    let errorMessage = "Hospital registration failed. Please try again.";
    
    if (error.name === "ValidationError") {
      errorMessage = Object.values(error.errors).map(err => err.message).join(", ");
    } else if (error.code === 11000) {
      errorMessage = "Hospital with this email already exists";
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Update Hospital Resources (Fixing the resource update functionality)
router.put("/update-resources/:hospitalId", async (req, res) => {
  try {
    const Hospital = mongoose.model("Hospital");
    const {
      totalBeds,
      availableBeds,
      totalIcuBeds,
      availableIcuBeds,
      totalOxygenCylinders,
      availableOxygenCylinders
    } = req.body;

    const updateFields = {};
    if (totalBeds !== undefined) updateFields["facilities.totalBeds"] = parseInt(totalBeds) || 0;
    if (availableBeds !== undefined) updateFields["facilities.availableBeds"] = parseInt(availableBeds) || 0;
    if (totalIcuBeds !== undefined) updateFields["facilities.icuBeds"] = parseInt(totalIcuBeds) || 0;
    if (availableIcuBeds !== undefined) updateFields["facilities.availableIcuBeds"] = parseInt(availableIcuBeds) || 0;
    if (totalOxygenCylinders !== undefined) updateFields["facilities.oxygenCylinders"] = parseInt(totalOxygenCylinders) || 0;
    if (availableOxygenCylinders !== undefined) updateFields["facilities.availableOxygenCylinders"] = parseInt(availableOxygenCylinders) || 0;
    updateFields.lastUpdated = new Date();

    const hospital = await Hospital.findOneAndUpdate(
      { hospitalId: req.params.hospitalId },
      { $set: updateFields },
      { new: true }
    );

    if (!hospital) {
      // Fallback: check by _id if finding by hospitalId fails
      try {
        const hospitalByObjId = await Hospital.findByIdAndUpdate(
          req.params.hospitalId,
          { $set: updateFields },
          { new: true }
        );
        if (hospitalByObjId) {
          return res.json({
            success: true,
            hospital: hospitalByObjId
          });
        }
      } catch (err) {
        // ignore ObjId errors
      }

      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    res.json({
      success: true,
      hospital
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;