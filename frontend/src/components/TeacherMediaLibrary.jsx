import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const TeacherMediaLibrary = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Tipos de archivo permitidos
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4', 'video/webm', 'video/ogg',
    'audio/mp3', 'audio/wav', 'audio/ogg'
  ];

  // Cargar archivos del docente
  const fetchFiles = useCallback(async () => {
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
  }, [user.id]);

  useEffect(() => {
    if (user?.role === 'teacher' && user?.id) {
      fetchFiles();
    }
  }, [user, fetchFiles]);

  // Manejar drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Validar archivos
  const validateFiles = (fileList) => {
    const validFiles = [];
    const errors = [];

    fileList.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Tipo de archivo no permitido`);
      } else if (file.size > 10 * 1024 * 1024) { // 10MB
        errors.push(`${file.name}: El archivo es demasiado grande (máximo 10MB)`);
      } else {
        validFiles.push(file);
      }
    });

    return { validFiles, errors };
  };

  // Manejar selección de archivos
  const handleFiles = (fileList) => {
    const { validFiles, errors } = validateFiles(fileList);
    
    if (errors.length > 0) {
      setError(errors.join(', '));
    } else {
      setError(null);
    }

    setSelectedFiles(validFiles);
  };

  // Subir archivos
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', '');

        const response = await fetch(`http://localhost:8000/teachers/${user.id}/media`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error al subir ${file.name}`);
        }

        return response.json();
      });

      await Promise.all(uploadPromises);
      
      setSuccess(`${selectedFiles.length} archivo(s) subido(s) exitosamente`);
      setSelectedFiles([]);
      fetchFiles(); // Recargar la lista
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Eliminar archivo
  const deleteFile = async (fileId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

    try {
      const response = await fetch(`http://localhost:8000/teachers/${user.id}/media/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSuccess('Archivo eliminado exitosamente');
        fetchFiles();
      } else {
        setError('Error al eliminar el archivo');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  // Actualizar descripción
  const updateDescription = async (fileId, newDescription) => {
    try {
      const formData = new FormData();
      formData.append('description', newDescription);

      const response = await fetch(`http://localhost:8000/teachers/${user.id}/media/${fileId}/description`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setSuccess('Descripción actualizada');
        fetchFiles();
      } else {
        setError('Error al actualizar la descripción');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (user?.role !== 'teacher') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Solo los docentes pueden acceder a la biblioteca de medios.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Biblioteca de Medios</h1>
        <p className="text-gray-400">Gestiona tus archivos multimedia para usar en las tutorías</p>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200">
          {success}
        </div>
      )}

      {/* Zona de subida */}
      <div className="mb-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-sky-500 bg-sky-900/20' 
              : 'border-gray-600 bg-gray-800/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <p className="text-xl text-gray-300 mb-2">
            Arrastra archivos aquí o{' '}
            <label className="text-sky-400 hover:text-sky-300 cursor-pointer underline">
              selecciona archivos
              <input
                type="file"
                multiple
                className="hidden"
                accept={allowedTypes.join(',')}
                onChange={(e) => handleFiles(Array.from(e.target.files))}
              />
            </label>
          </p>
          
          <p className="text-gray-500 text-sm">
            Soporta: Imágenes, PDF, Word, PowerPoint, Videos, Audio (máx. 10MB por archivo)
          </p>

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Archivos seleccionados ({selectedFiles.length})
                </h3>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-600/50 rounded p-2">
                      <span className="text-gray-300">{file.name}</span>
                      <span className="text-gray-400 text-sm">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={uploadFiles}
                    disabled={uploading}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {uploading ? 'Subiendo...' : 'Subir Archivos'}
                  </button>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de archivos */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Mis Archivos ({files.length})
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Cargando archivos...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No hay archivos en tu biblioteca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDelete={deleteFile}
                onUpdateDescription={updateDescription}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para cada archivo
const FileCard = ({ file, onDelete, onUpdateDescription, getFileIcon, formatFileSize }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(file.description || '');

  const handleSaveDescription = () => {
    onUpdateDescription(file.id, description);
    setIsEditing(false);
  };

  const handleDownload = () => {
    window.open(`http://localhost:8000/teachers/${file.teacher_id}/media/${file.id}`, '_blank');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getFileIcon(file.mime_type)}</span>
          <div>
            <h3 className="text-white font-medium text-sm truncate" title={file.original_filename}>
              {file.original_filename}
            </h3>
            <p className="text-gray-400 text-xs">{formatFileSize(file.file_size)}</p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={handleDownload}
            className="p-1 text-gray-400 hover:text-sky-400 transition-colors"
            title="Descargar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(file.id)}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-gray-400 text-xs mb-1">
          Subido: {new Date(file.uploaded_at).toLocaleDateString()}
        </p>
      </div>

      <div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del archivo..."
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
              rows="2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveDescription}
                className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setDescription(file.description || '');
                }}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-300 text-sm mb-2 min-h-[2.5rem]">
              {file.description || 'Sin descripción'}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sky-400 hover:text-sky-300 text-xs underline"
            >
              Editar descripción
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMediaLibrary;
