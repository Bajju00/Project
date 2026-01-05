const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema({
    ambulanceNumber: { type: String, required: true, unique: true },
    driver: { name: String, phone: String },
    status: { type: String, default: "available" }
});

const Ambulance = mongoose.model("Ambulance", ambulanceSchema);
module.exports = Ambulance;
