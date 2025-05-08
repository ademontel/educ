import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      const users = await response.json();
      
      const user = users.find(u => 
        u.name === credentials.username && 
        u.password === credentials.password
      );

      if (user) {
        setIsAuthenticated(true);
        setUserRole('user');
        return true;
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        return false;
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      setIsAuthenticated(false);
      setUserRole(null);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};