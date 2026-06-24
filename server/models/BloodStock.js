import mongoose from 'mongoose';

const bloodStockSchema = new mongoose.Schema({
  'O+': { type: Number, default: 45 },
  'O-': { type: Number, default: 8 },
  'A+': { type: Number, default: 38 },
  'A-': { type: Number, default: 7 },
  'B+': { type: Number, default: 32 },
  'B-': { type: Number, default: 4 },
  'AB+': { type: Number, default: 18 },
  'AB-': { type: Number, default: 2 }
}, {
  timestamps: true
});

import { createMockModel } from './modelHelper.js';

const MongooseBloodStock = mongoose.model('BloodStock', bloodStockSchema);
const MockBloodStock = createMockModel('bloodstocks');

const BloodStock = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = global.useLocalDB ? MockBloodStock : MongooseBloodStock;
    return activeModel[prop];
  }
});

export default BloodStock;
