const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        console.log("💡 Using mock data mode...");
    }
};

connectDB();

// Load Models
require("./models/User");
require("./models/Hospital");
require("./models/Emergency");
require("./models/Ambulance");
require("./models/BloodRequest");

// Import Middleware
const auth = require("./middleware/auth");

// ====================
// ADMIN AUTH MIDDLEWARE (FIXED)
// ====================
const adminAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'No token provided' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;  // FIXED: Use 'id' not 'userId'
    
    // Check if user exists
    const User = mongoose.model('User');
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Check if user has admin role
    // If role field doesn't exist, check by email as fallback
    if (user.role && user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }
    
    // Fallback: Check by email if role field doesn't exist
    if (!user.role && user.email !== 'admin@lifelink.com') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

// ====================
// BASIC ROUTES
// ====================

// Home Route
app.get("/", (req, res) => {
    res.json({
        message: "🚑 LifeLink API Server",
        status: "running",
        version: "1.0.0",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        endpoints: [
            { method: "POST", path: "/api/auth/register", description: "Register user" },
            { method: "POST", path: "/api/auth/login", description: "Login user" },
            { method: "GET", path: "/api/hospitals", description: "Get hospitals" },
            { method: "GET", path: "/api/hospitals/nearby", description: "Find nearby hospitals" },
            { method: "POST", path: "/api/emergency/sos", description: "Send emergency SOS" },
            { method: "GET", path: "/api/admin/stats", description: "Get admin stats (admin only)" }
        ]
    });
});

// Health Check
app.get("/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    };
    
    res.json({
        status: dbStatus === 1 ? "OK" : "WARNING",
        timestamp: new Date().toISOString(),
        database: statusMap[dbStatus] || "unknown",
        uptime: process.uptime()
    });
});

// ====================
// AUTH ROUTES (UPDATED WITH ROLE SUPPORT)
// ====================

// Register User
app.post("/api/auth/register", async (req, res) => {
    try {
        const User = mongoose.model("User");
        const { fullName, email, mobile, password, bloodGroup } = req.body;
        
        // Check required fields
        if (!fullName || !email || !mobile || !password) {
            return res.status(400).json({
                success: false,
                error: "Please provide all required fields"
            });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "User already exists"
            });
        }
        
        // Create user
        const user = new User({
            fullName,
            email,
            mobile,
            password,
            bloodGroup,
            isVerified: true,
            role: email === 'admin@lifelink.com' ? 'admin' : 'user' // Auto-set admin role for admin email
        });
        
        await user.save();
        
        // Generate token with role
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "7d" }
        );
        
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                bloodGroup: user.bloodGroup,
                isBloodDonor: user.isBloodDonor,
                isVerified: user.isVerified,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: "Email or mobile number already exists"
            });
        }
        
        res.status(500).json({
            success: false,
            error: "Registration failed"
        });
    }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
    try {
        const User = mongoose.model("User");
        const { email, password } = req.body;
        
        // Check for email and password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Please provide email and password"
            });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log("Login failed: User not found for email:", email);
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }
        
        // Check if user is verified
        if (user.isVerified === false) {
            return res.status(401).json({
                success: false,
                error: "Please verify your account first"
            });
        }
        
        // Check password
        let isPasswordValid;
        try {
            if (typeof user.comparePassword === 'function') {
                isPasswordValid = await user.comparePassword(password);
            } else {
                // Fallback: Use bcrypt directly
                const bcrypt = require('bcryptjs');
                isPasswordValid = await bcrypt.compare(password, user.password);
            }
        } catch (bcryptError) {
            console.error("Password comparison error:", bcryptError);
            isPasswordValid = false;
        }
        
        if (!isPasswordValid) {
            console.log("Login failed: Password mismatch for user:", email);
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }
        
        console.log("✅ Login successful for:", email);
        
        // Generate token with role
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role || (email === 'admin@lifelink.com' ? 'admin' : 'user')
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "7d" }
        );
        
        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                bloodGroup: user.bloodGroup,
                isBloodDonor: user.isBloodDonor,
                isVerified: user.isVerified,
                role: user.role || (email === 'admin@lifelink.com' ? 'admin' : 'user')
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            success: false,
            error: "Login failed"
        });
    }
});

// ====================
// HOSPITAL ROUTES
// ====================

