import React from 'react';
import { useParams, Link } from 'react-router-dom';

function TeacherView() {
  const { id } = useParams();
  
  // Array de profesores (temporalmente aquí, luego se moverá a un contexto o se obtendrá de una API)
  const profesores = [
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

  ];

  // Encontrar el profesor según el ID
  const profesor = profesores.find(p => p.id === parseInt(id));

  if (!profesor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Profesor no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-sky-900 via-sky-700 to-sky-500 border-b border-sky-900">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-white font-bold text-xl sm:text-2xl">EDUC</Link>
          <span className="text-white">
            <i className="fa-regular fa-circle-user fa-lg"></i>
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Botón Volver */}
          <button
            onClick={() => window.history.back()}
            className="mb-6 inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors"
          >
            <i className="fas fa-chevron-left mr-2"></i>
            <span>Volver</span>
          </button>

          <div className="bg-black rounded-2xl shadow-xl p-8">
            {/* Información principal */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Foto del profesor */}
              <div className="w-full md:w-1/3">
                <div className="w-full aspect-square bg-gray-800 rounded-2xl flex items-center justify-center">
                  {profesor.foto ? (
                    <img src={profesor.foto} alt={profesor.nombre} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <i className="fa-regular fa-circle-user text-8xl text-gray-600"></i>
                  )}
                </div>
              </div>

              {/* Detalles del profesor */}
              <div className="w-full md:w-2/3 text-white">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{profesor.nombre}</h1>
                <p className="text-xl mb-2">@{profesor.usuario}</p>
                <div className="flex items-center mb-4">
                  <span className="text-xl mr-2">Valoración: {profesor.valoracion}/5</span>
                  <span className="text-yellow-500">{'★'.repeat(Math.round(profesor.valoracion))}</span>
                </div>
                <p className="text-xl mb-4">Nivel: {profesor.nivel}</p>
                <p className="text-lg text-gray-300 text-justify sm:text-left">{profesor.descripción}</p>
              </div>
            </div>

            {/* Materias */}
            <div className="border-t border-sky-800 pt-6">
              <h2 className="text-2xl font-bold text-white mb-4">Materias</h2>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {profesor.materias.map((materia, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-sky-900 text-white rounded-full text-sm"
                  >
                    {materia}
                  </span>
                ))}
              </div>
            </div>

            {/* Botón de contacto */}
            <div className="mt-8 flex justify-center">
              <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-full transition-colors">
                Contactar Profesor
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-purple-800 via-pink-600 to-red-400 border-t border-purple-800 mt-8">
        <div className="container mx-auto px-6 py-6 flex justify-center">
          <span className="text-white font-medium text-sm sm:text-base">
            © {new Date().getFullYear()} EDUC. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default TeacherView;