# LifeLink - Emergency Healthcare Locator

A real-time emergency healthcare management system that connects users with nearby hospitals, ambulances, and blood donors during medical emergencies.

## 🚑 Features

### Core Functionality
- **Emergency SOS System**: One-click emergency alert that notifies nearby hospitals
- **Hospital Directory**: Find and filter hospitals by availability (beds, ICU, oxygen)
- **Real-time Availability**: View live hospital bed, ICU, and oxygen cylinder availability
- **Geolocation Services**: Locate nearest hospitals based on GPS coordinates
- **Hospital Management Dashboard**: Admin panel for managing hospital information and resources

### User Roles
- **Regular Users**: Can search hospitals, request ambulances, and trigger emergency SOS
- **Hospital Staff**: Manage hospital resources, bed availability, and emergency requests
- **System Admin**: Oversee all hospitals and manage system-wide settings
- **Blood Donors**: Register as blood donors and manage donation records
- **Doctors**: Access patient emergency records and medical history

### Security
- JWT-based authentication with role-based access control
- Password hashing with bcryptjs
- Protected API endpoints with middleware authentication
- Token refresh and session management

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **React Router DOM 6.8.1** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React-Leaflet 4.2.1** - Interactive maps
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js + Express.js** - Server framework
- **MongoDB + Mongoose** - NoSQL database
- **JWT (jsonwebtoken)** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin request handling
- **Morgan** - HTTP request logging

## 📁 Project Structure

```
life-link/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # Auth context
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                # Express backend
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Hospital.js
│   │   ├── Emergency.js
│   │   ├── Ambulance.js
│   │   └── BloodRequest.js
│   ├── routes/           # API route handlers
│   ├── middleware/       # Auth and validation middleware
│   ├── config/           # Configuration files
│   ├── server.js         # Main server file
│   ├── seed-data.js      # Database seeding script
│   └── package.json
│
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd life-link
   ```

2. **Setup Environment Variables**

   **Server (.env)**
   ```bash
   cd server
   cat > .env << EOF
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/lifelink
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   EOF
   ```

   **Client (.env)**
   ```bash
   cd ../client
   cat > .env << EOF
   VITE_API_URL=http://localhost:5000/api
   EOF
   ```

3. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Initialize Database**
   ```bash
   cd server
   node -e "const http = require('http'); const options = {hostname: 'localhost', port: 5000, path: '/api/test/init', method: 'POST', headers: {'Content-Type': 'application/json'}}; const req = http.request(options, (res) => {let data=''; res.on('data', d => data+=d); res.on('end', () => console.log(JSON.parse(data)))}); req.write('{}'); req.end();"
   ```

## 🏃 Running the Project

### Start the Backend Server
```bash
cd server
npm run dev        # Development with nodemon
# OR
npm start          # Production
```

Server will run on: `http://localhost:5000`

### Start the Frontend Dev Server
```bash
cd client
npm run dev
```

Frontend will run on: `http://localhost:3000`

## 🔐 Test Credentials

### System Admin
- **Email**: `admin@lifelink.com`
- **Password**: `admin123`

### Hospital Staff
- **City General Hospital**
  - Email: `citygeneral@lifelink.com`
  - Password: `hospital123`

- **Medicare Center**
  - Email: `medicare@lifelink.com`
  - Password: `hospital123`

- **Sunrise Medical**
  - Email: `sunrise@lifelink.com`
  - Password: `hospital123`

### Regular Users
- **Email**: `user@example.com`
- **Password**: `user123`

- **Blood Donor**
  - Email: `donor@example.com`
  - Password: `user123`

- **Doctor**
  - Email: `doctor@example.com`
  - Password: `user123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Hospitals
- `GET /api/hospitals` - List all hospitals with availability
- `GET /api/hospitals/nearby` - Find nearby hospitals by coordinates
- `POST /api/hospitals` - Create new hospital (admin/hospital staff)
- `PUT /api/hospitals/:id` - Update hospital (hospital staff)

### Emergency
- `POST /api/emergency/sos` - Send emergency SOS
- `GET /api/emergency` - Get emergency requests

### Ambulances
- `GET /api/ambulances` - List available ambulances
- `POST /api/ambulances/request` - Request ambulance

### Blood Requests
- `GET /api/blood` - List blood requests
- `POST /api/blood/request` - Create blood request

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/check-admin` - Check admin status

