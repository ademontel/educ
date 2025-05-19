import React from "react";
import { Link } from "react-router-dom";

export default function TeacherCard(props) {
  return (
    <div className="relative flex flex-col justify-between p-4 w-[300px] min-h-[250px] bg-black border border-sky-500 rounded-2xl">
      {/* Encabezado */}
      <div className="flex flex-col pb-2 border-b border-sky-500">
        <span className="font-bold text-xl sm:text-2xl text-white">
          {props.name}
        </span>
        <span className="pt-1 text-xl sm:text-lg text-white">
          Usuario: {props.username} 
        </span>
        <div className="flex items-center">
        <span className="py-1 text-xl sm:text-lg text-white">
          Valoración: {props.valoracion}/5 
        </span>
        <span className="text-yellow-500 ms-5">{'★'.repeat(Math.round(props.valoracion))}</span>
        </div>
      </div>

      {/* Cuerpo con detalles */}
      <div className="pt-3 flex-grow">
        <span className="block text-lg sm:text-xl text-white">Nivel: {props.nivel}</span>
        <p className="block pt-2 text-lg sm:text-xl text-white line-clamp-2">Materias: {props.materias}</p>
      </div>

      <Link
        to={`/teacherview/${props.id}`}
        className="self-end mt-2 inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-2xl"
      >
        Ver más
      </Link>
    </div>
  );
}
