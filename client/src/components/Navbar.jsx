// src/components/Navbar.jsx - CORRECTED VERSION
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isAuth = !!token && !!user;
    console.log('🔐 Navbar auth check - Has token:', !!token, 'Has user:', !!user);
    return isAuth;
  };

  // Function to get user data
  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  };

  const user = getUser();
  const isHospital = user && (user.role === 'hospital' || user.userType === 'hospital');
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    console.log('👋 Logging out user:', user?.email);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isHospital');
    toast.success('Logged out successfully');
    
    if (isHospital || isAdmin) {
      navigate('/admin/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white p-2 rounded-lg">
              <span className="text-2xl">🚑</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">LifeLink</h1>
              <p className="text-xs text-blue-100">Emergency Healthcare</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 transition-colors font-medium">
              Home
            </Link>
            
            {isAuthenticated() ? (
              <>
                <Link 
                  to={isHospital || isAdmin ? "/admin/dashboard" : "/dashboard"} 
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                
                {/* Show additional links for regular users */}
                {!(isHospital || isAdmin) && (
                  <>
                    <Link to="/hospitals" className="hover:text-blue-200 transition-colors font-medium">
                      Hospitals
                    </Link>
                    <Link to="/ambulance" className="hover:text-blue-200 transition-colors font-medium">
                      Ambulance
                    </Link>
                    <Link to="/blood-donors" className="hover:text-blue-200 transition-colors font-medium">
                      Blood Donors
                    </Link>
                  </>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    {user?.fullName || user?.name || user?.hospitalName || 'User'}
                    {isHospital && ' 🏥'}
                    {isAdmin && ' 👑'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition-colors font-medium">
                  User Login
                </Link>
                <Link to="/admin/login" className="hover:text-blue-200 transition-colors font-medium">
                  Admin/Hospital Login
                </Link>
                <Link 
                  to="/hospital/register" 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-bold"
                >
                  Register Hospital
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors font-bold"
                >
                  Register User
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-500">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="py-2 hover:text-blue-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {isAuthenticated() ? (
                <>
                  <Link 
                    to={isHospital || isAdmin ? "/admin/dashboard" : "/dashboard"} 
                    className="py-2 hover:text-blue-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {/* Show additional links for regular users */}
                  {!(isHospital || isAdmin) && (
                    <>
                      <Link 
                        to="/hospitals" 
                        className="py-2 hover:text-blue-200 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Hospitals
                      </Link>
                      <Link 
                        to="/ambulance" 
                        className="py-2 hover:text-blue-200 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Ambulance
                      </Link>
                      <Link 
                        to="/blood-donors" 
                        className="py-2 hover:text-blue-200 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Blood Donors
                      </Link>
                    </>
                  )}
                  
                  <div className="pt-4 border-t border-blue-500 space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">
                        {user?.fullName || user?.name || user?.hospitalName || 'User'}
                        {isHospital && ' 🏥'}
                        {isAdmin && ' 👑'}
                      </p>
                      <p className="text-blue-200 text-xs">
                        {user?.email || ''}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors text-center font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="py-2 hover:text-blue-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    User Login
                  </Link>
                  <Link 
                    to="/admin/login" 
                    className="py-2 hover:text-blue-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin/Hospital Login
                  </Link>
                  <Link 
                    to="/hospital/register" 
                    className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors text-center font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register Hospital
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-blue-600 hover:bg-gray-100 py-2 rounded-lg transition-colors text-center font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register User
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;