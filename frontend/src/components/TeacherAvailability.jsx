import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Lunes', short: 'L' },
  { id: 1, name: 'Martes', short: 'M' },
  { id: 2, name: 'Miércoles', short: 'X' },
  { id: 3, name: 'Jueves', short: 'J' },
  { id: 4, name: 'Viernes', short: 'V' },
  { id: 5, name: 'Sábado', short: 'S' },
  { id: 6, name: 'Domingo', short: 'D' }
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

function TeacherAvailability() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '10:00',
    is_available: true
  });

  // Cargar disponibilidad actual
  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/teachers/${user.id}/availability`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar disponibilidad');
      }

      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Error loading availability:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createAvailability = async (slotData) => {
    try {
      const response = await fetch(`${API_URL}/teachers/${user.id}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(slotData)
      });

      if (!response.ok) {
        throw new Error('Error al crear disponibilidad');
      }

      const newAvailability = await response.json();
      setAvailability(prev => [...prev, newAvailability]);
      return true;
    } catch (error) {
      console.error('Error creating availability:', error);
      setError(error.message);
      return false;
    }
  };

  const updateAvailability = async (id, slotData) => {
    try {
      const response = await fetch(`${API_URL}/teachers/${user.id}/availability/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(slotData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar disponibilidad');
      }

      const updatedAvailability = await response.json();
      setAvailability(prev => 
        prev.map(slot => slot.id === id ? updatedAvailability : slot)
      );
      return true;
    } catch (error) {
      console.error('Error updating availability:', error);
      setError(error.message);
      return false;
    }
  };

  const deleteAvailability = async (id) => {
    try {
      const response = await fetch(`${API_URL}/teachers/${user.id}/availability/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar disponibilidad');
      }

      setAvailability(prev => prev.filter(slot => slot.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting availability:', error);
      setError(error.message);
      return false;
    }
  };

  const validateTimeSlot = (startTime, endTime) => {
    const start = new Date(`2024-01-01T${startTime}:00`);
    const end = new Date(`2024-01-01T${endTime}:00`);
    return end > start;
  };

  const checkTimeConflict = (dayOfWeek, startTime, endTime, excludeId = null) => {
    return availability.some(slot => {
      if (slot.id === excludeId) return false;
      if (slot.day_of_week !== dayOfWeek) return false;
      
      const slotStart = new Date(`2024-01-01T${slot.start_time}:00`);
      const slotEnd = new Date(`2024-01-01T${slot.end_time}:00`);
      const newStart = new Date(`2024-01-01T${startTime}:00`);
      const newEnd = new Date(`2024-01-01T${endTime}:00`);
      
      // Verificar si hay solapamiento
      return (newStart < slotEnd && newEnd > slotStart);
    });
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    
    // Validar que la hora de fin sea posterior a la de inicio
    if (!validateTimeSlot(newSlot.start_time, newSlot.end_time)) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }
    
    // Verificar conflictos de horario
    if (checkTimeConflict(newSlot.day_of_week, newSlot.start_time, newSlot.end_time)) {
      setError('Ya existe un horario que se solapa con el horario seleccionado');
      return;
    }
    
    setError(null);
    const success = await createAvailability(newSlot);
    if (success) {
      setNewSlot({
        day_of_week: 0,
        start_time: '09:00',
        end_time: '10:00',
        is_available: true
      });
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot({
      ...slot,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_available
    });
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    
    // Validar que la hora de fin sea posterior a la de inicio
    if (!validateTimeSlot(editingSlot.start_time, editingSlot.end_time)) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }
    
    // Verificar conflictos de horario (excluyendo el slot actual)
    if (checkTimeConflict(editingSlot.day_of_week, editingSlot.start_time, editingSlot.end_time, editingSlot.id)) {
      setError('Ya existe un horario que se solapa con el horario seleccionado');
      return;
    }
    
    setError(null);
    const { id, ...slotData } = editingSlot;
    const success = await updateAvailability(id, slotData);
    if (success) {
      setEditingSlot(null);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      await deleteAvailability(id);
    }
  };

  const getAvailabilityByDay = (dayId) => {
    return availability.filter(slot => slot.day_of_week === dayId);
  };

  const getDayName = (dayId) => {
    const day = DAYS_OF_WEEK.find(d => d.id === dayId);
    return day ? day.name : '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-white text-lg">Cargando disponibilidad...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Configurar Disponibilidad Semanal</h1>

        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Formulario para agregar nueva disponibilidad */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Agregar Nuevo Horario</h2>
          <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Día</label>
              <select
                value={newSlot.day_of_week}
                onChange={(e) => setNewSlot({...newSlot, day_of_week: parseInt(e.target.value)})}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.id} value={day.id}>{day.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hora Inicio</label>
              <select
                value={newSlot.start_time}
                onChange={(e) => {
                  setNewSlot({...newSlot, start_time: e.target.value});
                  // Limpiar error si se corrige el problema
                  if (error && error.includes('hora de fin')) {
                    setError(null);
                  }
                }}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hora Fin</label>
              <select
                value={newSlot.end_time}
                onChange={(e) => {
                  setNewSlot({...newSlot, end_time: e.target.value});
                  // Limpiar error si se corrige el problema
                  if (error && (error.includes('hora de fin') || error.includes('solapa'))) {
                    setError(null);
                  }
                }}
                className={`w-full p-2 bg-gray-700 border rounded focus:outline-none ${
                  !validateTimeSlot(newSlot.start_time, newSlot.end_time) 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600 focus:border-blue-500'
                }`}
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {!validateTimeSlot(newSlot.start_time, newSlot.end_time) && (
                <p className="text-red-400 text-xs mt-1">La hora de fin debe ser posterior a la de inicio</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!validateTimeSlot(newSlot.start_time, newSlot.end_time)}
                className={`w-full font-semibold py-2 px-4 rounded transition-colors ${
                  validateTimeSlot(newSlot.start_time, newSlot.end_time)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Agregar
              </button>
            </div>
          </form>
        </div>

        {/* Vista semanal de disponibilidad */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map(day => (
            <div key={day.id} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-center mb-4 text-lg">
                {day.name}
              </h3>
              
              <div className="space-y-2">
                {getAvailabilityByDay(day.id).map(slot => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border ${
                      slot.is_available 
                        ? 'bg-green-900 border-green-700' 
                        : 'bg-red-900 border-red-700'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {slot.start_time} - {slot.end_time}
                    </div>
                    <div className="text-xs opacity-75">
                      {slot.is_available ? 'Disponible' : 'No disponible'}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditSlot(slot)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                
                {getAvailabilityByDay(day.id).length === 0 && (
                  <div className="text-gray-400 text-sm text-center py-4">
                    Sin horarios configurados
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal de edición */}
        {editingSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Editar Horario</h3>
              <form onSubmit={handleUpdateSlot} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Día</label>
                  <select
                    value={editingSlot.day_of_week}
                    onChange={(e) => setEditingSlot({...editingSlot, day_of_week: parseInt(e.target.value)})}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hora Inicio</label>
                  <select
                    value={editingSlot.start_time}
                    onChange={(e) => setEditingSlot({...editingSlot, start_time: e.target.value})}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hora Fin</label>
                  <select
                    value={editingSlot.end_time}
                    onChange={(e) => setEditingSlot({...editingSlot, end_time: e.target.value})}
                    className={`w-full p-2 bg-gray-700 border rounded focus:outline-none ${
                      !validateTimeSlot(editingSlot.start_time, editingSlot.end_time) 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-600 focus:border-blue-500'
                    }`}
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {!validateTimeSlot(editingSlot.start_time, editingSlot.end_time) && (
                    <p className="text-red-400 text-xs mt-1">La hora de fin debe ser posterior a la de inicio</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingSlot.is_available}
                      onChange={(e) => setEditingSlot({...editingSlot, is_available: e.target.checked})}
                      className="mr-2"
                    />
                    Disponible
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={!validateTimeSlot(editingSlot.start_time, editingSlot.end_time)}
                    className={`flex-1 font-semibold py-2 px-4 rounded transition-colors ${
                      validateTimeSlot(editingSlot.start_time, editingSlot.end_time)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherAvailability;
