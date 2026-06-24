import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
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
  phone: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'hospital'],
    default: 'user'
  },
  isDonor: {
    type: Boolean,
    default: false
  },
  age: {
    type: Number,
    default: 30
  },
  weight: {
    type: Number,
    default: 70
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

import { createMockModel } from './modelHelper.js';

const MongooseUser = mongoose.model('User', userSchema);
const MockUser = createMockModel('users');

const User = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = global.useLocalDB ? MockUser : MongooseUser;
    return activeModel[prop];
  }
});

export default User;
