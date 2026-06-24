import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  ambulanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulance',
    required: true
  },
  ambulanceNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  emergencyType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Dispatched', 'Completed'],
    default: 'Pending'
  },
  handoverNotes: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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

const MongooseBooking = mongoose.model('Booking', bookingSchema);
const MockBooking = createMockModel('bookings');

const Booking = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = global.useLocalDB ? MockBooking : MongooseBooking;
    return activeModel[prop];
  }
});

export default Booking;
