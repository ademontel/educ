import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

function TeacherCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [tutorships, setTutorships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    is_blocked: false
  });

  // Cargar eventos y tutorías del mes actual
  useEffect(() => {
    loadScheduleAndTutorships();
  }, [currentDate]);

  const loadScheduleAndTutorships = async () => {
    try {
      setIsLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Cargar schedule de eventos
      const scheduleResponse = await fetch(
        `${API_URL}/teachers/${user.id}/schedule?start_date=${startDateStr}&end_date=${endDateStr}`,
        { credentials: 'include' }
      );

      // Cargar tutorías
      const tutorshipsResponse = await fetch(
        `${API_URL}/teachers/${user.id}/tutorships`,
        { credentials: 'include' }
      );

      if (!scheduleResponse.ok || !tutorshipsResponse.ok) {
        throw new Error('Error al cargar calendario');
      }

      const scheduleData = await scheduleResponse.json();
      const tutorshipsData = await tutorshipsResponse.json();

      // Filtrar tutorías del mes actual y que estén confirmadas
      const filteredTutorships = tutorshipsData.filter(tutorship => {
        if (tutorship.status !== 'confirmed') return false;
        
        const tutorshipDate = new Date(tutorship.start_datetime || tutorship.scheduled_datetime);
        return tutorshipDate >= startDate && tutorshipDate <= endDate;
      });

      setSchedule(scheduleData);
      setTutorships(filteredTutorships);
    } catch (error) {
      console.error('Error loading schedule and tutorships:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch(`${API_URL}/teachers/${user.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear evento');
      }

      const newEvent = await response.json();
      setSchedule(prev => [...prev, newEvent]);
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.message);
      return false;
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const response = await fetch(`${API_URL}/teachers/${user.id}/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar evento');
      }

      const updatedEvent = await response.json();
      setSchedule(prev => prev.map(event => event.id === id ? updatedEvent : event));
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error.message);
      return false;
    }
  };

  const deleteEvent = async (id) => {
    try {
      const response = await fetch(`${API_URL}/teachers/${user.id}/schedule/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar evento');
      }

      setSchedule(prev => prev.filter(event => event.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.message);
      return false;
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior (para completar la primera semana)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDay(date);
      days.push({
        date,
        isCurrentMonth: true,
        events: dayEvents
      });
    }
    
    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas x 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: []
      });
    }
    
    return days;
  };

  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Obtener eventos del schedule
    const scheduleEvents = schedule.filter(event => {
      const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
    
    // Obtener tutorías confirmadas
    const tutorshipEvents = tutorships.filter(tutorship => {
      const tutorshipDate = new Date(tutorship.start_datetime || tutorship.scheduled_datetime).toISOString().split('T')[0];
      return tutorshipDate === dateStr;
    }).map(tutorship => ({
      id: `tutorship-${tutorship.id}`,
      title: `Tutoría: ${tutorship.subject?.name || 'Sin materia'}`,
      description: `Estudiante: ${tutorship.student?.first_name} ${tutorship.student?.last_name}`,
      start_datetime: tutorship.start_datetime || tutorship.scheduled_datetime,
      end_datetime: tutorship.end_datetime || tutorship.scheduled_datetime,
      event_type: 'tutoring',
      is_tutorship: true,
      tutorship_data: tutorship
    }));
    
    return [...scheduleEvents, ...tutorshipEvents];
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDayClick = (day) => {
    if (!day.isCurrentMonth) return;
    
    // Bloquear fechas anteriores a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    const selectedDate = new Date(day.date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('No se pueden crear eventos en fechas pasadas');
      return;
    }
    
    setSelectedDate(day.date);
    setShowEventModal(true);
    setEditingEvent(null);
    setNewEvent({
      title: '',
      description: '',
      start_datetime: formatDateTimeLocal(day.date, '09:00'),
      end_datetime: formatDateTimeLocal(day.date, '10:00'),
      is_blocked: false
    });
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    
    // Si es una tutoría, mostrar información pero no permitir edición
    if (event.is_tutorship) {
      const tutorship = event.tutorship_data;
      alert(`TUTORÍA CONFIRMADA
      
Materia: ${tutorship.subject?.name || 'Sin materia'}
Estudiante: ${tutorship.student?.first_name} ${tutorship.student?.last_name}
Email: ${tutorship.student?.email}
Fecha: ${new Date(event.start_datetime).toLocaleDateString('es-ES')}
Hora: ${new Date(event.start_datetime).toLocaleTimeString('es-ES', { 
  hour: '2-digit', 
  minute: '2-digit' 
})}

Las tutorías se gestionan desde la sección "Mis Tutorías"`);
      return;
    }
    
    // Para eventos normales, permitir edición
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      start_datetime: formatDateTimeLocal(new Date(event.start_datetime)),
      end_datetime: formatDateTimeLocal(new Date(event.end_datetime)),
      is_blocked: event.is_blocked
    });
    setShowEventModal(true);
  };

  const formatDateTimeLocal = (date, time = null) => {
    const d = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':');
      d.setHours(parseInt(hours), parseInt(minutes));
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validateEvent = () => {
    if (!newEvent.title.trim()) {
      setError('El título es obligatorio');
      return false;
    }
    
    const startDate = new Date(newEvent.start_datetime);
    const endDate = new Date(newEvent.end_datetime);
    const now = new Date();
    
    // Verificar que la fecha de inicio no sea en el pasado (excepto si estamos editando)
    if (!editingEvent && startDate < now) {
      setError('No se pueden crear eventos en fechas pasadas');
      return false;
    }
    
    if (endDate <= startDate) {
      setError('La fecha de fin debe ser posterior a la de inicio');
      return false;
    }
    
    return true;
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    
    if (!validateEvent()) return;
    
    setError(null);
    
    const eventData = {
      ...newEvent,
      start_datetime: new Date(newEvent.start_datetime).toISOString(),
      end_datetime: new Date(newEvent.end_datetime).toISOString()
    };
    
    let success;
    if (editingEvent) {
      success = await updateEvent(editingEvent.id, eventData);
    } else {
      success = await createEvent(eventData);
    }
    
    if (success) {
      setShowEventModal(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        description: '',
        start_datetime: '',
        end_datetime: '',
        is_blocked: false
      });
      // Refrescar eventos y tutorías
      loadScheduleAndTutorships();
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      const success = await deleteEvent(editingEvent.id);
      if (success) {
        setShowEventModal(false);
        setEditingEvent(null);
        setNewEvent({
          title: '',
          description: '',
          start_datetime: '',
          end_datetime: '',
          is_blocked: false
        });
        // Refrescar eventos y tutorías
        loadScheduleAndTutorships();
      }
    }
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-white text-lg">Cargando calendario...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mi Calendario</h1>

        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Navegación del calendario */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              ← Anterior
            </button>
            
            <h2 className="text-2xl font-semibold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth(1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Leyenda de tipos de eventos */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Leyenda</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-600"></div>
              <span className="text-sm">Tutorías</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600"></div>
              <span className="text-sm">Clases</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span className="text-sm">Reuniones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-600"></div>
              <span className="text-sm">Personal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <span className="text-sm">Bloqueos</span>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Cabecera de días de la semana */}
          <div className="grid grid-cols-7 bg-gray-700">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="p-4 text-center font-semibold border-r border-gray-600 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7">
            {getDaysInMonth().map((day, index) => {
              const isPast = isPastDate(day.date);
              const isCurrentMonth = day.isCurrentMonth;
              const todayDate = isToday(day.date);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-600 last:border-r-0 transition-colors ${
                    !isCurrentMonth ? 'bg-gray-800 opacity-50' : ''
                  } ${
                    todayDate ? 'bg-blue-900' : ''
                  } ${
                    isPast && isCurrentMonth 
                      ? 'bg-gray-700 opacity-60 cursor-not-allowed' 
                      : 'cursor-pointer hover:bg-gray-700'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    !isCurrentMonth ? 'text-gray-500' : 
                    isPast ? 'text-gray-400' :
                    todayDate ? 'text-blue-300' : 'text-white'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {day.events.slice(0, 3).map(event => {
                      let bgColor = 'bg-green-600 hover:bg-green-700'; // Default
                      
                      if (event.is_tutorship) {
                        bgColor = 'bg-orange-600 hover:bg-orange-700'; // Tutorías en naranja
                      } else if (event.is_blocked) {
                        bgColor = 'bg-red-600 hover:bg-red-700'; // Bloqueos en rojo
                      } else if (event.event_type === 'class') {
                        bgColor = 'bg-blue-600 hover:bg-blue-700'; // Clases en azul
                      } else if (event.event_type === 'meeting') {
                        bgColor = 'bg-green-600 hover:bg-green-700'; // Reuniones en verde
                      } else if (event.event_type === 'personal') {
                        bgColor = 'bg-purple-600 hover:bg-purple-700'; // Personal en morado
                      }
                      
                      // Si es una fecha pasada, atenuar los colores
                      if (isPast) {
                        bgColor = bgColor.replace('600', '500').replace('700', '600') + ' opacity-70';
                      }
                      
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => handleEventClick(event, e)}
                          className={`text-xs p-1 rounded cursor-pointer truncate ${bgColor}`}
                          title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}
                        >
                          {new Date(event.start_datetime).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} {event.title}
                        </div>
                      );
                    })}
                    {day.events.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{day.events.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de evento */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              
              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Título del evento"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none h-20"
                    placeholder="Descripción del evento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha y hora de inicio *</label>
                  <input
                    type="datetime-local"
                    value={newEvent.start_datetime}
                    onChange={(e) => setNewEvent({...newEvent, start_datetime: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)} // Bloquear fechas pasadas
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha y hora de fin *</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end_datetime}
                    onChange={(e) => setNewEvent({...newEvent, end_datetime: e.target.value})}
                    min={newEvent.start_datetime || new Date().toISOString().slice(0, 16)} // Bloquear fechas pasadas y anteriores a inicio
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newEvent.is_blocked}
                      onChange={(e) => setNewEvent({...newEvent, is_blocked: e.target.checked})}
                      className="mr-2"
                    />
                    Bloquear tiempo (no disponible para nuevas citas)
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    {editingEvent ? 'Actualizar' : 'Crear'}
                  </button>
                  
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={handleDeleteEvent}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                      setError(null);
                      setNewEvent({
                        title: '',
                        description: '',
                        start_datetime: '',
                        end_datetime: '',
                        is_blocked: false
                      });
                    }}
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

export default TeacherCalendar;
