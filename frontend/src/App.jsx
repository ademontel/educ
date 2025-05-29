import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import StudentDashboard from "./components/StudentDashboard";
import SearchTutoring from "./components/SearchTutoring";
import StudentHistory from "./components/StudentHistory";
import StudentActiveTutoringList from "./components/StudentActiveTutoringList";
import TutoringDetails from "./components/TutoringDetails";
import TeacherView from "./components/TeacherView";
import TeacherDashboard from "./components/TeacherDashboard";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import PrivateLayout from "./components/PrivateLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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

      <Route
        path="/studenthistory"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <StudentHistory />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/studentactivetutoringlist"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <StudentActiveTutoringList />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tutoringdetails"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <TutoringDetails />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <TeacherDashboard />
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
