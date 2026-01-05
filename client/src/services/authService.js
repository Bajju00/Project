// src/services/authService.js - COMPLETE WORKING VERSION
import api from './api';

const authService = {
  // Login user (works for all roles: user, donor, doctor, hospital, admin)
  login: async (email, password) => {
    console.log('🔐 Attempting login for:', email);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login response:', response.data);
      
      if (response.data.success && response.data.token) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Store role-specific flags
        const user = response.data.user;
        
        if (user.role === 'admin' || user.isAdmin === true) {
          localStorage.setItem('isAdmin', 'true');
          console.log('👑 User is admin');
        }
        
        if (user.role === 'hospital' || user.userType === 'hospital' || user.isHospitalAdmin === true) {
          localStorage.setItem('isHospital', 'true');
          console.log('🏥 User is hospital staff');
        }
        
        console.log('✅ Auth data stored in localStorage');
        console.log('👤 User role:', user.role);
        console.log('🔑 Token saved:', response.data.token ? 'Yes' : 'No');
        
        return {
          success: true,
          ...response.data,
          userType: user.role || user.userType
        };
      } else {
        console.error('❌ Login failed - no token');
        return {
          success: false,
          error: response.data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('❌ Login API error:', error);
      
      // Provide user-friendly error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },
  
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, ...response.data };
      } else {
        return { success: false, error: response.data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    console.log('🔐 Auth check - Has token:', hasToken);
    return hasToken;
  },
  
  // Get current user
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      console.log('👤 Current user from storage:', user?.email, 'Role:', user?.role);
      return user;
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  },
  
  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    const isAdmin = user && (
      user.role === 'admin' || 
      user.isAdmin === true ||
      localStorage.getItem('isAdmin') === 'true'
    );
    console.log('👑 Is admin?', isAdmin);
    return isAdmin;
  },
  
  // Check if user is hospital staff
  isHospital: () => {
    const user = authService.getCurrentUser();
    const isHospital = user && (
      user.role === 'hospital' || 
      user.userType === 'hospital' || 
      user.isHospitalAdmin === true ||
      localStorage.getItem('isHospital') === 'true'
    );
    console.log('🏥 Is hospital?', isHospital);
    return isHospital;
  },
  
  // Get user role
  getUserRole: () => {
    const user = authService.getCurrentUser();
    const role = user ? (user.role || user.userType) : null;
    console.log('🎭 User role:', role);
    return role;
  },
  
  // Logout user
  logout: () => {
    const user = authService.getCurrentUser();
    console.log('👋 Logging out user:', user?.email);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isHospital');
    
    return { success: true };
  },
  
  // Debug function to check auth status
  debugAuth: () => {
    console.group('🔍 AUTH DEBUG');
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));
    console.log('isAdmin flag:', localStorage.getItem('isAdmin'));
    console.log('isHospital flag:', localStorage.getItem('isHospital'));
    
    const user = authService.getCurrentUser();
    console.log('Parsed user:', user);
    console.log('User role:', user?.role);
    console.log('User type:', user?.userType);
    console.groupEnd();
    
    return {
      hasToken: !!localStorage.getItem('token'),
      user: user,
      isAdmin: authService.isAdmin(),
      isHospital: authService.isHospital(),
      role: authService.getUserRole()
    };
  }
};

export default authService;