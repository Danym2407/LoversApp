import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTimelineEvents } from '@/lib/eventSync';

export default function TimelinePage({ navigateTo }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setEvents(getTimelineEvents());
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const openEvent = (event) => {
    setSelectedEvent(event);
    setPhotoIndex(0);
  };

  const closeEvent = () => {
    setSelectedEvent(null);
    setPhotoIndex(0);
  };

  const resolvePhotos = () => {
    if (!selectedEvent) return [];

    if (selectedEvent.sourceType === 'date' && selectedEvent.sourceId) {
      const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
      const match = dates.find((item) => Number(item.id) === Number(selectedEvent.sourceId));
      if (match) {
        return [
          ...(match.danielaPhotos || []),
          ...(match.eduardoPhotos || [])
        ];
      }
    }

    if (selectedEvent.image && selectedEvent.image.startsWith('data:image')) {
      return [selectedEvent.image];
    }

    return [];
  };

  const photos = resolvePhotos();
  const hasMultiplePhotos = photos.length > 1;

  const getCoverImage = (event) => {
    if (!event) return null;

    if (event.sourceType === 'date' && event.sourceId) {
      const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
      const match = dates.find((item) => Number(item.id) === Number(event.sourceId));
      if (match) {
        const firstPhoto = (match.danielaPhotos || [])[0] || (match.eduardoPhotos || [])[0];
        if (firstPhoto) return firstPhoto;
      }
    }

    if (event.image && String(event.image).startsWith('data:image')) {
      return event.image;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
          <h1 className="text-3xl font-bold text-black">Línea del Tiempo</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Add Event Button */}
        <button
          onClick={() => navigateTo('moments')}
          className="mb-12 w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl hover:shadow-lg transition font-semibold text-lg"
        >
          <Plus className="w-6 h-6" />
          Agregar Momento
        </button>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-red-500 transform md:-translate-x-1/2"></div>

          {/* Events */}
          {sortedEvents.length > 0 ? (
            <div className="space-y-12">
              {sortedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`flex ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  onClick={() => openEvent(event)}
                >
                  {/* Left/Right Content */}
                  <div className="md:w-1/2 md:px-8 ml-24 md:ml-0">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-yellow-500 hover:shadow-xl transition cursor-pointer">
                      {getCoverImage(event) ? (
                        <img
                          src={getCoverImage(event)}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-xl border-2 border-yellow-500 mb-4"
                        />
                      ) : (
                        <div className="text-4xl mb-3">{event.image}</div>
                      )}
                      <p className="text-sm text-black font-semibold mb-2 bg-yellow-100 px-3 py-1 rounded border border-yellow-600 inline-block">
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <h3 className="text-xl font-bold text-black mb-2">{event.title}</h3>
                      <p className="text-black font-semibold">{event.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-0 md:left-1/2 top-4 w-16 h-16 md:w-12 md:h-12 bg-red-50 rounded-full border-4 border-white shadow-lg flex items-center justify-center transform md:-translate-x-1/2">
                    <div className="w-8 h-8 md:w-6 md:h-6 bg-red-500 rounded-full"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-2xl p-8 text-center">
              <p className="text-lg font-semibold text-black">Aún no hay momentos registrados.</p>
              <p className="text-gray-600 mt-2">Guarda una salida o un momento para verlo aquí.</p>
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeEvent}>
          <div
            className="bg-white rounded-2xl shadow-2xl border-2 border-black max-w-3xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">{selectedEvent.title}</h2>
              <button onClick={closeEvent} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-black font-semibold mb-4 bg-yellow-100 px-3 py-1 rounded border border-yellow-600 inline-block">
              {new Date(selectedEvent.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            {photos.length > 0 ? (
              <div className="relative">
                <img
                  src={photos[photoIndex]}
                  alt={`${selectedEvent.title} ${photoIndex + 1}`}
                  className="w-full h-[420px] object-contain bg-black rounded-xl border-2 border-yellow-500"
                />

                {hasMultiplePhotos && (
                  <>
                    <button
                      onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 border border-black rounded-full p-2 hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 border border-black rounded-full p-2 hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="mt-3 text-center text-sm text-gray-600 font-semibold">
                      Foto {photoIndex + 1} de {photos.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-600 font-semibold">
                No hay fotos para este momento.
              </div>
            )}

            {selectedEvent.description && (
              <p className="mt-4 text-black font-semibold">{selectedEvent.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
