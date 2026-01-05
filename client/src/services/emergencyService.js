// src/services/emergencyService.js - New file
import api from './api';

export const emergencyService = {
  // Send emergency SOS
  sendSOS: async (emergencyData) => {
    const response = await api.post('/emergency/sos', emergencyData);
    return response.data;
  },

  // Get emergency status
  getEmergencyStatus: async (emergencyId) => {
    const response = await api.get(`/emergency/${emergencyId}`);
    return response.data;
  },

  // Cancel emergency
  cancelEmergency: async (emergencyId) => {
    const response = await api.delete(`/emergency/${emergencyId}`);
    return response.data;
  }
};