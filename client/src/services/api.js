const API_BASE_URL = 'http://localhost:5000/api';

// Helper to construct headers with JWT auth token
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('lifelinkToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch wrapper to handle errors
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();
  
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error.message);
    throw error;
  }
};

export const api = {
  // 1. Auth Services
  auth: {
    login: async (credentials) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      // Save local context
      if (data.token) {
        localStorage.setItem('lifelinkToken', data.token);
        localStorage.setItem('lifelinkUser', JSON.stringify(data));
      }
      return data;
    },
    registerUser: async (userData) => {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (data.token) {
        localStorage.setItem('lifelinkToken', data.token);
        localStorage.setItem('lifelinkUser', JSON.stringify(data));
      }
      return data;
    },
    registerHospital: async (hospitalData) => {
      const data = await request('/auth/register-hospital', {
        method: 'POST',
        body: JSON.stringify(hospitalData)
      });
      if (data.token) {
        localStorage.setItem('lifelinkToken', data.token);
        localStorage.setItem('lifelinkUser', JSON.stringify(data));
      }
      return data;
    },
    getProfile: async () => {
      return await request('/auth/profile');
    },
    updateProfile: async (profileData) => {
      const data = await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      if (data.token) {
        localStorage.setItem('lifelinkUser', JSON.stringify(data));
      }
      return data;
    },
    logout: () => {
      localStorage.removeItem('lifelinkToken');
      localStorage.removeItem('lifelinkUser');
    }
  },

  // 2. Hospital Services
  hospitals: {
    getAll: async () => {
      return await request('/hospitals');
    },
    getStats: async () => {
      return await request('/hospitals/stats');
    },
    updateResources: async (resourceData) => {
      return await request('/hospitals/resources', {
        method: 'PUT',
        body: JSON.stringify(resourceData)
      });
    }
  },

  // 3. Ambulance Services
  ambulances: {
    getAll: async () => {
      return await request('/ambulances');
    },
    registerAmbulance: async (ambulanceData) => {
      return await request('/ambulances', {
        method: 'POST',
        body: JSON.stringify(ambulanceData)
      });
    },
    bookAmbulance: async (bookingData) => {
      return await request('/ambulances/book', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
    },
    getBookings: async () => {
      return await request('/ambulances/bookings');
    },
    resolveBooking: async (bookingId) => {
      return await request(`/ambulances/bookings/${bookingId}/resolve`, {
        method: 'PUT'
      });
    }
  },

  // 4. Blood Donor Services
  donors: {
    getAll: async () => {
      return await request('/donors');
    },
    registerDonor: async (donorData) => {
      return await request('/donors', {
        method: 'POST',
        body: JSON.stringify(donorData)
      });
    },
    getBloodStocks: async () => {
      return await request('/donors/blood-stocks');
    },
    updateBloodStocks: async (stockData) => {
      return await request('/donors/blood-stocks', {
        method: 'PUT',
        body: JSON.stringify(stockData)
      });
    }
  },

  // 5. Emergency SOS Services
  emergencies: {
    triggerSOS: async (sosData) => {
      return await request('/emergencies', {
        method: 'POST',
        body: JSON.stringify(sosData)
      });
    }
  }
};
