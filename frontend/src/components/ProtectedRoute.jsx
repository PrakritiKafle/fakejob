import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Read user_data to verify authentication
  const userData = localStorage.getItem("user_data");

  // If user_data is missing, send them back to login
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, let them into the Dashboard
  return children;
};

export default ProtectedRoute;