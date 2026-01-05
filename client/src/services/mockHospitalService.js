// services/mockHospitalService.js

export const mockHospitals = [
  {
    _id: 'HOS001',
    name: 'City General Hospital',
    address: '123 Medical Street, New Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    contact: '+91 9876543210',
    email: 'citygeneral@lifelink.com',
    totalBeds: 60,
    availableBeds: 15,
    totalIcuBeds: 12,
    availableIcuBeds: 4,
    totalOxygenCylinders: 30,
    availableOxygenCylinders: 10,
    bloodBank: {
      'O+': 25,
      'O-': 10,
      'A+': 20,
      'A-': 8,
      'B+': 18,
      'B-': 7,
      'AB+': 12,
      'AB-': 5
    },
    ambulances: 5,
    emergencyContact: '108',
    specialties: ['Emergency', 'Cardiology', 'Neurology', 'Trauma'],
    rating: 4.5,
    distance: '2.5 km'
  },
  {
    _id: 'HOS002',
    name: 'Medicare Center',
    address: '456 Health Avenue, Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    contact: '+91 9876543211',
    email: 'medicare@lifelink.com',
    totalBeds: 45,
    availableBeds: 8,
    totalIcuBeds: 8,
    availableIcuBeds: 2,
    totalOxygenCylinders: 25,
    availableOxygenCylinders: 5,
    bloodBank: {
      'O+': 20,
      'O-': 8,
      'A+': 15,
      'A-': 6,
      'B+': 12,
      'B-': 5,
      'AB+': 8,
      'AB-': 3
    },
    ambulances: 3,
    emergencyContact: '108',
    specialties: ['Pediatrics', 'Orthopedics', 'General Surgery'],
    rating: 4.2,
    distance: '4.1 km'
  },
  {
    _id: 'HOS003',
    name: 'Sunrise Medical',
    address: '789 Care Road, Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
    contact: '+91 9876543212',
    email: 'sunrise@lifelink.com',
    totalBeds: 80,
    availableBeds: 25,
    totalIcuBeds: 15,
    availableIcuBeds: 6,
    totalOxygenCylinders: 40,
    availableOxygenCylinders: 15,
    bloodBank: {
      'O+': 30,
      'O-': 12,
      'A+': 25,
      'A-': 10,
      'B+': 22,
      'B-': 9,
      'AB+': 15,
      'AB-': 7
    },
    ambulances: 7,
    emergencyContact: '108',
    specialties: ['Oncology', 'Cardiology', 'Nephrology', 'ICU'],
    rating: 4.7,
    distance: '3.2 km'
  }
];

// Mock API calls
export const mockHospitalService = {
  // Get all hospitals
  getHospitals: async () => {
    console.log('🏥 Mock: Fetching hospitals');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockHospitals });
      }, 500);
    });
  },

  // Get hospital by ID
  getHospitalById: async (id) => {
    console.log(`🏥 Mock: Fetching hospital ${id}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const hospital = mockHospitals.find(h => h._id === id);
        if (hospital) {
          resolve({ data: hospital });
        } else {
          reject(new Error('Hospital not found'));
        }
      }, 500);
    });
  },

  // Update hospital resources
  updateHospitalResources: async (id, resources) => {
    console.log(`🏥 Mock: Updating hospital ${id} resources`, resources);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: 'Resources updated successfully',
          data: resources
        });
      }, 500);
    });
  },

  // Get emergencies for hospital
  getEmergencies: async (hospitalId) => {
    console.log(`🚨 Mock: Fetching emergencies for hospital ${hospitalId}`);
    const mockEmergencies = [
      {
        id: 1,
        type: 'Accident',
        patientName: 'Rajesh Kumar',
        age: 35,
        bloodGroup: 'O+',
        location: '5 km away',
        status: 'active',
        time: '15 mins ago',
        priority: 'high',
        assignedAmbulance: 'AMB-101',
        eta: '5 minutes'
      },
      {
        id: 2,
        type: 'Heart Attack',
        patientName: 'Priya Sharma',
        age: 52,
        bloodGroup: 'A+',
        location: '3 km away',
        status: 'active',
        time: '25 mins ago',
        priority: 'critical',
        assignedAmbulance: 'AMB-205',
        eta: '3 minutes'
      }
    ];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockEmergencies });
      }, 500);
    });
  }
};

export default mockHospitalService;