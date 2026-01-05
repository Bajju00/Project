// src/services/adminService.js - UPDATED
import api from './api';

export const adminService = {
  // Verify admin status
  verifyAdmin: async () => {
    const response = await api.get('/admin/verify');
    return response.data;
  },

  // Get system statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all hospitals (admin view)
  getHospitals: async () => {
    const response = await api.get('/admin/hospitals');
    return response.data;
  },

  // Get all emergencies
  getEmergencies: async () => {
    const response = await api.get('/admin/emergencies');
    return response.data;
  },

  // Get all users
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Add new hospital
  addHospital: async (hospitalData) => {
    const response = await api.post('/admin/hospitals', hospitalData);
    return response.data;
  },

  // Update hospital
  updateHospital: async (hospitalId, updates) => {
    const response = await api.put(`/admin/hospitals/${hospitalId}`, updates);
    return response.data;
  },

  // Delete hospital
  deleteHospital: async (hospitalId) => {
    const response = await api.delete(`/admin/hospitals/${hospitalId}`);
    return response.data;
  },

  // Update emergency status
  updateEmergency: async (emergencyId, updates) => {
    const response = await api.put(`/admin/emergencies/${emergencyId}`, updates);
    return response.data;
  },

  // Get blood bank data
  getBloodBank: async () => {
    const response = await api.get('/admin/blood-bank');
    return response.data;
  },

  // Get ambulance data
  getAmbulances: async () => {
    const response = await api.get('/admin/ambulances');
    return response.data;
  }
};