import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, ThumbsDown, Zap, MapPin, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { citasDatabase, citasPorCategoria } from '@/data/citas';

const CitasAleatoriasPage = ({ navigateTo }) => {
  const [currentCita, setCurrentCita] = useState(null);
  const [availableCitas, setAvailableCitas] = useState([]);
  const [rejectedCitas, setRejectedCitas] = useState([]);
  const [personality, setPersonality] = useState('hibrido');
  const [budget, setBudget] = useState('medium');
  const [stats, setStats] = useState({ like: 0, dislike: 0 });
  const { toast } = useToast();

  const budgetLevels = {
    very_low: '💰 Muy Bajo (< $100 MXN)',
    low: '💰💰 Bajo ($100-500 MXN)',
    medium: '💰💰💰 Medio ($500-1500 MXN)',
    high: '💰💰💰💰 Alto ($1500-5000 MXN)',
    very_high: '💰💰💰💰💰 Muy Alto (> $5000 MXN)'
  };

  const personalities = {
    tranquilo: '🧘 Tranquilo',
    extremo: '⚡ Extremo',
    hibrido: '🎭 Híbrido'
  };

  // Inicializar citas disponibles
  useEffect(() => {
    loadAvailableCitas();
  }, []);

  // Cargar cita cuando cambia la selección o disponibles
  useEffect(() => {
    if (availableCitas.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCitas.length);
      setCurrentCita(availableCitas[randomIndex]);
    } else if (availableCitas.length === 0 && rejectedCitas.length > 0) {
      toast({
        title: "¡Todas las citas se han mostrado!",
        description: "Puedes reiniciar la selección para ver las citas rechazadas nuevamente.",
      });
    }
  }, [availableCitas]);

  const loadAvailableCitas = () => {
    // Obtener citas del localStorage si existen
    const stored = localStorage.getItem('citasAleatorias');
    if (stored) {
      const { available, rejected } = JSON.parse(stored);
      setAvailableCitas(available);
      setRejectedCitas(rejected);
      return;
    }

    // Cargar todas las citas y mezclar
    const allCitas = [
      ...Object.values(citasDatabase).flat(),
      ...Object.values(citasPorCategoria).flat()
    ];

    // Remover duplicados por ID
    const uniqueCitas = Array.from(
      new Map(allCitas.map(item => [item.id, item])).values()
    );

    // Mezclar aleatoriamente
    const shuffled = uniqueCitas.sort(() => 0.5 - Math.random());
    
    setAvailableCitas(shuffled);
    setRejectedCitas([]);
    
    // Guardar en localStorage
    localStorage.setItem('citasAleatorias', JSON.stringify({
      available: shuffled,
      rejected: []
    }));
  };

  const handleLike = () => {
    if (!currentCita) return;

    // Actualizar estadísticas
    const newStats = { ...stats, like: stats.like + 1 };
    setStats(newStats);

    // Guardar cita en localStorage como favorita
    const favorites = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
    if (!favorites.find(c => c.id === currentCita.id)) {
      favorites.push(currentCita);
      localStorage.setItem('favoritesCitas', JSON.stringify(favorites));
    }

    // Mostrar siguiente cita
    moveToNextCita();

    toast({
      title: "¡Me gusta! 💕",
      description: `Agregada a favoritos: ${currentCita.title}`,
    });
  };

  const handleDislike = () => {
    if (!currentCita) return;

    // Actualizar estadísticas
    const newStats = { ...stats, dislike: stats.dislike + 1 };
    setStats(newStats);

    // Agregar a rechazadas
    const newRejected = [...rejectedCitas, currentCita];
    setRejectedCitas(newRejected);

    // Remover de disponibles
    const newAvailable = availableCitas.filter(c => c.id !== currentCita.id);
    setAvailableCitas(newAvailable);

    // Guardar en localStorage
    localStorage.setItem('citasAleatorias', JSON.stringify({
      available: newAvailable,
      rejected: newRejected
    }));

    // Animación de desaparición
    toast({
      title: "Descartada ❌",
      description: `"${currentCita.title}" ha sido removida. Mostrando siguiente...`,
    });
  };

  const moveToNextCita = () => {
    if (availableCitas.length > 1) {
      const newAvailable = availableCitas.filter(c => c.id !== currentCita.id);
      setAvailableCitas(newAvailable);
      
      localStorage.setItem('citasAleatorias', JSON.stringify({
        available: newAvailable,
        rejected: rejectedCitas
      }));
    }
  };

  const handleReset = () => {
    localStorage.removeItem('citasAleatorias');
    localStorage.removeItem('favoritesCitas');
    setStats({ like: 0, dislike: 0 });
    setRejectedCitas([]);
    loadAvailableCitas();

    toast({
      title: "Reinicio completado",
      description: "Todas las citas están disponibles nuevamente.",
    });
  };

  const getBudgetColor = (budget) => {
    const colors = {
      'very_low': 'text-green-600 bg-green-50',
      'low': 'text-blue-600 bg-blue-50',
      'medium': 'text-amber-600 bg-amber-50',
      'high': 'text-orange-600 bg-orange-50',
      'very_high': 'text-red-600 bg-red-50'
    };
    return colors[budget] || colors.medium;
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      outdoor: '🏞️',
      indoor: '🏠',
      cultural: '🎭',
      gastronomica: '🍽️',
      deportes: '⚽',
      mixed: '🎉'
    };
    return emojis[category] || '📍';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('dashboard')}
          className="hover:bg-pink-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
        
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600">
          🎲 Citas Aleatorias México
        </h1>

        <Button 
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-xs"
        >
          🔄 Reiniciar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-md border-l-4 border-pink-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Me Gusta</p>
              <p className="text-3xl font-bold text-pink-600">{stats.like}</p>
            </div>
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">No Me Gusta</p>
              <p className="text-3xl font-bold text-blue-600">{stats.dislike}</p>
            </div>
            <ThumbsDown className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 shadow-md border-l-4 border-amber-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Disponibles</p>
              <p className="text-3xl font-bold text-amber-600">{availableCitas.length}</p>
            </div>
            <Zap className="w-8 h-8 text-amber-500" />
          </div>
        </motion.div>
      </div>

      {/* Main Cita Card */}
      <AnimatePresence mode="wait">
        {currentCita ? (
          <motion.div
            key={currentCita.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8 mb-8 max-w-2xl mx-auto border border-pink-100"
          >
            {/* Categoría y Presupuesto */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-pink-50 rounded-full text-pink-700 font-semibold">
                {getCategoryEmoji(currentCita.category)} {currentCita.category.toUpperCase()}
              </span>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getBudgetColor(currentCita.budget)}`}>
                <DollarSign className="w-4 h-4" />
                {budgetLevels[currentCita.budget]}
              </span>
            </div>

            {/* Título */}
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {currentCita.title}
            </h2>

            {/* Descripción */}
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {currentCita.description}
            </p>

            {/* Meta information */}
            <div className="border-t border-gray-200 pt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="font-semibold text-gray-800">{personalities[currentCita.personality]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="font-semibold text-gray-800">México</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ¡No hay más citas disponibles!
            </h3>
            <p className="text-gray-600 mb-6">
              {rejectedCitas.length > 0 
                ? `Has rechazado ${rejectedCitas.length} citas. ¿Quieres reiniciar?`
                : 'Carga todas las citas para comenzar.'}
            </p>
            <Button 
              onClick={handleReset}
              className="bg-gradient-to-r from-pink-600 to-blue-600 hover:from-pink-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              🔄 Reiniciar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {currentCita && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-6 justify-center mb-8 max-w-2xl mx-auto"
        >
          {/* Dislike Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDislike}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300 -z-10"></div>
            <Button 
              variant="outline"
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold py-6 px-8 rounded-full text-lg w-20 h-20 flex items-center justify-center"
            >
              <ThumbsDown className="w-8 h-8" />
            </Button>
            <p className="text-center text-sm font-semibold text-blue-600 mt-2">No Me Gusta</p>
          </motion.button>

          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300 -z-10"></div>
            <Button 
              className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold py-6 px-8 rounded-full text-lg w-20 h-20 flex items-center justify-center"
            >
              <Heart className="w-8 h-8 fill-white" />
            </Button>
            <p className="text-center text-sm font-semibold text-pink-600 mt-2">Me Gusta</p>
          </motion.button>
        </motion.div>
      )}

      {/* Favoritos Quick View */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6">❤️ Citas Favoritas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            const favorites = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
            if (favorites.length === 0) {
              return (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Aún no has marcado ninguna cita como favorita
                </div>
              );
            }
            return favorites.slice(0, 4).map(cita => (
              <motion.div
                key={cita.id}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-pink-50 to-white rounded-lg p-4 border border-pink-200 shadow-sm hover:shadow-md transition-all"
              >
                <h4 className="font-bold text-gray-800 mb-2">{cita.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{cita.description}</p>
              </motion.div>
            ));
          })()}
        </div>
      </motion.div>
    </div>
  );
};

export default CitasAleatoriasPage;
