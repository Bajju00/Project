import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Models
import User from './models/User.js';
import Hospital from './models/Hospital.js';
import Ambulance from './models/Ambulance.js';
import Booking from './models/Booking.js';
import Donor from './models/Donor.js';
import BloodStock from './models/BloodStock.js';
import Emergency from './models/Emergency.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect db
    await connectDB();

    // Clear old data
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Ambulance.deleteMany({});
    await Booking.deleteMany({});
    await Donor.deleteMany({});
    await BloodStock.deleteMany({});
    await Emergency.deleteMany({});

    console.log('Existing database records cleared.');

    // 1. Create Default Blood Stocks
    await BloodStock.create({
      'O+': 45, 'O-': 8, 'A+': 38, 'A-': 7, 
      'B+': 32, 'B-': 4, 'AB+': 18, 'AB-': 2
    });
    console.log('Blood stocks inventory seeded.');

    // 2. Create Default Demo User
    const defaultUser = await User.create({
      fullName: 'LifeLink User',
      email: 'demo@lifelink.local',
      password: 'password123',
      phone: '+91 99999 88888',
      bloodGroup: 'O+',
      role: 'user',
      isDonor: false
    });
    console.log('Default demo patient user registered: demo@lifelink.local / password123');

    // 3. Create Hospitals
    const hospitalsData = [
      {
        name: 'City General Hospital',
        email: 'admin@citygeneral.local',
        password: 'password123',
        contact: { phone: '+91 98765 43210' },
        address: '123 Medical Street, New Delhi',
        facilities: { availableBeds: 15, availableIcuBeds: 5, availableOxygenCylinders: 25 },
        location: { type: 'Point', coordinates: [77.209, 28.6139] },
        distance: '2.3 km',
        rating: 4.5
      },
      {
        name: 'Medicare Center',
        email: 'admin@medicare.local',
        password: 'password123',
        contact: { phone: '+91 98765 43211' },
        address: '456 Health Avenue, Mumbai',
        facilities: { availableBeds: 8, availableIcuBeds: 2, availableOxygenCylinders: 15 },
        location: { type: 'Point', coordinates: [77.24, 28.62] },
        distance: '3.1 km',
        rating: 4.2
      },
      {
        name: 'Sunrise Medical',
        email: 'admin@sunrise.local',
        password: 'password123',
        contact: { phone: '+91 98765 43212' },
        address: '789 Health Road, Bangalore',
        facilities: { availableBeds: 12, availableIcuBeds: 3, availableOxygenCylinders: 20 },
        location: { type: 'Point', coordinates: [77.18, 28.59] },
        distance: '4.5 km',
        rating: 4.7
      },
      {
        name: 'Apollo Hospital',
        email: 'admin@apollo.local',
        password: 'password123',
        contact: { phone: '+91 98765 43213' },
        address: '101 Health Complex, Chennai',
        facilities: { availableBeds: 25, availableIcuBeds: 8, availableOxygenCylinders: 35 },
        location: { type: 'Point', coordinates: [77.26, 28.65] },
        distance: '5.2 km',
        rating: 4.8
      },
      {
        name: 'Fortis Hospital',
        email: 'admin@fortis.local',
        password: 'password123',
        contact: { phone: '+91 98765 43214' },
        address: '202 Medical Park, Kolkata',
        facilities: { availableBeds: 18, availableIcuBeds: 4, availableOxygenCylinders: 22 },
        location: { type: 'Point', coordinates: [77.16, 28.64] },
        distance: '1.8 km',
        rating: 4.6
      },
      {
        name: 'AIIMS Hospital',
        email: 'admin@aiims.local',
        password: 'password123',
        contact: { phone: '+91 98765 43215' },
        address: '303 Government Road, Delhi',
        facilities: { availableBeds: 45, availableIcuBeds: 12, availableOxygenCylinders: 50 },
        location: { type: 'Point', coordinates: [77.21, 28.57] },
        distance: '6.3 km',
        rating: 4.9
      }
    ];

    const seededHospitals = await Hospital.create(hospitalsData);
    console.log(`${seededHospitals.length} clinical hospitals seeded successfully.`);

    // 4. Create Ambulances (Link them to seeded hospitals to make fleet tracking functional)
    const ambulancesData = [
      {
        number: 'DL-3C-AM-1002',
        type: 'Mobile ICU',
        status: 'available',
        driver: 'Rajesh Kumar',
        phone: '+91 98765 00001',
        locationName: 'Connaught Place, New Delhi',
        location: [28.6304, 77.2177],
        equipment: ['Ventilator', 'Defibrillator', 'Oxygen Cylinder', 'Advanced Monitor', 'AED'],
        hospitalId: seededHospitals[0]._id // City General
      },
      {
        number: 'DL-2C-AM-4098',
        type: 'Advanced Life Support',
        status: 'available',
        driver: 'Vikram Singh',
        phone: '+91 98765 00002',
        locationName: 'Saket, New Delhi',
        location: [28.5244, 77.2167],
        equipment: ['Oxygen Port', 'Defibrillator', 'Patient Monitor', 'First Aid Kit'],
        hospitalId: seededHospitals[4]._id // Fortis Hospital
      },
      {
        number: 'DL-4C-AM-9988',
        type: 'Basic Life Support',
        status: 'available',
        driver: 'Amit Patel',
        phone: '+91 98765 00003',
        locationName: 'Dwarka, New Delhi',
        location: [28.5889, 77.0578],
        equipment: ['Oxygen Port', 'First Aid Kit', 'Manual Stretcher'],
        hospitalId: seededHospitals[3]._id // Apollo Hospital
      },
      {
        number: 'DL-1C-AM-0099',
        type: 'Mobile ICU',
        status: 'available',
        driver: 'Sanjay Dutt',
        phone: '+91 98765 00004',
        locationName: 'Rajouri Garden, New Delhi',
        location: [28.6415, 77.1209],
        equipment: ['Ventilator', 'Defibrillator', 'Oxygen Cylinder', 'Advanced Monitor'],
        hospitalId: seededHospitals[5]._id // AIIMS Hospital
      },
      {
        number: 'DL-5C-AM-3432',
        type: 'Basic Life Support',
        status: 'available',
        driver: 'Ramesh Sen',
        phone: '+91 98765 00005',
        locationName: 'Okhla, New Delhi',
        location: [28.5355, 77.2878],
        equipment: ['Oxygen Port', 'First Aid Kit'],
        hospitalId: seededHospitals[1]._id // Medicare Center
      },
      {
        number: 'DL-9C-AM-1122',
        type: 'Advanced Life Support',
        status: 'available',
        driver: 'Sohan Lal',
        phone: '+91 98765 00006',
        locationName: 'Indirapuram, NCR',
        location: [28.6358, 77.3732],
        equipment: ['Oxygen Port', 'Defibrillator', 'First Aid Kit'],
        hospitalId: seededHospitals[2]._id // Sunrise Medical
      }
    ];

    await Ambulance.create(ambulancesData);
    console.log('Initial ambulance fleet seeded.');

    // 5. Create Blood Donor volunteers
    const donorsData = [
      {
        name: 'Rahul Sharma',
        bloodGroup: 'O+',
        phone: '+91 98765 11111',
        address: 'Sec-12, Noida, UP',
        location: { type: 'Point', coordinates: [77.32, 28.57] },
        distance: '1.2 km',
        lastDonated: '2 months ago'
      },
      {
        name: 'Priya Patel',
        bloodGroup: 'A-',
        phone: '+91 98765 22222',
        address: 'Andheri West, Mumbai',
        location: { type: 'Point', coordinates: [77.23, 28.64] },
        distance: '2.5 km',
        lastDonated: '4 months ago'
      },
      {
        name: 'Amit Patel',
        bloodGroup: 'B+',
        phone: '+91 98765 33333',
        address: 'Indiranagar, Bangalore',
        location: { type: 'Point', coordinates: [77.15, 28.60] },
        distance: '3.4 km',
        lastDonated: '1 month ago'
      },
      {
        name: 'Anjali Gupta',
        bloodGroup: 'O-',
        phone: '+91 98765 44444',
        address: 'Salt Lake, Kolkata',
        location: { type: 'Point', coordinates: [77.28, 28.63] },
        distance: '4.1 km',
        lastDonated: '5 months ago'
      },
      {
        name: 'Vikram Singh',
        bloodGroup: 'AB+',
        phone: '+91 98765 55555',
        address: 'Karol Bagh, New Delhi',
        location: { type: 'Point', coordinates: [77.19, 28.56] },
        distance: '5.8 km',
        lastDonated: 'Never'
      },
      {
        name: 'Neha Roy',
        bloodGroup: 'B-',
        phone: '+91 98765 66666',
        address: 'Connaught Place, New Delhi',
        location: { type: 'Point', coordinates: [77.22, 28.61] },
        distance: '0.8 km',
        lastDonated: '3 months ago'
      }
    ];

    await Donor.create(donorsData);
    console.log('Blood donor volunteers list seeded.');

    console.log('Database Seeding Complete!');
    process.exit();
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
