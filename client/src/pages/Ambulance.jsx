// src/pages/Ambulance.jsx - Redesigned High-Fidelity Version
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Navigation, 
  Clock, 
  User, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  PhoneCall,
  Truck,
  Heart,
  ChevronRight,
  Sparkles,
  Info
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

const initialAmbulancesList = [
  { 
    id: 1, 
    number: 'AMB-DL-001', 
    type: 'Advanced Life Support', 
    status: 'available', 
    driver: 'Rajesh Kumar', 
    phone: '+91 98765 43222', 
    locationName: 'Connaught Place, New Delhi',
    location: [28.6304, 77.2177], 
    eta: '5 min',
    equipment: ['Ventilator', 'Defibrillator', 'Oxygen Port', 'Cardiac Monitor']
  },
  { 
    id: 2, 
    number: 'AMB-DL-002', 
    type: 'Basic Life Support', 
    status: 'available', 
    driver: 'Suresh Patel', 
    phone: '+91 98765 43223', 
    locationName: 'Karol Bagh, New Delhi',
    location: [28.6448, 77.1902], 
    eta: '8 min',
    equipment: ['Oxygen Cylinder', 'Basic First Aid Kit', 'Trauma Stretcher']
  },
  { 
    id: 3, 
    number: 'AMB-DL-003', 
    type: 'Mobile ICU', 
    status: 'busy', 
    driver: 'Amit Singh', 
    phone: '+91 98765 43224', 
    locationName: 'Saket, New Delhi',
    location: [28.5244, 77.2104], 
    eta: '15 min',
    equipment: ['ICU Ventilator', 'Advanced Cardiac Monitor', 'Trauma Stabilization Kit', 'AED']
  },
  { 
    id: 4, 
    number: 'AMB-DL-004', 
    type: 'Advanced Life Support', 
    status: 'available', 
    driver: 'Vikram Sharma', 
    phone: '+91 98765 43225', 
    locationName: 'Dwarka Sector 10, New Delhi',
    location: [28.5850, 77.0498], 
    eta: '7 min',
    equipment: ['Ventilator', 'Defibrillator', 'Oxygen Port', 'Intubation Set']
  },
  { 
    id: 5, 
    number: 'AMB-DL-005', 
    type: 'Mobile ICU', 
    status: 'available', 
    driver: 'Neha Verma', 
    phone: '+91 98765 43226', 
    locationName: 'Preet Vihar, New Delhi',
    location: [28.6485, 77.2919], 
    eta: '9 min',
    equipment: ['ICU Ventilator', 'Infusion Pump', 'Cardiac Pacemaker Support', 'Defibrillator']
  },
  { 
    id: 6, 
    number: 'AMB-DL-006', 
    type: 'Basic Life Support', 
    status: 'busy', 
    driver: 'Gagan Deep', 
    phone: '+91 98765 43227', 
    locationName: 'Rohini Sector 9, New Delhi',
    location: [28.7041, 77.1025], 
    eta: '12 min',
    equipment: ['Oxygen Cylinder', 'Basic First Aid Kit', 'Cervical Collar']
  }
];

