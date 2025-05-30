import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  console.log('NotFound component rendered');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-9xl font-bold text-sky-500">404</h1>
        <h2 className="text-4xl font-semibold text-white mt-4">Página no encontrada</h2>
        <p className="text-gray-300 mt-4 text-lg">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}