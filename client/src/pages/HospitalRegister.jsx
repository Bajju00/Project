import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

const HospitalRegister = () => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    password: 'password123', // Default admin login password
    contact: '',
    address: '',
    totalBeds: 50,
    totalIcuBeds: 10,
    totalOxygenCylinders: 20
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hospitalName || !formData.email || !formData.contact || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      await api.auth.registerHospital({
        hospitalName: formData.hospitalName,
        email: formData.email,
        password: formData.password,
        contact: formData.contact,
        address: formData.address,
        totalBeds: Number(formData.totalBeds) || 0,
        totalIcuBeds: Number(formData.totalIcuBeds) || 0,
        totalOxygenCylinders: Number(formData.totalOxygenCylinders) || 0
      });

      toast.success('Hospital registered successfully on backend!');
      setTimeout(() => navigate('/admin/dashboard'), 800);
    } catch (error) {
      console.error('Hospital registration failed:', error);
      toast.error(error.message || 'Could not register hospital facility.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setFormData({
      hospitalName: 'City General Hospital',
      email: `hospital${Date.now().toString().slice(-6)}@lifelink.com`,
      password: 'password123',
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
            <p className="text-gray-600 mt-2">Save hospital resources in this browser</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onChange={(e) => updateField('hospitalName', e.target.value)}
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
                  onChange={(e) => updateField('email', e.target.value)}
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
                  onChange={(e) => updateField('contact', e.target.value)}
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
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="123 Medical Street, City, State, Pincode"
                />
              </div>

              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Initial Resources</h3>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Total Beds</label>
                <input
                  type="number"
                  value={formData.totalBeds}
                  onChange={(e) => updateField('totalBeds', e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">ICU Beds</label>
                <input
                  type="number"
                  value={formData.totalIcuBeds}
                  onChange={(e) => updateField('totalIcuBeds', e.target.value)}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Oxygen Cylinders</label>
                <input
                  type="number"
                  value={formData.totalOxygenCylinders}
                  onChange={(e) => updateField('totalOxygenCylinders', e.target.value)}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving Hospital...' : 'Save Hospital'}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={handleQuickFill}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium transition"
            >
              Fill Demo Hospital Data
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-650 text-sm mb-4">
              Already registered your hospital?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Login to Hospital Portal
              </Link>
            </p>

            <div className="flex justify-center space-x-6 text-sm">
              <Link to="/" className="text-slate-500 hover:text-slate-700 font-semibold">
                Back to Home
              </Link>
              <span className="text-slate-300">|</span>
              <Link to="/hospitals" className="text-slate-500 hover:text-slate-700 font-semibold">
                View Hospitals
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4">
          <div className="text-sm text-gray-600">
            <strong>Note:</strong> After saving, the hospital appears in hospital lists and dashboard data.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegister;
