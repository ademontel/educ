import React, { createContext, useContext, useState } from 'react';

const TeacherContext = createContext();

const API_URL = 'http://localhost:8000';

export const TeacherProvider = ({ children }) => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener lista de profesores
  const getTeachers = async (skip = 0, limit = 100) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/teachers?skip=${skip}&limit=${limit}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener profesores');
      }

      const data = await response.json();
      setTeachers(data);
      return data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener lista de materias
  const getSubjects = async (skip = 0, limit = 100) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/subjects?skip=${skip}&limit=${limit}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener materias');
      }

      const data = await response.json();
      setSubjects(data);
      return data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener información de un profesor específico
  const getTeacher = async (teacherId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/${teacherId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener información del profesor');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar profesores por criterios
  const searchTeachers = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de búsqueda si existen
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const response = await fetch(`${API_URL}/teachers?${queryParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al buscar profesores');
      }

      const data = await response.json();
      setTeachers(data);
      return data;
    } catch (error) {
      console.error('Error searching teachers:', error);
      setError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TeacherContext.Provider value={{
      teachers,
      subjects,
      isLoading,
      error,
      getTeachers,
      getSubjects,
      getTeacher,
      searchTeachers,
      setError
    }}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
};
