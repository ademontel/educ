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

function StudentCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tutorships, setTutorships] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [newTutorship, setNewTutorship] = useState({
    professor_id: '',
    subject_id: '',
    start_time: '',
    end_time: '',
    price_usdt: 0
  });

  // Cargar tutorías del mes actual
  useEffect(() => {
    if (user && user.id) {
      loadTutorships();
      loadTeachersAndSubjects();
    }
  }, [currentDate, user]);

  const loadTutorships = async () => {
    if (!user || !user.id) {
      console.error('Usuario no disponible');
      setError('Usuario no autenticado');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Cargando tutorías para usuario:', user.id);
      
      // Obtener tutorías del estudiante
      const response = await fetch(`${API_URL}/students/${user.id}/tutorships`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No se encontraron tutorías');
          setTutorships([]);
          return;
        }
        if (response.status === 500) {
          console.log('Error interno del servidor - usando datos vacíos');
          setTutorships([]);
          setError('El servidor está reiniciando. Por favor, recarga la página en unos momentos.');
          return;
        }
        const errorData = await response.text();
        console.error('Error del servidor:', errorData);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Tutorías cargadas:', data);
      setTutorships(data);
    } catch (error) {
      console.error('Error loading tutorships:', error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('No se puede conectar al servidor. Verifica tu conexión o intenta recargar la página.');
      } else {
        setError(error.message);
      }
      // En caso de error, al menos mostrar interfaz vacía
      setTutorships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeachersAndSubjects = async () => {
    try {
      console.log('Cargando profesores y materias...');
      
      // Cargar profesores
      const teachersResponse = await fetch(`${API_URL}/teachers`, {
        credentials: 'include'
      });
      
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        console.log('Profesores cargados:', teachersData.length);
        setTeachers(teachersData);
      } else {
        console.error('Error cargando profesores:', teachersResponse.status);
      }

      // Cargar materias
      const subjectsResponse = await fetch(`${API_URL}/subjects`, {
        credentials: 'include'
      });
      
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        console.log('Materias cargadas:', subjectsData.length);
        setSubjects(subjectsData);
      } else {
        console.error('Error cargando materias:', subjectsResponse.status);
      }
    } catch (error) {
      console.error('Error loading teachers and subjects:', error);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    return tutorships.filter(tutorship => {
      if (!tutorship.start_time) return false;
      const tutorshipDate = new Date(tutorship.start_time).toISOString().split('T')[0];
      return tutorshipDate === dateStr;
    });
  };

  const getEventsForWeek = (startDate) => {
    const events = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      events.push(...getEventsForDate(date));
    }
    return events;
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'active':
        return 'bg-green-500';
      case 'finished':
        return 'bg-gray-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'active':
        return 'Activa';
      case 'finished':
        return 'Finalizada';
      case 'canceled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const createTutorship = async (tutorshipData) => {
    try {
      const response = await fetch(`${API_URL}/tutorships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...tutorshipData,
          student_id: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear tutoría');
      }

      const newTutorship = await response.json();
      setTutorships(prev => [...prev, newTutorship]);
      return true;
    } catch (error) {
      console.error('Error creating tutorship:', error);
      setError(error.message);
      return false;
    }
  };

  const handleCreateTutorship = async () => {
    const success = await createTutorship(newTutorship);
    if (success) {
      setShowCreateModal(false);
      setNewTutorship({
        professor_id: '',
        subject_id: '',
        start_time: '',
        end_time: '',
        price_usdt: 0
      });
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    setNewTutorship(prev => ({
      ...prev,
      start_time: `${dateStr}T14:00:00`,
      end_time: `${dateStr}T15:00:00`
    }));
    setShowCreateModal(true);
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const calendar = [];
    let day = 1;

    // Crear las semanas del mes
    for (let week = 0; week < 6; week++) {
      const weekRow = [];
      
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        if (week === 0 && dayOfWeek < firstDayOfWeek) {
          weekRow.push(null);
        } else if (day > daysInMonth) {
          weekRow.push(null);
        } else {
          weekRow.push(day);
          day++;
        }
      }
      
      calendar.push(weekRow);
      
      if (day > daysInMonth) break;
    }

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border-b">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-0">
          {calendar.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              const date = day ? new Date(year, month, day) : null;
              const events = date ? getEventsForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`min-h-[100px] p-2 border-b border-r border-gray-200 cursor-pointer ${
                    day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                  } ${isToday ? 'bg-blue-50' : ''}`}
                  onClick={() => date && handleDateClick(date)}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day}
                        <button
                          className="ml-2 text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDateClick(date);
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div className="space-y-1">
                        {events.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded cursor-pointer text-white ${getStatusColor(event.status)}`}
                            onClick={() => handleEventClick(event)}
                          >
                            {formatTime(event.start_time)} - {event.subject?.name || 'Tutoría'}
                          </div>
                        ))}
                        {events.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{events.length - 3} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    const events = getEventsForWeek(startOfWeek);

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-0 border-b">
          <div className="p-3 bg-gray-50"></div>
          {weekDays.map((date, index) => (
            <div key={index} className="p-3 text-center bg-gray-50">
              <div className="font-semibold text-gray-700">{DAYS_OF_WEEK[index]}</div>
              <div className={`text-sm ${date.toDateString() === new Date().toDateString() ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-8 gap-0">
          {TIME_SLOTS.map((time) => (
            <React.Fragment key={time}>
              <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b border-r">
                {time}
              </div>
              {weekDays.map((date, dayIndex) => {
                const dayEvents = events.filter(event => {
                  if (!event.start_time) return false;
                  const eventDate = new Date(event.start_time);
                  const eventTime = eventDate.toTimeString().slice(0, 5);
                  return eventDate.toDateString() === date.toDateString() && eventTime === time;
                });
                
                return (
                  <div key={dayIndex} className="p-1 border-b border-r border-gray-200 min-h-[40px]">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer text-white ${getStatusColor(event.status)}`}
                        onClick={() => handleEventClick(event)}
                      >
                        {event.subject?.name || 'Tutoría'}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const events = getEventsForDate(currentDate);
    
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-900">
            {formatDate(currentDate)}
          </h3>
        </div>
        
        <div className="p-4">
          {events.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay tutorías programadas para este día
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {event.subject?.name || 'Tutoría'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Profesor: {event.professor?.user?.name || 'No especificado'}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(event.status)}`}>
                      {getStatusText(selectedEvent.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Cargando calendario...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">📅 Mi Calendario</h2>
              <p className="text-gray-300 text-sm">
                Aquí puedes ver todas tus tutorías programadas
              </p>
            </div>

            {/* Controles de vista */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Vista</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setView('month')}
                  className={`w-full p-2 rounded text-left ${
                    view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Mes
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`w-full p-2 rounded text-left ${
                    view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setView('day')}
                  className={`w-full p-2 rounded text-left ${
                    view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Día
                </button>
              </div>
            </div>

            {/* Crear nueva tutoría */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
              >
                <span className="mr-2">+</span>
                Nueva Tutoría
              </button>
            </div>

            {/* Leyenda */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Estados</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-sm">Pendiente</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-sm">Activa</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
                  <span className="text-sm">Finalizada</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-sm">Cancelada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Controles de navegación */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      if (view === 'month') navigateMonth(-1);
                      else if (view === 'week') navigateWeek(-1);
                      else navigateDay(-1);
                    }}
                    className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    ←
                  </button>
                  <h2 className="text-xl font-bold">
                    {view === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                    {view === 'week' && `Semana del ${formatDate(currentDate)}`}
                    {view === 'day' && formatDate(currentDate)}
                  </h2>
                  <button
                    onClick={() => {
                      if (view === 'month') navigateMonth(1);
                      else if (view === 'week') navigateWeek(1);
                      else navigateDay(1);
                    }}
                    className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    →
                  </button>
                </div>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Hoy
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setError(null);
                        loadTutorships();
                      }}
                      className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Reintentar
                    </button>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-100 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Calendario */}
            <div className="mb-6">
              {view === 'month' && renderMonthView()}
              {view === 'week' && renderWeekView()}
              {view === 'day' && renderDayView()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles del evento */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Detalles de la Tutoría
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Materia</label>
                <div className="text-gray-900">{selectedEvent.subject?.name || 'No especificada'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Profesor</label>
                <div className="text-gray-900">{selectedEvent.professor?.user?.name || 'No especificado'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                <div className="text-gray-900">
                  {formatDate(selectedEvent.start_time)}
                  <br />
                  {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(selectedEvent.status)}`}>
                  {getStatusText(selectedEvent.status)}
                </div>
              </div>
              
              {selectedEvent.price_usdt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <div className="text-gray-900">${selectedEvent.price_usdt} USDT</div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeEventModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear tutoría */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Crear Tutoría
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Materia</label>
                <select
                  value={newTutorship.subject_id}
                  onChange={(e) => setNewTutorship({ ...newTutorship, subject_id: e.target.value })}
                  className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Seleccionar materia</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Profesor</label>
                <select
                  value={newTutorship.professor_id}
                  onChange={(e) => setNewTutorship({ ...newTutorship, professor_id: e.target.value })}
                  className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Seleccionar profesor</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newTutorship.start_time.split('T')[0]}
                    onChange={(e) => {
                      const dateStr = e.target.value;
                      setNewTutorship(prev => ({
                        ...prev,
                        start_time: `${dateStr}T${prev.start_time.split('T')[1]}`,
                        end_time: `${dateStr}T${prev.end_time.split('T')[1]}`
                      }));
                    }}
                    className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={newTutorship.start_time.split('T')[1].substring(0, 5)}
                    onChange={(e) => {
                      const timeStr = e.target.value;
                      setNewTutorship(prev => ({
                        ...prev,
                        start_time: `${prev.start_time.split('T')[0]}T${timeStr}:00`,
                        end_time: `${prev.end_time.split('T')[0]}T${timeStr}:00`
                      }));
                    }}
                    className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio (USDT)</label>
                <input
                  type="number"
                  value={newTutorship.price_usdt}
                  onChange={(e) => setNewTutorship({ ...newTutorship, price_usdt: e.target.value })}
                  className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTutorship}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Crear Tutoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentCalendar;
