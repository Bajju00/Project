import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Basic Life Support', 'Advanced Life Support', 'Mobile ICU'],
    default: 'Basic Life Support'
  },
  status: {
    type: String,
    enum: ['available', 'busy'],
    default: 'available'
  },
  driver: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  locationName: {
    type: String,
    required: true
  },
  location: {
    type: [Number], // [lat, lng]
    default: [28.6139, 77.2099]
  },
  equipment: {
    type: [String],
    default: ['Oxygen Port', 'Basic First Aid Kit']
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null
  }
}, {
  timestamps: true
});

import { createMockModel } from './modelHelper.js';

const MongooseAmbulance = mongoose.model('Ambulance', ambulanceSchema);
const MockAmbulance = createMockModel('ambulances');

const Ambulance = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = global.useLocalDB ? MockAmbulance : MongooseAmbulance;
    return activeModel[prop];
  }
});

export default Ambulance;
