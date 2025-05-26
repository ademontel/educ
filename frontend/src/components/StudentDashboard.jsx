import React from "react";
import { Link, useNavigate } from "react-router-dom";

function StudentDashboard() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900">
      {/* Header */}
      <header className="w-full top-0 left-0 mx-auto text-white py-4 px-4 sm:px-6 bg-gradient-to-r from-sky-900 via-sky-700 to-sky-500 border-b border-sky-900">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl sm:text-2xl">EDUC</span>
          <span className="font-bold text-xl sm:text-2xl">
            <i className="fa-regular fa-circle-user fa-lg"></i>
          </span>
        </div>
      </header>

      <main className="flex-grow w-full flex items-center justify-center text-white g-gray-900 p-4 py-15 sm:py-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl">
          <div className="relative pb-12 flex flex-col sm:col-span-2 items-start min-h-[30px]">
            <span className="absolute top-3 left-0 font-bold text-2xl sm:text-4xl">
              <h1>Bienvenido Estudiante!</h1>
            </span>
          </div>

          {/* Card 1 */}
          <Link to="/studentactivetutoringlist" className="relative bg-gradient-to-br from-cyan-900 via-cyan-700 to-cyan-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Próximas Tutorías
            </span>
          </Link>

          {/* Card 2 */}
          <Link to="/search" className="relative bg-gradient-to-br from-orange-900 via-orange-700 to-orange-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Buscar Tutorías
            </span>
          </Link>

          {/* Card 3 */}
          <Link to="/studenthistory" className="relative bg-gradient-to-br from-yellow-900 via-yellow-700 to-yellow-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Historial
            </span>
          </Link>

          {/* Card 4 */}
          <div className="relative bg-gradient-to-br from-green-900 via-green-700 to-green-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Wallet
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bottom-0 left-0 mx-auto text-white pt-4 pb-6 px-4 sm:px-6 bg-gradient-to-r from-purple-800 via-pink-600 to-red-400 border-t border-purple-800">
        <div className="flex justify-center items-center">
          <span className="font-medium text-sm sm:text-base">
            © {new Date().getFullYear()} EDUC. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default StudentDashboard;
