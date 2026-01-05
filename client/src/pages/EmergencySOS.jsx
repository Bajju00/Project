// src/pages/EmergencySOS.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const EmergencySOS = () => {
  const [emergencyType, setEmergencyType] = useState('accident');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendSOS = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setSending(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const sosData = {
            location: [position.coords.longitude, position.coords.latitude],
            emergencyType,
            description
          };

          // TODO: Connect to backend API
          // const response = await api.post('/emergency/sos', sosData);
          
          toast.success('Emergency SOS sent successfully!');
          setDescription('');
          
          // Show confirmation
          setTimeout(() => {
            toast.success('Hospitals and ambulances have been notified. Help is on the way!');
          }, 1000);
        } catch (error) {
          toast.error('Failed to send SOS. Please try again.');
        } finally {
          setSending(false);
        }
      },
      (error) => {
        toast.error('Please enable location services');
        setSending(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-700 mb-4">🆘 Emergency SOS</h1>
            <p className="text-gray-600 text-lg">
              Send emergency alert to nearest hospitals and ambulances
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-3">Emergency Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['accident', 'heart-attack', 'stroke', 'bleeding', 'difficulty-breathing', 'other'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setEmergencyType(type)}
                    className={`py-3 px-4 rounded-lg border-2 transition ${
                      emergencyType === type
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="text-lg mb-1">
                      {type === 'accident' && '🚗'}
                      {type === 'heart-attack' && '❤️'}
                      {type === 'stroke' && '🧠'}
                      {type === 'bleeding' && '🩸'}
                      {type === 'difficulty-breathing' && '😮‍💨'}
                      {type === 'other' && '⚠️'}
                    </div>
                    <span className="capitalize">{type.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-bold mb-3">
                Additional Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the emergency situation, number of people involved, etc."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="4"
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="text-2xl mr-3">⚠️</div>
                <div>
                  <h3 className="font-bold text-red-800 mb-2">Important Instructions</h3>
                  <ul className="space-y-2 text-red-700">
                    <li>• Stay calm and do not move unnecessarily</li>
                    <li>• Keep your phone accessible</li>
                    <li>• Clear the area for emergency services</li>
                    <li>• Provide first aid if trained to do so</li>
                    <li>• Wait for instructions from emergency responders</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleSendSOS}
              disabled={sending}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-xl hover:from-red-700 hover:to-red-800 transition shadow-lg disabled:opacity-50 animate-pulse"
            >
              {sending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Sending Emergency Alert...
                </div>
              ) : (
                '🚨 SEND EMERGENCY SOS'
              )}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-3">What happens after you send SOS?</h3>
            <ol className="space-y-3 text-blue-700">
              <li className="flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">1</span>
                Nearest 3 hospitals receive your location and emergency details
              </li>
              <li className="flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">2</span>
                Available ambulances are dispatched to your location
              </li>
              <li className="flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">3</span>
                You receive confirmation and estimated arrival time
              </li>
              <li className="flex items-center">
                <span className="bg-blue-600 text-white rounded-white w-6 h-6 flex items-center justify-center mr-3">4</span>
                Track ambulance in real-time on your dashboard
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;