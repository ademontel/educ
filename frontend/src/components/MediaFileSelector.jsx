import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MediaFileSelector = ({ onFileSelect, onClose, selectedFiles = [] }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Cargar archivos del docente
  useEffect(() => {
    const fetchFiles = async () => {
      if (user?.role !== 'teacher' || !user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/teachers/${user.id}/media`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setFiles(data);
        } else {
          setError('Error al cargar los archivos');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user]);

  // Filtrar archivos
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'image' && file.mime_type.startsWith('image/')) ||
                       (filterType === 'video' && file.mime_type.startsWith('video/')) ||
                       (filterType === 'audio' && file.mime_type.startsWith('audio/')) ||
                       (filterType === 'document' && (file.mime_type.includes('pdf') || file.mime_type.includes('word') || file.mime_type.includes('powerpoint')));

    return matchesSearch && matchesType;
  });

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

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isSelected = (fileId) => {
    return selectedFiles.some(f => f.id === fileId);
  };

  const handleFileClick = (file) => {
    if (isSelected(file.id)) {
      onFileSelect(selectedFiles.filter(f => f.id !== file.id));
    } else {
      onFileSelect([...selectedFiles, file]);
    }
  };

  if (user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-3/4 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Seleccionar Archivos de Media</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="all">Todos los archivos</option>
              <option value="image">Imágenes</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documentos</option>
            </select>
          </div>
        </div>

        {/* Selected Files Info */}
        {selectedFiles.length > 0 && (
          <div className="px-4 py-2 bg-sky-900/30 border-b border-gray-600">
            <p className="text-sky-300 text-sm">
              {selectedFiles.length} archivo(s) seleccionado(s)
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
              <p className="text-gray-400 ml-3">Cargando archivos...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {searchTerm || filterType !== 'all' 
                  ? 'No se encontraron archivos con los filtros aplicados' 
                  : 'No hay archivos en tu biblioteca'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected(file.id)
                      ? 'border-sky-500 bg-sky-900/30'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1 min-w-0">
                      <span className="text-2xl mr-2 flex-shrink-0">{getFileIcon(file.mime_type)}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-medium text-sm truncate" title={file.original_filename}>
                          {file.original_filename}
                        </h3>
                        <p className="text-gray-400 text-xs">{formatFileSize(file.file_size)}</p>
                      </div>
                    </div>
                    
                    {isSelected(file.id) && (
                      <div className="flex-shrink-0 text-sky-400 ml-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {file.description && (
                    <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                      {file.description}
                    </p>
                  )}

                  <p className="text-gray-500 text-xs">
                    Subido: {new Date(file.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-6 py-4 border-t border-gray-600 flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            {filteredFiles.length} archivo(s) disponible(s)
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onFileSelect(selectedFiles);
                onClose();
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
            >
              Usar Seleccionados ({selectedFiles.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaFileSelector;