// Get all hospitals
app.get("/api/hospitals", async (req, res) => {
    try {
        const Hospital = mongoose.model("Hospital");
        
        // Mock data for testing if DB not connected
        if (mongoose.connection.readyState !== 1) {
            const mockHospitals = [
                {
                    id: 1,
                    name: "City General Hospital",
                    address: "123 Medical Street, New Delhi",
                    availableBeds: 15,
                    availableICU: 5,
                    distance: "2.3 km"
                },
                {
                    id: 2,
                    name: "Medicare Center",
                    address: "456 Health Avenue, Mumbai",
                    availableBeds: 8,
                    availableICU: 2,
                    distance: "3.1 km"
                },
                {
                    id: 3,
                    name: "Sunrise Medical",
                    address: "789 Health Road, Bangalore",
                    availableBeds: 12,
                    availableICU: 3,
                    distance: "4.5 km"
                }
            ];
            
            return res.json({
                success: true,
                message: "Using mock data",
                count: mockHospitals.length,
                hospitals: mockHospitals
            });
        }
        
        const hospitals = await Hospital.find({ status: "active" })
            .select("name address location availableBeds availableICU status")
            .limit(20);
            
        res.json({
            success: true,
            count: hospitals.length,
            hospitals
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
app.get("/api/hospitals/nearby", async (req, res) => {
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

// ====================
// EMERGENCY ROUTES
// ====================

// Send Emergency SOS
app.post("/api/emergency/sos", auth, async (req, res) => {
    try {
        const { location, emergencyType, description } = req.body;
        
        if (!location || !emergencyType) {
            return res.status(400).json({
                success: false,
                error: "Location and emergency type are required"
            });
        }
        
        const Emergency = mongoose.model("Emergency");
        const emergency = new Emergency({
            user: req.userId,
            location: {
                type: "Point",
                coordinates: location
            },
            emergencyType,
            description,
            status: "pending"
        });
        
        await emergency.save();
        
        res.status(201).json({
            success: true,
            message: "Emergency SOS sent successfully",
            emergencyId: emergency._id,
            instructions: [
                "Stay calm and do not move unnecessarily",
                "Keep your phone accessible",
                "Help is on the way"
            ]
        });
    } catch (error) {
        console.error("Emergency SOS error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to send emergency SOS"
        });
    }
});

// ====================
// AMBULANCE ROUTES
// ====================

app.get('/api/ambulances', async (req, res) => {
  try {
    const Ambulance = mongoose.model('Ambulance');
    const ambulances = await Ambulance.find({ status: 'available' });
    res.json({ success: true, ambulances });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch ambulances' });
  }
});

app.post('/api/ambulances/book', auth, async (req, res) => {
  try {
    const { ambulanceId, patientName, location, emergencyType } = req.body;
    
    const Ambulance = mongoose.model('Ambulance');
    const ambulance = await Ambulance.findByIdAndUpdate(
      ambulanceId,
      { status: 'busy', bookedBy: req.userId },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Ambulance booked successfully',
      ambulance,
      bookingId: new mongoose.Types.ObjectId()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to book ambulance' });
  }
});

// ====================
// BLOOD DONOR ROUTES
// ====================

app.get('/api/blood/donors', async (req, res) => {
  try {
    const User = mongoose.model('User');
    const donors = await User.find({ 
      isBloodDonor: true,
      isVerified: true 
    }).select('fullName bloodGroup email mobile');
    
    res.json({ success: true, donors });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch donors' });
  }
});

app.post('/api/blood/donor-register', auth, async (req, res) => {
  try {
    const User = mongoose.model('User');
    const user = await User.findByIdAndUpdate(
      req.userId,
      { isBloodDonor: true, bloodGroup: req.body.bloodGroup },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Registered as blood donor successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to register as donor' });
  }
});

// ====================
// ADMIN ROUTES (PROTECTED)
// ====================

app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const User = mongoose.model('User');
    const Hospital = mongoose.model('Hospital');
    const Emergency = mongoose.model('Emergency');
    const Ambulance = mongoose.model('Ambulance');

    const totalUsers = await User.countDocuments();
    const totalHospitals = await Hospital.countDocuments({ status: 'active' });
    const activeEmergencies = await Emergency.countDocuments({ status: 'active' });
    const totalAmbulances = await Ambulance.countDocuments({ status: 'available' });
    
    // Calculate available beds
    const hospitals = await Hospital.find({ status: 'active' });
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
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/hospitals', adminAuth, async (req, res) => {
  try {
    const Hospital = mongoose.model('Hospital');
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch hospitals' });
  }
});

app.get('/api/admin/emergencies', adminAuth, async (req, res) => {
  try {
    const Emergency = mongoose.model('Emergency');
    const emergencies = await Emergency.find()
      .populate('user', 'fullName email mobile')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, emergencies });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch emergencies' });
  }
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const User = mongoose.model('User');
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// ====================
// ADMIN UTILITY ROUTES
// ====================

// Create or fix admin user
app.post("/api/admin/create-admin", async (req, res) => {
  try {
    const User = mongoose.model("User");
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@lifelink.com" });
    if (existingAdmin && existingAdmin.role === 'admin') {
      return res.json({
        success: true,
        message: "Admin already exists",
        admin: existingAdmin.email
      });
    }
    
    // Create or update admin
    const bcrypt = require('bcryptjs');
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

// Check admin user status
app.get("/api/admin/check-admin", async (req, res) => {
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

// Add this route to server.js
app.get("/api/admin/verify", adminAuth, (req, res) => {
  res.json({
    success: true,
    message: "Admin verified",
    user: {
      id: req.userId,
      isAdmin: true
    }
  });
});



// Add role field to all users
app.post("/api/admin/add-role-field", adminAuth, async (req, res) => {
  try {
    const User = mongoose.model("User");
    
    // Update all existing users to have 'user' role by default
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    
    // Set specific user as admin
    const adminResult = await User.updateOne(
      { email: 'admin@lifelink.com' },
      { $set: { role: 'admin' } }
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

// ====================
// TEST & DEBUG ROUTES
// ====================

// Test protected route
app.get("/api/test/protected", auth, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed successfully",
        userId: req.userId
    });
});

// Test models
app.get("/api/test/models", (req, res) => {
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
app.get("/api/debug/user-model", async (req, res) => {
  try {
    const User = mongoose.model("User");
    
    // Get schema paths
    const schemaPaths = User.schema.paths;
    const paths = Object.keys(schemaPaths)
      .filter(key => !key.startsWith('_'))
      .map(key => ({
        field: key,
        type: schemaPaths[key].instance,
        required: schemaPaths[key].isRequired || false
      }));
    
    // Check if 'role' field exists
    const hasRoleField = User.schema.path('role') !== undefined;
    
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
app.post("/api/debug/test-login", async (req, res) => {
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
        if (typeof user.comparePassword === 'function') {
            passwordMatch = await user.comparePassword(password);
        } else {
            const bcrypt = require('bcryptjs');
            passwordMatch = await bcrypt.compare(password, user.password);
        }
        
        res.json({
            success: true,
            userExists: true,
            email: user.email,
            role: user.role || 'none',
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
// ====================
// TEST ROUTES (ADD THIS SECTION BEFORE app.listen)
// ====================

// Initialize test data
app.post("/api/test/init", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const Hospital = mongoose.model("Hospital");
    const bcrypt = require('bcryptjs');
    
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
    
    res.json({
      success: true,
      message: "Test users created successfully",
      users: createdUsers.map(u => ({
        email: u.email,
        role: u.role,
        password: "Check source code for passwords"
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
app.get("/api/test/users", async (req, res) => {
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
    }).select('-password');
    
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

// Add this to your server.js (before error handling middleware)

// ====================
// HOSPITAL REGISTRATION (UPDATED with better error handling)
// ====================

app.post("/api/hospital/register", async (req, res) => {
  try {
    console.log("🏥 Hospital registration request received:", req.body);
    
    // Check if models are loaded
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
    const requiredFields = ['hospitalName', 'email', 'password', 'contact', 'address'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
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
    const hospitalId = 'HOS' + Date.now().toString().slice(-6);
    
    // Create hospital user account
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const hospitalUserData = {
      fullName: `${hospitalName} Administrator`,
      email: email.toLowerCase(),
      mobile: contact,
      password: hashedPassword,
      role: 'hospital',
      userType: 'hospital',
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
    
    console.log("Creating hospital user with data:", { ...hospitalUserData, password: 'HIDDEN' });
    
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
          status: 'active',
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
        role: 'hospital',
        hospitalId: hospitalId
      },
      process.env.JWT_SECRET || 'your-secret-key',
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
        role: 'hospital',
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
    
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = "Hospital with this email already exists";
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================
// TEST HOSPITAL REGISTRATION ENDPOINT
// ====================

app.post("/api/test/hospital-register", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const bcrypt = require('bcryptjs');
    
    // Create a test hospital
    const hospitalId = 'HOS' + Date.now().toString().slice(-6);
    const testEmail = `testhospital${Date.now().toString().slice(-6)}@lifelink.com`;
    
    const hospitalUser = new User({
      fullName: 'Test Hospital Administrator',
      email: testEmail,
      mobile: '+91 9876543210',
      password: await bcrypt.hash('test123', 10),
      role: 'hospital',
      userType: 'hospital',
      isHospitalAdmin: true,
      isVerified: true,
      hospitalName: 'Test Hospital',
      hospitalId: hospitalId,
      hospitalAddress: 'Test Address',
      address: 'Test Address',
      phone: '+91 9876543210'
    });
    
    await hospitalUser.save();
    
    res.json({
      success: true,
      message: 'Test hospital created',
      credentials: {
        email: testEmail,
        password: 'test123',
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

// ====================
// START SERVER
// ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"}`);
    console.log("\n📋 Available Endpoints:");
    console.log("   GET  /                           - Server status");
    console.log("   GET  /health                     - Health check");
    console.log("   POST /api/auth/register          - Register user");
    console.log("   POST /api/auth/login             - Login user");
    console.log("   GET  /api/admin/stats            - Admin stats (admin only)");
    console.log("   GET  /api/admin/check-admin      - Check admin user status");
    console.log("   POST /api/admin/create-admin     - Create admin user");
    console.log("   GET  /api/debug/user-model       - Debug user model");
    console.log("   GET  /api/test/models            - Check model loading");
    console.log("   POST /api/test/init              - Create test users");
    console.log("   GET  /api/test/users             - List test users");
});