import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Newlogin from './components/Newlogin';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Hospitals from './pages/Hospitals';
import Ambulance from './pages/Ambulance';
import BloodDonors from './pages/BloodDonors';
import EmergencySOS from './pages/EmergencySOS';
import HospitalRegister from './pages/HospitalRegister';
import HospitalDashboard from './pages/HospitalDashboard';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 4000,
            },
          }}
        />
        
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/ambulance" element={<Ambulance />} />
              <Route path="/blood-donors" element={<BloodDonors />} />
              <Route path="/emergency" element={<EmergencySOS />} />
              <Route path="/hospital/register" element={<HospitalRegister />} />
              <Route path="/admin/dashboard" element={<HospitalDashboard />} />
              {/* <Route path="/login" element={<Navigate to="/login" />} /> */}
              <Route path="/register" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin/login" element={<Navigate to="/hospital/register" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path='/login' element={<Login/>} />
              <Route path='/newlogin' element={<Newlogin/>}/>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
