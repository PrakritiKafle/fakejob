import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Read the key you just set in Login.jsx
  const isAuth = localStorage.getItem("isAuthenticated");

  // If the key is missing or not "true", send them back to login
  if (!isAuth || isAuth !== "true") {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, let them into the Dashboard
  return children;
};

export default ProtectedRoute;