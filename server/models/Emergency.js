const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emergencyType: { type: String, required: true },
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

const Emergency = mongoose.model("Emergency", emergencySchema);
module.exports = Emergency;
