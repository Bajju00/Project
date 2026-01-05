const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bloodGroup: { type: String },
    isBloodDonor: { type: Boolean, default: false },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: true },  // ADD THIS LINE
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
    // Only hash if password is modified (or new)
    if (!this.isModified("password")) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords - MUST BE comparePassword (not matchPassword)
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Optional: Keep matchPassword as alias for future compatibility
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user info without sensitive data
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;