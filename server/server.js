const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
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

// Load Models (registers schemas in Mongoose)
require("./models/User");
require("./models/Hospital");
require("./models/Emergency");
require("./models/Ambulance");
require("./models/BloodRequest");

// ====================
// BASIC ROUTE HANDLERS
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
// MODULAR ROUTES
// ====================

app.use("/api/auth", require("./routes/auth"));
app.use("/api/hospitals", require("./routes/hospitals"));
app.use("/api/hospital", require("./routes/hospitals")); // maps /api/hospital/register
app.use("/api/emergency", require("./routes/emergency"));
app.use("/api/ambulances", require("./routes/ambulances"));
app.use("/api/blood", require("./routes/blood"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/test", require("./routes/test"));
app.use("/api/debug", require("./routes/test"));

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