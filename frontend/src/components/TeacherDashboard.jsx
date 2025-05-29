import React from "react";
import { Link, useNavigate } from "react-router-dom";

function TeacherDashboard() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full bg-gray-900">
      
      <main className="flex-1 flex items-center justify-center w-full text-white bg-gray-900 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl">
          
          <div className="relative pb-12 flex flex-col sm:col-span-2 items-start min-h-[30px]">
            <span className="absolute top-3 left-0 font-bold text-2xl sm:text-4xl">
              <h1>Bienvenido Docente!</h1>
            </span>
          </div>

          {/* Card 1 */}
          <Link to="/" className="relative bg-gradient-to-br from-cyan-900 via-cyan-700 to-cyan-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Próximas Tutorías
            </span>
          </Link>

          <Link to="/" className="relative bg-gradient-to-br from-orange-900 via-orange-700 to-orange-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Recursos
            </span>
          </Link>

          {/* Card 3 */}
          <Link to="/" className="relative bg-gradient-to-br from-yellow-900 via-yellow-700 to-yellow-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Historial Y Pagos
            </span>
          </Link>

          <div className="relative bg-gradient-to-br from-green-900 via-green-700 to-green-500 rounded-2xl shadow-lg p-6 flex flex-col items-start hover:scale-105 hover:contrast-125 transition min-h-[180px]">
            <span className="absolute top-3 left-3 font-bold text-xl sm:text-2xl z-10">
              Wallet
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}


export default TeacherDashboard;
