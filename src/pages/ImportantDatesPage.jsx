import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Bell, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { upsertCalendarEvent, removeCalendarEventBySource } from '@/lib/eventSync';

export default function ImportantDatesPage({ navigateTo }) {
  const defaultDates = [
    {
      id: 1,
      title: 'Aniversario',
      date: '2026-02-14',
      description: '2 años juntos',
      color: 'from-red-500 to-pink-500',
      icon: '💕',
      type: 'anniversary'
    },
    {
      id: 2,
      title: 'Cumpleaños de Eduardo',
      date: '2026-03-25',
      description: '¡Sorpresa especial!',
      color: 'from-blue-500 to-cyan-500',
      icon: '🎂',
      type: 'birthday'
    }
  ];

  const [dates, setDates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingSourceType, setEditingSourceType] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    type: 'birthday'
  });
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('importantDates');
    if (saved) {
      const parsed = JSON.parse(saved);
      const synced = ensureBirthdays(parsed);
      setDates(synced);
      localStorage.setItem('importantDates', JSON.stringify(synced));
      syncImportantDates(synced);
    } else {
      const seeded = ensureBirthdays(defaultDates);
      setDates(seeded);
      localStorage.setItem('importantDates', JSON.stringify(seeded));
      syncImportantDates(seeded);
    }
  }, []);

  const syncImportantDates = (items) => {
    items.forEach((item) => {
      if (!item?.id) return;
      upsertCalendarEvent({
        title: `${item.type === 'birthday' ? 'Cumpleaños' : item.type === 'anniversary' ? 'Aniversario' : 'Fecha'}: ${item.title}`,
        description: item.description || 'Fecha importante',
        dateStr: item.date,
        sourceType: 'important-date',
        sourceId: item.id
      });
    });
  };

  const parseDateParts = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    return { year, month, day };
  };

  const formatLocalDate = (dateStr) => {
    const parts = parseDateParts(dateStr);
    if (!parts) return '';
    const localDate = new Date(parts.year, parts.month - 1, parts.day);
    return localDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ensureBirthdays = (items) => {
    const userData = JSON.parse(localStorage.getItem('loversappUser') || '{}');
    const userName = userData.name?.trim() || '';
    const partnerName = userData.partner?.trim() || '';
    const userBirthDate = userData.personalityTest?.birthDate || userData.birthDate;
    const partnerBirthDate = userData.personalityTest?.partnerBirthDate || userData.partnerBirthDate;
    const now = new Date();

    const normalize = (dateStr) => {
      const parts = parseDateParts(dateStr);
      if (!parts) return null;
      const normalized = new Date(now.getFullYear(), parts.month - 1, parts.day);
      const yyyy = normalized.getFullYear();
      const mm = String(normalized.getMonth() + 1).padStart(2, '0');
      const dd = String(normalized.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    let updatedItems = [...items];

    if (userBirthDate) {
      const normalizedDateStr = normalize(userBirthDate);
      if (normalizedDateStr) {
        const existing = updatedItems.find((item) => item.sourceType === 'user-birthday');
        const baseItem = {
          title: userName ? `Cumpleaños de ${userName}` : 'Tu cumpleaños',
          date: normalizedDateStr,
          description: 'Cumpleaños',
          type: 'birthday',
          icon: '🎂',
          color: 'from-blue-500 to-cyan-500',
          sourceType: 'user-birthday'
        };
        updatedItems = existing
          ? updatedItems.map((item) => (item.id === existing.id ? { ...item, ...baseItem } : item))
          : [{ id: Date.now(), ...baseItem }, ...updatedItems];
      }
    }

    if (partnerBirthDate) {
      const normalizedDateStr = normalize(partnerBirthDate);
      if (normalizedDateStr) {
        const existing = updatedItems.find((item) => item.sourceType === 'partner-birthday');
        const baseItem = {
          title: partnerName ? `Cumpleaños de ${partnerName}` : 'Cumpleaños de tu pareja',
          date: normalizedDateStr,
          description: 'Cumpleaños',
          type: 'birthday',
          icon: '🎂',
          color: 'from-blue-500 to-cyan-500',
          sourceType: 'partner-birthday'
        };
        updatedItems = existing
          ? updatedItems.map((item) => (item.id === existing.id ? { ...item, ...baseItem } : item))
          : [{ id: Date.now(), ...baseItem }, ...updatedItems];
      }
    }

    return updatedItems;
  };

  const getNextOccurrence = (dateStr, type) => {
    const today = new Date();
    const parts = parseDateParts(dateStr);
    if (!parts) return null;

    if (type === 'birthday' || type === 'anniversary') {
      const next = new Date(today.getFullYear(), parts.month - 1, parts.day);
      if (next < new Date(today.setHours(0, 0, 0, 0))) {
        next.setFullYear(next.getFullYear() + 1);
      }
      return next;
    }

    return new Date(parts.year, parts.month - 1, parts.day);
  };

  const getDaysUntil = (dateStr, type) => {
    const today = new Date();
    const next = getNextOccurrence(dateStr, type);
    if (!next) return null;
    const diff = next - new Date(today.setHours(0, 0, 0, 0));
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleSaveDate = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) {
      toast({
        title: 'Faltan datos',
        description: 'Agrega título y fecha.'
      });
      return;
    }

    const baseItem = {
      title: formData.title.trim(),
      date: formData.date,
      description: formData.description.trim(),
      type: formData.type,
      icon: formData.type === 'birthday' ? '🎂' : formData.type === 'anniversary' ? '💕' : '📌',
      color: formData.type === 'birthday' ? 'from-blue-500 to-cyan-500' : formData.type === 'anniversary' ? 'from-red-500 to-pink-500' : 'from-gray-500 to-gray-700',
      sourceType: editingSourceType || undefined
    };

    const updated = editingId
      ? dates.map((item) => (item.id === editingId ? { ...item, ...baseItem } : item))
      : [{ id: Date.now(), ...baseItem }, ...dates];

    const savedItem = editingId
      ? updated.find((item) => item.id === editingId)
      : updated[0];

    setDates(updated);
    localStorage.setItem('importantDates', JSON.stringify(updated));
    upsertCalendarEvent({
      title: `${savedItem.type === 'birthday' ? 'Cumpleaños' : savedItem.type === 'anniversary' ? 'Aniversario' : 'Fecha'}: ${savedItem.title}`,
      description: savedItem.description || 'Fecha importante',
      dateStr: savedItem.date,
      sourceType: 'important-date',
      sourceId: savedItem.id
    });

    setShowModal(false);
    setEditingId(null);
    setEditingSourceType(null);
    setFormData({ title: '', date: '', description: '', type: 'birthday' });
    toast({
      title: editingId ? 'Fecha actualizada' : 'Fecha guardada',
      description: 'Se agregó al calendario.'
    });
  };

  const handleEditDate = (item) => {
    setEditingId(item.id);
    setEditingSourceType(item.sourceType || null);
    setFormData({
      title: item.title,
      date: item.date,
      description: item.description || '',
      type: item.type || 'birthday'
    });
    setShowModal(true);
  };

  const handleDeleteDate = (id) => {
    const updated = dates.filter((item) => item.id !== id);
    setDates(updated);
    localStorage.setItem('importantDates', JSON.stringify(updated));
    removeCalendarEventBySource('important-date', id);
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
          <h1 className="text-3xl font-bold text-black">Fechas Importantes</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl hover:shadow-lg transition font-semibold text-lg"
        >
          <Plus className="w-6 h-6" />
          Agregar Fecha
        </button>

        {/* Important Dates List */}
        <div className="space-y-4">
          {dates.map((dateItem, index) => {
            const daysLeft = getDaysUntil(dateItem.date, dateItem.type);
            const isUpcoming = daysLeft > 0 && daysLeft <= 30;

            return (
              <motion.div
                key={dateItem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 border-2 border-red-500 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 opacity-20 text-6xl">{dateItem.icon}</div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-black">{dateItem.title}</h3>
                      <p className="text-gray-600 font-semibold">{dateItem.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDate(dateItem)}
                        className="px-3 py-1 text-sm font-semibold border border-black rounded-lg hover:bg-gray-100 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteDate(dateItem.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition border border-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                    <p className="text-lg font-semibold text-black">
                      {formatLocalDate(
                        getNextOccurrence(dateItem.date, dateItem.type)?.toISOString().slice(0, 10) || dateItem.date
                      )}
                    </p>
                    {typeof daysLeft === 'number' && (
                      <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-600">
                        <Bell className="w-4 h-4 text-black" />
                        <span className="font-semibold text-black">{daysLeft} días</span>
                      </div>
                    )}
                    {isUpcoming && (
                      <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-600">
                        <Bell className="w-4 h-4 text-black" />
                        <span className="font-semibold text-black">{daysLeft} días</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border-2 border-black">
          <h2 className="text-2xl font-bold text-black mb-6">Próximas Celebraciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dates
              .filter(d => {
                const days = getDaysUntil(d.date, d.type);
                return days > 0 && days <= 30;
              })
              .map(d => (
                <div key={d.id} className="bg-white rounded-xl p-4 border-2 border-yellow-500">
                  <p className="text-2xl mb-2">{d.icon}</p>
                  <p className="font-bold text-black">{d.title}</p>
                  <p className="text-sm font-semibold text-gray-600">{getDaysUntil(d.date, d.type)} días</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-black max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">{editingId ? 'Editar fecha importante' : 'Agregar fecha importante'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg"
                >
                  <option value="birthday">Cumpleaños</option>
                  <option value="anniversary">Aniversario</option>
                  <option value="other">Otra fecha</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg"
                  placeholder="Ej: Cumpleaños de Ana"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg h-24 resize-none"
                  placeholder="Detalles de la fecha"
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
