// src/pages/Login.jsx - UPDATED
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use authService for login
      const result = await authService.login(formData.email, formData.password);
      
      if (result.success) {
        toast.success(result.message || 'Login successful!');
        
        // Get user info
        const user = authService.getCurrentUser();
        const userRole = authService.getUserRole();
        
        console.log('🎯 Login successful. User role:', userRole);
        console.log('👤 User details:', user);
        
        // Redirect based on role
        setTimeout(() => {
          if (authService.isAdmin()) {
            console.log('📍 Redirecting admin to /admin/dashboard');
            navigate('/admin/dashboard');
          } else if (authService.isHospital()) {
            console.log('📍 Redirecting hospital to /admin/dashboard');
            navigate('/admin/dashboard');
          } else {
            console.log('📍 Redirecting regular user to /dashboard');
            navigate('/dashboard');
          }
        }, 1000);
        
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login buttons
  const handleQuickLogin = (email, password, userType) => {
    console.log(`🚀 Quick login as ${userType}`);
    setFormData({ email, password });
    
    // Auto-submit after setting form data
    setTimeout(() => {
      const submitEvent = new Event('submit', { cancelable: true });
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(submitEvent);
      }
    }, 100);
  };

  // Debug function
  const debugAuth = () => {
    console.log('🔍 Debugging auth...');
    authService.debugAuth();
    
    // Check if backend is reachable
    fetch('http://localhost:5000/api/hospitals')
      .then(res => {
        console.log('🌐 Backend reachable:', res.ok);
        return res.json();
      })
      .then(data => console.log('🏥 Hospitals data:', data))
      .catch(err => console.error('❌ Backend error:', err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">User Login</h2>
            <p className="text-gray-600 mt-2">Access your LifeLink dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-6 space-y-3">
            <p className="text-gray-600 text-sm text-center">Quick Test Logins:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('user@example.com', 'user123', 'User')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm"
              >
                Regular User
              </button>
              <button
                onClick={() => handleQuickLogin('donor@example.com', 'donor123', 'Donor')}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm"
              >
                Blood Donor
              </button>
              <button
                onClick={() => handleQuickLogin('citygeneral@lifelink.com', 'hospital123', 'Hospital')}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm"
              >
                Hospital Staff
              </button>
              <button
                onClick={() => handleQuickLogin('admin@lifelink.com', 'admin123', 'Admin')}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm"
              >
                System Admin
              </button>
            </div>
          </div>

          {/* Debug Tools */}
          <div className="mt-4">
            <button
              onClick={debugAuth}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg text-sm"
            >
              Debug Auth
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Register here
                </Link>
              </p>
              
              <div className="flex justify-center space-x-4">
                <Link 
                  to="/admin/login" 
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  🏥 Hospital Login
                </Link>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm text-gray-600">
            <strong>Test Credentials:</strong>
            <br/>• User: user@example.com / user123
            <br/>• Hospital: citygeneral@lifelink.com / hospital123
            <br/>• Admin: admin@lifelink.com / admin123
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Open browser console (F12) for debug logs
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;