const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const adminAuth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: "No token provided" 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    
    // Check if user exists
    const User = mongoose.model("User");
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: "User not found" 
      });
    }
    
    // Check if user has admin role
    if (user.role && user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Admin access required" 
      });
    }
    
    // Fallback: Check by email if role field doesn't exist
    if (!user.role && user.email !== "admin@lifelink.com") {
      return res.status(403).json({ 
        success: false, 
        error: "Admin access required" 
      });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: "Invalid token" 
    });
  }
};

module.exports = adminAuth;
