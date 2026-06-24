// src/pages/Home.jsx - Dynamic High-Fidelity Version
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import img from '../assets/img2.png';
import { api } from '../services/api';

const Home = () => {
  const [hospitals, setHospitals] = useState([]);
  const [ambulancesCount, setAmbulancesCount] = useState(6);
  const [donorsCount, setDonorsCount] = useState(6);

  const fetchMetrics = async () => {
    try {
      const hospitalsList = await api.hospitals.getAll();
      setHospitals(hospitalsList);

      const ambulances = await api.ambulances.getAll();
      setAmbulancesCount(ambulances.length);

      const donors = await api.donors.getAll();
      setDonorsCount(donors.length);
    } catch (e) {
      console.error('Failed to fetch home metrics:', e);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleEmergencySOS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
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
      await api.emergencies.triggerSOS({
        location: [longitude, latitude],
        emergencyType: 'SOS from Home Page'
      });

      toast.success('Emergency SOS logged with backend control!');
      setTimeout(() => {
        alert(`EMERGENCY ALERT RECORDED\n\nYour location: ${latitude}, ${longitude}\n\nNearest hospitals have been notified. Please call 112 for real emergency assistance.`);
      }, 500);
    } catch (e) {
      console.error(e);
      toast.error('Could not log emergency alert with backend.');
    }
  };

  return (
    <div>
      <section
        className="relative min-h-screen bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${img})` }}
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 items-center min-h-screen min-h-[calc(100vh-88px)]">
            
            {/* Left Content */}
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
                Emergency Care
                <br />
                When <span className="text-blue-600">Every Second</span> Counts
              </h1>

              <p className="mt-6 text-xl text-gray-600 max-w-xl">
                Find nearest hospitals, ambulances and blood donors
                in real-time with live availability and accurate locations.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/hospitals" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-3">
                  <img src="https://img.icons8.com/?size=100&id=6OOnASO9fxuG&format=png&color=000000" alt="" className="w-5 h-5" /> Find Nearby Hospitals
                </Link>

                <button
                  onClick={handleEmergencySOS}
                  className="bg-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-600"
                >
                  🆘 Emergency SOS
                </button>
              </div>

              <div className="mt-7">
                <p className="text-gray-700 font-medium">
                  ⭐⭐⭐⭐⭐ Trusted by 10,000+ users
                </p>
              </div>
            </div>

          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-4 gap-6">

              <div className="flex items-center gap-3">
                <img
                  src="https://img.icons8.com/?size=100&id=CjnVAFU0iCln&format=png&color=000000"
                  alt="Hospital"
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="text-3xl font-bold text-blue-600">{hospitals.length}</h3>
                  <p className="font-semibold">Hospitals</p>
                  <p className="text-sm text-gray-500">Live Availability</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="https://img.icons8.com/?size=100&id=xgEcOpNx06e4&format=png&color=000000"
                  alt="Ambulance"
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="text-3xl font-bold text-red-500">{ambulancesCount}</h3>
                  <p className="font-semibold">Ambulances</p>
                  <p className="text-sm text-gray-500">Ready 24/7</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="https://img.icons8.com/?size=100&id=uHokh4xPtHYH&format=png&color=000000"
                  alt="Blood Donor"
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="text-3xl font-bold text-green-500">{donorsCount}</h3>
                  <p className="font-semibold">Blood Donors</p>
                  <p className="text-sm text-gray-500">Verified</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="https://img.icons8.com/?size=100&id=12216&format=png&color=000000"
                  alt="Support"
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="text-3xl font-bold text-purple-500">24/7</h3>
                  <p className="font-semibold">Support</p>
                  <p className="text-sm text-gray-500">We're Always Here</p>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-b from-transparent via-white/40 to-white pointer-events-none"></div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl">
        {/* Hospitals List */}   
        <div className='font-bold text-3xl p-4' >
          <h1>Nearby</h1>
        </div>
        <div className=" p-2 grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-8">
          
          {hospitals.map((hospital) => (
            
            <div
              key={hospital._id || hospital.id}
              className="group bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {hospital.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-sm text-green-600 font-medium">
                      Available Now
                    </span>
                  </div>
                </div>

                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                  📍 {hospital.distance || "N/A"}
                </span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 mb-5">
                <span className="text-lg">📍</span>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {typeof hospital.address === "string"
                    ? hospital.address
                    : hospital.address?.fullAddress ||
                      hospital.address?.address ||
                      "Address unavailable"}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div >
                  
                  <div className="text-xl font-bold text-blue-700">
                    {hospital.facilities?.availableBeds ?? 0}
                  </div>
                  <div className="text-xs text-gray-500">Beds</div>
                </div>

                <div >
                 
                  <div className="text-xl font-bold text-green-700">
                    {hospital.facilities?.availableIcuBeds ?? 0}
                  </div>
                  <div className="text-xs text-gray-500">ICU</div>
                </div>

                <div >
                  
                  <div className="text-xl font-bold text-amber-700">
                    {hospital.facilities?.availableOxygenCylinders ?? 0}
                  </div>
                  <div className="text-xs text-gray-500">Oxygen</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  to="/hospitals"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl text-center font-semibold hover:opacity-90 transition"
                >
                  View Details
                </Link>

                <button className="flex-1 border border-gray-200 bg-white py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
                  Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="container mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
              Why LifeLink?
            </span>

            <h2 className="mt-6 text-4xl lg:text-5xl font-bold text-gray-900">
              Emergency Healthcare
              <span className="text-blue-600"> Simplified</span>
            </h2>

            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Get instant access to hospitals, ambulances, blood donors,
              and emergency assistance whenever you need it most.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Hospital Card */}
            <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                <img
                  src="https://img.icons8.com/fluency/96/hospital-3.png"
                  alt="Hospital"
                  className="w-10 h-10"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Find Hospitals
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Real-time availability of beds, ICU units, and oxygen supplies.
              </p>
            </div>

            {/* Ambulance Card */}
            <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                <img
                  src="https://img.icons8.com/fluency/96/ambulance.png"
                  alt="Ambulance"
                  className="w-10 h-10"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Call Ambulance
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Request the nearest ambulance with live tracking and ETA.
              </p>
            </div>

            {/* Blood Donor Card */}
            <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                <img
                  src="https://img.icons8.com/fluency/96/drop-of-blood.png"
                  alt="Blood Donor"
                  className="w-10 h-10"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Blood Donors
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Find verified blood donors nearby based on blood group.
              </p>
            </div>

            {/* SOS Card */}
            <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                <img
                  src="https://img.icons8.com/fluency/96/alarm.png"
                  alt="Emergency SOS"
                  className="w-10 h-10"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Emergency SOS
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Instantly alert nearby hospitals and emergency responders.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">

          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            What People Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Testimonial 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="text-yellow-400 text-lg mb-3">
                ★★★★★
              </div>

              <p className="text-gray-600 italic">
                "LifeLink helped me find an ICU bed within minutes. Amazing service!"
              </p>

              <div className="flex items-center gap-3 mt-5">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Rahul"
                  className="w-12 h-12 rounded-full"
                />

                <div>
                  <h4 className="font-semibold text-gray-800">
                    Rahul K.
                  </h4>
                  <p className="text-sm text-gray-500">
                    Bangalore
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="text-yellow-400 text-lg mb-3">
                ★★★★★
              </div>

              <p className="text-gray-600 italic">
                "The ambulance arrived on time and the tracking feature was extremely helpful."
              </p>

              <div className="flex items-center gap-3 mt-5">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Priya"
                  className="w-12 h-12 rounded-full"
                />

                <div>
                  <h4 className="font-semibold text-gray-800">
                    Priya S.
                  </h4>
                  <p className="text-sm text-gray-500">
                    Mumbai
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="text-yellow-400 text-lg mb-3">
                ★★★★★
              </div>

              <p className="text-gray-600 italic">
                "Found a blood donor quickly during a critical situation. Thank you LifeLink!"
              </p>

              <div className="flex items-center gap-3 mt-5">
                <img
                  src="https://randomuser.me/api/portraits/men/51.jpg"
                  alt="Arjun"
                  className="w-12 h-12 rounded-full"
                />

                <div>
                  <h4 className="font-semibold text-gray-800">
                    Arjun M.
                  </h4>
                  <p className="text-sm text-gray-500">
                    Hyderabad
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Floating SOS Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleEmergencySOS}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-1xl shadow-1xl animate-pulse hover:scale-110 transition"
        >
          SOS
        </button>
      </div>

    </div>
  );
};

export default Home;
