import React from "react";
import { Link, useNavigate } from "react-router-dom";

function TeacherDashboard() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full bg-gray-900">
      
      <main className="flex-1 flex items-center justify-center w-full text-white bg-gray-900 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          
          <div className="relative pb-12 flex flex-col sm:col-span-3 items-start min-h-[30px]">
            <span className="absolute top-3 left-0 font-bold text-2xl sm:text-4xl">
              <h1>Bienvenido Docente!</h1>
            </span>
          </div>

          {/* Mi Perfil */}
          <Link to="/teacher/profile" className="relative bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Mi Perfil
            </span>
            <span className="absolute bottom-3 left-3 text-sm opacity-80 z-10">
              Ver y editar información personal
            </span>
          </Link>

          {/* Próximas Tutorías */}
            <Link to="/teacher/tutoring" className="relative bg-gradient-to-br from-cyan-900 via-cyan-700 to-cyan-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Mis Tutorías
            </span>
            <span className="absolute bottom-3 left-3 text-sm opacity-80 z-10">
              Gestionar tutorías programadas
            </span>
          </Link>          {/* Mis Estudiantes */}
          <Link to="/teacher/students" className="relative bg-gradient-to-br from-orange-900 via-orange-700 to-orange-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Mis Estudiantes
            </span>
            <span className="absolute bottom-3 left-3 text-sm opacity-80 z-10">
              Ver estudiantes asignados
            </span>
          </Link>

          {/* Biblioteca de Medios */}
          <Link to="/teacher/media" className="relative bg-gradient-to-br from-teal-900 via-teal-700 to-teal-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              📁 Biblioteca
            </span>
            <span className="absolute bottom-3 left-3 text-sm opacity-80 z-10">
              Gestionar archivos multimedia
            </span>
          </Link>

          {/* Buscar Estudiantes */}
          <Link to="/search" className="relative bg-gradient-to-br from-yellow-900 via-yellow-700 to-yellow-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Buscar Estudiantes
            </span>
            <span className="absolute bottom-3 left-3 text-sm opacity-80 z-10">
              Encontrar nuevos estudiantes
            </span>
          </Link>

          {/* Estadísticas */}
          <div className="relative bg-gradient-to-br from-green-900 via-green-700 to-green-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Estadísticas
            </span>
            <span className="absolute bottom-3 left-3 text-sm opacity-80 z-10">
              Rendimiento y análisis
            </span>
          </div>

          {/* Configuración */}
          <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Configuración
            </span>
            <span className="absolute bottom-3 left-3 text-sm opacity-80 z-10">
              Ajustes de cuenta
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard;
