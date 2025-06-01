import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import StudentDashboard from "./components/StudentDashboard";
import SearchTutoring from "./components/SearchTutoring";
import StudentHistory from "./components/StudentHistory";
import StudentActiveTutoringList from "./components/StudentActiveTutoringList";
import TutoringDetails from "./components/TutoringDetails";
import TeacherView from "./components/TeacherView";
import TeacherDashboard from "./components/TeacherDashboard";
import TeacherProfile from "./components/TeacherProfile";
import StudentProfile from "./components/StudentProfile";
import TeacherMediaLibrary from "./components/TeacherMediaLibrary";
import TeacherTutorships from "./components/TeacherTutorships";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import PrivateLayout from "./components/PrivateLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />      {/* Redirección raíz basada en rol */}
      <Route
        path="/"
        element={<RoleRoute redirectOnly={true} />}
      />

      {/* Redirección de dashboard basada en rol */}
      <Route
        path="/dashboard"
        element={<RoleRoute redirectOnly={true} />}
      />      {/* Rutas específicas para estudiantes */}
      <Route
        path="/student"
        element={
          <RoleRoute allowedRoles={['student']}>
            <PrivateLayout>
              <StudentDashboard />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <RoleRoute allowedRoles={['student']}>
            <PrivateLayout>
              <StudentDashboard />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <RoleRoute allowedRoles={['student']}>
            <PrivateLayout>
              <StudentProfile />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/student/profile/:id"
        element={
          <RoleRoute allowedRoles={['student', 'teacher']}>
            <PrivateLayout>
              <StudentProfile />
            </PrivateLayout>
          </RoleRoute>
        }
      />
      
      <Route
        path="/student/history"
        element={
          <RoleRoute allowedRoles={['student']}>
            <PrivateLayout>
              <StudentHistory />
            </PrivateLayout>
          </RoleRoute>
        }
      />
      
      <Route
        path="/student/tutoring"
        element={
          <RoleRoute allowedRoles={['student']}>
            <PrivateLayout>
              <StudentActiveTutoringList />
            </PrivateLayout>
          </RoleRoute>
        }
      />
      
      <Route
        path="/student/tutoring-details"
        element={
          <RoleRoute allowedRoles={['student']}>
            <PrivateLayout>
              <TutoringDetails />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      {/* Rutas específicas para profesores */}
      <Route
        path="/teacher"
        element={
          <RoleRoute allowedRoles={['teacher']}>
            <PrivateLayout>
              <TeacherDashboard />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/teacher/dashboard"
        element={
          <RoleRoute allowedRoles={['teacher']}>
            <PrivateLayout>
              <TeacherDashboard />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/teacher/profile"
        element={
          <RoleRoute allowedRoles={['teacher']}>
            <PrivateLayout>
              <TeacherProfile />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/teacher/profile/:id"
        element={
          <RoleRoute allowedRoles={['teacher', 'student']}>
            <PrivateLayout>
              <TeacherProfile />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/teacher/tutoring"
        element={
          <RoleRoute allowedRoles={['teacher']}>
            <PrivateLayout>
              <TeacherTutorships />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/teacher/media"
        element={
          <RoleRoute allowedRoles={['teacher']}>
            <PrivateLayout>
              <TeacherMediaLibrary />
            </PrivateLayout>
          </RoleRoute>
        }
      />
      
      <Route
        path="/teacher/view/:id"
        element={
          <RoleRoute allowedRoles={['teacher']}>
            <PrivateLayout>
              <TeacherView />
            </PrivateLayout>
          </RoleRoute>
        }
      />

      {/* Rutas compartidas (accesibles por ambos roles) */}
      <Route
        path="/search"
        element={
          <RoleRoute allowedRoles={['student', 'teacher']}>
            <PrivateLayout>
              <SearchTutoring />
            </PrivateLayout>
          </RoleRoute>
        }
      />      {/* Rutas legacy - redirigir a las nuevas rutas */}
      <Route
        path="/studenthistory"
        element={<Navigate to="/student/history" replace />}
      />
      
      <Route
        path="/studentactivetutoringlist"
        element={<Navigate to="/student/tutoring" replace />}
      />

      <Route
        path="/student/active-tutoring"
        element={<Navigate to="/student/tutoring" replace />}
      />
      
      <Route
        path="/tutoringdetails"
        element={<Navigate to="/student/tutoring-details" replace />}
      />
      
      <Route
        path="/teacherview/:id"
        element={<Navigate to="/teacher/view/:id" replace />}
      />

      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
