const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

// Send Emergency SOS
router.post("/sos", auth, async (req, res) => {
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

module.exports = router;