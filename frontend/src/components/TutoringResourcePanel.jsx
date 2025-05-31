import React, { useState } from 'react';
import MediaFileSelector from './MediaFileSelector';

const TutoringResourcePanel = ({ tutoringId }) => {
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [selectedMediaFiles, setSelectedMediaFiles] = useState([]);
  const [resources, setResources] = useState([]);

  // Añadir archivos de biblioteca a la tutoría
  const handleMediaFilesSelected = (files) => {
    const newResources = files.map(file => ({
      id: `media_${file.id}`,
      type: 'media_library',
      mediaFile: file,
      title: file.original_filename,
      addedAt: new Date()
    }));

    setResources(prev => [...prev, ...newResources]);
    setSelectedMediaFiles(files);
  };

  // Remover recurso
  const removeResource = (resourceId) => {
    setResources(prev => prev.filter(r => r.id !== resourceId));
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('powerpoint')) return '📊';
    return '📎';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recursos de la Tutoría</h3>
        <button
          onClick={() => setShowMediaSelector(true)}
          className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Añadir desde Biblioteca
        </button>
      </div>

      {/* Lista de recursos */}
      <div className="space-y-2">
        {resources.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>No hay recursos añadidos</p>
            <p className="text-sm">Usa el botón "Añadir desde Biblioteca" para agregar archivos</p>
          </div>
        ) : (
          resources.map(resource => (
            <div key={resource.id} className="flex items-center justify-between bg-gray-700 rounded p-3">
              <div className="flex items-center flex-1 min-w-0">
                <span className="text-xl mr-3">
                  {getFileIcon(resource.mediaFile.mime_type)}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-medium truncate">
                    {resource.title}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Añadido: {resource.addedAt.toLocaleTimeString()}
                  </p>
                  {resource.mediaFile.description && (
                    <p className="text-gray-300 text-sm truncate">
                      {resource.mediaFile.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Abrir/descargar archivo
                    window.open(`http://localhost:8000/teachers/${resource.mediaFile.teacher_id}/media/${resource.mediaFile.id}`, '_blank');
                  }}
                  className="p-1 text-gray-400 hover:text-sky-400 transition-colors"
                  title="Abrir archivo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => removeResource(resource.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Remover de tutoría"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estadísticas */}
      {resources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-600">
          <p className="text-gray-400 text-sm">
            {resources.length} recurso(s) en esta tutoría
          </p>
        </div>
      )}

      {/* Modal selector de medios */}
      {showMediaSelector && (
        <MediaFileSelector
          onFileSelect={handleMediaFilesSelected}
          onClose={() => setShowMediaSelector(false)}
          selectedFiles={selectedMediaFiles}
        />
      )}
    </div>
  );
};

export default TutoringResourcePanel;
