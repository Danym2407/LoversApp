import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

export default function CalendarPage({ navigateTo }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 22));
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventPhoto, setEventPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const { toast } = useToast();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Cargar eventos del localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Manejar selección de foto
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventPhoto(reader.result);
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Abrir modal para agregar evento
  const openEventModal = (day) => {
    setSelectedDate(day);
    setEventTitle('');
    setEventDescription('');
    setEventPhoto(null);
    setPhotoPreview(null);
    setShowModal(true);
  };

  // Guardar evento
  const handleSaveEvent = (e) => {
    e.preventDefault();
    
    if (!eventTitle.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un título para el evento"
      });
      return;
    }

    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedDate}`;
    const newEvent = {
      id: Date.now(),
      dateKey,
      date: selectedDate,
      title: eventTitle,
      description: eventDescription,
      photo: eventPhoto,
      createdAt: new Date().toISOString()
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
    
    setShowModal(false);
    toast({
      title: "Evento agregado",
      description: `Se agregó "${eventTitle}" al ${selectedDate} de ${monthName}`
    });
  };

  // Obtener eventos de un día específico
  const getEventsForDay = (day) => {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return events.filter(event => event.dateKey === dateKey);
  };

  const getEventPhotos = (event) => {
    if (!event) return [];

    if (event.sourceType === 'date' && event.sourceId) {
      const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
      const match = dates.find((item) => Number(item.id) === Number(event.sourceId));
      if (match) {
        return [
          ...(match.danielaPhotos || []),
          ...(match.eduardoPhotos || [])
        ];
      }
    }

    if (event.photo) return [event.photo];
    return [];
  };

  const openEventDetails = (event) => {
    setSelectedEventDetails(event);
    setPhotoIndex(0);
  };

  const closeEventDetails = () => {
    setSelectedEventDetails(null);
    setPhotoIndex(0);
  };

  // Eliminar evento
  const deleteEvent = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
    toast({
      title: "Evento eliminado",
      description: "El evento ha sido removido del calendario"
    });
  };

  // Filtrar y ordenar eventos
  const getFilteredAndSortedEvents = () => {
    let filtered = [...events];

    // Filtrar por mes
    if (filterMonth !== 'all') {
      filtered = filtered.filter(event => {
        const eventMonth = parseInt(event.dateKey.split('-')[1]);
        return eventMonth === parseInt(filterMonth);
      });
    }

    // Filtrar por año
    if (filterYear !== 'all') {
      filtered = filtered.filter(event => {
        const eventYear = parseInt(event.dateKey.split('-')[0]);
        return eventYear === parseInt(filterYear);
      });
    }

    // Ordenar
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return filtered;
  };

  // Obtener años únicos de eventos
  const getUniqueYears = () => {
    const years = events.map(e => parseInt(e.dateKey.split('-')[0]));
    return [...new Set(years)].sort((a, b) => b - a);
  };

  // Obtener meses únicos de eventos
  const getUniqueMonths = () => {
    const months = events.map(e => parseInt(e.dateKey.split('-')[1]));
    return [...new Set(months)].sort((a, b) => a - b);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-black">
        <div className="px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
          <h1 className="text-3xl font-bold text-black">Calendario</h1>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Calendar Section */}
        <div className="flex-1 overflow-y-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-black max-w-2xl mx-auto">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-8 gap-4">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                ← Anterior
              </button>

              {/* Month and Year Selectors */}
              <div className="flex gap-2 items-center">
                <select
                  value={currentDate.getMonth()}
                  onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                  className="px-4 py-2 bg-white border-2 border-black rounded-lg font-semibold text-black hover:bg-gray-100 transition cursor-pointer"
                >
                  {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
                
                <select
                  value={currentDate.getFullYear()}
                  onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                  className="px-4 py-2 bg-white border-2 border-black rounded-lg font-semibold text-black hover:bg-gray-100 transition cursor-pointer"
                >
                  {Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                Siguiente →
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                <div key={day} className="text-center font-bold text-black text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const hasBirthday = dayEvents.some((event) =>
                  event?.title?.toLowerCase().includes('cumpleaños')
                );
                return (
                  <motion.div
                    key={index}
                    whileHover={day ? { scale: 1.05 } : {}}
                    onClick={() => {
                      if (day) {
                        if (dayEvents.length > 0) {
                          // Si hay eventos, mostrar ficha de detalles
                          setSelectedDayDetails(day);
                        } else {
                          // Si no hay eventos, abrir modal para crear
                          openEventModal(day);
                        }
                      }
                    }}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center font-bold transition cursor-pointer overflow-hidden relative group ${
                      day === null
                        ? 'bg-gray-100 border-gray-300 cursor-default'
                        : dayEvents.length > 0
                        ? 'bg-red-50 border-red-500 hover:bg-red-100'
                        : 'bg-white border-black hover:bg-yellow-100 hover:border-red-500'
                    }`}
                  >
                    {day && (
                      <>
                        <span className="text-lg text-black">{day}</span>
                        {hasBirthday && (
                          <span className="absolute top-1 right-1 text-base">🥳</span>
                        )}
                        {dayEvents.length > 0 && (
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full mt-1">
                            {dayEvents.length}
                          </span>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/5 transition" />
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Events List */}
        <div className="w-96 bg-white border-l-2 border-black p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            <Filter className="w-6 h-6" />
            Eventos
          </h2>

          {/* Filters */}
          <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-300">
            {/* Sort Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">
                Ordenar por Antigüedad
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg font-semibold text-black hover:bg-gray-100 transition cursor-pointer text-sm"
              >
                <option value="newest">Más Recientes</option>
                <option value="oldest">Más Antiguos</option>
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">
                Filtrar por Mes
              </label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg font-semibold text-black hover:bg-gray-100 transition cursor-pointer text-sm"
              >
                <option value="all">Todos los Meses</option>
                {getUniqueMonths().map(month => (
                  <option key={month} value={month}>
                    {monthNames[month]}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">
                Filtrar por Año
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg font-semibold text-black hover:bg-gray-100 transition cursor-pointer text-sm"
              >
                <option value="all">Todos los Años</option>
                {getUniqueYears().map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Events Count */}
          <p className="text-sm text-gray-600 mb-4 font-semibold">
            Total de eventos: <span className="text-red-500 font-black">{getFilteredAndSortedEvents().length}</span>
          </p>

          {/* Events List */}
          <div className="space-y-3">
            {getFilteredAndSortedEvents().length > 0 ? (
              getFilteredAndSortedEvents().map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-500 rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                  onClick={() => {
                    const [year, month, day] = event.dateKey.split('-').map(Number);
                    setCurrentDate(new Date(year, month, 1));
                    setSelectedDayDetails(day);
                  }}
                >
                  {event.photo && (
                    <img
                      src={event.photo}
                      alt={event.title}
                      className="w-full h-20 object-cover rounded-lg mb-2"
                    />
                  )}
                  <p className="text-xs text-gray-600 mb-1">
                    {event.date} de {monthNames[parseInt(event.dateKey.split('-')[1])]} {event.dateKey.split('-')[0]}
                  </p>
                  <h4 className="font-bold text-black text-sm mb-1">{event.title}</h4>
                  {event.description && (
                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">{event.description}</p>
                  )}
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="w-full py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition font-semibold"
                  >
                    Eliminar
                  </button>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay eventos con estos filtros
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ficha de detalles del día */}
      {selectedDayDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDayDetails(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full border-2 border-black max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-black">
                {selectedDayDetails} de {monthName}
              </h2>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Eventos del día */}
            <div className="space-y-4">
              {getEventsForDay(selectedDayDetails).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-red-500 rounded-xl overflow-hidden bg-gradient-to-br from-red-50 to-white"
                >
                  {/* Foto del evento */}
                  {event.photo && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.photo}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Contenido del evento */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-black mb-2">{event.title}</h3>
                    
                    {event.description && (
                      <p className="text-gray-700 mb-4 text-base leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {getEventPhotos(event).length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEventDetails(event);
                        }}
                        className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
                      >
                        Ver galería
                      </button>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <span className="font-semibold">Creado:</span>
                      <span>
                        {new Date(event.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedDayDetails(null);
                          openEventModal(selectedDayDetails);
                        }}
                        className="flex-1 py-2 px-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-semibold border-2 border-black"
                      >
                        Agregar otro evento
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="py-2 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold border-2 border-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Botón para cerrar */}
            <div className="mt-6">
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold text-lg"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {selectedEventDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeEventDetails}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full border-2 border-black"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">{selectedEventDetails.title}</h2>
              <button
                onClick={closeEventDetails}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedEventDetails.description && (
              <p className="text-gray-700 mb-4 text-base leading-relaxed">
                {selectedEventDetails.description}
              </p>
            )}

            {getEventPhotos(selectedEventDetails).length > 0 ? (
              <div className="relative">
                <img
                  src={getEventPhotos(selectedEventDetails)[photoIndex]}
                  alt={`${selectedEventDetails.title} ${photoIndex + 1}`}
                  className="w-full h-[420px] object-contain bg-black rounded-xl border-2 border-yellow-500"
                />

                {getEventPhotos(selectedEventDetails).length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIndex((photoIndex - 1 + getEventPhotos(selectedEventDetails).length) % getEventPhotos(selectedEventDetails).length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 border border-black rounded-full p-2 hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPhotoIndex((photoIndex + 1) % getEventPhotos(selectedEventDetails).length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 border border-black rounded-full p-2 hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="mt-3 text-center text-sm text-gray-600 font-semibold">
                      Foto {photoIndex + 1} de {getEventPhotos(selectedEventDetails).length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-600 font-semibold">
                No hay fotos para este evento.
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Modal para agregar evento */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-black"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                Evento - {selectedDate} de {monthName}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Título del evento
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ej: Cita especial"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Detalles del evento..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition resize-none h-20"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Foto (opcional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="photo-input"
                  />
                  <label
                    htmlFor="photo-input"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {photoPreview ? 'Cambiar foto' : 'Seleccionar foto'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Photo Preview */}
              {photoPreview && (
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-300">
                  <img src={photoPreview} alt="preview" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setEventPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
