import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [77.2099, 28.6139]
    }
  },
  distance: {
    type: String,
    default: 'Local'
  },
  lastDonated: {
    type: String,
    default: 'Never'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

donorSchema.index({ location: '2dsphere' });

import { createMockModel } from './modelHelper.js';

const MongooseDonor = mongoose.model('Donor', donorSchema);
const MockDonor = createMockModel('donors');

const Donor = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = global.useLocalDB ? MockDonor : MongooseDonor;
    return activeModel[prop];
  }
});

export default Donor;
