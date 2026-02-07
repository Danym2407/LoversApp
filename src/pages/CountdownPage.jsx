import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCountdownEvents, removeCountdownEventBySource } from '@/lib/eventSync';

export default function CountdownPage({ navigateTo }) {
  const defaultCountdowns = [
    {
      id: 1,
      title: 'Viaje a la Playa',
      date: '2026-02-14',
      emoji: '🏖️',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Cita Sorpresa',
      date: '2026-01-25',
      emoji: '🎁',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const [countdowns, setCountdowns] = useState([]);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const stored = getCountdownEvents();
    if (stored.length > 0) {
      setCountdowns(stored);
    } else {
      setCountdowns(defaultCountdowns);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parseDateParts = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    return { year, month, day };
  };

  const calculateCountdown = (targetDate) => {
    void nowTick;
    const now = new Date();
    const parts = parseDateParts(targetDate);
    if (!parts) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const target = new Date(parts.year, parts.month - 1, parts.day, 23, 59, 59);
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
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
          <h1 className="text-3xl font-bold text-black">Countdown</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Add Button */}
        <button className="mb-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl hover:shadow-lg transition font-semibold text-lg">
          <Plus className="w-6 h-6" />
          Crear Countdown
        </button>

        {/* Countdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {countdowns.map((countdown, index) => {
            const time = calculateCountdown(countdown.date);
            const isRed = index % 2 === 0;

            return (
              <motion.div
                key={countdown.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-8 border-2 ${isRed ? 'border-red-500' : 'border-yellow-500'} relative overflow-hidden`}
              >
                {/* Emoji Background */}
                <div className="absolute top-0 right-0 text-8xl opacity-20">{countdown.emoji}</div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-black mb-2">{countdown.title}</h3>
                  <p className="text-gray-600 font-semibold mb-6">
                    {(() => {
                      const parts = parseDateParts(countdown.date);
                      if (!parts) return '';
                      const localDate = new Date(parts.year, parts.month - 1, parts.day);
                      return localDate.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </p>

                  {/* Countdown Display */}
                  <div className={`grid grid-cols-4 gap-2 mb-6 rounded-xl p-4 border-2 ${isRed ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'}`}>
                    {[
                      { value: time.days, label: 'Días' },
                      { value: time.hours, label: 'Horas' },
                      { value: time.minutes, label: 'Min' },
                      { value: time.seconds, label: 'Seg' }
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="text-3xl font-bold text-black">{String(item.value).padStart(2, '0')}</div>
                        <div className="text-xs font-semibold text-gray-600">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (countdown.sourceType && countdown.sourceId) {
                        removeCountdownEventBySource(countdown.sourceType, countdown.sourceId);
                      }
                      const updated = countdowns.filter((item) => item.id !== countdown.id);
                      setCountdowns(updated);
                      localStorage.setItem('countdownEvents', JSON.stringify(updated));
                    }}
                    className={`w-full p-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 ${isRed ? 'bg-red-100 text-red-600 border border-red-500 hover:bg-red-200' : 'bg-yellow-100 text-black border border-yellow-600 hover:bg-yellow-200'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {countdowns.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-black">
            <p className="text-3xl mb-3">⏰</p>
            <h3 className="text-xl font-bold text-black mb-2">No hay countdowns</h3>
            <p className="text-gray-600 font-semibold">Crea tu primer countdown para una cita especial</p>
          </div>
        )}
      </div>
    </div>
  );
}
