import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  location: {
    type: [Number], // [lng, lat]
    required: true
  },
  emergencyType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

import { createMockModel } from './modelHelper.js';

const MongooseEmergency = mongoose.model('Emergency', emergencySchema);
const MockEmergency = createMockModel('emergencies');

const Emergency = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = global.useLocalDB ? MockEmergency : MongooseEmergency;
    return activeModel[prop];
  }
});

export default Emergency;
