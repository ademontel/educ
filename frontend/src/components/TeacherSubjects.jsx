import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

function TeacherSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [isAddingSubjects, setIsAddingSubjects] = useState(false);

  useEffect(() => {
    loadSubjects();
    loadTeacherSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/subjects`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar materias');
      }

      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError(error.message);
    }
  };

  const loadTeacherSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/teachers/${user.id}/subjects`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar tus materias');
      }

      const data = await response.json();
      setTeacherSubjects(data);
    } catch (error) {
      console.error('Error loading teacher subjects:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addSubjectsToTeacher = async (subjectIds) => {
    try {
      setIsAddingSubjects(true);
      const promises = subjectIds.map(subjectId => 
        fetch(`${API_URL}/teachers/${user.id}/subjects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ subject_id: parseInt(subjectId) })
        })
      );

      const responses = await Promise.all(promises);
      
      // Verificar si alguna respuesta no fue exitosa
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          const errorData = await responses[i].json();
          throw new Error(errorData.detail || `Error al agregar materia ${subjectIds[i]}`);
        }
      }

      await loadTeacherSubjects();
      setShowAddModal(false);
      setSelectedSubjects([]);
      setSelectedLevel('');
    } catch (error) {
      console.error('Error adding subjects:', error);
      setError(error.message);
    } finally {
      setIsAddingSubjects(false);
    }
  };

  const removeSubjectFromTeacher = async (subjectId) => {
    try {
      const response = await fetch(`${API_URL}/teachers/${user.id}/subjects/${subjectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar materia');
      }

      await loadTeacherSubjects();
    } catch (error) {
      console.error('Error removing subject:', error);
      setError(error.message);
    }
  };

  const handleAddSubjects = async (e) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
      setError('Por favor selecciona al menos una materia');
      return;
    }

    setError(null);
    await addSubjectsToTeacher(selectedSubjects);
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSelectAll = () => {
    const availableSubjects = getAvailableSubjects();
    if (selectedSubjects.length === availableSubjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(availableSubjects.map(subject => subject.id));
    }
  };

  const handleRemoveSubject = async (subjectId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
      await removeSubjectFromTeacher(subjectId);
    }
  };

  const getAvailableSubjects = () => {
    const filtered = subjects.filter(subject => 
      !teacherSubjects.some(ts => ts.subject.id === subject.id)
    );
    
    if (selectedLevel) {
      return filtered.filter(subject => subject.level === selectedLevel);
    }
    
    return filtered;
  };

  const getLevelDisplayName = (level) => {
    const levelNames = {
      'primaria': 'Primaria',
      'secundaria': 'Secundaria', 
      'terciaria': 'Terciaria'
    };
    return levelNames[level] || level;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-white text-lg">Cargando materias...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Materias</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Agregar Materia
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Lista de materias del docente */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {teacherSubjects.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-lg mb-4">No tienes materias asignadas</p>
              <p>Haz clic en "Agregar Materia" para comenzar</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {teacherSubjects.map(teacherSubject => (
                <div key={teacherSubject.id} className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {teacherSubject.subject.name}
                    </h3>
                    <p className="text-gray-400 mb-2">
                      {teacherSubject.subject.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span>Créditos: {teacherSubject.subject.credits}</span>
                      <span>Departamento: {teacherSubject.subject.department}</span>
                      <span className="bg-blue-600 px-2 py-1 rounded text-xs">
                        {getLevelDisplayName(teacherSubject.subject.level)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemoveSubject(teacherSubject.subject.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para agregar materias */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Agregar Nuevas Materias</h3>
              
              <form onSubmit={handleAddSubjects} className="space-y-4">
                {/* Filtro por nivel */}
                <div>
                  <label className="block text-sm font-medium mb-2">Filtrar por Nivel</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setSelectedSubjects([]); // Limpiar selección al cambiar nivel
                    }}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Todos los niveles</option>
                    <option value="primaria">Primaria</option>
                    <option value="secundaria">Secundaria</option>
                    <option value="terciaria">Terciaria</option>
                  </select>
                </div>

                {/* Lista de materias disponibles */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">
                      Seleccionar Materias ({selectedSubjects.length} seleccionadas)
                    </label>
                    {getAvailableSubjects().length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {selectedSubjects.length === getAvailableSubjects().length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border border-gray-600 rounded">
                    {getAvailableSubjects().length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        {selectedLevel ? `No hay materias disponibles para ${getLevelDisplayName(selectedLevel)}` : 'No hay materias disponibles'}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-700">
                        {getAvailableSubjects().map(subject => (
                          <div key={subject.id} className="p-3 hover:bg-gray-700">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedSubjects.includes(subject.id)}
                                onChange={() => handleSubjectToggle(subject.id)}
                                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{subject.name}</h4>
                                  <span className="bg-blue-600 px-2 py-1 rounded text-xs">
                                    {getLevelDisplayName(subject.level)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 mt-1">{subject.description}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  Créditos: {subject.credits} | Departamento: {subject.department}
                                </p>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={selectedSubjects.length === 0 || isAddingSubjects}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    {isAddingSubjects ? 'Agregando...' : `Agregar ${selectedSubjects.length} materia${selectedSubjects.length !== 1 ? 's' : ''}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedSubjects([]);
                      setSelectedLevel('');
                      setError(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherSubjects;
