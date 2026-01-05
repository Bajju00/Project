import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Route Guards
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Hospitals from './pages/Hospitals';
import Ambulance from './pages/Ambulance';
import BloodDonors from './pages/BloodDonors';
import EmergencySOS from './pages/EmergencySOS';
import HospitalRegister from './pages/HospitalRegister';

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
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute allowedRoles={['user', 'donor', 'driver', 'doctor']}>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute allowedRoles={['user', 'donor', 'driver', 'doctor', 'hospital']}>
                  <Profile />
                </PrivateRoute>
              } />
              
              <Route path="/hospitals" element={
                <PrivateRoute>
                  <Hospitals />
                </PrivateRoute>
              } />
              
              <Route path="/ambulance" element={
                <PrivateRoute>
                  <Ambulance />
                </PrivateRoute>
              } />
              
              <Route path="/blood-donors" element={
                <PrivateRoute>
                  <BloodDonors />
                </PrivateRoute>
              } />
              
              <Route path="/emergency" element={
                <PrivateRoute>
                  <EmergencySOS />
                </PrivateRoute>
              } />
              
              {/* Hospital/Admin Routes */}
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/hospital/register" element={<HospitalRegister />} />
<Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;