import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function PersonalityTestModal({ isOpen, onStart, onSkip }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-2xl max-w-md w-full border-4 border-red-500"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-b-2 border-red-500 p-6 text-center">
              <h2 className="text-3xl font-bold text-black mb-2">¡Bienvenido! 💕</h2>
              <p className="text-gray-700">
                Para personalizar tus 100 citas especiales, nos gustaría conocerte mejor
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-bold text-black">15 Preguntas Personalizadas</h3>
                    <p className="text-sm text-gray-600">Conoceremos tu personalidad y preferencias</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <h3 className="font-bold text-black">Solo 5 minutos</h3>
                    <p className="text-sm text-gray-600">Es rápido y muy revelador</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="font-bold text-black">Citas únicas</h3>
                    <p className="text-sm text-gray-600">Diseñadas especialmente para ti</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStart}
                  className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold text-lg border-2 border-red-500"
                >
                  Hacer el Test Ahora ❤️
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSkip}
                  className="w-full py-3 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition font-bold"
                >
                  Omitir por Ahora
                </motion.button>
                <p className="text-xs text-center text-gray-600 mt-4">
                  💡 Puedes hacer el test después desde tu perfil en cualquier momento
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
