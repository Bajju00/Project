export const defaultUser = {
  id: 'demo-user',
  fullName: 'LifeLink User',
  email: 'demo@lifelink.local',
  bloodGroup: 'O+',
  role: 'user'
};

export const demoHospitals = [
  {
    _id: '1',
    name: 'City General Hospital',
    address: '123 Medical Street, New Delhi',
    contact: { phone: '+91 98765 43210' },
    facilities: {
      availableBeds: 15,
      availableIcuBeds: 5,
      availableOxygenCylinders: 25
    },
    location: { coordinates: [77.209, 28.6139] },
    distance: '2.3 km',
    rating: 4.5
  },
  {
    _id: '2',
    name: 'Medicare Center',
    address: '456 Health Avenue, Mumbai',
    contact: { phone: '+91 98765 43211' },
    facilities: {
      availableBeds: 8,
      availableIcuBeds: 2,
      availableOxygenCylinders: 15
    },
    location: { coordinates: [77.24, 28.62] },
    distance: '3.1 km',
    rating: 4.2
  },
  {
    _id: '3',
    name: 'Sunrise Medical',
    address: '789 Health Road, Bangalore',
    contact: { phone: '+91 98765 43212' },
    facilities: {
      availableBeds: 12,
      availableIcuBeds: 3,
      availableOxygenCylinders: 20
    },
    location: { coordinates: [77.18, 28.59] },
    distance: '4.5 km',
    rating: 4.7
  },
  {
    _id: '4',
    name: 'Apollo Hospital',
    address: '101 Health Complex, Chennai',
    contact: { phone: '+91 98765 43213' },
    facilities: {
      availableBeds: 25,
      availableIcuBeds: 8,
      availableOxygenCylinders: 35
    },
    location: { coordinates: [77.26, 28.65] },
    distance: '5.2 km',
    rating: 4.8
  },
  {
    _id: '5',
    name: 'Fortis Hospital',
    address: '202 Medical Park, Kolkata',
    contact: { phone: '+91 98765 43214' },
    facilities: {
      availableBeds: 18,
      availableIcuBeds: 4,
      availableOxygenCylinders: 22
    },
    location: { coordinates: [77.16, 28.64] },
    distance: '1.8 km',
    rating: 4.6
  },
  {
    _id: '6',
    name: 'AIIMS Hospital',
    address: '303 Government Road, Delhi',
    contact: { phone: '+91 98765 43215' },
    facilities: {
      availableBeds: 45,
      availableIcuBeds: 12,
      availableOxygenCylinders: 50
    },
    location: { coordinates: [77.21, 28.57] },
    distance: '6.3 km',
    rating: 4.9
  }
];

export const getStoredHospitals = () => {
  try {
    const storedHospitals = JSON.parse(localStorage.getItem('lifelinkHospitals') || '[]');
    return [...storedHospitals, ...demoHospitals];
  } catch {
    return demoHospitals;
  }
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('lifelinkUser') || 'null') || defaultUser;
  } catch {
    return defaultUser;
  }
};
