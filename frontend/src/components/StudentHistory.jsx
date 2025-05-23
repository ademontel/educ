import React from "react";
import { useNavigate } from "react-router-dom";

function StudentHistory() {
  const navigate = useNavigate();

  // Historial estático de tutorías
  const studentHistory = [
    { id: 1, Teacher: "Elías Milano", date: "22/05/2025", level: "Secundario", subject: "Matemática", pendingTasks: true },
    { id: 2, Teacher: "Pedro Pablo", date: "22/05/2025", level: "Secundario", subject: "Física", pendingTasks: false },
    { id: 3, Teacher: "Pablo Pérez", date: "22/05/2025", level: "Secundario", subject: "Geografía", pendingTasks: true },
    { id: 4, Teacher: "Elsa Payito", date: "22/05/2025", level: "Secundario", subject: "Química", pendingTasks: false },
    { id: 5, Teacher: "Mario Cantinflas", date: "22/05/2025", level: "Secundario", subject: "Historia", pendingTasks: true },
    { id: 6, Teacher: "Aquiles Baeza", date: "22/05/2025", level: "Secundario", subject: "Mecánica", pendingTasks: false }
  ];

  const handleTasksClick = (id) => {
    // Navegar a la vista de actividades pendientes para la tutoría con id
    navigate(`/student/tasks/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-6">Historial de Tutorías</h1>
        <ul className="space-y-4">
          {studentHistory.map((session, idx) => (
            <li
              key={session.id}
              className="bg-sky-700 rounded-lg shadow-lg p-4 text-white
                flex flex-col justify-between items-start space-y-4
                lg:grid lg:grid-cols-5 lg:items-center lg:space-y-0 lg:gap-4"
            >
                
              <div className="flex flex-col items-center direction-row">
                <span className="col-span-1"><strong>Nombre</strong></span>
                <span className="col-span-1">{session.Teacher}</span>
              </div>

              <div className="flex flex-col items-center direction-row">
                <span className="col-span-1"><strong>Fecha</strong></span>
                <span className="col-span-1">{session.date}</span>
              </div>

              <div className="flex flex-col items-center direction-row">
                <span className="col-span-1"><strong>Nivel</strong></span>
                <span className="col-span-1">{session.level}</span>
              </div>

              <div className="flex flex-col items-center direction-row">
                <span className="col-span-1"><strong>Materia</strong></span>
                <span className="col-span-1">{session.subject}</span>
              </div>


            <div className="w-full flex justify-end items-center lg:justify-center lg:col-span-1">
              <button
                onClick={() => handleTasksClick(session.id)}
                disabled={!session.pendingTasks}
                className={`px-4 py-2 rounded-lg font-medium lg:w-full 
                  ${session.pendingTasks ? 'bg-white text-sky-700 hover:bg-gray-100' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
              >
                {session.pendingTasks ? 'Ver tareas' : 'Sin tareas'}
              </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StudentHistory;
