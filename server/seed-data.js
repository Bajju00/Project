console.log("🌱 Seeding LifeLink database...");

const mongoose = require("mongoose");
require("dotenv").config();

async function seed() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        
        // Load models
        const User = require("./models/User");
        const Hospital = require("./models/Hospital");
        const Ambulance = require("./models/Ambulance");
        const Emergency = require("./models/Emergency");
        const BloodRequest = require("./models/BloodRequest");
        
        // Clear old data
        console.log("🧹 Clearing old data...");
        await User.deleteMany({});
        await Hospital.deleteMany({});
        await Ambulance.deleteMany({});
        await Emergency.deleteMany({});
        await BloodRequest.deleteMany({});
        console.log("✅ Old data cleared");
        
        // ========== CREATE USERS ==========
        console.log("👥 Creating users...");
        
        // Create admin user - USE PLAIN PASSWORD ONLY!
        const adminUser = new User({
            fullName: "Admin User",
            email: "admin@lifelink.com",
            mobile: "9876543210",
            password: "admin123", // PLAIN PASSWORD - model will hash it
            bloodGroup: "O+",
            isBloodDonor: true,
            role: "admin",
            isVerified: true,
            address: {
                city: "New Delhi",
                state: "Delhi"
            }
        });
        await adminUser.save();
        console.log("   ✅ Admin: admin@lifelink.com / admin123");
        
        // Create regular user
        const regularUser = new User({
            fullName: "John Patient",
            email: "user@example.com",
            mobile: "9876543211",
            password: "user123", // PLAIN PASSWORD - model will hash it
            bloodGroup: "A+",
            isBloodDonor: true,
            role: "user",
            isVerified: true,
            address: {
                city: "Mumbai",
                state: "Maharashtra"
            }
        });
        await regularUser.save();
        console.log("   ✅ User: user@example.com / user123");
        
        // Create donor user
        const donorUser = new User({
            fullName: "Priya Sharma",
            email: "donor@example.com",
            mobile: "9876543212",
            password: "donor123", // PLAIN PASSWORD - model will hash it
            bloodGroup: "B+",
            isBloodDonor: true,
            role: "user",
            isVerified: true,
            address: {
                city: "Bangalore",
                state: "Karnataka"
            }
        });
        await donorUser.save();
        console.log("   ✅ Donor: donor@example.com / donor123");
        
        // ========== CREATE HOSPITALS ==========
        console.log("🏥 Creating hospitals...");
        
        const hospitals = [
            {
                name: "City General Hospital",
                registrationId: "HOSP001",
                address: "123 Medical Street, Connaught Place, New Delhi - 110001",
                location: {
                    type: "Point",
                    coordinates: [77.2090, 28.6139] // Delhi
                },
                contact: {
                    phone: "011-23456789",
                    emergencyPhone: "011-23456790",
                    email: "info@citygeneral.com"
                },
                facilities: {
                    totalBeds: 200,
                    availableBeds: 45,
                    icuBeds: 30,
                    availableIcuBeds: 8,
                    oxygenCylinders: 100,
                    availableOxygenCylinders: 42
                },
                specialties: ["Cardiology", "Emergency", "Neurology", "Surgery"],
                status: "active",
                lastUpdated: new Date()
            },
            {
                name: "Medicare Center",
                registrationId: "HOSP002",
                address: "456 Health Avenue, Fort, Mumbai - 400001",
                location: {
                    type: "Point",
                    coordinates: [72.8777, 19.0760] // Mumbai
                },
                contact: {
                    phone: "022-23456789",
                    emergencyPhone: "022-23456790",
                    email: "contact@medicare.com"
                },
                facilities: {
                    totalBeds: 150,
                    availableBeds: 25,
                    icuBeds: 20,
                    availableIcuBeds: 5,
                    oxygenCylinders: 80,
                    availableOxygenCylinders: 30
                },
                specialties: ["Pediatrics", "Orthopedics", "General Medicine"],
                status: "active",
                lastUpdated: new Date()
            },
            {
                name: "Sunrise Medical Hospital",
                registrationId: "HOSP003",
                address: "789 Health Road, MG Road, Bangalore - 560001",
                location: {
                    type: "Point",
                    coordinates: [77.5946, 12.9716] // Bangalore
                },
                contact: {
                    phone: "080-23456789",
                    emergencyPhone: "080-23456790",
                    email: "care@sunrisehospital.com"
                },
                facilities: {
                    totalBeds: 180,
                    availableBeds: 32,
                    icuBeds: 25,
                    availableIcuBeds: 6,
                    oxygenCylinders: 90,
                    availableOxygenCylinders: 35
                },
                specialties: ["Cardiology", "ICU", "Trauma", "Emergency"],
                status: "active",
                lastUpdated: new Date()
            }
        ];
        
        for (let i = 0; i < hospitals.length; i++) {
            const hospital = new Hospital(hospitals[i]);
            await hospital.save();
            console.log(`   ✅ Hospital: ${hospital.name} (${hospital.registrationId})`);
        }
        
        // ========== CREATE AMBULANCES ==========
        console.log("🚑 Creating ambulances...");
        
        const ambulances = [
            {
                ambulanceNumber: "AMB001",
                driver: {
                    name: "Rajesh Kumar",
                    phone: "9876543222",
                    licenseNumber: "DL123456"
                },
                location: {
                    type: "Point",
                    coordinates: [77.2090, 28.6139] // Delhi
                },
                type: "advanced",
                status: "available",
                createdAt: new Date()
            },
            {
                ambulanceNumber: "AMB002",
                driver: {
                    name: "Suresh Patel",
                    phone: "9876543223",
                    licenseNumber: "MH123456"
                },
                location: {
                    type: "Point",
                    coordinates: [72.8777, 19.0760] // Mumbai
                },
                type: "basic",
                status: "available",
                createdAt: new Date()
            },
            {
                ambulanceNumber: "AMB003",
                driver: {
                    name: "Amit Singh",
                    phone: "9876543224",
                    licenseNumber: "KA123456"
                },
                location: {
                    type: "Point",
                    coordinates: [77.5946, 12.9716] // Bangalore
                },
                type: "mobile_icu",
                status: "available",
                createdAt: new Date()
            }
        ];
        
        for (let i = 0; i < ambulances.length; i++) {
            const ambulance = new Ambulance(ambulances[i]);
            await ambulance.save();
            console.log(`   ✅ Ambulance: ${ambulance.ambulanceNumber}`);
        }
        
        // Verify users were created with proper hashing
        console.log("\n🔍 Verifying user passwords...");
        const testUsers = [
            { email: "admin@lifelink.com", password: "admin123" },
            { email: "user@example.com", password: "user123" },
            { email: "donor@example.com", password: "donor123" }
        ];
        
        for (const test of testUsers) {
            const user = await User.findOne({ email: test.email });
            if (user) {
                const isValid = await user.comparePassword(test.password);
                console.log(`   ${test.email}: ${isValid ? '✅ Password correct' : '❌ Password incorrect'}`);
            }
        }
        
        console.log("\n🎉 Database Seeding Completed Successfully!");
        console.log("\n📊 Summary:");
        console.log("   Users: 3 (with proper password hashing)");
        console.log("   Hospitals: 3");
        console.log("   Ambulances: 3");
        console.log("\n🔑 Test Credentials:");
        console.log("   Admin: admin@lifelink.com / admin123");
        console.log("   User: user@example.com / user123");
        console.log("   Donor: donor@example.com / donor123");
        console.log("\n📍 Test Coordinates:");
        console.log("   Delhi: lat=28.6139, lng=77.2090");
        console.log("   Mumbai: lat=19.0760, lng=72.8777");
        console.log("   Bangalore: lat=12.9716, lng=77.5946");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error("Stack:", error.stack);
        process.exit(1);
    }
}

// Run the seeding
seed();