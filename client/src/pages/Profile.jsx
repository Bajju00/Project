// src/pages/Profile.jsx
import React from 'react';
import authService from '../services/authService';

const Profile = () => {
  const user = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h2>
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-4 mb-6">
            <p className="text-lg">
              <strong className="text-gray-700">Name:</strong>{' '}
              <span className="text-gray-800">{user?.fullName || 'N/A'}</span>
            </p>
            <p className="text-lg">
              <strong className="text-gray-700">Email:</strong>{' '}
              <span className="text-gray-800">{user?.email || 'N/A'}</span>
            </p>
            <p className="text-lg">
              <strong className="text-gray-700">Blood Group:</strong>{' '}
              <span className="text-gray-800">{user?.bloodGroup || 'Not specified'}</span>
            </p>
            <p className="text-lg">
              <strong className="text-gray-700">Role:</strong>{' '}
              <span className="text-gray-800">{user?.role || 'User'}</span>
            </p>
          </div>
          <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;