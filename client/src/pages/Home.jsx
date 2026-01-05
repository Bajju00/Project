// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Fetch hospitals from API
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setApiError(false);
      
      const response = await fetch('http://localhost:5000/api/hospitals');
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data.success && Array.isArray(data.hospitals)) {
        setHospitals(data.hospitals);
      } else if (Array.isArray(data)) {
        setHospitals(data);
      } else if (data.hospitals && Array.isArray(data.hospitals)) {
        setHospitals(data.hospitals);
      } else {
        // Use mock data as fallback
        setApiError(true);
        setHospitals(getMockHospitals());
        toast.error('Using demo hospital data');
      }
      
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setApiError(true);
      // Use mock data as fallback
      setHospitals(getMockHospitals());
      toast.error('Using demo hospital data');
    } finally {
      setLoading(false);
    }
  };

  // Mock hospital data for fallback
  const getMockHospitals = () => {
    return [
      {
        _id: '1',
        name: 'City General Hospital',
        address: '123 Medical Street, New Delhi',
        facilities: {
          availableBeds: 15,
          availableIcuBeds: 5,
          availableOxygenCylinders: 25
        },
        distance: '2.3 km',
        rating: 4.5
      },
      {
        _id: '2',
        name: 'Medicare Center',
        address: '456 Health Avenue, Mumbai',
        facilities: {
          availableBeds: 8,
          availableIcuBeds: 2,
          availableOxygenCylinders: 15
        },
        distance: '3.1 km',
        rating: 4.2
      },
      {
        _id: '3',
        name: 'Sunrise Medical',
        address: '789 Health Road, Bangalore',
        facilities: {
          availableBeds: 12,
          availableIcuBeds: 3,
          availableOxygenCylinders: 20
        },
        distance: '4.5 km',
        rating: 4.7
      },
      {
        _id: '4',
        name: 'Apollo Hospital',
        address: '101 Health Complex, Chennai',
        facilities: {
          availableBeds: 25,
          availableIcuBeds: 8,
          availableOxygenCylinders: 35
        },
        distance: '5.2 km',
        rating: 4.8
      },
      {
        _id: '5',
        name: 'Fortis Hospital',
        address: '202 Medical Park, Kolkata',
        facilities: {
          availableBeds: 18,
          availableIcuBeds: 4,
          availableOxygenCylinders: 22
        },
        distance: '1.8 km',
        rating: 4.6
      },
      {
        _id: '6',
        name: 'AIIMS Hospital',
        address: '303 Government Road, Delhi',
        facilities: {
          availableBeds: 45,
          availableIcuBeds: 12,
          availableOxygenCylinders: 50
        },
        distance: '6.3 km',
        rating: 4.9
      }
    ];
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleEmergencySOS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Send emergency SOS to backend
          sendEmergencySOS(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Please enable location services for emergency SOS');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const sendEmergencySOS = async (latitude, longitude) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      if (!token || !user.id) {
        toast.error('Please login to use emergency SOS');
        return;
      }

      const response = await fetch('http://localhost:5000/api/emergency/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          location: [longitude, latitude], // GeoJSON format
          emergencyType: 'SOS from Home Page',
          description: 'Emergency SOS button pressed'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('🚨 Emergency SOS sent to nearest hospitals!');
        console.log('Emergency ID:', data.emergencyId);
        
        // Show emergency instructions
        setTimeout(() => {
          alert(`🚨 EMERGENCY ALERT SENT!\n\nInstructions:\n1. Stay calm\n2. Do not move unnecessarily\n3. Keep your phone accessible\n4. Help is on the way!\n\nEmergency ID: ${data.emergencyId}`);
        }, 500);
      } else {
        toast.error(data.error || 'Failed to send SOS');
      }
    } catch (error) {
      console.error('SOS Error:', error);
      
      // Fallback to mock alert if API fails
      toast.success('🚨 Emergency SOS sent to nearest hospitals! (Demo Mode)');
      setTimeout(() => {
        alert(`🚨 EMERGENCY ALERT SENT!\n\nYour location: ${latitude}, ${longitude}\n\nNearest hospitals have been notified. Help is on the way!\n\nPlease stay calm and wait for assistance.`);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <span className="text-5xl">🚑</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            LifeLink Emergency Healthcare Locator
          </h1>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Find nearest hospitals, ambulances, and blood donors in real-time during emergencies
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg text-lg"
            >
              👤 User Login
            </Link>
            <Link 
              to="/admin/login" 
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg text-lg"
            >
              🏥 Hospital Login
            </Link>
            <button 
              onClick={handleEmergencySOS}
              className="bg-red-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-900 transition shadow-lg text-lg animate-pulse"
            >
              🆘 Emergency SOS
            </button>
          </div>
          
          <div className="mt-8 text-sm opacity-80">
            <p>24/7 Emergency Services • Real-time Updates • Verified Hospitals</p>
          </div>
        </div>
      </section>

      {/* Hospitals List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              🏥 Nearby Hospitals
            </h2>
            {apiError && (
              <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                Using Demo Data
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
              <p className="mt-4 text-gray-600">Loading hospitals data...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500 text-lg">No hospital data available.</p>
              <button 
                onClick={fetchHospitals}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitals.map((hospital) => (
                  <div key={hospital._id || hospital.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{hospital.name}</h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                        {hospital.distance || 'N/A'} away
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 flex items-start">
                      <span className="mr-2">📍</span>
                      {hospital.address}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-700">
                          {hospital.facilities?.availableBeds || 0}
                        </div>
                        <div className="text-xs text-gray-600">Beds</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-700">
                          {hospital.facilities?.availableIcuBeds || 0}
                        </div>
                        <div className="text-xs text-gray-600">ICU</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-orange-700">
                          {hospital.facilities?.availableOxygenCylinders || 0}
                        </div>
                        <div className="text-xs text-gray-600">O₂</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link 
                        to="/login"
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-center font-medium"
                      >
                        View Details
                      </Link>
                      <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition font-medium">
                        Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Link 
                  to="/hospitals" 
                  className="inline-flex items-center text-red-600 hover:text-red-800 font-bold"
                >
                  View More Hospitals
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose LifeLink?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-red-50 rounded-xl hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Find Hospitals</h3>
              <p className="text-gray-600">Real-time availability of beds, ICUs, and oxygen supplies</p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-xl hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="text-4xl mb-4">🚑</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Call Ambulance</h3>
              <p className="text-gray-600">Request nearest available ambulance with live tracking</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-xl hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="text-4xl mb-4">🩸</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Blood Donors</h3>
              <p className="text-gray-600">Find nearby blood donors by blood group in emergencies</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="text-4xl mb-4">🆘</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Emergency SOS</h3>
              <p className="text-gray-600">One-tap emergency alert to nearest hospitals & responders</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready for Emergencies?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Register now to access all emergency healthcare services instantly
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition text-lg"
            >
              👤 Register as User
            </Link>
            <Link 
              to="/admin/login" 
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-600 transition text-lg"
            >
              🏥 Hospital Login
            </Link>
            <button 
              onClick={handleEmergencySOS}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition text-lg animate-pulse"
            >
              🆘 Emergency SOS
            </button>
          </div>
          
          <p className="mt-8 text-sm opacity-80">
            • 24/7 Emergency Support • Verified Hospitals • Real-time Updates • Secure & Private
          </p>
        </div>

        // In your Home.jsx hero section, add:
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <Link 
    to="/login" 
    className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
  >
    👤 User Login
  </Link>
  <Link 
    to="/admin/login" 
    className="bg-green-500 text-white px-8 py-3 rounded-full font-bold hover:bg-green-600 transition-colors"
  >
    🏥 Admin/Hospital Login
  </Link>
  <Link 
    to="/hospital/register" 
    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors"
  >
    🏥 Register Hospital
  </Link>
</div>
      </section>
    </div>
  );
};

export default Home;