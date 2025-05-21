import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import SearchTutoring from './components/SearchTutoring';
import TeacherView from './components/TeacherView';
import Register from './components/Register';
import NotFound from './components/NotFound';
import PrivateLayout from './components/PrivateLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';


function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Redirección raíz */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas con Navbar */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <StudentDashboard />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/*"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <StudentDashboard />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <SearchTutoring />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacherview/:id"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <TeacherView />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />

      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
