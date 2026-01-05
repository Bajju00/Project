// src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Dashboard = () => {
  const user = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome, {user?.fullName || 'User'}! 👋
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Your Emergency Healthcare Dashboard
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-3xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Find Hospitals</h3>
            <p className="text-gray-600 mb-4">Find nearby hospitals with real-time bed availability</p>
            <Link to="/hospitals" className="block w-full bg-red-600 text-white text-center py-2 rounded-lg hover:bg-red-700 transition">
              Search Hospitals
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-3xl mb-4">🚑</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Call Ambulance</h3>
            <p className="text-gray-600 mb-4">Request nearest available ambulance</p>
            <Link to="/ambulance" className="block w-full bg-red-600 text-white text-center py-2 rounded-lg hover:bg-red-700 transition">
              Book Ambulance
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-3xl mb-4">🩸</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Find Blood Donors</h3>
            <p className="text-gray-600 mb-4">Search for blood donors by blood group</p>
            <Link to="/blood-donors" className="block w-full bg-red-600 text-white text-center py-2 rounded-lg hover:bg-red-700 transition">
              Find Donors
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-3xl mb-4">🆘</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Emergency SOS</h3>
            <p className="text-gray-600 mb-4">Send emergency alert to nearest hospitals</p>
            <Link to="/emergency" className="block w-full bg-red-700 text-white text-center py-2 rounded-lg hover:bg-red-800 transition">
              Emergency SOS
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-3xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Donate Blood</h3>
            <p className="text-gray-600 mb-4">Register as a blood donor</p>
            <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
              Become a Donor
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">My Profile</h3>
            <p className="text-gray-600 mb-4">View and update your profile information</p>
            <Link to="/profile" className="block w-full bg-red-600 text-white text-center py-2 rounded-lg hover:bg-red-700 transition">
              View Profile
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Successfully logged in</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🏥</span>
              <span className="text-gray-700">No recent hospital searches</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">🚑</span>
              <span className="text-gray-700">No ambulance requests yet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;