## 🗄️ Database Models

### User Schema
```javascript
{
  fullName, email, mobile, password,
  role: 'user|hospital|admin|donor|doctor',
  isBloodDonor, isVerified,
  hospitalId (for hospital staff)
}
```

### Hospital Schema
```javascript
{
  name, address: { fullAddress, city, state },
  location: { type: Point, coordinates: [lng, lat] },
  facilities: {
    totalBeds, availableBeds,
    icuBeds, availableIcuBeds,
    oxygenCylinders, availableOxygenCylinders
  },
  specialties: [String],
  contact: { phone, email },
  admin (reference to User),
  status: 'active|inactive'
}
```

### Emergency Schema
```javascript
{
  userId, location: { type: Point, coordinates },
  emergencyType, description,
  status: 'pending|responded|resolved',
  assignedHospital, createdAt
}
```

## 🔒 Authentication Flow

1. User submits login credentials
2. Server validates credentials against MongoDB
3. Server generates JWT token with user ID and role
4. Client stores token in localStorage and user object
5. Subsequent requests include token in Authorization header
6. Middleware verifies token and extracts user information
7. Route handler checks user role for authorization

## 🛣️ Frontend Routes

- `/` - Home page with hospital search
- `/login` - User login
- `/register` - User registration
- `/hospitals` - Hospital directory with map
- `/ambulance` - Ambulance request
- `/blood-donors` - Blood donor search
- `/emergency-sos` - Emergency SOS page
- `/admin/login` - Admin/hospital staff login
- `/admin/dashboard` - Admin dashboard
- `/profile` - User profile page

## 🧪 Testing

### Quick Test Workflow
1. Navigate to http://localhost:3000
2. Click "Hospital Login" 
3. Use hospital staff credentials (e.g., `citygeneral@lifelink.com` / `hospital123`)
4. View hospital dashboard with resource management
5. Or login as admin to manage all hospitals

### Testing Emergency SOS
1. Login as regular user
2. Click "Emergency SOS" button on home page
3. Allow geolocation access
4. Check backend logs for emergency creation

## 📝 API Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lifelink.com",
    "password": "admin123"
  }'
```

### Get Hospitals
```bash
curl http://localhost:5000/api/hospitals
```

### Find Nearby Hospitals
```bash
curl "http://localhost:5000/api/hospitals/nearby?lat=28.6139&lng=77.2099&maxDistance=50000"
```

## 🚨 Error Handling

The application includes comprehensive error handling:
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Validation Errors**: 400 Bad Request
- **Server Errors**: 500 Internal Server Error

All errors return JSON with `success`, `error`, and `message` fields.

## 📚 Key Features Explained

### Hospital Availability System
Hospitals track three resource types:
- **Beds**: General admission beds
- **ICU Beds**: Intensive care unit beds
- **Oxygen Cylinders**: Supplemental oxygen supplies

Users can filter hospitals by minimum bed count or resource availability.

### Geolocation Integration
- Uses browser Geolocation API for GPS coordinates
- Calculates distance to nearby hospitals
- Sends location with emergency SOS requests
- Displays hospitals on interactive Leaflet map

### Role-Based Access Control
Routes are protected by role verification middleware:
- `PrivateRoute` - Requires any authenticated user
- `AdminRoute` - Requires admin or hospital staff role
- `ProtectedRoute` - Custom role-based protection

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify connection string in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure network connectivity

### Port Already in Use
```bash
# Find and kill process on port 5000
netstat -ano | findstr ":5000"
taskkill /PID <PID> /F
```

### CORS Errors
- Check `VITE_API_URL` in client `.env`
- Verify CORS middleware is enabled in server
- Ensure frontend and backend are running on correct ports

### Login Not Working
- Check credentials against test users
- Verify MongoDB contains user records
- Check browser console for token storage issues
- Verify JWT_SECRET in server `.env`

## 📦 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy 'dist' folder to Vercel
```

### Backend (Heroku/Railway)
```bash
cd server
npm install
# Set environment variables in hosting platform
# Deploy repository
```

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time notifications (Socket.io)
- [ ] Video consultations with doctors
- [ ] Prescription management system
- [ ] Insurance integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

**Last Updated**: January 6, 2026  
**Version**: 1.0.0
