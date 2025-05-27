import React, { useState } from "react";
import { Link } from "react-router-dom";

const TutoringDetails = () => {
  const tutoringData = {
    id: 1,
    teacher: "Elías Milano",
    student: "Pepito Rodríguez",
    date: "22/05/2025",
    level: "Secundario",
    subject: "Matemática",
    rating: "4",
  };

  const resources = [
    { id: 1, name: "Fundamentos de álgebra lineal", url: "https://educ/teacher12345/recurso1.pdf" },
    { id: 2, name: "Ecuaciones de primer grado", url: "https://educ/teacher12345/recurso2.pdf" },
    { id: 3, name: "Ecuaciones de segundo grado", url: "https://educ/teacher12345/recurso3.pdf" },
  ];

  const activities = [
    { id: 1, label: "Preguntas de selección múltiple", route: "/activities/multiple-choice" },
    { id: 2, label: "Preguntas verdadero o falso", route: "/activities/true-false" },
    { id: 3, label: "Desarrolle su respuesta", route: "/activities/open-answer" },
  ];

  const [description, setDescription] = useState("");

  return (
    <div className="container bg-gray-900 mx-auto p-6 space-y-6 lg:py-15 lg:px-40">
      {/* Botón Volver */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors"
      >
        <i className="fas fa-chevron-left mr-2"></i>
        <span>Volver</span>
      </button>

      {/* Cabecera */}
      <div className="border-2 border-pink-300 rounded-2xl bg-gradient-to-r from-blue-300 to-pink-300 p-4 flex flex-col lg:grid lg:grid-cols-3 gap-4">
        <div className="flex flex-col space-y-1 text-left">
          <span className="font-semibold">Profesor: {tutoringData.teacher}</span>
          <span className="font-semibold">Estudiante: {tutoringData.student}</span>
        </div>
        <div className="flex flex-col space-y-1 text-left lg:text-center">
          <span className="font-semibold">Nivel: {tutoringData.level}</span>
          <span className="font-semibold">Materia: {tutoringData.subject}</span>
        </div>
        <div className="flex flex-col space-y-1 text-left lg:text-right">
          <span className="font-semibold">Fecha: {tutoringData.date}</span>
          <span className="font-semibold">Valoración: {'★'.repeat(Math.round(tutoringData.rating))}</span>
        </div>
      </div>

      {/* Descripción */}
      <div className="border-2 border-blue-200 rounded-2xl bg-blue-300 p-4">
        <label htmlFor="description" className="block font-semibold mb-2">
          Descripción:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Escribe aquí lo que has aprendido en la tutoría..."
          className="w-full h-32 rounded-lg border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
        />
      </div>

      {/* Recursos y Actividades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recursos */}
        <div className="border-2 border-pink-300 rounded-2xl bg-pink-300 p-4">
          <h2 className="font-semibold mb-3">Recursos:</h2>
          <ul className="space-y-2">
            {resources.map((res) => (
              <li key={res.id} className="flex flex-col">
                <Link
                  to={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                >
                  {res.name}
                </Link>
                <span className="text-sm text-gray-600">{res.url}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actividades */}
        <div className="border-2 border-blue-200 rounded-2xl bg-blue-300 p-4">
          <h2 className="font-semibold mb-3">Actividades:</h2>
          <ul className="space-y-2">
            {activities.map((act) => (
              <li key={act.id}>
                <Link
                  to={act.route}
                  className="font-medium text-pink-600 hover:underline"
                >
                  {act.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TutoringDetails;
