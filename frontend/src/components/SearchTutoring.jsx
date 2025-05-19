import React from "react";
import { Link, useNavigate } from "react-router-dom";
import TeacherCard from "./TeacherCard";

function SearchTutoring() {

    let profesores = [
             {
                "id": 1,
                "nombre": "Elías Milano",
                "usuario": "eliasmilano01",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 5,
                "nivel": "Universitario",
                "materias": ["matemática", "física", "química", "geometría", "cálculo", "fisicoquímica", "mecánica de fluidos"]
            },
            {
                "id": 2,
                "nombre": "María Pérez",
                "usuario": "mariaperez99",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.8,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 3,
                "nombre": "Elsa Payito",
                "usuario": "elsapayito",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.4,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 4,
                "nombre": "Bryseida Roldán",
                "usuario": "bryseroldan",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.0,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 5,
                "nombre": "María Pérez",
                "usuario": "mariaperez99",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.8,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 6,
                "nombre": "María Pérez",
                "usuario": "mariaperez99",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.8,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 7,
                "nombre": "María Pérez",
                "usuario": "mariaperez99",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.8,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 8,
                "nombre": "María Pérez",
                "usuario": "mariaperez99",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.8,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 9,
                "nombre": "María Pérez",
                "usuario": "mariaperez99",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.8,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 10,
                "nombre": "María Pérez",
                "usuario": "mariaperez99",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.8,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 11,
                "nombre": "María Pérez",
                "usuario": "mariaperez99",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.8,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            },
            {
                "id": 12,
                "nombre": "María Pérez",
                "usuario": "mariaperez99",
                "foto": "",
                "descripción": "Soy un profesor de matemáticas y física con más de 10 años de experiencia en la enseñanza. Me apasiona ayudar a los estudiantes a comprender conceptos complejos y a desarrollar habilidades críticas.",
                "valoracion": 4.8,
                "nivel": "Secundario",
                "materias": ["matemática", "historia"]
            }
            
        ]
    
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
        <h1 className=" ps-2 sm:ps-26 text-white font-bold  mb-8 text-3xl sm:text-4xl">Buscar Tutoría</h1>

        <div className="flex flex-wrap justify-center gap-6">
          {profesores.map((profesor) => (
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
