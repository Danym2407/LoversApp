import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, MapPin, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  upsertCalendarEvent,
  upsertTimelineEvent,
  removeCalendarEventBySource,
  removeTimelineEventBySource
} from '@/lib/eventSync';

export default function RegistryPage({ navigateTo }) {
  const defaultLocations = [
    { id: 1, name: 'Restaurante Downtown', date: '2025-12-20', category: 'Comida', rating: 5 },
    { id: 2, name: 'Cine Auditorio', date: '2025-12-15', category: 'Películas', rating: 4 }
  ];

  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    category: 'Comida',
    rating: 4
  });
  const { toast } = useToast();

  const categories = ['Comida', 'Películas', 'Parque', 'Playa', 'Viaje', 'Compras', 'Otro'];

  const syncLocationsToEvents = (items) => {
    items.forEach((location) => {
      if (!location?.id) return;
      upsertCalendarEvent({
        title: `Salida: ${location.name}`,
        description: location.category ? `Categoría: ${location.category}` : 'Salida registrada',
        dateStr: location.date,
        sourceType: 'registry',
        sourceId: location.id
      });
      upsertTimelineEvent({
        title: location.name,
        description: location.category ? `Salida · ${location.category}` : 'Salida registrada',
        dateStr: location.date,
        image: '📍',
        sourceType: 'registry',
        sourceId: location.id
      });
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('registryLocations');
    if (saved) {
      const parsed = JSON.parse(saved);
      setLocations(parsed);
      syncLocationsToEvents(parsed);
    } else {
      setLocations(defaultLocations);
      localStorage.setItem('registryLocations', JSON.stringify(defaultLocations));
      syncLocationsToEvents(defaultLocations);
    }
  }, []);

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date) {
      toast({
        title: 'Faltan datos',
        description: 'Agrega nombre y fecha para la salida.'
      });
      return;
    }

    const newLocation = {
      id: Date.now(),
      name: formData.name.trim(),
      date: formData.date,
      category: formData.category,
      rating: Number(formData.rating) || 0
    };

    const updated = [newLocation, ...locations];
    setLocations(updated);
    localStorage.setItem('registryLocations', JSON.stringify(updated));

    upsertCalendarEvent({
      title: `Salida: ${newLocation.name}`,
      description: newLocation.category ? `Categoría: ${newLocation.category}` : 'Salida registrada',
      dateStr: newLocation.date,
      sourceType: 'registry',
      sourceId: newLocation.id
    });
    upsertTimelineEvent({
      title: newLocation.name,
      description: newLocation.category ? `Salida · ${newLocation.category}` : 'Salida registrada',
      dateStr: newLocation.date,
      image: '📍',
      sourceType: 'registry',
      sourceId: newLocation.id
    });

    setShowModal(false);
    setFormData({ name: '', date: '', category: 'Comida', rating: 4 });
    toast({
      title: 'Salida registrada',
      description: 'Se agregó al calendario y a la línea del tiempo.'
    });
  };

  const handleDeleteLocation = (id) => {
    const updated = locations.filter((location) => location.id !== id);
    setLocations(updated);
    localStorage.setItem('registryLocations', JSON.stringify(updated));
    removeCalendarEventBySource('registry', id);
    removeTimelineEventBySource('registry', id);
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
          <h1 className="text-3xl font-bold text-black">Registro de Salidas</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl hover:shadow-lg transition font-semibold text-lg"
        >
          <Plus className="w-6 h-6" />
          Agregar Salida
        </button>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-black hover:shadow-xl transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-black">{location.name}</h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-black rounded-full text-sm font-semibold border border-yellow-600">
                    {location.category}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteLocation(location.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 transition bg-red-100 text-red-600 rounded-lg border border-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-black font-semibold">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <span>{new Date(location.date).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < location.rating ? 'text-yellow-600 text-xl' : 'text-gray-400 text-xl'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category Stats */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border-2 border-black">
          <h2 className="text-2xl font-bold text-black mb-6">Resumen por Categoría</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat} className="bg-white rounded-xl p-4 text-center border-2 border-yellow-500">
                <p className="font-semibold text-black">{cat}</p>
                <p className="text-2xl font-bold text-yellow-600">0</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-black max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Registrar salida</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Lugar</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg"
                  placeholder="Ej: Restaurante favorito"
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
                <label className="block text-sm font-semibold text-black mb-2">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Calificación</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg"
                >
                  {[5, 4, 3, 2, 1].map((rate) => (
                    <option key={rate} value={rate}>{rate} ⭐</option>
                  ))}
                </select>
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
