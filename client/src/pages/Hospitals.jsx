// src/pages/Hospitals.jsx - Redesigned High-Fidelity Version
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { 
  Bed, 
  Building2, 
  MapPin, 
  Navigation, 
  Phone, 
  Search, 
  SlidersHorizontal, 
  Wind, 
  Sparkles, 
  Star, 
  Activity, 
  ChevronRight,
  Info,
  AlertCircle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../services/api';

// Reset Leaflet icon default settings to resolve loading issues in bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getAddress = (hospital) => {
  if (!hospital) return 'Address unavailable';
  if (typeof hospital.address === 'string') return hospital.address;
  return hospital.address?.fullAddress || hospital.address?.address || 'Address unavailable';
};

const getHospitalPosition = (hospital, index) => {
  const lat = Number(hospital?.location?.coordinates?.[1]);
  const lng = Number(hospital?.location?.coordinates?.[0]);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  return [28.6139 + (index * 0.012), 77.2099 + (index * 0.012)];
};

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

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2099]);
  const [mapZoom, setMapZoom] = useState(10);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [filters, setFilters] = useState({
    minBeds: 0,
    hasICU: false,
    hasOxygen: false
  });

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await api.hospitals.getAll();
        setHospitals(data.filter(Boolean));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    let filtered = hospitals;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((hospital) => {
        const nameMatch = (hospital.name || '').toString().toLowerCase().includes(term);
        const addressMatch = getAddress(hospital).toLowerCase().includes(term);
        return nameMatch || addressMatch;
      });
    }

    if (filters.minBeds > 0) {
      filtered = filtered.filter((hospital) => (hospital.facilities?.availableBeds || 0) >= filters.minBeds);
    }

    if (filters.hasICU) {
      filtered = filtered.filter((hospital) => (hospital.facilities?.availableIcuBeds || 0) > 0);
    }

    if (filters.hasOxygen) {
      filtered = filtered.filter((hospital) => (hospital.facilities?.availableOxygenCylinders || 0) > 0);
    }

    setFilteredHospitals(filtered);
  }, [hospitals, searchTerm, filters]);

  const stats = useMemo(() => {
    const beds = filteredHospitals.reduce((sum, hospital) => sum + (hospital.facilities?.availableBeds || 0), 0);
    const icu = filteredHospitals.reduce((sum, hospital) => sum + (hospital.facilities?.availableIcuBeds || 0), 0);
    const oxygen = filteredHospitals.reduce((sum, hospital) => sum + (hospital.facilities?.availableOxygenCylinders || 0), 0);

    return [
      { label: 'Available Beds', value: beds, icon: Bed, color: 'text-blue-700', bg: 'bg-blue-50' },
      { label: 'ICU Beds Available', value: icu, icon: Activity, color: 'text-rose-700', bg: 'bg-rose-50' },
      { label: 'Oxygen Reserves', value: oxygen, icon: Wind, color: 'text-amber-700', bg: 'bg-amber-50' }
    ];
  }, [filteredHospitals]);

  // Color coding markers by bed counts
  const createHospitalIcon = (bedsCount) => {
    let pingColor = 'bg-emerald-500 ring-emerald-400';
    if (bedsCount <= 5) {
      pingColor = 'bg-rose-500 ring-rose-400';
    } else if (bedsCount <= 20) {
      pingColor = 'bg-amber-500 ring-amber-400';
    }
    
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${pingColor} ring-4 ring-opacity-20 transition-all duration-300">
          <span class="text-white text-xs select-none">🏥</span>
          <span class="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor.split(' ')[1]} opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 ${pingColor.split(' ')[0]}"></span>
          </span>
        </div>
      `,
      className: 'custom-hospital-marker-leaflet',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const handleSelectHospital = (hospital, index) => {
    setSelectedHospitalId(hospital._id || index);
    const pos = getHospitalPosition(hospital, index);
    if (pos) {
      setMapCenter(pos);
      setMapZoom(13);
    }
  };

  const hospitalImages = {
    "Apollo Hospital": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=300",
    "Fortis Hospital": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=300",
    "Manipal Hospital": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300",
    "City General Hospital": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300",
    "Medicare Center": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300",
    "Sunrise Medical": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300",
    "AIIMS Hospital": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300",
    default: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. Header Hero Panel */}
      <div className="relative bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Emergency Care Radar
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Live <span className="text-blue-500 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Hospital Bed Finder</span>
              </h1>
              <p className="mt-2 text-slate-300 max-w-xl text-sm md:text-base leading-relaxed">
                Compare local clinical metrics, analyze live ICU resources, locate medical oxygen cylinders, and map route directions instantly.
              </p>
            </div>
            
            {/* Quick Metrics display */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 px-4 py-3 rounded-lg text-sm font-semibold text-blue-400">
              {filteredHospitals.length} Matching Medical Facilities
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Area */}
      <div className="container mx-auto px-4 -mt-6 relative z-25">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by hospital name or regional street address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Beds capacity select */}
            <div className="lg:col-span-3">
              <select
                value={filters.minBeds}
                onChange={(e) => setFilters({ ...filters, minBeds: parseInt(e.target.value, 10) })}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="0">Any General Bed Volume</option>
                <option value="5">5+ Beds Available</option>
                <option value="10">10+ Beds Available</option>
                <option value="20">20+ Beds Available</option>
              </select>
            </div>

            {/* Switch filters */}
            <div className="lg:col-span-4 flex flex-wrap items-center gap-4 justify-start lg:justify-end bg-slate-50 border rounded-lg p-1.5 h-11">
              <span className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-500">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Options:
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 hover:text-blue-600 select-none">
                <input
                  type="checkbox"
                  checked={filters.hasICU}
                  onChange={(e) => setFilters({ ...filters, hasICU: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                ICU Available
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 hover:text-blue-600 select-none mr-2">
                <input
                  type="checkbox"
                  checked={filters.hasOxygen}
                  onChange={(e) => setFilters({ ...filters, hasOxygen: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                Oxygen Available
              </label>
            </div>

          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="container mx-auto px-4 py-8">
        
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-600 text-sm">Locating clinical radar points...</p>
          </div>
        ) : (
          <>
            {/* 3. Stats Row */}
            <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-500">{stat.label}</div>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* 4. Split Screen: Map & Listings */}
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Live Map Panel (5 Cols) */}
              <div className="xl:col-span-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm z-10 relative">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      Hospitals Radar
                    </h2>
                    <p className="text-[10px] text-slate-500">Delhi NCR active coordinate grid</p>
                  </div>
                  <Navigation className="h-4 w-4 text-blue-600 animate-pulse" />
                </div>
                
                <div className="h-[300px] lg:h-[480px]">
                  <MapContainer
                    key="lifelink-hospital-map-redesign"
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
                    {filteredHospitals.map((hospital, index) => (
                      <Marker
                        key={hospital._id || index}
                        position={getHospitalPosition(hospital, index)}
                        icon={createHospitalIcon(hospital.facilities?.availableBeds || 0)}
                      >
                        <Popup>
                          <div className="text-xs">
                            <strong className="text-slate-950 font-bold block">{hospital.name}</strong>
                            <span className="block text-slate-600 mt-0.5">{getAddress(hospital).split(',')[0]}</span>
                            <span className="block text-slate-500">Beds available: {hospital.facilities?.availableBeds || 0}</span>
                            <span className="block text-slate-500">ICU units: {hospital.facilities?.availableIcuBeds || 0}</span>
                            <button
                              onClick={() => handleSelectHospital(hospital, index)}
                              className="mt-2 w-full bg-blue-600 text-white text-[10px] py-1 rounded font-bold hover:bg-blue-700"
                            >
                              Center on Card
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* Listings Panel (7 Cols) */}
              <div className="xl:col-span-7 space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {filteredHospitals.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <AlertCircle className="mx-auto h-12 w-12 text-slate-350 mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No Hospitals Found</h3>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or clearing search strings.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHospitals.map((hospital, index) => {
                      const isSelected = selectedHospitalId === (hospital._id || index);
                      const beds = hospital.facilities?.availableBeds || 0;
                      
                      // Capacity status indicators
                      let statusText = 'Available';
                      let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      let sideBorder = 'border-l-4 border-l-emerald-500';

                      if (beds <= 5) {
                        statusText = 'Critical';
                        statusColor = 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
                        sideBorder = 'border-l-4 border-l-rose-500';
                      } else if (beds <= 20) {
                        statusText = 'Limited';
                        statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                        sideBorder = 'border-l-4 border-l-amber-500';
                      }

                      return (
                        <article
                          key={hospital._id || index}
                          onClick={() => handleSelectHospital(hospital, index)}
                          className={`group bg-white rounded-xl p-4 border transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 ${sideBorder} ${
                            isSelected ? 'ring-2 ring-blue-500 border-transparent shadow-lg bg-slate-50/40' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            
                            {/* Left details */}
                            <div className="flex items-center gap-4 flex-1">
                              <img
                                src={hospitalImages[hospital.name] || hospitalImages.default}
                                alt={hospital.name}
                                className="w-14 h-14 rounded-lg object-cover border border-slate-150 group-hover:scale-105 transition-transform duration-300 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {hospital.name}
                                  </h3>
                                  <span className="flex items-center text-[10px] text-amber-500 font-semibold gap-0.5 bg-slate-50 border px-1.5 py-0.5 rounded">
                                    <Star className="w-3 h-3 fill-amber-500" /> {hospital.rating || '4.2'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-0.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {hospital.distance || '0.8 km away'} • {getAddress(hospital).split(',')[0]}
                                </p>
                                
                                {/* Live metrics */}
                                <div className="flex gap-4 mt-2.5 text-xs text-slate-500 font-medium">
                                  <div>
                                    Beds: <strong className="text-slate-800">{hospital.facilities?.availableBeds ?? 0}</strong>
                                  </div>
                                  <div>
                                    ICU: <strong className="text-slate-800 text-rose-600">{hospital.facilities?.availableIcuBeds ?? 0}</strong>
                                  </div>
                                  <div>
                                    Oxygen: <strong className="text-slate-800 text-amber-600">{hospital.facilities?.availableOxygenCylinders ?? 0}</strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right action controls */}
                            <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto justify-between border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                              <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${statusColor}`}>
                                {statusText}
                              </span>
                              
                              <div className="flex gap-1.5">
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + getAddress(hospital))}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition"
                                >
                                  <Navigation className="h-3 w-3 text-blue-500" /> Map
                                </a>
                                <a 
                                  href={`tel:${hospital.contact?.phone || '+919876543210'}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition"
                                >
                                  <Phone className="h-3 w-3 text-emerald-600" /> Call
                                </a>
                              </div>
                            </div>

                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

            </section>
          </>
        )}

      </div>
    </div>
  );
};

export default Hospitals;
