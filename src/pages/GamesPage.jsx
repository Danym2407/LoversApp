import React, { useState } from 'react';
import { ChevronLeft, Dices } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GamesPage({ navigateTo }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [diceResult, setDiceResult] = useState(null);

  const games = [
    {
      id: 'question',
      title: '🎲 Preguntas',
      description: 'Preguntas profundas para conocerse mejor',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'truth',
      title: '🤔 Verdad o Reto',
      description: 'Elige verdad o atrévete con un reto',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'memory',
      title: '🧠 Memoria',
      description: 'Recuerda nuestros momentos especiales',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'riddles',
      title: '🧩 Acertijos',
      description: 'Resuelve acertijos románticos',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const rollDice = () => {
    setDiceResult(Math.floor(Math.random() * 6) + 1);
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
          <h1 className="text-3xl font-bold text-black">Jueguito</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {!selectedGame ? (
          <>
            {/* Game Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {games.map((game, index) => (
                <motion.button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${game.id % 2 === 0 ? 'bg-white border-2 border-red-500' : 'bg-white border-2 border-yellow-500'} rounded-2xl p-8 text-black shadow-lg hover:shadow-xl transition text-left group`}
                >
                  <h3 className="text-2xl font-bold mb-2 group-hover:translate-x-1 transition">{game.title}</h3>
                  <p className="text-black font-semibold">{game.description}</p>
                </motion.button>
              ))}
            </div>

            {/* Dice Game */}
            <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-black text-center">
              <h2 className="text-3xl font-bold text-black mb-6">🎲 Lanza los dados</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={rollDice}
                className="mx-auto mb-6 px-8 py-4 bg-black text-white rounded-xl hover:shadow-lg transition font-bold text-lg"
              >
                <Dices className="w-6 h-6 inline mr-2" />
                Lanzar
              </motion.button>
              {diceResult && (
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-6xl font-bold text-yellow-600"
                >
                  {diceResult}
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-black">
            <button
              onClick={() => setSelectedGame(null)}
              className="mb-4 text-black font-semibold flex items-center gap-2 hover:text-red-500"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </button>
            <h2 className="text-3xl font-bold text-black mb-6">
              {games.find(g => g.id === selectedGame)?.title}
            </h2>
            <p className="text-black text-lg">Contenido del juego: {selectedGame}</p>
          </div>
        )}
      </div>
    </div>
  );
}
