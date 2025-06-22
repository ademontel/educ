import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTeacher } from "../context/TeacherContext";

function SearchTutoring() {
  const navigate = useNavigate();
  const { 
    teachers, 
    subjects, 
    isLoading, 
    error, 
    getTeachers, 
    getSubjects, 
    searchTeachers 
  } = useTeacher();

  // Estados para filtros
  const [filters, setFilters] = useState({
    subject: '',
    level: '',
    name: ''
  });

  // Estados para información adicional de docentes
  const [teachersWithSubjects, setTeachersWithSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Paginación
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      await getTeachers(0, 100); // Cargar profesores
      await getSubjects(); // Cargar materias
    };
    
    loadInitialData();
  }, []);

  // Cargar materias de cada docente cuando cambie la lista de docentes
  useEffect(() => {
    const loadTeachersSubjects = async () => {
      if (teachers.length === 0) {
        setTeachersWithSubjects([]);
        return;
      }

      setLoadingSubjects(true);
      try {
        const teachersWithSubjectsData = await Promise.all(
          teachers.map(async (teacher) => {
            try {
              const response = await fetch(`http://localhost:8000/teachers/${teacher.id}/subjects`, {
                credentials: 'include'
              });
              if (response.ok) {
                const subjectsData = await response.json();
                return {
                  ...teacher,
                  subjects: subjectsData.map(ts => ts.subject) // Extraer solo la información de la materia
                };
              } else {
                return {
                  ...teacher,
                  subjects: []
                };
              }
            } catch (error) {
              console.error(`Error loading subjects for teacher ${teacher.id}:`, error);
              return {
                ...teacher,
                subjects: []
              };
            }
          })
        );
        setTeachersWithSubjects(teachersWithSubjectsData);
      } catch (error) {
        console.error('Error loading teachers subjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadTeachersSubjects();
  }, [teachers]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    const applyFilters = async () => {
      const filterParams = {
        ...filters,
        skip: 0,
        limit: 100
      };
      
      // Limpiar filtros vacíos
      Object.keys(filterParams).forEach(key => {
        if (!filterParams[key]) {
          delete filterParams[key];
        }
      });

      await searchTeachers(filterParams);
      setCurrentPage(1); // Resetear a la primera página cuando se filtran
    };

    applyFilters();
  }, [filters]);

  // Cálculo de paginación
  const totalPages = Math.ceil(teachersWithSubjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const teachersToDisplay = teachersWithSubjects.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      level: '',
      name: ''
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Main */}
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Botón Volver */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors lg:ms-25 "
        >
          <i className="fas fa-chevron-left mr-2"></i>
          <span>Volver</span>
        </button>

        <h1 className="ps-2 sm:ps-26 text-white font-bold mb-8 text-3xl sm:text-4xl">
          Buscar Tutoría
        </h1>

        {/* Filtros de búsqueda */}
        <div className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-white text-xl mb-4">Filtros de Búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por nombre */}
            <div>
              <label className="block text-white text-sm mb-2">Nombre del profesor</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Filtro por materia */}
            <div>
              <label className="block text-white text-sm mb-2">Materia</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-sky-500 focus:outline-none"
              >
                <option value="">Todas las materias</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por nivel */}
            <div>
              <label className="block text-white text-sm mb-2">Nivel</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-sky-500 focus:outline-none"
              >
                <option value="">Todos los niveles</option>
                <option value="Primario">Primario</option>
                <option value="Secundario">Secundario</option>
                <option value="Universitario">Universitario</option>
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <button
            onClick={clearFilters}
            className="mt-4 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Mostrar estado de carga */}
        {(isLoading || loadingSubjects) && (
          <div className="flex justify-center items-center py-8">
            <div className="text-white text-lg">
              {isLoading ? 'Cargando profesores...' : 'Cargando materias...'}
            </div>
          </div>
        )}

        {/* Mostrar errores */}
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Lista de profesores */}
        {!isLoading && !loadingSubjects && !error && (
          <>
            {teachersToDisplay.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6">
                {teachersToDisplay.map((teacher) => (
                  <div key={teacher.id} className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-white mb-2">{teacher.name}</h3>
                      <p className="text-gray-400 text-sm">{teacher.email}</p>
                    </div>
                    
                    {/* Materias del docente */}
                    <div className="mb-4">
                      <h4 className="text-white text-sm font-medium mb-2">Materias:</h4>
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject) => (
                            <span 
                              key={subject.id} 
                              className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                            >
                              {subject.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Sin materias asignadas</p>
                      )}
                    </div>

                    {/* Niveles de las materias */}
                    {teacher.subjects && teacher.subjects.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-white text-sm font-medium mb-2">Niveles:</h4>
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(teacher.subjects.map(s => s.level))].map((level) => (
                            <span 
                              key={level} 
                              className="bg-green-600 text-white text-xs px-2 py-1 rounded"
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botón ver perfil */}
                    <div className="text-center">
                      <Link
                        to={`/teacher/profile/${teacher.id}`}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded transition-colors inline-block"
                      >
                        Ver Perfil
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white py-8">
                <p className="text-xl">No se encontraron profesores con los filtros aplicados.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded transition-colors"
                >
                  Mostrar todos los profesores
                </button>
              </div>
            )}
          </>
        )}

        {/* Controles de paginación */}
        {!isLoading && !loadingSubjects && !error && teachersToDisplay.length > 0 && (
          <div className="flex justify-center space-x-2 mt-8">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 transition-colors"
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-4 py-2 rounded transition-colors ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchTutoring;
