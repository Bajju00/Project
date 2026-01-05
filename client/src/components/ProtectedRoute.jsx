import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user doesn't have required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    
    // Special case: if user is admin trying to access user route, redirect to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;