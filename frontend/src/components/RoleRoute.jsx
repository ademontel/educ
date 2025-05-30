import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * Componente unificado para manejar rutas basadas en roles
 * Puede funcionar como protector de rutas O como redirector automático
 * 
 * @param {React.ReactNode} children - Contenido a renderizar si está autorizado
 * @param {string[]} allowedRoles - Roles permitidos para acceder a esta ruta
 * @param {string} redirectTo - URL personalizada de redirección (opcional)
 * @param {boolean} redirectOnly - Si es true, solo redirige sin renderizar contenido
 */
const RoleRoute = ({ 
  children = null, 
  allowedRoles = [], 
  redirectTo = null,
  redirectOnly = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Función para obtener la ruta según el rol del usuario
  const getRoleBasedRoute = (userRole) => {
    switch (userRole) {
      case 'student':
      case 'alumno':
        return '/student';
      case 'teacher':
      case 'docente':
        return '/teacher';
      case 'admin':
        return '/admin';
      case 'moderador':
      case 'mod':
        return '/moderator';
      default:
        return '/login';
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !user.role) {
    console.error('Usuario sin rol definido:', user);
    return <Navigate to="/login" replace />;
  }

  // Modo: Solo redirección automática (caso de RoleBasedRedirect)
  if (redirectOnly || (allowedRoles.length === 0 && !children)) {
    return <Navigate to={getRoleBasedRoute(user.role)} replace />;
  }

  // Modo: Protección de ruta (caso de RoleProtectedRoute)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Si se especifica una redirección personalizada, usarla
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Redirección automática basada en el rol del usuario
    return <Navigate to={getRoleBasedRoute(user.role)} replace />;
  }

  // Si no hay children, redirigir automáticamente
  if (!children) {
    return <Navigate to={getRoleBasedRoute(user.role)} replace />;
  }

  return children;
};

export default RoleRoute;
