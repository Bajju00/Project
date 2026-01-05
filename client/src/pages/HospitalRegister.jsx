// src/pages/HospitalRegister.jsx - UPDATED
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const HospitalRegister = () => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
    address: '',
    totalBeds: 50,
    totalIcuBeds: 10,
    totalOxygenCylinders: 20
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Validate required fields
    if (!formData.hospitalName || !formData.email || !formData.contact || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Call hospital registration API
      const response = await fetch('http://localhost:5000/api/hospital/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospitalName: formData.hospitalName,
          email: formData.email,
          password: formData.password,
          contact: formData.contact,
          address: formData.address,
          totalBeds: parseInt(formData.totalBeds),
          totalIcuBeds: parseInt(formData.totalIcuBeds),
          totalOxygenCylinders: parseInt(formData.totalOxygenCylinders)
        })
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (data.success) {
        // Save token and hospital data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.hospital));
        localStorage.setItem('isHospital', 'true');
        
        toast.success(data.message || 'Hospital registered successfully!');
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setFormData({
      hospitalName: 'City General Hospital',
      email: `hospital${Date.now().toString().slice(-6)}@lifelink.com`,
      password: 'hospital123',
      confirmPassword: 'hospital123',
      contact: '+91 9876543210',
      address: '123 Medical Street, New Delhi',
      totalBeds: 60,
      totalIcuBeds: 12,
      totalOxygenCylinders: 30
    });
    
    toast.success('Demo data filled. Modify as needed.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Hospital Registration</h2>
            <p className="text-gray-600 mt-2">Register your hospital to manage resources and emergencies</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hospital Information */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Hospital Information</h3>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
                  Hospital Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="City General Hospital"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="hospital@example.com"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
                  Complete Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="123 Medical Street, City, State, Pincode"
                />
              </div>
              
              {/* Initial Resources */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Initial Resources</h3>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Total Beds</label>
                <input
                  type="number"
                  value={formData.totalBeds}
                  onChange={(e) => setFormData({...formData, totalBeds: e.target.value})}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">ICU Beds</label>
                <input
                  type="number"
                  value={formData.totalIcuBeds}
                  onChange={(e) => setFormData({...formData, totalIcuBeds: e.target.value})}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Oxygen Cylinders</label>
                <input
                  type="number"
                  value={formData.totalOxygenCylinders}
                  onChange={(e) => setFormData({...formData, totalOxygenCylinders: e.target.value})}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Account Information */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Account Information</h3>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="h-4 w-4 text-green-600 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I certify that this information is correct and I have authorization to register this hospital
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering Hospital...
                </div>
              ) : (
                'Register Hospital'
              )}
            </button>
          </form>

          {/* Quick Fill Button */}
          <div className="mt-6">
            <button
              onClick={handleQuickFill}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium transition"
            >
              Fill Demo Hospital Data
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">
              Already have a hospital account?{' '}
              <Link to="/admin/login" className="text-green-600 hover:text-green-800 font-medium">
                Login here
              </Link>
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← User Login
              </Link>
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Info Box - FIXED: Separated <ul> from <p> */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4">
          <div className="text-sm text-gray-600">
            <strong>Note:</strong> After registration, you'll be able to:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Update bed availability in real-time</li>
              <li>View and manage emergencies</li>
              <li>Track hospital resources</li>
              <li>Receive emergency alerts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegister;