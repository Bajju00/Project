// src/pages/Dashboard.jsx - Redesigned High-Fidelity Portal Version
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '../data/demoData';
import { api } from '../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  Phone, 
  Heart, 
  FileText, 
  Activity, 
  Truck, 
  MapPin, 
  Droplet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye,
  Plus,
  Compass,
  ArrowRight,
  Info,
  X,
  FileSpreadsheet,
  Stethoscope,
  UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    bloodGroup: 'O+',
    age: '26',
    weight: '72',
    phone: '',
    emergencyContact: '+91 98765 00000'
  });

  // State for blood donor registration check
  const [isRegisteredDonor, setIsRegisteredDonor] = useState(false);

  // States for ambulance dispatch activity
  const [bookings, setBookings] = useState([]);
  const [portalBooking, setPortalBooking] = useState({
    patientName: '',
    serviceType: 'Basic Life Support',
    emergencyType: '',
    location: '',
    notes: ''
  });

  // Modal report state
  const [activeReportModal, setActiveReportModal] = useState(null);

  // Mock clinical reports
  const clinicalReports = [
    {
      id: 'REP-2026-001',
      date: '10/05/2026',
      hospitalName: 'City General Hospital',
      doctor: 'Dr. Shailesh Gupta (MD, Pulmonology)',
      diagnosis: 'Acute Bronchitis & Congestion',
      vitals: {
        bp: '120/80 mmHg',
        pulse: '82 bpm',
        temp: '99.1 F',
        spo2: '98%'
      },
      prescriptions: [
        { name: 'Amoxicillin 500mg', dosage: '1 tablet - thrice daily (after meals)', duration: '5 Days' },
        { name: 'Paracetamol 650mg', dosage: '1 tablet - as needed for fever', duration: '3 Days' },
        { name: 'Guaifenesin Expectorant Syrup', dosage: '10ml - twice daily', duration: '5 Days' }
      ],
      advice: 'Perform steam inhalation twice daily. Drink warm fluids and avoid cold drinks. Complete rest is highly recommended for 3 days.'
    },
    {
      id: 'REP-2026-002',
      date: '18/04/2026',
      hospitalName: 'Sunrise Medical Center',
      doctor: 'Dr. Meena Iyer (General Physician)',
      diagnosis: 'Vitamin D3 & Iron Deficiency',
      vitals: {
        bp: '118/79 mmHg',
        pulse: '76 bpm',
        temp: '98.4 F',
        spo2: '99%'
      },
      prescriptions: [
        { name: 'Cholecalciferol (Vitamin D3) 60K UI', dosage: '1 capsule - weekly with milk', duration: '8 Weeks' },
        { name: 'Ferrous Ascorbate (Iron) 100mg', dosage: '1 tablet - daily at bedtime', duration: '30 Days' },
        { name: 'Zinc & Vitamin C Chewables', dosage: '1 tablet - daily', duration: '15 Days' }
      ],
      advice: 'Increase sun exposure for 15-20 minutes daily. Include spinach, pomegranate, legumes, and eggs in your nutrition. Re-test hemoglobin in 30 days.'
    }
  ];

  // Fetch all dashboard data from backend API
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('lifelinkToken');
    if (!token) return;

    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
      setProfileForm({
        fullName: profile.fullName || '',
        email: profile.email || '',
        bloodGroup: profile.bloodGroup || 'O+',
        age: profile.age || '26',
        weight: profile.weight || '72',
        phone: profile.phone || '',
        emergencyContact: profile.emergencyContact || '+91 98765 00000'
      });
      setIsRegisteredDonor(profile.isDonor || false);

      const dispatches = await api.ambulances.getBookings();
      setBookings(dispatches);
    } catch (e) {
      console.error('Failed to load dashboard metrics from API:', e);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('lifelinkToken');
    const userStr = localStorage.getItem('lifelinkUser');
    
    if (!token || !userStr) {
      toast.error('Please log in to access the patient dashboard.');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role === 'hospital') {
        navigate('/admin/dashboard');
        return;
      }
    } catch (e) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, []);

  // Update Profile details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await api.auth.updateProfile(profileForm);
      setUser(updatedUser);
      setEditMode(false);
      toast.success('User health profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Profile save failed');
    }
  };

  // Quick Register as donor
  const handleRegisterAsDonor = async () => {
    try {
      await api.donors.registerDonor({
        name: user.fullName,
        bloodGroup: user.bloodGroup || 'O+',
        phone: user.phone || '+91 98765 11111',
        address: 'Connaught Place, New Delhi',
        lastDonated: 'Never'
      });
      setIsRegisteredDonor(true);
      toast.success('Registered successfully! You are now live on the donor map.');
    } catch (e) {
      toast.error('Donor registration failed.');
    }
  };

  // Instant booking match and dispatch
  const handlePortalBookAmbulance = async (e) => {
    e.preventDefault();
    if (!portalBooking.patientName || !portalBooking.location) {
      toast.error('Please specify patient name and pickup address');
      return;
    }

    try {
      const fleet = await api.ambulances.getAll();
      const candidate = fleet.find(amb => amb.type === portalBooking.serviceType && amb.status === 'available');

      if (!candidate) {
        toast.error(`All ${portalBooking.serviceType} units are currently dispatched. Please choose another tier.`);
        return;
      }

      await api.ambulances.bookAmbulance({
        ambulanceId: candidate._id,
        patientName: portalBooking.patientName,
        phone: user.phone || '+91 99999 88888',
        location: portalBooking.location,
        emergencyType: portalBooking.emergencyType || 'General Medical Case',
        handoverNotes: portalBooking.notes || ''
      });

      toast.success(`Dispatched ${candidate.number} (${candidate.type}) immediately!`);
      setPortalBooking({
        patientName: '',
        serviceType: 'Basic Life Support',
        emergencyType: '',
        location: '',
        notes: ''
      });

      // Refresh bookings history list
      const dispatches = await api.ambulances.getBookings();
      setBookings(dispatches);
    } catch (err) {
      toast.error(err.message || 'Ambulance dispatch booking failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. Header Hero Board */}
      <div className="relative bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <UserCheck className="w-3.5 h-3.5" /> Patient Control Panel
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Welcome back, <span className="text-blue-500 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{user?.fullName || 'User'}</span>! 👋
              </h1>
              <p className="mt-2 text-slate-300 max-w-xl text-sm md:text-base">
                Monitor your clinical reports, request emergency ambulance coordinates, and manage volunteer donor status from your health dashboard.
              </p>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 lg:w-auto">
              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl text-center min-w-[100px] md:min-w-[130px]">
                <div className="text-slate-400 text-xs mb-1 flex items-center justify-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-400" /> Lab Reports
                </div>
                <div className="text-2xl font-black text-white">{clinicalReports.length}</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl text-center min-w-[100px] md:min-w-[130px]">
                <div className="text-slate-400 text-xs mb-1 flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-red-400" /> Bookings
                </div>
                <div className="text-2xl font-black text-white">{bookings.length}</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl text-center min-w-[100px] md:min-w-[130px]">
                <div className="text-slate-400 text-xs mb-1 flex items-center justify-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" /> Blood Donor
                </div>
                <div className="text-sm font-bold text-white mt-1.5 uppercase tracking-wider">
                  {isRegisteredDonor ? (
                    <span className="text-emerald-400 flex items-center justify-center gap-0.5"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                  ) : (
                    <span className="text-slate-400">In-active</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile & Blood Donor Form (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4.5 h-4.5 text-blue-500" /> Personal Health Profile
                </h2>
                {!editMode && (
                  <button 
                    onClick={() => setEditMode(true)}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-700 transition"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                      className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                      <select
                        value={profileForm.bloodGroup}
                        onChange={(e) => setProfileForm({...profileForm, bloodGroup: e.target.value})}
                        className="w-full px-2.5 h-9 border border-slate-200 rounded-lg outline-none bg-white text-slate-700"
                      >
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
                      <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Age (Years)</label>
                      <input
                        type="number"
                        required
                        value={profileForm.age}
                        onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
                        className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Weight (Kg)</label>
                      <input
                        type="number"
                        required
                        value={profileForm.weight}
                        onChange={(e) => setProfileForm({...profileForm, weight: e.target.value})}
                        className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Emergency SOS Contact</label>
                    <input
                      type="tel"
                      required
                      value={profileForm.emergencyContact}
                      onChange={(e) => setProfileForm({...profileForm, emergencyContact: e.target.value})}
                      className="w-full px-3 h-9 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white h-9 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setProfileForm({...user}); setEditMode(false); }}
                      className="flex-1 bg-slate-100 text-slate-700 h-9 rounded-lg font-bold hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 font-black rounded-full flex items-center justify-center text-lg uppercase border border-blue-100">
                      {user.fullName ? user.fullName[0] : 'U'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{user.fullName || 'N/A'}</h3>
                      <p className="text-slate-400">{user.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-y-3.5 gap-x-2">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Blood Group</span>
                      <strong className="text-slate-900 text-sm flex items-center gap-1">
                        <Droplet className="w-4 h-4 text-rose-500 fill-rose-500" /> {user.bloodGroup || 'Not specified'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Phone Number</span>
                      <strong className="text-slate-900 text-sm flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-500" /> {user.phone || '+91 98765 11111'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Age</span>
                      <strong className="text-slate-900 text-sm flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {user.age || '26'} Years
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Body Weight</span>
                      <strong className="text-slate-900 text-sm flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-cyan-500" /> {user.weight || '72'} Kg
                      </strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Emergency SOS Contact</span>
                    <div className="flex justify-between items-center p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-800">
                      <span className="font-extrabold text-sm flex items-center gap-1">🚨 {user.emergencyContact || '+91 98765 00000'}</span>
                      <a href={`tel:${user.emergencyContact}`} className="bg-rose-600 text-white font-bold px-2.5 py-1 rounded text-[10px] hover:bg-rose-700 transition">Call SOS</a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Blood Donation Registration Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" /> Blood Donor Status
              </h3>
              
              {isRegisteredDonor ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-950 text-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <strong className="font-extrabold text-emerald-900 text-sm">Active Donor Registered</strong>
                    </div>
                    Your details are currently listed on the public Map Radar under the group <strong className="font-bold">{user.bloodGroup}</strong>. Nearby patients can request blood from you.
                  </div>
                  <Link 
                    to="/blood-donors" 
                    className="flex items-center justify-center gap-1.5 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-lg transition"
                  >
                    View Blood Radar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-500 text-xs leading-relaxed">
                    You have not registered as a volunteer blood donor yet. Join our community to save lives in emergencies.
                  </p>
                  
                  <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-3 text-[10px] text-rose-800 space-y-1">
                    <span className="font-bold block mb-1">Registration Details:</span>
                    <div>• Registered Name: <strong className="font-bold text-slate-900">{user.fullName}</strong></div>
                    <div>• Blood Group: <strong className="font-bold text-slate-900">{user.bloodGroup}</strong></div>
                    <div>• Registry Contact: <strong className="font-bold text-slate-900">{user.phone}</strong></div>
                  </div>

                  <button
                    onClick={handleRegisterAsDonor}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-md shadow-rose-500/10 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Become a Donor Now
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Reports & Bookings (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hospital Medical Reports Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" /> Clinic Medical Reports
              </h2>

              <div className="space-y-3.5">
                {clinicalReports.map((report) => (
                  <div 
                    key={report.id}
                    onClick={() => setActiveReportModal(report)}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md cursor-pointer transition duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">{report.diagnosis}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{report.hospitalName} • {report.doctor.split('(')[0]}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Consultation Date</span>
                        <strong className="text-slate-700 text-xs font-bold">{report.date}</strong>
                      </div>
                      <button className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition">
                        <Eye className="w-3.5 h-3.5 text-blue-500" /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambulance Dispatch & Booking Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-500" /> Ambulance Dispatch Radar
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Instant dispatch widget */}
                <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="font-bold text-slate-950 text-xs mb-3 flex items-center gap-1">
                    <Activity className="w-4 h-4 text-red-500" /> Instant Dispatch Widget
                  </h3>
                  
                  <form onSubmit={handlePortalBookAmbulance} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Patient Name *</label>
                      <input
                        type="text"
                        required
                        value={portalBooking.patientName}
                        onChange={(e) => setPortalBooking({...portalBooking, patientName: e.target.value})}
                        className="w-full px-3 h-8.5 border border-slate-250 rounded-lg outline-none bg-white focus:border-red-500"
                        placeholder="Patient name"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Service Classification</label>
                      <select
                        value={portalBooking.serviceType}
                        onChange={(e) => setPortalBooking({...portalBooking, serviceType: e.target.value})}
                        className="w-full px-2 h-8.5 border border-slate-250 rounded-lg outline-none bg-white text-slate-700 font-medium"
                      >
                        <option value="Basic Life Support">Basic Life Support</option>
                        <option value="Advanced Life Support">Advanced Life Support</option>
                        <option value="Mobile ICU">Mobile ICU</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Emergency Priority</label>
                      <select
                        value={portalBooking.emergencyType}
                        onChange={(e) => setPortalBooking({...portalBooking, emergencyType: e.target.value})}
                        className="w-full px-2 h-8.5 border border-slate-250 rounded-lg outline-none bg-white text-slate-700 font-medium"
                      >
                        <option value="">Choose Case</option>
                        <option value="Cardiac arrest">Cardiac Distress</option>
                        <option value="Stroke / Paralysis">Stroke / Paralysis</option>
                        <option value="Physical Trauma">Accident / Physical Trauma</option>
                        <option value="Difficulty Breathing">Respiratory Distress</option>
                        <option value="Other Crisis">Other Medical Crisis</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Pickup Address *</label>
                      <input
                        type="text"
                        required
                        value={portalBooking.location}
                        onChange={(e) => setPortalBooking({...portalBooking, location: e.target.value})}
                        className="w-full px-3 h-8.5 border border-slate-250 rounded-lg outline-none bg-white focus:border-red-500"
                        placeholder="Pickup address details"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-9 rounded-lg transition shadow-md shadow-red-500/10 uppercase tracking-wider text-[10px]"
                    >
                      Book Ambulance
                    </button>
                  </form>
                </div>

                {/* Dispatch history logs */}
                <div className="md:col-span-7 space-y-3">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> Recent Dispatched Fleets
                  </h3>
                  
                  {bookings.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 bg-slate-50/30">
                      <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      No ambulances requested yet.
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2.5">
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id}
                          className="border border-slate-200 rounded-xl p-3 text-xs bg-slate-50/50 flex justify-between items-center gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 font-black text-sm">{booking.ambulanceNumber}</strong>
                              <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-600 uppercase">
                                {booking.type.split(' ')[0]}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[10px] mt-1">Patient: {booking.patientName} • Priority: {booking.emergencyType}</p>
                            <p className="text-slate-500 text-[10px]">Location: {booking.location.split(',')[0]} • Date: {booking.date}</p>
                          </div>
                          
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                              {booking.status}
                            </span>
                            <a 
                              href={`tel:${booking.driverPhone}`}
                              className="block text-[9px] text-blue-600 font-extrabold hover:underline mt-1 flex items-center justify-end gap-0.5"
                            >
                              <Phone className="w-2.5 h-2.5" /> Call Driver
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 5. Medical Report Detail Modal */}
      {activeReportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-xs">
            
            {/* Modal header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-extrabold text-sm">Clinical Report Summary</h3>
                  <p className="text-[10px] text-slate-400">Ref ID: {activeReportModal.id} • Issued: {activeReportModal.date}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveReportModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              
              {/* Facility & Doctor Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Medical Facility</span>
                  <p className="text-slate-900 font-extrabold text-sm">{activeReportModal.hospitalName}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Attending Practitioner</span>
                  <p className="text-slate-900 font-extrabold text-sm">{activeReportModal.doctor}</p>
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                  <Activity className="w-4 h-4 text-emerald-500" /> Patient Laboratory Vitals
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="block text-[8px] text-slate-400 uppercase font-semibold">Blood Pressure</span>
                    <strong className="text-slate-800 text-xs">{activeReportModal.vitals.bp}</strong>
                  </div>
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="block text-[8px] text-slate-400 uppercase font-semibold">Pulse Rate</span>
                    <strong className="text-slate-800 text-xs">{activeReportModal.vitals.pulse}</strong>
                  </div>
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="block text-[8px] text-slate-400 uppercase font-semibold">Body Temp</span>
                    <strong className="text-slate-800 text-xs">{activeReportModal.vitals.temp}</strong>
                  </div>
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="block text-[8px] text-slate-400 uppercase font-semibold">Oxygen (SpO2)</span>
                    <strong className="text-slate-800 text-xs">{activeReportModal.vitals.spo2}</strong>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Clinical Diagnosis</span>
                <p className="text-slate-900 font-black text-sm bg-rose-50 border border-rose-100 text-rose-900 px-3 py-2 rounded-lg mt-1">
                  {activeReportModal.diagnosis}
                </p>
              </div>

              {/* Prescriptions */}
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block mb-2">Prescribed Medication Intake</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold text-[9px]">
                        <th className="p-2.5">Medicine Name</th>
                        <th className="p-2.5">Frequency & Instructions</th>
                        <th className="p-2.5">Course Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeReportModal.prescriptions.map((med, idx) => (
                        <tr key={idx} className="border-b last:border-0 border-slate-150">
                          <td className="p-2.5 font-bold text-slate-900">{med.name}</td>
                          <td className="p-2.5 text-slate-600">{med.dosage}</td>
                          <td className="p-2.5 text-slate-600">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctor's Advice */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900">
                <h4 className="font-bold flex items-center gap-1 mb-1.5"><Info className="w-4 h-4 text-blue-600" /> Physician Advisory Remarks</h4>
                <p className="leading-relaxed">{activeReportModal.advice}</p>
              </div>

            </div>

            {/* Modal footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2">
              <button 
                onClick={() => toast.success('Prescription print request initialized!')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg"
              >
                Print Report
              </button>
              <button 
                onClick={() => setActiveReportModal(null)}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
