import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  contact: {
    phone: {
      type: String,
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  facilities: {
    availableBeds: {
      type: Number,
      default: 0
    },
    availableIcuBeds: {
      type: Number,
      default: 0
    },
    availableOxygenCylinders: {
      type: Number,
      default: 0
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [77.2099, 28.6139] // Delhi coords
    }
  },
  rating: {
    type: Number,
    default: 4.5
  },
  distance: {
    type: String,
    default: 'Local'
  }
}, {
  timestamps: true
});

// Geospatial index for nearby queries
hospitalSchema.index({ location: '2dsphere' });

// Hash password before saving
hospitalSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
hospitalSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

import { createMockModel } from './modelHelper.js';

const MongooseHospital = mongoose.model('Hospital', hospitalSchema);
const MockHospital = createMockModel('hospitals');

const Hospital = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = global.useLocalDB ? MockHospital : MongooseHospital;
    return activeModel[prop];
  }
});

export default Hospital;
