import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import TeacherCard from "./TeacherCard";
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
  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const teachersToDisplay = teachers.slice(startIndex, endIndex);

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
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-white text-lg">Cargando profesores...</div>
          </div>
        )}

        {/* Mostrar errores */}
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Lista de profesores */}
        {!isLoading && !error && (
          <>
            {teachersToDisplay.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6">
                {teachersToDisplay.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    id={teacher.id}
                    name={teacher.name}
                    username={teacher.email} // Usar email como username
                    valoracion={4.5} // Valor por defecto ya que no está en el modelo
                    nivel="Secundario" // Valor por defecto ya que no está en el modelo
                    materias="Ver materias disponibles" // Texto genérico
                  />
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
        {!isLoading && !error && teachersToDisplay.length > 0 && (
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
