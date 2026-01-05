const express = require("express");
const Hospital = require("../models/Hospital");
const router = express.Router();

// UPDATE HOSPITAL RESOURCES
router.put("/update-resources/:hospitalId", async (req, res) => {
  try {
    const {
      totalBeds,
      availableBeds,
      totalIcuBeds,              // coming from frontend
      availableIcuBeds,
      totalOxygenCylinders,
      availableOxygenCylinders
    } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.hospitalId,
      {
        facilities: {
          totalBeds,
          availableBeds,
          icuBeds: totalIcuBeds,               // 🔥 mapping fix
          availableIcuBeds,
          oxygenCylinders: totalOxygenCylinders,
          availableOxygenCylinders
        },
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!hospital) {
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

router.get("/hospitals", async (req, res) => {
  const hospitals = await Hospital.find({ status: "active" });

  res.json({
    success: true,
    hospitals
  });
});


module.exports = router;
