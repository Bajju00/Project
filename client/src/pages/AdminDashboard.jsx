import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  FaHospital, 
  FaAmbulance, 
  FaUserInjured, 
  FaUsers,
  FaBed,
  FaChartLine,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaDownload,
  FaBell,
  FaUserCircle,
  FaEdit,
  FaEye
} from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  AreaChart, Area
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [isEditingResources, setIsEditingResources] = useState(false);
  const [resources, setResources] = useState({
    totalBeds: 0,
    availableBeds: 0,
    totalIcuBeds: 0,
    availableIcuBeds: 0,
    totalOxygenCylinders: 0,
    availableOxygenCylinders: 0
  });
  const [tempResources, setTempResources] = useState({});
  
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    emergenciesToday: 0,
    resolvedToday: 0,
    totalPatients: 0,
    averageResponseTime: 0
  });
  
  const [emergencies, setEmergencies] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check hospital access on component mount
  useEffect(() => {
    console.log('🔍 AdminDashboard: Checking access...');
    
    const checkHospitalAccess = () => {
      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      console.log('📋 Raw user string:', userStr);
      
      if (!userStr) {
        console.log('❌ No user found in localStorage');
        toast.error('Please login first');
        navigate('/admin/login');
        return false;
      }
      
      try {
        // Parse user
        const user = JSON.parse(userStr);
        console.log('👤 Parsed user object:', user);
        console.log('🎭 User role:', user.role);
        console.log('🏥 User type:', user.userType);
        console.log('🔑 Is admin?', user.isAdmin);
        console.log('🏥 Is hospital admin?', user.isHospitalAdmin);
        
        // Set hospital info
        setHospitalInfo(user);
        
        // ✅ ACCEPT HOSPITAL ROLE, ADMIN ROLE, AND HOSPITAL ADMIN FLAG
        // Allow: role = 'hospital' OR role = 'admin' OR isHospitalAdmin = true
        const isHospitalStaff = user.role === 'hospital' || 
                               user.userType === 'hospital' || 
                               user.isHospitalAdmin === true;
        
        const isSystemAdmin = user.role === 'admin' || 
                             user.isAdmin === true;
        
        if (isHospitalStaff || isSystemAdmin) {
          console.log('✅ Access granted!');
          console.log('👤 User details:', {
            role: user.role,
            userType: user.userType,
            isAdmin: user.isAdmin,
            isHospitalAdmin: user.isHospitalAdmin,
            hospitalName: user.hospitalName
          });
          return true;
        } else {
          console.log('❌ Access denied. User details:', {
            role: user.role,
            userType: user.userType,
            isAdmin: user.isAdmin,
            isHospitalAdmin: user.isHospitalAdmin
          });
          toast.error('Access denied. Hospital admin privileges required.');
          navigate('/login');
          return false;
        }
        
      } catch (error) {
        console.error('❌ Error parsing user:', error);
        toast.error('Session error. Please login again.');
        navigate('/admin/login');
        return false;
      }
    };
    
    if (checkHospitalAccess()) {
      console.log('🚀 Fetching hospital data...');
      fetchHospitalData();
    }
  }, [navigate]);

  // Chart data - specific to this hospital
  const emergencyTrendData = [
    { day: 'Mon', emergencies: 4 },
    { day: 'Tue', emergencies: 3 },
    { day: 'Wed', emergencies: 6 },
    { day: 'Thu', emergencies: 5 },
    { day: 'Fri', emergencies: 8 },
    { day: 'Sat', emergencies: 7 },
    { day: 'Sun', emergencies: 4 },
  ];

  const bedUtilizationData = [
    { name: 'General Beds', used: 45, total: 60 },
    { name: 'ICU Beds', used: 8, total: 12 },
    { name: 'Oxygen Beds', used: 20, total: 30 },
  ];

  const responseTimeData = [
    { hour: '6AM', time: 8.2 },
    { hour: '9AM', time: 7.8 },
    { hour: '12PM', time: 12.4 },
    { hour: '3PM', time: 15.6 },
    { hour: '6PM', time: 18.3 },
    { hour: '9PM', time: 14.7 },
  ];

  const fetchHospitalData = async () => {
    setLoading(true);
    try {
      // Set hospital resources
      setResources({
        totalBeds: 60,
        availableBeds: 15,
        totalIcuBeds: 12,
        availableIcuBeds: 4,
        totalOxygenCylinders: 30,
        availableOxygenCylinders: 10
      });
      
      setTempResources({
        totalBeds: 60,
        availableBeds: 15,
        totalIcuBeds: 12,
        availableIcuBeds: 4,
        totalOxygenCylinders: 30,
        availableOxygenCylinders: 10
      });

      setStats({
        activeEmergencies: 3,
        emergenciesToday: 8,
        resolvedToday: 5,
        totalPatients: 42,
        averageResponseTime: 14.3
      });

      // Emergencies assigned to this hospital
      setEmergencies([
        { 
          id: 1, 
          type: 'Accident', 
          patientName: 'Rajesh Kumar',
          age: 35,
          bloodGroup: 'O+',
          location: '5 km away', 
          status: 'active', 
          time: '15 mins ago', 
          priority: 'high',
          assignedAmbulance: 'AMB-101',
          eta: '5 minutes'
        },
        { 
          id: 2, 
          type: 'Heart Attack', 
          patientName: 'Priya Sharma',
          age: 52,
          bloodGroup: 'A+',
          location: '3 km away', 
          status: 'active', 
          time: '25 mins ago', 
          priority: 'critical',
          assignedAmbulance: 'AMB-205',
          eta: '3 minutes'
        },
        { 
          id: 3, 
          type: 'Difficulty Breathing', 
          patientName: 'Amit Singh',
          age: 68,
          bloodGroup: 'B+',
          location: '8 km away', 
          status: 'resolved', 
          time: '1 hour ago', 
          priority: 'medium',
          assignedAmbulance: 'AMB-102',
          eta: 'Arrived'
        },
      ]);

      // Current patients in hospital
      setPatients([
        { 
          id: 1, 
          name: 'Rohan Verma', 
          age: 45,
          bloodGroup: 'O+',
          admissionDate: '2024-01-15', 
          status: 'stable',
          ward: 'General Ward',
          bedNumber: 'G-12',
          doctor: 'Dr. Sharma'
        },
        { 
          id: 2, 
          name: 'Sneha Patel', 
          age: 32,
          bloodGroup: 'A-',
          admissionDate: '2024-01-18', 
          status: 'critical',
          ward: 'ICU',
          bedNumber: 'ICU-3',
          doctor: 'Dr. Kumar'
        },
        { 
          id: 3, 
          name: 'Vikram Reddy', 
          age: 58,
          bloodGroup: 'B+',
          admissionDate: '2024-01-20', 
          status: 'recovering',
          ward: 'General Ward',
          bedNumber: 'G-08',
          doctor: 'Dr. Gupta'
        },
      ]);

    } catch (error) {
      toast.error('Failed to load hospital data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleUpdateResources = () => {
    // Update resources logic here
    setResources(tempResources);
    setIsEditingResources(false);
    toast.success('Hospital resources updated successfully!');
  };

  const handleMarkEmergencyResolved = (emergencyId) => {
    setEmergencies(prev => 
      prev.map(emergency => 
        emergency.id === emergencyId 
          ? { ...emergency, status: 'resolved' }
          : emergency
      )
    );
    toast.success('Emergency marked as resolved');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Loading Hospital Dashboard...</p>
          <p className="text-gray-500">Please wait while we fetch your hospital data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-green-900 via-green-800 to-green-900 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-xl shadow-md">
                <FaHospital className="text-3xl text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">🏥 {hospitalInfo?.hospitalName || 'Hospital Dashboard'}</h1>
                <p className="text-green-200 text-sm">Hospital Control Panel • {hospitalInfo?.email || 'Hospital Staff'}</p>
                <p className="text-green-300 text-xs">{hospitalInfo?.hospitalAddress || 'Hospital Management System'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <button className="text-white hover:text-green-200 p-2">
                  <FaBell className="text-xl" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {emergencies.filter(e => e.status === 'active').length}
                  </span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3 bg-green-800/50 px-4 py-2 rounded-xl">
                <FaUserCircle className="text-2xl text-white" />
                <div className="text-white">
                  <p className="font-medium">{hospitalInfo?.fullName || hospitalInfo?.name || 'Hospital Staff'}</p>
                  <p className="text-xs text-green-200">
                    {hospitalInfo?.role === 'hospital' ? 'Hospital Staff' : 'System Administrator'} • 
                    ID: {hospitalInfo?.hospitalId || 'HOS001'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Hospital Tabs */}
          <div className="mt-6 flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'resources', label: 'Resources', icon: '🛏️' },
              { id: 'emergencies', label: 'Emergencies', icon: '🚨' },
              { id: 'patients', label: 'Patients', icon: '👥' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-t-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-green-900 shadow-lg'
                    : 'text-green-100 hover:bg-green-700/50 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl shadow-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Welcome, {hospitalInfo?.fullName || hospitalInfo?.name || 'Hospital Team'}!</h2>
              <p className="text-green-100 text-lg">Real-time overview of {hospitalInfo?.hospitalName || 'your hospital'}'s operations</p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="font-medium">Status:</span> Operational
                </div>
                <div className="bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="font-medium">Last Update:</span> Just now
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Active Emergencies', 
                  value: stats.activeEmergencies, 
                  icon: <FaUserInjured className="text-3xl" />, 
                  color: 'from-red-500 to-red-600',
                  change: 'Need immediate attention'
                },
                { 
                  title: 'Available Beds', 
                  value: `${resources.availableBeds}/${resources.totalBeds}`, 
                  icon: <FaBed className="text-3xl" />, 
                  color: 'from-blue-500 to-blue-600',
                  change: `${Math.round((resources.availableBeds/resources.totalBeds)*100)}% available`
                },
                { 
                  title: 'Current Patients', 
                  value: stats.totalPatients, 
                  icon: <FaUsers className="text-3xl" />, 
                  color: 'from-purple-500 to-purple-600',
                  change: '3 in ICU'
                },
                { 
                  title: 'Avg Response Time', 
                  value: `${stats.averageResponseTime} min`, 
                  icon: <FaAmbulance className="text-3xl" />, 
                  color: 'from-orange-500 to-orange-600',
                  change: 'Today: 12.4 min'
                },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                      <p className="text-gray-400 text-sm mt-2">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Resource Update */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Quick Resource Update</h3>
                <button
                  onClick={() => setIsEditingResources(!isEditingResources)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaEdit />
                  <span>{isEditingResources ? 'Cancel' : 'Edit Resources'}</span>
                </button>
              </div>

              {isEditingResources ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">General Beds Available</label>
                    <input
                      type="number"
                      value={tempResources.availableBeds}
                      onChange={(e) => setTempResources({...tempResources, availableBeds: parseInt(e.target.value)})}
                      max={tempResources.totalBeds}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-gray-500 text-sm mt-1">Total: {tempResources.totalBeds} beds</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">ICU Beds Available</label>
                    <input
                      type="number"
                      value={tempResources.availableIcuBeds}
                      onChange={(e) => setTempResources({...tempResources, availableIcuBeds: parseInt(e.target.value)})}
                      max={tempResources.totalIcuBeds}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-gray-500 text-sm mt-1">Total: {tempResources.totalIcuBeds} ICU beds</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Oxygen Cylinders Available</label>
                    <input
                      type="number"
                      value={tempResources.availableOxygenCylinders}
                      onChange={(e) => setTempResources({...tempResources, availableOxygenCylinders: parseInt(e.target.value)})}
                      max={tempResources.totalOxygenCylinders}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-gray-500 text-sm mt-1">Total: {tempResources.totalOxygenCylinders} cylinders</p>
                  </div>
                  <div className="md:col-span-3">
                    <button
                      onClick={handleUpdateResources}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
                    >
                      Update Resources
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-500">General Beds</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {resources.availableBeds} / {resources.totalBeds}
                        </p>
                      </div>
                      <FaBed className="text-3xl text-blue-500" />
                    </div>
                    <div className="mt-4 h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600" 
                        style={{ width: `${(resources.availableBeds/resources.totalBeds)*100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-500">ICU Beds</p>
                        <p className="text-2xl font-bold text-green-600">
                          {resources.availableIcuBeds} / {resources.totalIcuBeds}
                        </p>
                      </div>
                      <FaBed className="text-3xl text-green-500" />
                    </div>
                    <div className="mt-4 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600" 
                        style={{ width: `${(resources.availableIcuBeds/resources.totalIcuBeds)*100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-500">Oxygen Cylinders</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {resources.availableOxygenCylinders} / {resources.totalOxygenCylinders}
                        </p>
                      </div>
                      <FaBed className="text-3xl text-orange-500" />
                    </div>
                    <div className="mt-4 h-2 bg-orange-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-600" 
                        style={{ width: `${(resources.availableOxygenCylinders/resources.totalOxygenCylinders)*100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Emergencies */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Emergencies</h3>
              <div className="space-y-4">
                {emergencies.slice(0, 3).map((emergency) => (
                  <div key={emergency.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        emergency.priority === 'critical' ? 'bg-red-100 text-red-600' :
                        emergency.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {emergency.type === 'Accident' ? '🚗' :
                         emergency.type === 'Heart Attack' ? '❤️' :
                         emergency.type === 'Stroke' ? '🧠' : '😮‍💨'}
                      </div>
                      <div>
                        <p className="font-medium">{emergency.type} - {emergency.patientName}</p>
                        <div className="flex items-center text-gray-500 text-sm">
                          <FaMapMarkerAlt className="mr-1" />
                          {emergency.location} • {emergency.time}
                        </div>
                        <div className="text-sm text-gray-600">
                          Age: {emergency.age} • Blood Group: {emergency.bloodGroup}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        emergency.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {emergency.status}
                      </span>
                      {emergency.status === 'active' && (
                        <button 
                          onClick={() => handleMarkEmergencyResolved(emergency.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Resource Management</h2>
                  <p className="text-gray-600">Update your hospital's available resources in real-time</p>
                </div>
                <button
                  onClick={() => setIsEditingResources(!isEditingResources)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  <FaEdit />
                  <span>{isEditingResources ? 'Cancel Editing' : 'Edit Resources'}</span>
                </button>
              </div>

              {isEditingResources ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">General Beds</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Total Beds</label>
                        <input
                          type="number"
                          value={tempResources.totalBeds}
                          onChange={(e) => setTempResources({...tempResources, totalBeds: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Available Beds</label>
                        <input
                          type="number"
                          value={tempResources.availableBeds}
                          onChange={(e) => setTempResources({...tempResources, availableBeds: parseInt(e.target.value)})}
                          max={tempResources.totalBeds}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-4">ICU Beds</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Total ICU Beds</label>
                        <input
                          type="number"
                          value={tempResources.totalIcuBeds}
                          onChange={(e) => setTempResources({...tempResources, totalIcuBeds: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Available ICU Beds</label>
                        <input
                          type="number"
                          value={tempResources.availableIcuBeds}
                          onChange={(e) => setTempResources({...tempResources, availableIcuBeds: parseInt(e.target.value)})}
                          max={tempResources.totalIcuBeds}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-800 mb-4">Oxygen Supply</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Total Cylinders</label>
                        <input
                          type="number"
                          value={tempResources.totalOxygenCylinders}
                          onChange={(e) => setTempResources({...tempResources, totalOxygenCylinders: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Available Cylinders</label>
                        <input
                          type="number"
                          value={tempResources.availableOxygenCylinders}
                          onChange={(e) => setTempResources({...tempResources, availableOxygenCylinders: parseInt(e.target.value)})}
                          max={tempResources.totalOxygenCylinders}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setIsEditingResources(false)}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateResources}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">General Beds</h3>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-600">
                        {resources.availableBeds} / {resources.totalBeds}
                      </p>
                      <p className="text-gray-600 mt-2">Available / Total</p>
                      <div className="mt-4 h-3 bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600" 
                          style={{ width: `${(resources.availableBeds/resources.totalBeds)*100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-green-800 mb-4">ICU Beds</h3>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-green-600">
                        {resources.availableIcuBeds} / {resources.totalIcuBeds}
                      </p>
                      <p className="text-gray-600 mt-2">Available / Total</p>
                      <div className="mt-4 h-3 bg-green-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600" 
                          style={{ width: `${(resources.availableIcuBeds/resources.totalIcuBeds)*100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-orange-800 mb-4">Oxygen Supply</h3>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-orange-600">
                        {resources.availableOxygenCylinders} / {resources.totalOxygenCylinders}
                      </p>
                      <p className="text-gray-600 mt-2">Available / Total</p>
                      <div className="mt-4 h-3 bg-orange-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-600" 
                          style={{ width: `${(resources.availableOxygenCylinders/resources.totalOxygenCylinders)*100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EMERGENCIES TAB */}
        {activeTab === 'emergencies' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Emergencies</h2>
              
              <div className="space-y-4">
                {emergencies.map((emergency) => (
                  <div key={emergency.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{emergency.type}</h3>
                        <p className="text-gray-600">Patient: {emergency.patientName} • Age: {emergency.age} • Blood Group: {emergency.bloodGroup}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        emergency.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        emergency.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {emergency.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{emergency.location}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Ambulance</p>
                        <p className="font-medium">{emergency.assignedAmbulance}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">ETA</p>
                        <p className="font-medium">{emergency.eta}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        emergency.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Status: {emergency.status}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <FaEye className="inline mr-2" />
                          View Details
                        </button>
                        {emergency.status === 'active' && (
                          <button 
                            onClick={() => handleMarkEmergencyResolved(emergency.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PATIENTS TAB */}
        {activeTab === 'patients' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Patients</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left text-gray-700 font-semibold">Patient Name</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-semibold">Age</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-semibold">Blood Group</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-semibold">Ward</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-semibold">Bed</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-semibold">Status</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaUserCircle className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-gray-500">Admitted: {patient.admissionDate}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold">{patient.age}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-red-600">{patient.bloodGroup}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {patient.ward}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold">{patient.bedNumber}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            patient.status === 'critical' ? 'bg-red-100 text-red-800' :
                            patient.status === 'stable' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Hospital Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Emergency Trends (Last 7 Days)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={emergencyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="emergencies" fill="#4CAF50" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Bed Utilization</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bedUtilizationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, used, total }) => `${name}: ${used}/${total}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="used"
                        >
                          <Cell fill="#2196F3" />
                          <Cell fill="#4CAF50" />
                          <Cell fill="#FF9800" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Response Time Analysis</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="time" stroke="#FF5722" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Hospital Settings</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Hospital Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Hospital Name</label>
                    <input 
                      type="text" 
                      value={hospitalInfo?.hospitalName || hospitalInfo?.fullName || ''}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Hospital ID</label>
                    <input 
                      type="text" 
                      value={hospitalInfo?.hospitalId || 'HOS001'}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Address</label>
                    <textarea 
                      value={hospitalInfo?.hospitalAddress || hospitalInfo?.address || ''}
                      readOnly
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Contact Number</label>
                    <input 
                      type="text" 
                      value={hospitalInfo?.phone || hospitalInfo?.contact || '+91 9876543210'}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      value={hospitalInfo?.email || ''}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-5 w-5 text-green-600" defaultChecked />
                    <span className="text-gray-700">Emergency alerts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-5 w-5 text-green-600" defaultChecked />
                    <span className="text-gray-700">Ambulance arrival notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-5 w-5 text-green-600" defaultChecked />
                    <span className="text-gray-700">Resource depletion warnings</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Daily summary reports</span>
                  </label>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium">
                  Request Admin Assistance
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;