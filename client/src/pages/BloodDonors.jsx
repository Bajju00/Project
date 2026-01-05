// src/pages/BloodDonors.jsx - Complete Version
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const BloodDonors = () => {
  const [donors, setDonors] = useState([
    { id: 1, name: 'Priya Sharma', bloodGroup: 'B+', distance: '2.3 km', lastDonated: '3 months ago', contact: '9876543212', available: true },
    { id: 2, name: 'Rahul Verma', bloodGroup: 'O+', distance: '3.1 km', lastDonated: '1 month ago', contact: '9876543213', available: true },
    { id: 3, name: 'Anjali Singh', bloodGroup: 'A+', distance: '4.5 km', lastDonated: '6 months ago', contact: '9876543214', available: false },
    { id: 4, name: 'Mohit Kumar', bloodGroup: 'AB-', distance: '5.2 km', lastDonated: '2 months ago', contact: '9876543215', available: true },
    { id: 5, name: 'Sneha Patel', bloodGroup: 'O-', distance: '1.8 km', lastDonated: '4 months ago', contact: '9876543216', available: true },
    { id: 6, name: 'Arun Desai', bloodGroup: 'B-', distance: '6.3 km', lastDonated: '8 months ago', contact: '9876543217', available: true },
  ]);
  
  const [filteredDonors, setFilteredDonors] = useState(donors);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    availableOnly: true,
    maxDistance: 10
  });
  const [selectedDonor, setSelectedDonor] = useState(null);

  useEffect(() => {
    filterDonors();
  }, [filters]);

  const filterDonors = () => {
    let filtered = donors;

    if (filters.bloodGroup) {
      filtered = filtered.filter(donor => donor.bloodGroup === filters.bloodGroup);
    }

    if (filters.availableOnly) {
      filtered = filtered.filter(donor => donor.available);
    }

    setFilteredDonors(filtered);
  };

  const handleContactDonor = (donor) => {
    setSelectedDonor(donor);
    toast.success(`Contacting ${donor.name}...`);
  };

  const handleBecomeDonor = () => {
    toast.success('Thank you for registering as a blood donor!');
  };

  const bloodGroupStats = {
    'O+': { count: 45, needed: 120 },
    'O-': { count: 8, needed: 25 },
    'A+': { count: 38, needed: 95 },
    'A-': { count: 7, needed: 20 },
    'B+': { count: 32, needed: 85 },
    'B-': { count: 5, needed: 18 },
    'AB+': { count: 15, needed: 40 },
    'AB-': { count: 3, needed: 10 },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🩸 Find Blood Donors</h1>
          <p className="text-gray-600">Connect with nearby blood donors during emergencies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Blood Group Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Blood Group Availability</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(bloodGroupStats).map(([group, stats]) => (
                  <div key={group} className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">{group}</div>
                    <div className="text-sm text-gray-600">Available: {stats.count}</div>
                    <div className="text-sm text-gray-600">Needed: {stats.needed}</div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500" 
                        style={{ width: `${(stats.count / stats.needed) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Donors</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Blood Group</label>
                  <select
                    value={filters.bloodGroup}
                    onChange={(e) => setFilters({...filters, bloodGroup: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">All Blood Groups</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Max Distance (km)</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({...filters, maxDistance: e.target.value})}
                    className="w-full"
                  />
                  <div className="text-center text-gray-600">{filters.maxDistance} km</div>
                </div>
                
                <div className="flex items-center justify-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.availableOnly}
                      onChange={(e) => setFilters({...filters, availableOnly: e.target.checked})}
                      className="mr-2 h-5 w-5 text-red-600"
                    />
                    <span className="text-gray-700">Show available donors only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Donors List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Available Donors ({filteredDonors.length})
              </h2>
              
              {filteredDonors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🩸</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No donors found</h3>
                  <p className="text-gray-600">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDonors.map((donor) => (
                    <div key={donor.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{donor.name}</h3>
                          <div className="flex items-center mt-1">
                            <span className="text-red-600 font-bold text-lg mr-2">{donor.bloodGroup}</span>
                            <span className="text-gray-600">• {donor.distance} away</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          donor.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {donor.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-700">
                          <span className="font-medium">Last Donated:</span> {donor.lastDonated}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Contact:</span> {donor.contact}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleContactDonor(donor)}
                        disabled={!donor.available}
                        className={`w-full py-2 rounded-lg font-bold transition ${
                          donor.available
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {donor.available ? 'Contact Donor' : 'Currently Unavailable'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Become a Donor */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">❤️ Become a Blood Donor</h3>
              <p className="text-gray-600 mb-4">
                Register as a blood donor and save lives in emergencies. Your contribution matters!
              </p>
              <button
                onClick={handleBecomeDonor}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700"
              >
                Register as Donor
              </button>
              
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <h4 className="font-bold text-red-800 mb-2">Eligibility Criteria</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Age: 18-65 years</li>
                  <li>• Weight: Minimum 45 kg</li>
                  <li>• Hemoglobin: Minimum 12.5 g/dL</li>
                  <li>• Good general health</li>
                  <li>• No major illnesses</li>
                </ul>
              </div>
            </div>

            {/* Selected Donor Info */}
            {selectedDonor && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📞 Contacting Donor</h3>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-bold text-blue-800">{selectedDonor.name}</h4>
                  <p className="text-blue-700">Blood Group: {selectedDonor.bloodGroup}</p>
                  <p className="text-blue-700">Distance: {selectedDonor.distance}</p>
                  <p className="text-blue-700">Contact: {selectedDonor.contact}</p>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    Call Now
                  </button>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Send Message
                  </button>
                  <button 
                    onClick={() => setSelectedDonor(null)}
                    className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Blood Donation Tips */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Donation Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <p className="text-gray-700">Drink plenty of water before donating</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <p className="text-gray-700">Eat iron-rich foods</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <p className="text-gray-700">Get adequate sleep the night before</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <p className="text-gray-700">Avoid alcohol 24 hours before donation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodDonors;