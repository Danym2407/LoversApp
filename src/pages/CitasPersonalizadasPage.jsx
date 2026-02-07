import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Filter, Star, MapPin, DollarSign, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { citasDatabase, citasPorCategoria } from '@/data/citas';

export default function CitasPersonalizadasPage({ navigateTo }) {
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [personalityData, setPersonalityData] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [stats, setStats] = useState({ likes: 0, dislikes: 0 });
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    // Obtener datos del test de personalidad
    const userData = JSON.parse(localStorage.getItem('loversappUser') || '{}');
    if (userData.personalityTest?.completed) {
      setTestCompleted(true);
      setPersonalityData(userData.personalityTest);
      generatePersonalizedCitas(userData.personalityTest);
    }
    
    // Cargar preferencias guardadas
    if (userData.citaPreferences) {
      setPreferences(userData.citaPreferences);
      calculateStats(userData.citaPreferences);
    }
  }, []);

  const generatePersonalizedCitas = (testData) => {
    const personality = testData.personality; // tranquilo, extremo, hibrido
    const budgetLevel = testData.budgetLevel; // 1-5
    
    // Mapear budget a keys
    const budgetKeys = {
      1: 'very_low',
      2: 'low',
      3: 'medium',
      4: 'high',
      5: 'very_high'
    };
    
    const budgetKey = budgetKeys[budgetLevel];
    const key = `${personality}-${budgetKey}`;
    
    // Obtener citas específicas para esta combinación
    let personalizedCitas = citasDatabase[key] || [];
    
    // Completar hasta 100 si faltan
    if (personalizedCitas.length < 100) {
      const remaining = 100 - personalizedCitas.length;
      const additionalCitas = Object.values(citasPorCategoria)
        .flat()
        .slice(0, remaining);
      personalizedCitas = [...personalizedCitas, ...additionalCitas];
    }
    
    // Shuffle para randomizar
    personalizedCitas = personalizedCitas
      .sort(() => Math.random() - 0.5)
      .slice(0, 100)
      .map((cita, index) => ({ ...cita, id: index + 1 }));
    
    setCitas(personalizedCitas);
    setFilteredCitas(personalizedCitas);
  };

  const handleFilter = (filter) => {
    setSelectedFilter(filter);
    
    if (filter === 'all') {
      setFilteredCitas(citas);
    } else {
      setFilteredCitas(citas.filter(cita => cita.category === filter));
    }
  };

  const calculateStats = (prefs) => {
    const likes = Object.values(prefs).filter(p => p === 'like').length;
    const dislikes = Object.values(prefs).filter(p => p === 'dislike').length;
    setStats({ likes, dislikes });
  };

  const handleLikeCita = (citaId) => {
    const newPreferences = { ...preferences };
    
    if (newPreferences[citaId] === 'like') {
      delete newPreferences[citaId];
    } else {
      newPreferences[citaId] = 'like';
    }
    
    setPreferences(newPreferences);
    calculateStats(newPreferences);
    
    // Guardar en localStorage
    const userData = JSON.parse(localStorage.getItem('loversappUser') || '{}');
    userData.citaPreferences = newPreferences;
    localStorage.setItem('loversappUser', JSON.stringify(userData));
  };

  const handleDislikeCita = (citaId) => {
    const newPreferences = { ...preferences };
    
    if (newPreferences[citaId] === 'dislike') {
      delete newPreferences[citaId];
    } else {
      newPreferences[citaId] = 'dislike';
    }
    
    setPreferences(newPreferences);
    calculateStats(newPreferences);
    
    // Guardar en localStorage
    const userData = JSON.parse(localStorage.getItem('loversappUser') || '{}');
    userData.citaPreferences = newPreferences;
    localStorage.setItem('loversappUser', JSON.stringify(userData));
  };

  const getBudgetLabel = (budget) => {
    const labels = {
      1: 'Muy Bajo',
      2: 'Bajo',
      3: 'Medio',
      4: 'Alto',
      5: 'Muy Alto'
    };
    return labels[budget] || 'Medio';
  };

  const getPersonalityEmoji = (personality) => {
    const emojis = {
      'tranquilo': '😌',
      'extremo': '🔥',
      'hibrido': '⚖️'
    };
    return emojis[personality] || '❤️';
  };

  const categories = ['all', 'outdoor', 'indoor', 'cultural', 'gastronomica', 'deportes'];
  const categoryLabels = {
    'all': 'Todas',
    'outdoor': '🏕️ Exterior',
    'indoor': '🏠 Interior',
    'cultural': '🎭 Cultural',
    'gastronomica': '🍽️ Gastronómica',
    'deportes': '⚽ Deportes'
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Test Not Completed Warning */}
      {!testCompleted && (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="text-6xl mb-4">📋</div>
              <h1 className="text-3xl font-bold text-black mb-4">¡Completa el Test Primero! 💕</h1>
              <p className="text-gray-700 mb-8">
                Para recibir tus 100 citas personalizadas, primero necesitamos que completes el test de personalidad. ¡Solo son 5 minutos!
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('personality-test')}
              className="w-full px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold text-lg mb-3"
            >
              Hacer Test de Personalidad Ahora
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('dashboard')}
              className="w-full px-6 py-2 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition font-semibold"
            >
              Volver al Dashboard
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Content - Only show if test completed */}
      {testCompleted && (
        <>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b-2 border-red-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2 text-black hover:text-red-500 transition mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            100 Citas Personalizadas
          </h1>
          {personalityData && (
            <p className="text-gray-600">
              {getPersonalityEmoji(personalityData.personality)} {personalityData.personality.toUpperCase()} • 💰 Presupuesto: {getBudgetLabel(personalityData.budgetLevel)}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilter(category)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                selectedFilter === category
                  ? 'bg-red-500 text-white border-2 border-red-500'
                  : 'border-2 border-gray-300 text-black hover:border-red-500'
              }`}
            >
              {categoryLabels[category]}
            </motion.button>
          ))}
        </div>

        {/* Citas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCitas.map((cita, index) => (
            <motion.div
              key={cita.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-white to-red-50 border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition hover:border-red-500 group cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black group-hover:text-red-500 transition">
                    {cita.id}. {cita.title}
                  </h3>
                </div>
                <Star className="w-5 h-5 text-red-500 group-hover:fill-red-500 transition" />
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-4">{cita.description}</p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2">
                {cita.budget && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    <DollarSign className="w-3 h-3" />
                    {getBudgetLabel(cita.budget)}
                  </span>
                )}
                {cita.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    <MapPin className="w-3 h-3" />
                    {cita.category}
                  </span>
                )}
              </div>

              {/* Personality Tag */}
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-xs font-bold text-gray-600 mb-3 text-center">
                  Ideal para: {getPersonalityEmoji(cita.personality)} {cita.personality}
                </p>
                
                {/* Like/Dislike Buttons */}
                <div className="flex gap-2 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLikeCita(cita.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                      preferences[cita.id] === 'like'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Me gusta
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDislikeCita(cita.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                      preferences[cita.id] === 'dislike'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No gusta
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 p-6 bg-gradient-to-r from-red-50 to-red-100 border-4 border-red-500 rounded-lg">
          <h2 className="text-2xl font-bold text-black mb-4">
            Tus Citas Personalizadas
          </h2>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-black">{citas.length}</p>
              <p className="text-xs text-gray-600">citas</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-green-300">
              <p className="text-sm text-gray-600 mb-1">Me gusta</p>
              <p className="text-2xl font-bold text-green-500">👍 {stats.likes}</p>
              <p className="text-xs text-gray-600">seleccionadas</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-red-300">
              <p className="text-sm text-gray-600 mb-1">No gusta</p>
              <p className="text-2xl font-bold text-red-500">👎 {stats.dislikes}</p>
              <p className="text-xs text-gray-600">seleccionadas</p>
            </div>
          </div>

          <p className="text-gray-700 mb-4 text-sm">
            Mostrando {filteredCitas.length} de {citas.length} citas
            {personalityData?.citasTimeline && (
              <span className="block mt-2 font-semibold">
                ⏱️ Meta: Completar en {
                  {
                    'one_month': '1 mes',
                    'three_months': '3 meses',
                    'six_months': '6 meses',
                    'one_year': '1 año',
                    'two_years': '2+ años',
                    'no_deadline': 'sin fecha límite'
                  }[personalityData.citasTimeline] || 'su tiempo'
                }
              </span>
            )}
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('dashboard')}
            className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold w-full"
          >
            Volver al Dashboard
          </motion.button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
