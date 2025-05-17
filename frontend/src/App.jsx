import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import UserList from './components/UserList';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import SearchTutoring from './components/SearchTutoring';
import Register from './components/Register';
import { useAuth } from './context/AuthContext.jsx';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Navigate to="/users" replace /></ProtectedRoute>}/>
        <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>}/>
        <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}/>
        <Route path="/search" element={<ProtectedRoute><SearchTutoring /></ProtectedRoute>}/>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
