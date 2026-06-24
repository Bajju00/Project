// src/pages/HospitalDashboard.jsx - Complete High-Fidelity Hospital Admin Portal
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Truck, 
  Droplet, 
  Bed, 
  Wind, 
  Plus, 
  Settings, 
  Activity, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  TrendingUp,
  Sliders,
  Check,
  X
} from 'lucide-react';

import { api } from '../services/api';

const HospitalDashboard = () => {
  const [activeHospital, setActiveHospital] = useState({});
  const [resources, setResources] = useState({
    availableBeds: 0,
    availableIcuBeds: 0,
    availableOxygenCylinders: 0
  });

  const [bloodStocks, setBloodStocks] = useState({
    'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 
    'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0
  });

  const [ambulances, setAmbulances] = useState([]);
  const [newAmbulanceForm, setNewAmbulanceForm] = useState({
    number: '',
    type: 'Basic Life Support',
    driver: '',
    phone: '',
    locationName: '',
    eta: '10 min',
    equipment: ''
  });

  const [bookings, setBookings] = useState([]);

  // Load and sync all dashboard resources
  const loadData = async () => {
    try {
      const profile = await api.auth.getProfile();
      setActiveHospital(profile);
      setResources({
        availableBeds: profile.facilities?.availableBeds || 0,
        availableIcuBeds: profile.facilities?.availableIcuBeds || 0,
        availableOxygenCylinders: profile.facilities?.availableOxygenCylinders || 0
      });

      // Load blood stocks
      const stocks = await api.donors.getBloodStocks();
      setBloodStocks(stocks);

      // Load ambulances list and filter for this hospital
      const allAmbulances = await api.ambulances.getAll();
      const ownedAmbulances = allAmbulances.filter(amb => 
        amb.hospitalId === profile._id || (amb.hospitalId && amb.hospitalId._id === profile._id)
      );
      setAmbulances(ownedAmbulances);

      // Load active dispatches
      const activeBookings = await api.ambulances.getBookings();
      setBookings(activeBookings);
    } catch (e) {
      console.error('Failed to load dashboard data from API:', e);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('lifelinkToken');
    const userStr = localStorage.getItem('lifelinkUser');
    
    if (!token || !userStr) {
      toast.error('Please log in to access the hospital dashboard.');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role !== 'hospital') {
        navigate('/dashboard');
        return;
      }
    } catch (e) {
      navigate('/login');
      return;
    }

    loadData();
  }, []);

  // Save hospital profile and resource metrics
  const handleSaveResources = async (e) => {
    e.preventDefault();
    try {
      await api.hospitals.updateResources({
        availableBeds: Number(resources.availableBeds),
        availableIcuBeds: Number(resources.availableIcuBeds),
        availableOxygenCylinders: Number(resources.availableOxygenCylinders)
      });
      toast.success('Hospital resource metrics updated successfully!');
      loadData(); // Refresh profile values
    } catch (e) {
      toast.error(e.message || 'Failed to update hospital resources.');
    }
  };

  // Save blood stocks
  const handleSaveBloodStocks = async (e) => {
    e.preventDefault();
    try {
      await api.donors.updateBloodStocks(bloodStocks);
      toast.success('Blood bank reserve levels updated successfully!');
      loadData();
    } catch (e) {
      toast.error(e.message || 'Failed to save blood bank data.');
    }
  };

  // Quick increment/decrement helpers
  const adjustResource = (field, amount) => {
    setResources(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + amount)
    }));
  };

  // Quick adjust blood stocks
  const adjustBloodStock = (group, amount) => {
    setBloodStocks(prev => ({
      ...prev,
      [group]: Math.max(0, prev[group] + amount)
    }));
  };

  // Add new Ambulance operated by the hospital
  const handleAddAmbulance = async (e) => {
    e.preventDefault();
    const { number, type, driver, phone, locationName, equipment } = newAmbulanceForm;

    if (!number || !driver || !phone || !locationName) {
      toast.error('Please fill out all ambulance registration fields');
      return;
    }

    try {
      await api.ambulances.registerAmbulance({
        number,
        type,
        driver,
        phone,
        locationName,
        equipment: equipment || undefined
      });

      toast.success(`Ambulance fleet vehicle ${number} registered successfully!`);
      setNewAmbulanceForm({
        number: '',
        type: 'Basic Life Support',
        driver: '',
        phone: '',
        locationName: '',
        eta: '10 min',
        equipment: ''
      });
      loadData(); // Refresh fleets list
    } catch (err) {
      toast.error(err.message || 'Failed to register ambulance fleet vehicle');
    }
  };

  // Complete/Resolve ambulance bookings (Release vehicle)
  const handleResolveBooking = async (bookingId, ambulanceId) => {
    try {
      await api.ambulances.resolveBooking(bookingId);
      toast.success('Medical intake dispatch completed! Vehicle released back to available fleet.');
      loadData(); // Refresh intake & ambulance list
    } catch (e) {
      toast.error(e.message || 'Failed to resolve ambulance dispatch.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. Header Hero Panel */}
      <div className="relative bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Building2 className="w-3.5 h-3.5" /> Clinical Command Center
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                {activeHospital.name} <span className="text-indigo-400 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Management</span>
              </h1>
              <p className="mt-1.5 text-slate-300 max-w-xl text-xs md:text-sm">
                Operational status console. Adjust available beds, track clinical blood stocks, edit operated trauma ambulances, and sign off on resolved dispatches.
              </p>
            </div>
            
            {/* Hospital Contact Details Summary */}
            <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl text-xs max-w-sm space-y-1.5">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-400 shrink-0" /> <span className="truncate">{activeHospital.address}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-400 shrink-0" /> <span>{activeHospital.contact?.phone || '+91 98765 43210'}</span></div>
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-indigo-400 shrink-0" /> <span>Role: Hospital Administrator</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Resources & Blood Stock (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Resource Management: Beds & Oxygen */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <Bed className="w-5 h-5 text-indigo-500" /> Resource Intake Adjusters
              </h3>

              <form onSubmit={handleSaveResources} className="space-y-4 text-xs">
                
                {/* Available Beds */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <div>
                    <span className="block font-bold text-slate-900 text-sm">General Beds</span>
                    <span className="text-slate-400 text-[10px]">Standard patient wards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => adjustResource('availableBeds', -5)}
                      className="w-8 h-8 rounded-lg bg-white border font-bold hover:bg-slate-100 transition text-sm flex items-center justify-center"
                    >-</button>
                    <input
                      type="number"
                      value={resources.availableBeds}
                      onChange={(e) => setResources({...resources, availableBeds: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-12 text-center font-bold bg-white h-8 border rounded-lg text-xs outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => adjustResource('availableBeds', 5)}
                      className="w-8 h-8 rounded-lg bg-white border font-bold hover:bg-slate-100 transition text-sm flex items-center justify-center"
                    >+</button>
                  </div>
                </div>

                {/* ICU Beds */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <div>
                    <span className="block font-bold text-slate-900 text-sm">ICU Beds</span>
                    <span className="text-slate-400 text-[10px]">Intensive care units</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => adjustResource('availableIcuBeds', -1)}
                      className="w-8 h-8 rounded-lg bg-white border font-bold hover:bg-slate-100 transition text-sm flex items-center justify-center"
                    >-</button>
                    <input
                      type="number"
                      value={resources.availableIcuBeds}
                      onChange={(e) => setResources({...resources, availableIcuBeds: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-12 text-center font-bold bg-white h-8 border rounded-lg text-xs outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => adjustResource('availableIcuBeds', 1)}
                      className="w-8 h-8 rounded-lg bg-white border font-bold hover:bg-slate-100 transition text-sm flex items-center justify-center"
                    >+</button>
                  </div>
                </div>

                {/* Oxygen Cylinders */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <div>
                    <span className="block font-bold text-slate-900 text-sm">Oxygen Cylinders</span>
                    <span className="text-slate-400 text-[10px]">High pressure cylinders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => adjustResource('availableOxygenCylinders', -5)}
                      className="w-8 h-8 rounded-lg bg-white border font-bold hover:bg-slate-100 transition text-sm flex items-center justify-center"
                    >-</button>
                    <input
                      type="number"
                      value={resources.availableOxygenCylinders}
                      onChange={(e) => setResources({...resources, availableOxygenCylinders: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-12 text-center font-bold bg-white h-8 border rounded-lg text-xs outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => adjustResource('availableOxygenCylinders', 5)}
                      className="w-8 h-8 rounded-lg bg-white border font-bold hover:bg-slate-100 transition text-sm flex items-center justify-center"
                    >+</button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 rounded-lg transition shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px]"
                >
                  <Check className="w-4 h-4" /> Save Resource Counts
                </button>
              </form>
            </div>

            {/* Blood Bank stock control */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <Droplet className="w-5 h-5 text-rose-500 fill-rose-500" /> Blood Bank Stock Levels
              </h3>

              <form onSubmit={handleSaveBloodStocks} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(bloodStocks).map(([group, count]) => (
                    <div key={group} className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-lg">
                      <strong className="text-sm text-slate-900">{group}</strong>
                      <div className="flex items-center gap-1.5">
                        <button 
                          type="button" 
                          onClick={() => adjustBloodStock(group, -2)}
                          className="w-6 h-6 rounded bg-white border hover:bg-slate-100 font-bold transition flex items-center justify-center"
                        >-</button>
                        <span className="font-extrabold text-slate-800 text-xs w-6 text-center">{count}U</span>
                        <button 
                          type="button" 
                          onClick={() => adjustBloodStock(group, 2)}
                          className="w-6 h-6 rounded bg-white border hover:bg-slate-100 font-bold transition flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-10 rounded-lg transition shadow-md shadow-rose-500/10 flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px]"
                >
                  <Check className="w-4 h-4" /> Save Blood Stocks
                </button>
              </form>
            </div>

          </div>

          {/* Right panel: Ambulance Fleet & Active dispatches (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Ambulance intake requests */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <Activity className="w-5 h-5 text-indigo-500" /> Active Intake Dispatches
              </h3>

              {bookings.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 bg-slate-50/30">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No ambulance requests dispatched to your zone currently.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {bookings.map((booking) => (
                    <div 
                      key={booking.id}
                      className="border border-slate-200 rounded-xl p-4 text-xs bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-black text-slate-900">{booking.ambulanceNumber}</strong>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-bold uppercase">
                            {booking.type.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-slate-600 font-semibold mt-1">Patient: {booking.patientName}</p>
                        <p className="text-slate-500 text-[10px]">Location: {booking.location.split(',')[0]} • Cases: {booking.emergencyType}</p>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto justify-between border-t sm:border-0 pt-3 sm:pt-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping"></span>
                          {booking.status}
                        </span>
                        <button
                          onClick={() => handleResolveBooking(booking.id, booking.ambulanceId)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition flex items-center gap-0.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Intake
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ambulance Fleet management */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <Truck className="w-5 h-5 text-indigo-500" /> Operate Assigned Trauma Fleets
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Form to register new ambulance */}
                <div className="md:col-span-5 bg-slate-50 border border-slate-250/80 rounded-xl p-4">
                  <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 text-indigo-500" /> Add Fleet Vehicle
                  </h4>

                  <form onSubmit={handleAddAmbulance} className="space-y-3 text-[10px]">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Plate Number *</label>
                      <input
                        type="text"
                        required
                        value={newAmbulanceForm.number}
                        onChange={(e) => setNewAmbulanceForm({...newAmbulanceForm, number: e.target.value})}
                        className="w-full px-2.5 h-8 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="e.g. AMB-DL-099"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Classification</label>
                      <select
                        value={newAmbulanceForm.type}
                        onChange={(e) => setNewAmbulanceForm({...newAmbulanceForm, type: e.target.value})}
                        className="w-full px-1.5 h-8 border border-slate-200 rounded-lg outline-none bg-white text-slate-700 font-medium"
                      >
                        <option value="Basic Life Support">Basic Life Support</option>
                        <option value="Advanced Life Support">Advanced Life Support</option>
                        <option value="Mobile ICU">Mobile ICU</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Driver Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newAmbulanceForm.driver}
                        onChange={(e) => setNewAmbulanceForm({...newAmbulanceForm, driver: e.target.value})}
                        className="w-full px-2.5 h-8 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="Driver name"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Driver Phone Contact *</label>
                      <input
                        type="tel"
                        required
                        value={newAmbulanceForm.phone}
                        onChange={(e) => setNewAmbulanceForm({...newAmbulanceForm, phone: e.target.value})}
                        className="w-full px-2.5 h-8 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="+91 99999 88888"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Station Location Zone *</label>
                      <input
                        type="text"
                        required
                        value={newAmbulanceForm.locationName}
                        onChange={(e) => setNewAmbulanceForm({...newAmbulanceForm, locationName: e.target.value})}
                        className="w-full px-2.5 h-8 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="e.g. Connaught Place, New Delhi"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Equipment List (comma separated)</label>
                      <input
                        type="text"
                        value={newAmbulanceForm.equipment}
                        onChange={(e) => setNewAmbulanceForm({...newAmbulanceForm, equipment: e.target.value})}
                        className="w-full px-2.5 h-8 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="e.g. Ventilator, Defibrillator, AED"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8.5 rounded-lg transition uppercase tracking-wider text-[9px]"
                    >
                      Register Fleet Unit
                    </button>
                  </form>
                </div>

                {/* Fleet list */}
                <div className="md:col-span-7 space-y-3.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-450" /> Managed Vehicles ({ambulances.length})
                  </h4>

                  <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2">
                    {ambulances.map((amb) => (
                      <div 
                        key={amb.id}
                        className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex justify-between items-center text-xs"
                      >
                        <div>
                          <strong className="text-slate-900 font-bold block text-sm">{amb.number}</strong>
                          <span className="text-[9px] text-slate-450 block font-semibold mt-0.5">{amb.type}</span>
                          <span className="text-[10px] text-slate-500 block mt-1">Driver: {amb.driver} • {amb.phone}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          amb.status === 'available' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {amb.status}
                        </span>
                      </div>
                    ))}
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

export default HospitalDashboard;
