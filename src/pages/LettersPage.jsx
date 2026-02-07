import React, { useState } from 'react';
import { ChevronLeft, Plus, Send, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LettersPage({ navigateTo }) {
  const [letters, setLetters] = useState([
    {
      id: 1,
      from: 'Tú',
      title: 'Te Amo',
      date: '2026-01-20',
      content: 'Quería decirte cuánto significas para mí...',
      favorite: true
    },
    {
      id: 2,
      from: 'Tu Pareja',
      title: 'Un Día Especial',
      date: '2026-01-15',
      content: 'Este fue uno de nuestros mejores días juntos...',
      favorite: false
    }
  ]);

  const [selectedLetter, setSelectedLetter] = useState(null);

  const deleteLetter = (id) => {
    setLetters(letters.filter(l => l.id !== id));
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
          <h1 className="text-3xl font-bold text-black">Cartas Digitales</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {!selectedLetter ? (
          <>
            {/* New Letter Button */}
            <button className="mb-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl hover:shadow-lg transition font-semibold text-lg">
              <Plus className="w-6 h-6" />
              Escribir Nueva Carta
            </button>

            {/* Letters List */}
            <div className="space-y-4">
              {letters.map((letter, index) => (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedLetter(letter)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-red-500 cursor-pointer hover:translate-x-2 transform"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold bg-yellow-100 text-black px-3 py-1 rounded-full border border-yellow-600">
                          De: {letter.from}
                        </span>
                        {letter.favorite && <span className="text-xl">❤️</span>}
                      </div>
                      <h3 className="text-xl font-bold text-black">{letter.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(letter.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLetter(letter.id);
                      }}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition border border-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-black line-clamp-2 font-semibold">{letter.content}</p>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-black p-8">
            <button
              onClick={() => setSelectedLetter(null)}
              className="mb-4 text-black font-semibold flex items-center gap-2 hover:text-red-500"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </button>

            <div className="mb-6">
              <span className="text-sm font-semibold bg-yellow-100 text-black px-3 py-1 rounded-full border border-yellow-600">
                De: {selectedLetter.from}
              </span>
              <h2 className="text-3xl font-bold text-black mt-4 mb-2">{selectedLetter.title}</h2>
              <p className="text-gray-600 font-semibold">
                {new Date(selectedLetter.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 mb-6 min-h-64 border-2 border-yellow-500">
              <p className="text-black leading-relaxed whitespace-pre-wrap font-semibold">
                {selectedLetter.content}
              </p>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:shadow-lg transition font-semibold">
                <Send className="w-5 h-5" />
                Responder
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold border border-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
