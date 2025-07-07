import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';

const TeacherProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { getUserProfile } = useUserContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Si no hay ID, mostramos el perfil del usuario actual
  const isOwnProfile = !id || parseInt(id) === user?.id;
  const targetUserId = isOwnProfile ? user?.id : parseInt(id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getUserProfile(targetUserId);
        
        if (result.error) {
          setError(result.error);
        } else {
          setProfileData(result.user);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId, getUserProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isOwnProfile ? 'Mi Perfil' : `Perfil de ${profileData?.name}`}
          </h1>
          {isOwnProfile && (
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Editar Perfil
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <p className="text-lg text-gray-900">{profileData?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-lg text-gray-900">{profileData?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {profileData?.role === 'teacher' ? 'Profesor' : profileData?.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidades
              </label>
              <p className="text-gray-600">
                {/* Aquí puedes agregar especialidades cuando estén en el modelo */}
                Información próximamente disponible
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experiencia
              </label>
              <p className="text-gray-600">
                {/* Aquí puedes agregar experiencia cuando esté en el modelo */}
                Información próximamente disponible
              </p>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Estadísticas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-blue-800">Tutorías Completadas</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-green-800">Estudiantes Atendidos</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-purple-800">Calificación Promedio</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherProfile;
