// src/pages/Hospitals.jsx
import React, { useState, useEffect } from 'react';
import { hospitalService } from '../services/hospitalService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minBeds: 0,
    hasICU: false,
    hasOxygen: false
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    filterHospitals();
  }, [hospitals, searchTerm, filters]);

  const fetchHospitals = async () => {
    try {
      const response = await hospitalService.getHospitals();
      setHospitals(response.hospitals || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHospitals = () => {
    let filtered = hospitals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Bed filter
    if (filters.minBeds > 0) {
      filtered = filtered.filter(hospital =>
        hospital.facilities?.availableBeds >= filters.minBeds
      );
    }

    // ICU filter
    if (filters.hasICU) {
      filtered = filtered.filter(hospital =>
        hospital.facilities?.availableIcuBeds > 0
      );
    }

    // Oxygen filter
    if (filters.hasOxygen) {
      filtered = filtered.filter(hospital =>
        hospital.facilities?.availableOxygenCylinders > 0
      );
    }

    setFilteredHospitals(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏥 Find Hospitals</h1>
          <p className="text-gray-600">Search and filter nearby hospitals with real-time availability</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search hospitals by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <select
                value={filters.minBeds}
                onChange={(e) => setFilters({...filters, minBeds: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="0">Minimum Beds</option>
                <option value="5">5+ Beds</option>
                <option value="10">10+ Beds</option>
                <option value="20">20+ Beds</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasICU}
                  onChange={(e) => setFilters({...filters, hasICU: e.target.checked})}
                  className="mr-2 h-5 w-5 text-red-600"
                />
                <span className="text-gray-700">ICU Available</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasOxygen}
                  onChange={(e) => setFilters({...filters, hasOxygen: e.target.checked})}
                  className="mr-2 h-5 w-5 text-red-600"
                />
                <span className="text-gray-700">Oxygen Available</span>
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading hospitals...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{filteredHospitals.length}</div>
                <div className="text-gray-600">Hospitals Found</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {filteredHospitals.reduce((sum, h) => sum + (h.facilities?.availableBeds || 0), 0)}
                </div>
                <div className="text-gray-600">Total Beds Available</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {filteredHospitals.reduce((sum, h) => sum + (h.facilities?.availableIcuBeds || 0), 0)}
                </div>
                <div className="text-gray-600">ICU Beds Available</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {filteredHospitals.reduce((sum, h) => sum + (h.facilities?.availableOxygenCylinders || 0), 0)}
                </div>
                <div className="text-gray-600">Oxygen Cylinders</div>
              </div>
            </div>

            {/* Map and List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[500px]">
                <MapContainer 
                  center={[28.6139, 77.2099]} 
                  zoom={10} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {filteredHospitals.map((hospital, index) => (
                    <Marker 
                      key={index}
                      position={[
                        hospital.location?.coordinates?.[1] || 28.6139 + (Math.random() * 0.1 - 0.05),
                        hospital.location?.coordinates?.[0] || 77.2099 + (Math.random() * 0.1 - 0.05)
                      ]}
                    >
                      <Popup>
                        <strong>{hospital.name}</strong><br />
                        {hospital.address}<br />
                        📞 {hospital.contact?.phone || 'N/A'}<br />
                        🛏️ Beds: {hospital.facilities?.availableBeds || 'N/A'}<br />
                        🏥 ICU: {hospital.facilities?.availableIcuBeds || 'N/A'}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Hospital List */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredHospitals.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="text-5xl mb-4">🏥</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No hospitals found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredHospitals.map((hospital, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{hospital.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{hospital.address}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          🛏️ {hospital.facilities?.availableBeds || 0} Beds
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          🏥 {hospital.facilities?.availableIcuBeds || 0} ICU
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                          💨 {hospital.facilities?.availableOxygenCylinders || 0} Oxygen
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
                          View Details
                        </button>
                        <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition">
                          Get Directions
                        </button>
                        <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition">
                          Call
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Hospitals;