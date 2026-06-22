const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Register User
router.post("/register", async (req, res) => {
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
            role: email === "admin@lifelink.com" ? "admin" : "user" // Auto-set admin role for admin email
        });
        
        await user.save();
        
        // Generate token with role
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role || "user"
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
                role: user.role || "user"
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
router.post("/login", async (req, res) => {
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
            if (typeof user.comparePassword === "isPasswordValid") {
                // Check if user.comparePassword is a function
            }
            if (typeof user.comparePassword === "function") {
                isPasswordValid = await user.comparePassword(password);
            } else {
                // Fallback: Use bcrypt directly
                const bcrypt = require("bcryptjs");
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
                role: user.role || (email === "admin@lifelink.com" ? "admin" : "user")
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
                role: user.role || (email === "admin@lifelink.com" ? "admin" : "user")
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

module.exports = router;