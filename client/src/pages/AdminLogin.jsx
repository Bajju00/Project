// src/pages/AdminLogin.jsx - UPDATED (Unified Admin/Hospital Login)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
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
      // Call your backend login API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success && data.token) {
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Check if user is admin or hospital
        const user = data.user;
        const isAuthorized = user.role === 'admin' || user.role === 'hospital' || user.userType === 'hospital';
        
        if (isAuthorized) {
          toast.success(`Welcome ${user.fullName || user.hospitalName}!`);
          
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 1000);
        } else {
          toast.error('This account does not have admin/hospital access');
          localStorage.clear();
          navigate('/login');
        }
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Cannot connect to server. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login for testing
  const handleQuickLogin = (email, password, type) => {
    setFormData({ email, password });
    toast.info(`Logging in as ${type}...`);
    
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Admin/Hospital Login</h2>
            <p className="text-gray-600 mt-2">Access hospital management dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="admin@lifelink.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg disabled:opacity-50"
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
            <p className="text-gray-600 text-sm text-center">Quick Login:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('admin@lifelink.com', 'admin123', 'System Admin')}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm"
              >
                System Admin
              </button>
              <button
                onClick={() => handleQuickLogin('citygeneral@lifelink.com', 'hospital123', 'Hospital')}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
              >
                Hospital Staff
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Don't have a hospital account?{' '}
                <Link to="/hospital/register" className="text-green-600 hover:text-green-800 font-bold">
                  Register New Hospital
                </Link>
              </p>
              
              <div className="flex justify-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  ← User Login
                </Link>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  ← Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;