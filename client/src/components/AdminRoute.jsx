import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = () => {
      setIsLoading(true);
      
      // Check for user data
      const user = authService.getCurrentUser();
      const token = localStorage.getItem('token');
      
      // If no user data or token, redirect to login
      if (!user || !token) {
        toast.error('Please login to access admin panel');
        authService.logout();
        navigate('/login');
        return;
      }
      
      // Verify the user has admin role
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        
        // Redirect based on user role
        const redirectPaths = {
          'user': '/dashboard',
          'hospital': '/hospital/dashboard',
          'ambulance': '/ambulance/dashboard',
          'driver': '/driver/dashboard',
          'donor': '/donor/dashboard',
          'doctor': '/doctor/dashboard'
        };
        
        navigate(redirectPaths[user.role] || '/login');
        return;
      }
      
      // If we get here, user is admin
      setIsAuthorized(true);
      setIsLoading(false);
    };
    
    checkAdminAccess();
  }, [navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render anything
  if (!isAuthorized) {
    return null;
  }

  // Render the protected component
  return children;
};

export default AdminRoute;