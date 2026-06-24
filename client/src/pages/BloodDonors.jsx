// src/pages/BloodDonors.jsx - Redesigned High-Fidelity Version
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { 
  Search, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Navigation, 
  Clock, 
  User, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Droplet,
  Heart,
  Calendar,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  MessageSquare,
  BadgeAlert
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Reset Leaflet icon default settings to resolve loading issues in bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to auto-center map when active coordinate changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const getLatLng = (location) => {
  if (!location) return null;
  if (Array.isArray(location)) {
    return location;
  }
  if (location.coordinates && Array.isArray(location.coordinates)) {
    return [location.coordinates[1], location.coordinates[0]];
  }
  return null;
};

const BloodDonors = () => {
  // Initial donor data with coordinates near Delhi NCR
  const initialDonors = [
    { id: 1, name: 'Priya Sharma', bloodGroup: 'B+', locationName: 'Connaught Place, New Delhi', location: [28.6304, 77.2177], distance: 2.3, lastDonated: '3 months ago', contact: '+91 98765 43212', available: true },
    { id: 2, name: 'Rahul Verma', bloodGroup: 'O+', locationName: 'Karol Bagh, New Delhi', location: [28.6448, 77.1902], distance: 3.1, lastDonated: '1 month ago', contact: '+91 98765 43213', available: true },
    { id: 3, name: 'Anjali Singh', bloodGroup: 'A+', locationName: 'Saket, New Delhi', location: [28.5244, 77.2104], distance: 4.5, lastDonated: '6 months ago', contact: '+91 98765 43214', available: false },
    { id: 4, name: 'Mohit Kumar', bloodGroup: 'AB-', locationName: 'Dwarka, New Delhi', location: [28.5850, 77.0498], distance: 5.2, lastDonated: '2 months ago', contact: '+91 98765 43215', available: true },
    { id: 5, name: 'Sneha Patel', locationName: 'Preet Vihar, New Delhi', bloodGroup: 'O-', location: [28.6485, 77.2919], distance: 1.8, lastDonated: '4 months ago', contact: '+91 98765 43216', available: true },
    { id: 6, name: 'Arun Desai', bloodGroup: 'B-', locationName: 'Rohini, New Delhi', location: [28.7041, 77.1025], distance: 6.3, lastDonated: '8 months ago', contact: '+91 98765 43217', available: true },
  ];

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodStocks, setBloodStocks] = useState({});

  const getDonorLocationName = (donorObj) => {
    const loc = donorObj.locationName || donorObj.address || 'Local Area';
    return loc.split(',')[0];
  };

  // Fetch volunteers and blood stocks from API
  const fetchDonorData = async () => {
    try {
      const donorsList = await api.donors.getAll();
      setDonors(donorsList);

      const stocks = await api.donors.getBloodStocks();
      setBloodStocks(stocks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, []);

  // State bindings
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2099]);
  const [mapZoom, setMapZoom] = useState(11);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    availableOnly: true,
    maxDistance: 15
  });

  // Registration Form State
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    bloodGroup: '',
    phone: '',
    locationName: '',
    age: '',
    weight: '',
    lastDonated: 'Never'
  });

  // Statistics & Reserves configuration loaded dynamically
  const bloodGroupStats = useMemo(() => {
    const defaultStats = {
      'O+': { count: 45, needed: 120, level: 'stable' },
      'O-': { count: 8, needed: 25, level: 'critical' },
      'A+': { count: 38, needed: 95, level: 'stable' },
      'A-': { count: 7, needed: 20, level: 'critical' },
      'B+': { count: 32, needed: 85, level: 'stable' },
      'B-': { count: 4, needed: 18, level: 'critical' },
      'AB+': { count: 18, needed: 20, level: 'optimal' },
      'AB-': { count: 2, needed: 10, level: 'critical' },
    };

    if (Object.keys(bloodStocks).length > 0) {
      const mapped = {};
      Object.keys(defaultStats).forEach(group => {
        const count = bloodStocks[group] ?? defaultStats[group].count;
        const needed = defaultStats[group].needed;
        const ratio = count / needed;
        const level = ratio < 0.40 ? 'critical' : ratio < 0.75 ? 'stable' : 'optimal';
        mapped[group] = { count, needed, level };
      });
      return mapped;
    }
    return defaultStats;
  }, [bloodStocks]);

  // Filter donor records
  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchesSearch = 
        (donor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (donor.locationName || donor.address || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = !filters.bloodGroup || donor.bloodGroup === filters.bloodGroup;
      // In backend model, we can treat them as available
      const matchesAvailable = !filters.availableOnly || (donor.available !== false);
      const donorDistance = donor.distance || 2.0;
      const matchesDistance = donorDistance <= filters.maxDistance;
      
      return matchesSearch && matchesGroup && matchesAvailable && matchesDistance;
    });
  }, [donors, searchQuery, filters]);

  // Create custom donor marker with live blood group labeling
  const createDonorIcon = (available, bloodGroup) => {
    const colorClass = available 
      ? 'bg-rose-600 border-white text-white' 
      : 'bg-slate-400 border-white text-white';
    
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${colorClass} ring-4 ring-rose-500/10 text-xs font-black select-none">
          <span>${bloodGroup}</span>
          ${available ? '<span class="absolute -top-0.5 -right-0.5 flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></span>' : ''}
        </div>
      `,
      className: 'custom-donor-marker-leaflet',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const handleSelectDonor = (donor) => {
    setSelectedDonor(donor);
    const coords = getLatLng(donor.location);
    if (coords) {
      setMapCenter(coords);
      setMapZoom(13);
    }
  };

  const handleBecomeDonorSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('lifelinkToken');
    if (!token) {
      toast.error('Please login to register as a blood donor');
      return;
    }

    const { name, bloodGroup, phone, locationName, age, weight, lastDonated } = registrationForm;

    if (!name || !bloodGroup || !phone || !locationName || !age || !weight) {
      toast.error('Please fill out all registration fields');
      return;
    }

    if (parseInt(age) < 18 || parseInt(age) > 65) {
      toast.error('Donors must be between 18 and 65 years of age');
      return;
    }

    if (parseInt(weight) < 45) {
      toast.error('Minimum weight eligibility for blood donation is 45 kg');
      return;
    }

    try {
      await api.donors.registerDonor({
        name,
        bloodGroup,
        phone,
        address: locationName,
        lastDonated: lastDonated === 'Never' ? 'Never' : `${lastDonated} months ago`
      });

      toast.success('Thank you! You have been registered as an active donor.');
      fetchDonorData(); // Refresh donor list
      
      // Clear Form
      setRegistrationForm({
        name: '',
        bloodGroup: '',
        phone: '',
        locationName: '',
        age: '',
        weight: '',
        lastDonated: 'Never'
      });
    } catch (err) {
      toast.error(err.message || 'Donor registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. Header Hero Area */}
      <div className="relative bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Emergency Support Hub
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Find <span className="text-rose-500 bg-gradient-to-r from-rose-500 to-red-400 bg-clip-text text-transparent">Blood Donors</span>
              </h1>
              <p className="mt-2 text-slate-300 max-w-xl text-sm md:text-base leading-relaxed">
                Locate matching blood donors instantly within your dispatch radius. Save lives by donating blood or posting emergency community appeals.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 lg:w-auto">
              <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 p-4 rounded-xl text-center">
                <div className="text-slate-400 text-xs font-medium mb-1 flex items-center justify-center gap-1">
                  <User className="w-3.5 h-3.5 text-rose-500" /> Active Donors
                </div>
                <div className="text-2xl md:text-3xl font-black text-white">{donors.length}</div>
              </div>
              <div className="bg-rose-950/20 backdrop-blur-md border border-rose-800/40 p-4 rounded-xl text-center">
                <div className="text-rose-400 text-xs font-medium mb-1 flex items-center justify-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Matches Made
                </div>
                <div className="text-2xl md:text-3xl font-black text-rose-400">1,240+</div>
              </div>
              <div className="bg-emerald-950/20 backdrop-blur-md border border-emerald-800/40 p-4 rounded-xl text-center">
                <div className="text-emerald-400 text-xs font-medium mb-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified Centers
                </div>
                <div className="text-2xl md:text-3xl font-black text-emerald-400">24</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Blood Reserve Dashboard */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
            <Droplet className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg font-bold text-slate-900">National Blood Bank Reserve Stock</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Object.entries(bloodGroupStats).map(([group, val]) => {
              const stockRatio = (val.count / val.needed) * 100;
              let levelColor = 'bg-slate-200';
              let badgeColor = 'bg-slate-100 text-slate-700';
              let borderColor = 'border-slate-150';

              if (val.level === 'critical') {
                levelColor = 'bg-rose-500 animate-pulse';
                badgeColor = 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
                borderColor = 'border-rose-200';
              } else if (val.level === 'stable') {
                levelColor = 'bg-amber-500';
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-100';
                borderColor = 'border-amber-200';
              } else if (val.level === 'optimal') {
                levelColor = 'bg-emerald-500';
                badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                borderColor = 'border-emerald-200';
              }

              return (
                <div key={group} className={`bg-slate-50 border rounded-xl p-3.5 text-center transition hover:shadow-md ${borderColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl font-black text-slate-900">{group}</span>
                    <span className={`text-[8px] font-bold border px-1.5 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                      {val.level}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mb-0.5 text-left">Reserves: <strong className="text-slate-900">{val.count}U</strong></div>
                  <div className="text-xs text-slate-600 mb-2 text-left">Required: <strong className="text-slate-900">{val.needed}U</strong></div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${levelColor}`}
                      style={{ width: `${Math.min(stockRatio, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search query */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search donors by name, city, sector, or hospital location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
              />
            </div>

            {/* Blood group selection */}
            <div className="md:col-span-3">
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters({...filters, bloodGroup: e.target.value})}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
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

            {/* Distance Slider */}
            <div className="md:col-span-2 px-2">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-semibold">
                <span>Distance Limit</span>
                <span className="text-slate-800">{filters.maxDistance} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={filters.maxDistance}
                onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
                className="w-full accent-rose-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Availability Checkbox Toggle */}
            <div className="md:col-span-2 flex items-center justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => setFilters({...filters, availableOnly: e.target.checked})}
                  className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 focus:ring-2"
                />
                <span className="text-xs font-semibold text-slate-700">Available Only</span>
              </label>
            </div>

          </div>
        </div>

        {/* 4. Grid Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Donors List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-500" /> Active Local Donors
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                  {filteredDonors.length} Found
                </span>
              </h2>
              <span className="text-xs text-slate-500">Filters apply automatically</span>
            </div>

            {filteredDonors.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-950">No Matching Donors Available</h3>
                <p className="text-slate-500 text-sm mt-1">Try increasing your search distance range or clearing your blood group filter.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setFilters({ bloodGroup: '', availableOnly: false, maxDistance: 15 }); }}
                  className="mt-4 bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-slate-900 transition"
                >
                  Reset Search Criteria
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDonors.map((donor) => {
                  const isSelected = selectedDonor?._id === donor._id || selectedDonor?.id === donor.id;
                  const initials = (donor.name || 'D').split(' ').map(n => n[0]).join('');
                  
                  return (
                    <div 
                      key={donor._id || donor.id}
                      onClick={() => handleSelectDonor(donor)}
                      className={`group bg-white rounded-xl border p-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                        isSelected 
                          ? 'ring-2 ring-rose-500 border-transparent shadow-lg bg-slate-50/50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar representation with blood group overlay */}
                          <div className="relative w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 font-extrabold text-sm group-hover:bg-rose-500 group-hover:text-white transition duration-200">
                            {initials}
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-600 rounded-full border border-white text-white text-[8px] font-black flex items-center justify-center">
                              {donor.bloodGroup}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-1">
                              {donor.name}
                            </h3>
                            <p className="text-slate-500 text-[10px] flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" /> {getDonorLocationName(donor)} • {donor.distance} km away
                            </p>
                          </div>
                        </div>

                        {/* Availability badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          donor.available 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            donor.available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}></span>
                          {donor.available ? 'Ready' : 'Deferred'}
                        </span>
                      </div>

                      {/* Detail facts */}
                      <div className="py-2 px-3 bg-slate-50 rounded-lg space-y-1.5 text-xs text-slate-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Last Donated: <strong className="text-slate-800">{donor.lastDonated}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Contact: <strong className="text-slate-800">{donor.contact}</strong></span>
                        </div>
                      </div>

                      {/* Call-to-action button */}
                      <div className="flex gap-2">
                        {donor.available ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDonor(donor);
                              }}
                              className={`flex-1 text-center py-2 rounded-lg text-xs font-bold text-white transition ${
                                isSelected ? 'bg-rose-700' : 'bg-rose-600 hover:bg-rose-700'
                              }`}
                            >
                              {isSelected ? 'Ready to Call' : 'Request Donation'}
                            </button>
                            <a
                              href={`tel:${donor.contact}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
                              title="Call Donor Directly"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </>
                        ) : (
                          <div className="w-full text-center py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed">
                            Currently Deferred (Cool down window)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: Maps & Registration Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Track Radar Map */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    Donor Location Map
                  </h2>
                  <p className="text-xs text-slate-500">Active regional donor coordinates</p>
                </div>
                <Navigation className="w-4 h-4 text-rose-500" />
              </div>
              
              <div className="h-[250px] w-full z-10 relative">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <ChangeView center={mapCenter} zoom={mapZoom} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {filteredDonors.map((donor) => {
                    const coords = getLatLng(donor.location);
                    return coords && (
                      <Marker
                        key={donor._id || donor.id}
                        position={coords}
                        icon={createDonorIcon(donor.available !== false, donor.bloodGroup)}
                      >
                        <Popup>
                          <div className="text-xs">
                            <strong className="text-slate-950 font-bold block">{donor.name} ({donor.bloodGroup})</strong>
                            <span className="block text-slate-600 mt-0.5">Location: {getDonorLocationName(donor)}</span>
                            <span className="block text-slate-600">Last donation: {donor.lastDonated}</span>
                            {donor.available !== false ? (
                              <button
                                onClick={() => handleSelectDonor(donor)}
                                className="mt-2 w-full bg-rose-600 text-white text-[10px] py-1 rounded font-bold hover:bg-rose-700"
                              >
                                Contact / Request
                              </button>
                            ) : (
                              <span className="block text-slate-400 font-semibold mt-1">Not Available</span>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            {/* Selected Donor Dialog Panel */}
            {selectedDonor && (
              <div className="bg-white rounded-xl shadow-lg border border-rose-100 p-5 animate-fadeIn">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase">Emergency Dispatch Direct Channel</span>
                    <h2 className="text-lg font-bold text-slate-900">Requesting {selectedDonor.bloodGroup} Blood</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedDonor(null)}
                    className="text-xs bg-slate-100 text-slate-500 hover:bg-slate-200 px-2 py-1 rounded"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2 mb-4 text-xs">
                  <h3 className="font-extrabold text-sm text-slate-900">{selectedDonor.name}</h3>
                  <p className="text-slate-600"><strong className="text-slate-800">Station Area:</strong> {selectedDonor.locationName || selectedDonor.address || 'Local Area'}</p>
                  <p className="text-slate-500"><strong className="text-slate-800">Estimated Distance:</strong> {selectedDonor.distance} km</p>
                  <p className="text-slate-600"><strong className="text-slate-800">Direct Contact:</strong> {selectedDonor.contact || selectedDonor.phone}</p>
                  <p className="text-slate-600"><strong className="text-slate-800">Last Donation Date:</strong> {selectedDonor.lastDonated}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href={`tel:${selectedDonor.contact || selectedDonor.phone}`}
                    className="flex items-center justify-center gap-1 bg-green-600 text-white font-bold h-10 rounded-lg hover:bg-green-700 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Driver/Donor
                  </a>
                  <a
                    href={`sms:${selectedDonor.contact || selectedDonor.phone}?body=Emergency! We require your blood group ${selectedDonor.bloodGroup} at...`}
                    className="flex items-center justify-center gap-1 bg-blue-600 text-white font-bold h-10 rounded-lg hover:bg-blue-700 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Send SOS Message
                  </a>
                </div>
              </div>
            )}

            {/* Volunteer Form ("Become a Donor") */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Become a Blood Donor
              </h3>
              <p className="text-slate-500 text-xs mb-4">
                Volunteer to join the emergency donor radar and receive local critical alerts. Save lives in your neighborhood.
              </p>

              <form onSubmit={handleBecomeDonorSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({...registrationForm, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Blood Group *</label>
                    <select
                      required
                      value={registrationForm.bloodGroup}
                      onChange={(e) => setRegistrationForm({...registrationForm, bloodGroup: e.target.value})}
                      className="w-full px-2.5 h-9 border border-slate-200 rounded-lg outline-none bg-white text-slate-700"
                    >
                      <option value="">Select Group</option>
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
                    <label className="block text-slate-600 font-semibold mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      value={registrationForm.phone}
                      onChange={(e) => setRegistrationForm({...registrationForm, phone: e.target.value})}
                      placeholder="Your mobile phone"
                      className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Age * (18-65)</label>
                    <input
                      type="number"
                      required
                      min="18"
                      max="65"
                      value={registrationForm.age}
                      onChange={(e) => setRegistrationForm({...registrationForm, age: e.target.value})}
                      placeholder="e.g. 25"
                      className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Weight * (kg, min 45)</label>
                    <input
                      type="number"
                      required
                      min="45"
                      value={registrationForm.weight}
                      onChange={(e) => setRegistrationForm({...registrationForm, weight: e.target.value})}
                      placeholder="e.g. 68"
                      className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Your Residential Area / Location *</label>
                  <input
                    type="text"
                    required
                    value={registrationForm.locationName}
                    onChange={(e) => setRegistrationForm({...registrationForm, locationName: e.target.value})}
                    placeholder="e.g. Dwarka, New Delhi"
                    className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Last Blood Donation Timeline</label>
                  <select
                    value={registrationForm.lastDonated}
                    onChange={(e) => setRegistrationForm({...registrationForm, lastDonated: e.target.value})}
                    className="w-full px-2.5 h-9 border border-slate-200 rounded-lg outline-none bg-white text-slate-700"
                  >
                    <option value="Never">Never Donated</option>
                    <option value="1">1 month ago</option>
                    <option value="2">2 months ago</option>
                    <option value="3">3 months ago</option>
                    <option value="6">6+ months ago</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 text-white h-10 rounded-lg font-bold hover:bg-rose-700 transition mt-2 shadow-md shadow-rose-500/10"
                >
                  Register as Volunteer
                </button>
              </form>

              {/* Eligibility Criteria Checklist */}
              <div className="mt-4 p-3 bg-rose-50/50 border border-rose-100 rounded-lg text-[10px] text-rose-800 space-y-1">
                <h4 className="font-bold flex items-center gap-1 mb-1"><BadgeAlert className="w-3.5 h-3.5" /> Eligibility Requirement Checklist</h4>
                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-rose-600" /> Must be in general good health.</div>
                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-rose-600" /> Age range: 18 - 65 years.</div>
                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-rose-600" /> Minimum body weight: 45 kg.</div>
                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-rose-600" /> At least 3 months gap since the last donation.</div>
              </div>
            </div>

            {/* Donation Health Tips */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Info className="w-4.5 h-4.5 text-blue-500" /> Pre-Donation Care Tips
              </h3>
              
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 text-lg leading-none">✓</span>
                  <p>Hydrate abundantly: drink 500ml of water or fresh juice immediately before donation.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 text-lg leading-none">✓</span>
                  <p>Ensure iron-rich meals (spinach, dates, beans, lean meats) leading up to your appointment.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 text-lg leading-none">✓</span>
                  <p>Obtain at least 7-8 hours of uninterrupted sleep the night before your contribution.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 text-lg leading-none">✓</span>
                  <p>Avoid alcoholic beverages and excessive smoking for at least 24-48 hours before donation.</p>
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
