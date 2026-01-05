// src/pages/Ambulance.jsx - Complete Version
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const Ambulance = () => {
  const [ambulances, setAmbulances] = useState([
    { id: 1, number: 'AMB001', type: 'Advanced', status: 'available', driver: 'Rajesh Kumar', phone: '9876543222', location: 'New Delhi', eta: '5 min' },
    { id: 2, number: 'AMB002', type: 'Basic', status: 'available', driver: 'Suresh Patel', phone: '9876543223', location: 'Mumbai', eta: '8 min' },
    { id: 3, number: 'AMB003', type: 'Mobile ICU', status: 'busy', driver: 'Amit Singh', phone: '9876543224', location: 'Bangalore', eta: '15 min' },
    { id: 4, number: 'AMB004', type: 'Advanced', status: 'available', driver: 'Vikram Sharma', phone: '9876543225', location: 'Delhi', eta: '7 min' },
  ]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [bookingData, setBookingData] = useState({
    patientName: '',
    emergencyType: '',
    location: '',
    contact: ''
  });

  const handleBookAmbulance = (ambulance) => {
    setSelectedAmbulance(ambulance);
  };

  const handleConfirmBooking = () => {
    if (!bookingData.patientName || !bookingData.location) {
      toast.error('Please fill all required fields');
      return;
    }

    // Update ambulance status
    setAmbulances(prev => prev.map(amb => 
      amb.id === selectedAmbulance.id 
        ? { ...amb, status: 'busy' }
        : amb
    ));

    toast.success(`Ambulance ${selectedAmbulance.number} booked successfully!`);
    setSelectedAmbulance(null);
    setBookingData({ patientName: '', emergencyType: '', location: '', contact: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🚑 Book Ambulance</h1>
          <p className="text-gray-600">Find and book nearest available ambulances</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Ambulances */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Ambulances</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ambulances.map((ambulance) => (
                  <div key={ambulance.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{ambulance.number}</h3>
                        <p className="text-gray-600">{ambulance.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        ambulance.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ambulance.status === 'available' ? 'Available' : 'Busy'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="flex items-center text-gray-700">
                        <span className="mr-2">👨‍⚕️</span>
                        Driver: {ambulance.driver}
                      </p>
                      <p className="flex items-center text-gray-700">
                        <span className="mr-2">📍</span>
                        Location: {ambulance.location}
                      </p>
                      <p className="flex items-center text-gray-700">
                        <span className="mr-2">⏱️</span>
                        ETA: {ambulance.eta}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleBookAmbulance(ambulance)}
                      disabled={ambulance.status === 'busy'}
                      className={`w-full py-2 rounded-lg font-bold transition ${
                        ambulance.status === 'available'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {ambulance.status === 'available' ? 'Book Now' : 'Currently Busy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form / Selected Ambulance */}
          <div className="space-y-6">
            {/* Selected Ambulance Info */}
            {selectedAmbulance && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Booking</h2>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">{selectedAmbulance.number} - {selectedAmbulance.type}</h3>
                  <p className="text-blue-700">Driver: {selectedAmbulance.driver}</p>
                  <p className="text-blue-700">Contact: {selectedAmbulance.phone}</p>
                  <p className="text-blue-700">ETA: {selectedAmbulance.eta}</p>
                </div>

                {/* Booking Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Patient Name *</label>
                    <input
                      type="text"
                      value={bookingData.patientName}
                      onChange={(e) => setBookingData({...bookingData, patientName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Enter patient name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Emergency Type</label>
                    <select
                      value={bookingData.emergencyType}
                      onChange={(e) => setBookingData({...bookingData, emergencyType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select type</option>
                      <option value="accident">Accident</option>
                      <option value="heart">Heart Attack</option>
                      <option value="stroke">Stroke</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Pickup Location *</label>
                    <input
                      type="text"
                      value={bookingData.location}
                      onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Enter pickup location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={bookingData.contact}
                      onChange={(e) => setBookingData({...bookingData, contact: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Contact number (optional)"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmBooking}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => setSelectedAmbulance(null)}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🚨 Emergency Contacts</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-2xl mr-3">📞</span>
                  <div>
                    <p className="font-bold text-red-800">National Emergency</p>
                    <p className="text-red-700">112</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl mr-3">🚑</span>
                  <div>
                    <p className="font-bold text-blue-800">Ambulance Services</p>
                    <p className="text-blue-700">108</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl mr-3">👮‍♂️</span>
                  <div>
                    <p className="font-bold text-green-800">Police Control Room</p>
                    <p className="text-green-700">100</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ambulance; 