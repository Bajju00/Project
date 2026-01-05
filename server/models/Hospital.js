const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    registrationId: {
        type: String,
        unique: true,
        sparse: true  // This allows multiple null values
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        fullAddress: String
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    contact: {
        phone: {
            type: String,
            required: true
        },
        emergencyPhone: String,
        email: String,
        website: String
    },
    facilities: {
        totalBeds: {
            type: Number,
            default: 0
        },
        availableBeds: {
            type: Number,
            default: 0
        },
        icuBeds: {
            type: Number,
            default: 0
        },
        availableIcuBeds: {
            type: Number,
            default: 0
        },
        oxygenCylinders: {
            type: Number,
            default: 0
        },
        availableOxygenCylinders: {
            type: Number,
            default: 0
        }
    },
    specialties: [String],
    status: {
        type: String,
        enum: ["active", "inactive", "full"],
        default: "active"
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
hospitalSchema.index({ location: "2dsphere" });
hospitalSchema.index({ status: 1 });

const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;