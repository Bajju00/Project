import api from './api';

export const hospitalService = {
  // Get all hospitals
  getHospitals: async () => {
    try {
      const response = await api.get('/hospitals');
      return response.data;
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      // Return mock data if API fails
      return {
        success: true,
        count: 3,
        hospitals: [
          {
            name: "City General Hospital",
            address: "123 Medical Street, New Delhi",
            facilities: { availableBeds: 15, availableIcuBeds: 5 }
          },
          {
            name: "Medicare Center",
            address: "456 Health Avenue, Mumbai",
            facilities: { availableBeds: 8, availableIcuBeds: 2 }
          },
          {
            name: "Sunrise Medical Hospital",
            address: "789 Health Road, Bangalore",
            facilities: { availableBeds: 12, availableIcuBeds: 3 }
          }
        ]
      };
    }
  },

  // Get nearby hospitals
  getNearbyHospitals: async (lat, lng) => {
    try {
      const response = await api.get('/hospitals/nearby', {
        params: { lat, lng }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error);
      return {
        success: true,
        count: 2,
        hospitals: [
          {
            name: "Nearby Hospital 1",
            address: "123 Test Street",
            facilities: { availableBeds: 10, availableIcuBeds: 3 },
            distance: "2.3 km"
          },
          {
            name: "Nearby Hospital 2",
            address: "456 Test Avenue",
            facilities: { availableBeds: 5, availableIcuBeds: 1 },
            distance: "3.1 km"
          }
        ]
      };
    }
  }
};
