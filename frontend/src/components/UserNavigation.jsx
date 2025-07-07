import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isStudent = user?.role === 'student' || user?.role === 'alumno';
  const isTeacher = user?.role === 'teacher' || user?.role === 'docente';

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : '';
  };

  if (isStudent) {
    return (
      <nav className="bg-gray-800 border-b border-gray-700 mb-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-4">
            <Link
              to="/student"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/student')}`}
            >
              🏠 Dashboard
            </Link>
            <Link
              to="/student/profile"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/student/profile')}`}
            >
              👤 Mi Perfil
            </Link>
            <Link
              to="/student/tutoring"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/student/tutoring')}`}
            >
              📚 Mis Tutorías
            </Link>
            <Link
              to="/search"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/search')}`}
            >
              🔍 Buscar
            </Link>
            <Link
              to="/student/history"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/student/history')}`}
            >
              📋 Historial
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  if (isTeacher) {
    return (
      <nav className="bg-gray-800 border-b border-gray-700 mb-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-4">
            <Link
              to="/teacher"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/teacher')}`}
            >
              🏠 Dashboard
            </Link>
            <Link
              to="/teacher/profile"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/teacher/profile')}`}
            >
              👤 Mi Perfil
            </Link>
            <Link
              to="/teacher/tutoring"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/teacher/tutoring')}`}
            >
              🎓 Mis Tutorías
            </Link>
            <Link
              to="/teacher/availability"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/teacher/availability')}`}
            >
              📅 Disponibilidad
            </Link>
            <Link
              to="/teacher/calendar"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/teacher/calendar')}`}
            >
              �️ Calendario
            </Link>
            <Link
              to="/teacher/subjects"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/teacher/subjects')}`}
            >
              📚 Materias
            </Link>
            <Link
              to="/teacher/media"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/teacher/media')}`}
            >
              📁 Biblioteca
            </Link>
            <Link
              to="/search"
              className={`flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap ${isActive('/search')}`}
            >
              🔍 Buscar
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return null;
};

export default UserNavigation;
