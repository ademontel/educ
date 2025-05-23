import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentHistory() {
  const navigate = useNavigate();

  const initialStudentHistory = [
    { id: 1, Teacher: "Elías Milano", date: "22/05/2025", level: "Secundario", subject: "Matemática", pendingTasks: true },
    { id: 2, Teacher: "Pedro Pablo", date: "22/05/2025", level: "Secundario", subject: "Física", pendingTasks: false },
    { id: 3, Teacher: "Pablo Pérez", date: "22/05/2025", level: "Secundario", subject: "Geografía", pendingTasks: true },
    { id: 4, Teacher: "Elsa Payito", date: "22/05/2025", level: "Secundario", subject: "Química", pendingTasks: false },
    { id: 5, Teacher: "Mario Cantinflas", date: "22/05/2025", level: "Secundario", subject: "Historia", pendingTasks: true },
    { id: 6, Teacher: "Aquiles Baeza", date: "22/05/2025", level: "Secundario", subject: "Mecánica", pendingTasks: false },
    { id: 7, Teacher: "Aquiles Baeza", date: "22/05/2025", level: "Secundario", subject: "Mecánica", pendingTasks: false },
    { id: 8, Teacher: "Aquiles Baeza", date: "22/05/2025", level: "Secundario", subject: "Mecánica", pendingTasks: false },
    { id: 9, Teacher: "Aquiles Baeza", date: "22/05/2025", level: "Secundario", subject: "Mecánica", pendingTasks: false },
    { id: 10, Teacher: "Aquiles Baeza", date: "22/05/2025", level: "Secundario", subject: "Mecánica", pendingTasks: false },
  ];

  const handleTasksClick = (id) => {
    navigate(`/student/tasks/${id}`);
  };

  const [studentHistory, setStudentHistory] = useState(initialStudentHistory);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(studentHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const studentHistoryToDisplay = studentHistory.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-6">Historial de Tutorías</h1>
        <ul className="space-y-4">
          {studentHistoryToDisplay.map((session) => (
            <li
              key={session.id}
              className="bg-sky-700 rounded-lg shadow-lg p-4 text-white grid grid-cols-2 items-center space-y-4 lg:grid-cols-5 lg:space-y-0 lg:gap-4"
            >
              <div className="flex flex-col items-center">
                <strong>Nombre</strong>
                <span>{session.Teacher}</span>
              </div>
              <div className="flex flex-col items-center">
                <strong>Fecha</strong>
                <span>{session.date}</span>
              </div>
              <div className="flex flex-col items-center">
                <strong>Nivel</strong>
                <span>{session.level}</span>
              </div>
              <div className="flex flex-col items-center">
                <strong>Materia</strong>
                <span>{session.subject}</span>
              </div>
              <div className="flex justify-center items-center col-span-2 lg:col-span-1">
                <button
                  onClick={() => handleTasksClick(session.id)}
                  disabled={!session.pendingTasks}
                  className={`px-4 py-2 rounded-lg font-medium w-50
                    ${session.pendingTasks ? 'bg-white text-sky-700 hover:bg-gray-100' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                >
                  {session.pendingTasks ? 'Tareas pendientes' : 'Sin tareas pendientes'}
                </button>
              </div>
            </li>
          ))}
        </ul>

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
      </div>
    </div>
  );
}

export default StudentHistory;