const Ambulance = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ambulances from API on mount
  const fetchAmbulances = async () => {
    try {
      const data = await api.ambulances.getAll();
      setAmbulances(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load fleet ambulances from API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
  }, []);

  // States
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2099]);
  const [mapZoom, setMapZoom] = useState(11);
  const [bookingData, setBookingData] = useState({
    patientName: '',
    emergencyType: '',
    location: '',
    contact: '',
    notes: ''
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = ambulances.length;
    const available = ambulances.filter(a => a.status === 'available').length;
    const busy = total - available;
    return { total, available, busy };
  }, [ambulances]);

  // Style details based on Ambulance classification
  const getTypeStyles = (type) => {
    switch (type) {
      case 'Mobile ICU':
        return {
          border: 'border-l-4 border-l-rose-500',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-100',
          gradient: 'from-rose-50 to-white hover:from-rose-100/30',
          accentColor: 'text-rose-600',
        };
      case 'Advanced Life Support':
        return {
          border: 'border-l-4 border-l-blue-500',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
          gradient: 'from-blue-50 to-white hover:from-blue-100/30',
          accentColor: 'text-blue-600',
        };
      case 'Basic Life Support':
      default:
        return {
          border: 'border-l-4 border-l-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          gradient: 'from-emerald-50 to-white hover:from-emerald-100/30',
          accentColor: 'text-emerald-600',
        };
    }
  };

  // Create highly interactive, pulsing siren markers
  const createAmbulanceIcon = (status) => {
    const colorClass = status === 'available' 
      ? 'bg-emerald-500 ring-emerald-400' 
      : 'bg-rose-500 ring-rose-400';
    
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${colorClass} ring-4 ring-opacity-25 transition-all">
          <span class="text-white text-sm">🚑</span>
          ${status === 'available' ? '<span class="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>' : ''}
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  // Filter handlers
  const filteredAmbulances = useMemo(() => {
    return ambulances.filter(ambulance => {
      const matchesSearch = 
        (ambulance.number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ambulance.driver || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ambulance.locationName || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'All' || ambulance.type === filterType;
      const matchesStatus = filterStatus === 'All' || ambulance.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [ambulances, searchQuery, filterType, filterStatus]);

  // Center on card selection
  const handleSelectAmbulance = (ambulance) => {
    if (ambulance.status === 'busy') {
      toast.error(`Ambulance ${ambulance.number} is currently active on another call`);
      return;
    }
    setSelectedAmbulance(ambulance);
    setBookingData(prev => ({
      ...prev,
      location: ambulance.locationName
    }));
    if (ambulance.location) {
      setMapCenter(ambulance.location);
      setMapZoom(13);
    }
  };

  // Confirm booking handler
  const handleConfirmBooking = async () => {
    const token = localStorage.getItem('lifelinkToken');
    if (!token) {
      toast.error('Please login to book an ambulance');
      return;
    }

    if (!bookingData.patientName || !bookingData.location) {
      toast.error('Please specify patient name and pickup location');
      return;
    }

    try {
      await api.ambulances.bookAmbulance({
        ambulanceId: selectedAmbulance._id,
        patientName: bookingData.patientName,
        phone: bookingData.contact || '+91 99999 88888',
        location: bookingData.location,
        emergencyType: bookingData.emergencyType || 'General Medical Case',
        handoverNotes: bookingData.notes || ''
      });

      toast.success(`Emergency request dispatched for Ambulance ${selectedAmbulance.number}!`);
      setSelectedAmbulance(null);
      setBookingData({ patientName: '', emergencyType: '', location: '', contact: '', notes: '' });
      fetchAmbulances(); // Refresh list to show busy status
    } catch (e) {
      toast.error(e.message || 'Ambulance dispatch booking failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. Header Hero Panel */}
      <div className="relative bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white overflow-hidden border-b border-slate-800">
        
        {/* Glow ambient background graphics */}
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Emergency Dispatch System
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Ambulance <span className="text-red-500 bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Booking & Tracking</span>
              </h1>
              <p className="mt-2 text-slate-300 max-w-xl text-sm md:text-base leading-relaxed">
                Connect instantly with certified advanced trauma response units, monitor dispatch transit zones, and safeguard emergency transfers in real time.
              </p>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 lg:w-auto">
              <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 p-4 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                  <Truck className="w-3.5 h-3.5 text-blue-400" /> Active Fleets
                </div>
                <div className="text-2xl md:text-3xl font-black text-white">{stats.total}</div>
              </div>
              <div className="bg-emerald-950/20 backdrop-blur-md border border-emerald-800/40 p-4 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-medium mb-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Available Now
                </div>
                <div className="text-2xl md:text-3xl font-black text-emerald-400">{stats.available}</div>
              </div>
              <div className="bg-rose-950/20 backdrop-blur-md border border-rose-800/40 p-4 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-rose-400" /> Dispatched
                </div>
                <div className="text-2xl md:text-3xl font-black text-rose-400">{stats.busy}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Area */}
      <div className="container mx-auto px-4 -mt-6 relative z-25">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by driver name, sector, location, or vehicle number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
              />
            </div>

            {/* Type Selector */}
            <div className="md:col-span-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
              >
                <option value="All">All Classifications</option>
                <option value="Mobile ICU">Mobile ICU</option>
                <option value="Advanced Life Support">Advanced Life Support</option>
                <option value="Basic Life Support">Basic Life Support</option>
              </select>
            </div>

            {/* Status Selector */}
            <div className="md:col-span-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
              >
                <option value="All">All Statuses</option>
                <option value="available">Available</option>
                <option value="busy">Busy / Dispatched</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 3. Left Panel: Fleet Listing (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-500" /> Nearby Dispatch Fleet
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                  {filteredAmbulances.length} Active
                </span>
              </h2>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Select an available fleet card to configure booking
              </div>
            </div>

            {filteredAmbulances.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-950">No Matching Ambulance Fleets</h3>
                <p className="text-slate-500 text-sm mt-1">Try widening your filters or location search query.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setFilterType('All'); setFilterStatus('All'); }}
                  className="mt-4 bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-slate-900 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAmbulances.map((ambulance) => {
                  const isSelected = selectedAmbulance?.id === ambulance.id;
                  const design = getTypeStyles(ambulance.type);
                  
                  return (
                    <div 
                      key={ambulance.id}
                      onClick={() => handleSelectAmbulance(ambulance)}
                      className={`group bg-white rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 ${design.border} ${
                        isSelected 
                          ? 'ring-2 ring-red-500 border-transparent shadow-lg bg-slate-50/40' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top segment */}
                      <div className="p-4 border-b border-slate-100">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mb-1.5 ${design.badgeBg}`}>
                              {ambulance.type}
                            </span>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-red-600 transition-colors flex items-center gap-1.5">
                              {ambulance.number}
                            </h3>
                          </div>
                          
                          {/* Live Status indicator */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            ambulance.status === 'available' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              ambulance.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}></span>
                            {ambulance.status === 'available' ? 'Available' : 'Busy'}
                          </span>
                        </div>
                      </div>

                      {/* Middle Details segment */}
                      <div className="p-4 bg-slate-50/50 space-y-2.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span><strong className="text-slate-800">Driver:</strong> {ambulance.driver}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="truncate"><strong className="text-slate-800">Zone:</strong> {ambulance.locationName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span><strong className="text-slate-800">Response ETA:</strong> {ambulance.eta}</span>
                        </div>
                        
                        {/* Equipment tags */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                          {ambulance.equipment.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">
                              {item}
                            </span>
                          ))}
                          {ambulance.equipment.length > 3 && (
                            <span className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[10px]">
                              +{ambulance.equipment.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Button */}
                      <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
                        {ambulance.status === 'available' ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAmbulance(ambulance);
                              }}
                              className={`flex-1 text-center py-2 rounded-lg text-xs font-bold text-white transition ${
                                isSelected 
                                  ? 'bg-red-700' 
                                  : 'bg-red-600 hover:bg-red-700'
                              }`}
                            >
                              {isSelected ? 'Configure Booking Below' : 'Book Emergency'}
                            </button>
                            <a
                              href={`tel:${ambulance.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
                              title="Call Driver"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </>
                        ) : (
                          <div className="w-full text-center py-2 text-xs font-bold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed">
                            Currently In Transit
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Informational note */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-xs text-blue-800 mt-6 leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <strong className="block font-bold mb-0.5">Emergency Transit Notice</strong>
                All listed LifeLink ambulance operators are state-verified, emergency-compliant, and equipped with mandatory advanced trauma life support facilities. If an operator is unreachable, dial the primary state support lines immediately.
              </div>
            </div>

          </div>

          {/* 4. Right Panel: Maps & Booking (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Map Component */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Live Track Radar
                  </h2>
                  <p className="text-xs text-slate-500">Active regional operator coordinates</p>
                </div>
                <Navigation className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
              
              {/* React Leaflet Map Container */}
              <div className="h-[280px] w-full z-10 relative">
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
                  {filteredAmbulances.map((ambulance) => (
                    <Marker
                      key={ambulance.id}
                      position={ambulance.location}
                      icon={createAmbulanceIcon(ambulance.status)}
                    >
                      <Popup>
                        <div className="text-xs">
                          <strong className="text-slate-950 font-bold block">{ambulance.number} ({ambulance.type})</strong>
                          <span className="block text-slate-600 mt-0.5">Driver: {ambulance.driver}</span>
                          <span className="block text-slate-600">ETA: {ambulance.eta}</span>
                          {ambulance.status === 'available' ? (
                            <button
                              onClick={() => handleSelectAmbulance(ambulance)}
                              className="mt-2 w-full bg-red-600 text-white text-[10px] py-1 rounded font-bold hover:bg-red-700"
                            >
                              Configure Booking
                            </button>
                          ) : (
                            <span className="block text-rose-600 font-semibold mt-1">Dispatched/Busy</span>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Dynamic Booking Section */}
            {selectedAmbulance ? (
              <div className="bg-white rounded-xl shadow-lg border border-red-100 p-6 animate-fadeIn">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase">Step 2: Emergency Details</span>
                    <h2 className="text-xl font-extrabold text-slate-900">Confirm Dispatch</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedAmbulance(null)}
                    className="text-xs bg-slate-100 text-slate-500 hover:bg-slate-200 px-2 py-1 rounded"
                  >
                    Cancel Selection
                  </button>
                </div>
                
                {/* Visual recap of selected vehicle */}
                <div className="mb-4 p-3 bg-red-50/50 border border-red-100 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-bold text-red-950">{selectedAmbulance.number} ({selectedAmbulance.type})</h3>
                    <p className="text-red-800/80">Driver: {selectedAmbulance.driver} • ETA: {selectedAmbulance.eta}</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-red-900">{selectedAmbulance.locationName.split(',')[0]}</span>
                    <span className="text-[10px] text-slate-400">Current Station</span>
                  </div>
                </div>

                {/* Interactive Booking Form */}
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Patient Name *</label>
                    <input
                      type="text"
                      value={bookingData.patientName}
                      onChange={(e) => setBookingData({...bookingData, patientName: e.target.value})}
                      className="w-full px-3 h-10 border border-slate-200 rounded-lg focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-xs outline-none"
                      placeholder="Enter patient full name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Emergency Classification</label>
                      <select
                        value={bookingData.emergencyType}
                        onChange={(e) => setBookingData({...bookingData, emergencyType: e.target.value})}
                        className="w-full px-2.5 h-10 border border-slate-200 rounded-lg focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-xs outline-none bg-white text-slate-700"
                      >
                        <option value="">Select Priority</option>
                        <option value="Accident / Trauma">Accident / Trauma</option>
                        <option value="Cardiac Distress">Cardiac Distress</option>
                        <option value="Stroke / Neurological">Stroke / Neurological</option>
                        <option value="Respiratory Failure">Respiratory Distress</option>
                        <option value="Pregnancy / Labor">Pregnancy / Labor</option>
                        <option value="Other Medical">Other Medical Case</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Contact Phone *</label>
                      <input
                        type="tel"
                        value={bookingData.contact}
                        onChange={(e) => setBookingData({...bookingData, contact: e.target.value})}
                        className="w-full px-3 h-10 border border-slate-200 rounded-lg focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-xs outline-none"
                        placeholder="Primary mobile number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Pickup Address (Coordinates/Details) *</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={bookingData.location}
                        onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
                        className="w-full pl-9 pr-3 h-10 border border-slate-200 rounded-lg focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-xs outline-none"
                        placeholder="Specify complete pickup location"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Medical Handover Notes (Optional)</label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-xs outline-none h-16 resize-none"
                      placeholder="e.g. unconscious, severe bleeding, oxygen dependent..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleConfirmBooking}
                      className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white h-11 rounded-lg font-bold text-xs hover:from-red-700 hover:to-rose-700 transition shadow-md shadow-red-500/10"
                    >
                      Confirm Dispatch
                    </button>
                    <button
                      onClick={() => setSelectedAmbulance(null)}
                      className="flex-1 bg-slate-100 text-slate-700 h-11 rounded-lg font-bold text-xs hover:bg-slate-200 transition"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Default Panel when no selection
              <div className="bg-slate-100/40 border border-slate-200 rounded-xl p-6 text-center shadow-sm">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2 animate-bounce" />
                <h3 className="text-sm font-bold text-slate-800">Dispatch Pending</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Click the "Book Emergency" button on any available ambulance card to begin the instant medical dispatch configuration.
                </p>
              </div>
            )}

            {/* Redesigned Emergency Direct Contacts */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                <ShieldAlert className="w-4.5 h-4.5 text-red-500" /> Primary State Speed Dials
              </h3>
              
              <div className="space-y-3">
                <a 
                  href="tel:112"
                  className="flex items-center justify-between p-3.5 bg-rose-50/50 hover:bg-rose-100/40 border border-rose-100 rounded-xl transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-rose-100 text-rose-700 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 duration-200">
                      🚨
                    </span>
                    <div>
                      <p className="font-extrabold text-sm text-rose-950">National Emergency Support</p>
                      <p className="text-xs text-rose-800">Integrated rescue responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-black text-rose-700 text-sm">
                    Dial 112 <ChevronRight className="w-4 h-4" />
                  </div>
                </a>

                <a 
                  href="tel:108"
                  className="flex items-center justify-between p-3.5 bg-blue-50/50 hover:bg-blue-100/40 border border-blue-100 rounded-xl transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-blue-100 text-blue-700 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 duration-200">
                      🚑
                    </span>
                    <div>
                      <p className="font-extrabold text-sm text-blue-950">Free State Ambulance</p>
                      <p className="text-xs text-blue-800">Emergency medical transit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-black text-blue-700 text-sm">
                    Dial 108 <ChevronRight className="w-4 h-4" />
                  </div>
                </a>

                <a 
                  href="tel:100"
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-slate-100 text-slate-700 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 duration-200">
                      👮‍♂️
                    </span>
                    <div>
                      <p className="font-extrabold text-sm text-slate-950">Police Control Room</p>
                      <p className="text-xs text-slate-700">Law & order dispatch support</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-black text-slate-700 text-sm">
                    Dial 100 <ChevronRight className="w-4 h-4" />
                  </div>
                </a>
              </div>

            </div>

          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Ambulance;
