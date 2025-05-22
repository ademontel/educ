import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import TeacherCard from "./TeacherCard";

function SearchTutoring() {
  
  // Datos estáticos de profesores (simulación de backend)
  const initialProfesores = [
    {
      id: 1,
      nombre: "Elías Milano",
      usuario: "eliasmilano01",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 5,
      nivel: "Universitario",
      materias: [
        "matemática",
        "física",
        "química",
        "geometría",
        "cálculo",
        "fisicoquímica",
        "mecánica de fluidos",
      ],
    },
    {
      id: 2,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 3,
      nombre: "Elsa Payito",
      usuario: "elsapayito",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.4,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 4,
      nombre: "Bryseida Roldán",
      usuario: "bryseroldan",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.0,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 5,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 6,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 7,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 8,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 9,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 10,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 11,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 12,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 13,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 14,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 15,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
    {
      id: 16,
      nombre: "María Pérez",
      usuario: "mariaperez99",
      foto: "",
      descripción:
        "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
      valoracion: 4.8,
      nivel: "Secundario",
      materias: ["matemática", "historia"],
    },
  ];

  const [profesores, setProfesores] = useState(initialProfesores);
  // Paginación
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Cálculo de paginación
  const totalPages = Math.ceil(profesores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const profesoresToDisplay = profesores.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-sky-900 via-sky-700 to-sky-500 border-b border-sky-900">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-white font-bold text-xl sm:text-2xl">EDUC</span>
          <span className="text-white">
            <i className="fa-regular fa-circle-user fa-lg"></i>
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow container mx-auto px-6 py-8">
        <h1 className=" ps-2 sm:ps-26 text-white font-bold  mb-8 text-3xl sm:text-4xl">
          Buscar Tutoría
        </h1>

        <div className="flex flex-wrap justify-center gap-6">
          {profesoresToDisplay.map((profesor) => (
            <TeacherCard
              key={profesor.id}
              id={profesor.id}
              name={profesor.nombre}
              username={profesor.usuario}
              valoracion={profesor.valoracion}
              nivel={profesor.nivel}
              materias={profesor.materias.join(", ")}
            />
          ))}
        </div>

        {/* Controles de paginación */}
        <div className="flex justify-center space-x-2 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-4 py-2 rounded ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-purple-800 via-pink-600 to-red-400 border-t border-purple-800">
        <div className="container mx-auto px-6 py-6 flex justify-center">
          <span className="text-white font-medium text-sm sm:text-base">
            © {new Date().getFullYear()} EDUC. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default SearchTutoring;
