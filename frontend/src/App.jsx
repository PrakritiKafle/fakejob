import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Verify from "./pages/Verify.jsx"; // 1. Added the Verify import
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* 2. Added the Verify Route */}
      <Route path="/verify" element={<Verify />} />

      {/* Protected Route (User must be logged in to see Dashboard) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Redirect root "/" to login by default */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;