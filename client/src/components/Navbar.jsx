import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import logo from '../assets/M1.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('lifelinkToken');
  const userStr = localStorage.getItem('lifelinkUser');
  const user = userStr ? JSON.parse(userStr) : null;
  const isHospital = user?.role === 'hospital';

  const handleLogout = () => {
    api.auth.logout();
    toast.success('Successfully logged out!');
    setIsMenuOpen(false);
    navigate('/');
  };

  const displayName = isHospital ? (user.name || 'Hospital Admin') : (user?.fullName || 'User');

  const navItems = [
    { to: '/', label: 'Home', end: true },
    ...(token
      ? [
          isHospital
            ? { to: '/admin/dashboard', label: 'Admin Dashboard' }
            : { to: '/dashboard', label: 'Dashboard' }
        ]
      : []
    ),
    { to: '/hospitals', label: 'Hospitals' },
    { to: '/ambulance', label: 'Ambulance' },
    { to: '/blood-donors', label: 'Blood Donors' },
    { to: '/emergency', label: 'SOS' },
  ];

  const linkClass = ({ isActive }) =>
    `font-semibold transition-all duration-200 px-1 py-1 ${
      isActive
        ? 'text-blue-600 border-b-2 border-blue-600'
        : 'text-slate-650 hover:text-blue-650'
    }`;

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105">
              <img src={logo} alt="LifeLink logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                LifeLink
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Emergency Healthcare
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={isHospital ? '/admin/dashboard' : '/dashboard'}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl transition shadow-sm"
                >
                  <span className="text-base">{isHospital ? '🏥' : '👤'}</span>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-2 rounded-xl transition duration-200 font-bold text-sm shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/hospital/register"
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-800 border border-slate-200 px-4 py-2 rounded-xl transition duration-200 font-bold text-sm"
                >
                  Register Hospital
                </Link>
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition duration-200 font-bold text-sm shadow-sm shadow-blue-100"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-650 hover:text-slate-900 focus:outline-none"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <span className="text-2xl font-bold">×</span>
            ) : (
              <span className="text-2xl font-semibold">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-150 text-slate-800 animate-fadeIn">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="h-px bg-slate-100 my-2"></div>

              {token ? (
                <div className="flex flex-col space-y-2.5 px-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 py-1">
                    <span className="text-base">{isHospital ? '🏥' : '👤'}</span>
                    <span>{displayName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 py-2.5 rounded-xl font-bold text-sm border border-red-200 transition text-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 px-3">
                  <Link
                    to="/hospital/register"
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold text-sm border border-slate-200 text-center transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register Hospital
                  </Link>
                  <Link
                    to="/login"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm text-center transition shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
