import React, { useState } from 'react';
import { ChevronLeft, Plus, Flame, Smile, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChallengesPage({ navigateTo }) {
  const [challenges] = useState([
    {
      id: 1,
      type: 'kiss',
      title: 'Beso Sorpresa',
      description: 'Dale un beso sorpresa en un momento inesperado',
      icon: '💋',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 2,
      type: 'compliment',
      title: 'Cumplido del Día',
      description: 'Dale un cumplido sincero que lo/la haga sonreír',
      icon: '😊',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 3,
      type: 'surprise',
      title: 'Sorpresa Romántica',
      description: 'Plana una cita sorpresa especial',
      icon: '🎁',
      color: 'from-purple-500 to-pink-500'
    }
  ]);

  const [completed, setCompleted] = useState({});

  const toggleCompleted = (id) => {
    setCompleted(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
          <h1 className="text-3xl font-bold text-black">Retos Diarios</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border-2 border-red-500 text-center shadow-md">
            <p className="text-2xl font-bold text-red-600">💋</p>
            <p className="text-sm text-black font-semibold mt-1">Besos: <span className="font-bold text-red-600">0</span></p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-yellow-500 text-center shadow-md">
            <p className="text-2xl font-bold text-yellow-600">😊</p>
            <p className="text-sm text-black font-semibold mt-1">Cumplidos: <span className="font-bold text-yellow-600">0</span></p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-red-500 text-center shadow-md">
            <p className="text-2xl font-bold text-red-600">🎁</p>
            <p className="text-sm text-black font-semibold mt-1">Sorpresas: <span className="font-bold text-red-600">0</span></p>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${challenge.id % 2 === 0 ? 'border-red-500' : 'border-yellow-500'} bg-white rounded-2xl p-8 text-black shadow-lg hover:shadow-xl transition cursor-pointer transform hover:scale-105 relative overflow-hidden border-2`}
              onClick={() => toggleCompleted(challenge.id)}
            >
              {/* Checkmark overlay when completed */}
              {completed[challenge.id] && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-6xl">✓</div>
                </div>
              )}

              <div className="text-5xl mb-4">{challenge.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{challenge.title}</h3>
              <p className="text-black font-semibold">{challenge.description}</p>
              
              <div className="mt-6 pt-4 border-t-2 border-gray-300">
                <p className="text-sm font-semibold text-black">Click para marcar como completado</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Challenge Button */}
        <button className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl hover:shadow-lg transition font-semibold text-lg">
          <Plus className="w-6 h-6" />
          Crear Reto Personalizado
        </button>
      </div>
    </div>
  );
}
