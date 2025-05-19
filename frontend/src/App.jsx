import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import SearchTutoring from './components/SearchTutoring';
import TeacherView from './components/TeacherView';
import Register from './components/Register';
import NotFound from './components/NotFound';
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
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute><Navigate to="/login" replace /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchTutoring /></ProtectedRoute>} />
      <Route path="/teacherview/:id" element={<ProtectedRoute><TeacherView /></ProtectedRoute>} />
      
      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
