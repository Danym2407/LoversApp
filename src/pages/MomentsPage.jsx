import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Trash2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  upsertCalendarEvent,
  upsertTimelineEvent,
  removeCalendarEventBySource,
  removeTimelineEventBySource
} from '@/lib/eventSync';

export default function MomentsPage({ navigateTo }) {
  const defaultMoments = [
    {
      id: 1,
      date: '2026-01-15',
      title: 'Atardecer Mágico',
      note: 'El mejor atardecer que hemos visto juntos',
      favorite: true,
      image: '🌅'
    },
    {
      id: 2,
      date: '2026-01-10',
      title: 'Café y Conversación',
      note: 'Horas hablando de nuestros sueños',
      favorite: false,
      image: '☕'
    }
  ];

  const [moments, setMoments] = useState([]);
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    note: '',
    image: '✨'
  });
  const { toast } = useToast();

  const syncMomentsToEvents = (items) => {
    items.forEach((moment) => {
      if (!moment?.id) return;
      upsertCalendarEvent({
        title: `Momento: ${moment.title}`,
        description: moment.note || 'Momento guardado',
        dateStr: moment.date,
        sourceType: 'moment',
        sourceId: moment.id
      });
      upsertTimelineEvent({
        title: moment.title,
        description: moment.note || 'Momento guardado',
        dateStr: moment.date,
        image: moment.image || '✨',
        sourceType: 'moment',
        sourceId: moment.id
      });
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('momentsEntries');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMoments(parsed);
      syncMomentsToEvents(parsed);
    } else {
      setMoments(defaultMoments);
      localStorage.setItem('momentsEntries', JSON.stringify(defaultMoments));
      syncMomentsToEvents(defaultMoments);
    }
  }, []);

  const toggleFavorite = (id) => {
    const updated = moments.map((moment) =>
      moment.id === id ? { ...moment, favorite: !moment.favorite } : moment
    );
    setMoments(updated);
    localStorage.setItem('momentsEntries', JSON.stringify(updated));
    if (selectedMoment?.id === id) {
      const refreshed = updated.find((moment) => moment.id === id);
      setSelectedMoment(refreshed || null);
    }
  };

  const handleSaveMoment = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) {
      toast({
        title: 'Faltan datos',
        description: 'Agrega título y fecha para el momento.'
      });
      return;
    }

    const newMoment = {
      id: Date.now(),
      date: formData.date,
      title: formData.title.trim(),
      note: formData.note.trim(),
      favorite: false,
      image: formData.image.trim() || '✨'
    };

    const updated = [newMoment, ...moments];
    setMoments(updated);
    localStorage.setItem('momentsEntries', JSON.stringify(updated));

    upsertCalendarEvent({
      title: `Momento: ${newMoment.title}`,
      description: newMoment.note || 'Momento guardado',
      dateStr: newMoment.date,
      sourceType: 'moment',
      sourceId: newMoment.id
    });
    upsertTimelineEvent({
      title: newMoment.title,
      description: newMoment.note || 'Momento guardado',
      dateStr: newMoment.date,
      image: newMoment.image || '✨',
      sourceType: 'moment',
      sourceId: newMoment.id
    });

    setShowModal(false);
    setFormData({ title: '', date: '', note: '', image: '✨' });
    toast({
      title: 'Momento guardado',
      description: 'Se agregó al calendario y a la línea del tiempo.'
    });
  };

  const handleDeleteMoment = (id) => {
    const updated = moments.filter((moment) => moment.id !== id);
    setMoments(updated);
    localStorage.setItem('momentsEntries', JSON.stringify(updated));
    removeCalendarEventBySource('moment', id);
    removeTimelineEventBySource('moment', id);
    if (selectedMoment?.id === id) {
      setSelectedMoment(null);
    }
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
          <h1 className="text-3xl font-bold text-black">Momentos Favoritos</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl hover:shadow-lg transition font-semibold text-lg"
        >
          <Plus className="w-6 h-6" />
          Guardar Momento
        </button>

        {!selectedMoment ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moments.map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMoment(moment)}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer hover:scale-105 transform border-2 border-yellow-500"
              >
                {/* Image Area */}
                <div className="bg-yellow-100 h-40 flex items-center justify-center text-6xl border-b-2 border-yellow-500">
                  {moment.image}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-black">{moment.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(moment.id);
                      }}
                      className={`transition ${moment.favorite ? 'text-red-500' : 'text-gray-300'}`}
                    >
                      <Heart className="w-5 h-5" fill="currentColor" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    {new Date(moment.date).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-black font-semibold line-clamp-2">{moment.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Detail View */
          <div className="bg-white rounded-2xl shadow-lg border-2 border-black overflow-hidden">
            <button
              onClick={() => setSelectedMoment(null)}
              className="m-4 text-black font-semibold flex items-center gap-2 hover:text-red-500"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </button>

            <div className="px-8 pb-8">
              {/* Image */}
              <div className="bg-yellow-100 rounded-2xl h-64 flex items-center justify-center text-8xl mb-6 border-2 border-yellow-500">
                {selectedMoment.image}
              </div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-black">{selectedMoment.title}</h2>
                  <p className="text-black font-semibold mt-2 bg-yellow-100 px-3 py-1 rounded border border-yellow-600 inline-block">
                    {new Date(selectedMoment.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => toggleFavorite(selectedMoment.id)}
                  className={`p-3 rounded-full transition ${
                    selectedMoment.favorite
                      ? 'bg-red-100 text-red-500 border border-red-500'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Heart className="w-6 h-6" fill="currentColor" />
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6 border-2 border-yellow-500">
                <p className="text-black leading-relaxed font-semibold">{selectedMoment.note}</p>
              </div>

              <button
                onClick={() => handleDeleteMoment(selectedMoment.id)}
                className="w-full px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold flex items-center justify-center gap-2 border border-red-500"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-black max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Guardar momento</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMoment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg"
                  placeholder="Ej: Noche especial"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Emoji/Imagen</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg"
                  placeholder="Ej: 🌅"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Nota</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg min-h-[120px]"
                  placeholder="¿Qué pasó en este momento?"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
