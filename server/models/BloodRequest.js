const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    unitsRequired: { type: Number, required: true },
    status: { type: String, default: "pending" }
});

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);
module.exports = BloodRequest;
