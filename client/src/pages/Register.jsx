// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    bloodGroup: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Function to generate unique test data for development
  const fillTestData = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    
    setFormData({
      fullName: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      mobile: `98765${randomNum.toString().padStart(4, '0')}`,
      password: 'test123',
      confirmPassword: 'test123',
      bloodGroup: 'O+'
    });
    
    toast.success('Test data filled! Use these unique credentials.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.mobile.match(/^[0-9]{10}$/)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        bloodGroup: formData.bloodGroup || undefined // Send undefined if empty
      };

      console.log('📤 Registering user:', userData);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error details:', error);
      
      // Show specific error messages
      if (error.response?.data?.error === 'User already exists') {
        toast.error('Email or mobile number already registered. Please use different credentials.');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Make sure backend is running on http://localhost:5000');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Development Banner */}
        

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600 mt-2">Join LifeLink for emergency healthcare services</p>
          </div>
          
          
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="Enter your email"
              />
              <p className="text-sm text-gray-500 mt-1">Use a unique email not already registered</p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="10-digit number (9876543210)"
              />
              <p className="text-sm text-gray-500 mt-1">Must be 10 digits, no spaces or special characters</p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              >
                <option value="">Select Blood Group (Optional)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="Confirm your password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-red-600 hover:text-red-800 font-bold">
                Login here
              </Link>
            </p>
            <p className="text-center text-gray-500 text-sm mt-2">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Quick Login Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">Want to test quickly?</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <span className="mr-2">👤</span>
              Login as User
            </Link>
            <Link 
              to="/admin/login" 
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            >
              <span className="mr-2">👨‍💼</span>
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;