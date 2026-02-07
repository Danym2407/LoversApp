import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Zap, Target, Users, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalityProfilePage({ navigateTo }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('loversappUser') || '{}');
    if (userData.personalityTest?.profile) {
      setProfile(userData.personalityTest);
    }
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  const getPersonalityDescription = (personality) => {
    const descriptions = {
      'tranquilo': {
        title: '😌 Personalidad Tranquila',
        description: 'Prefieren experiencias relajadas, íntimas y sin prisa. Disfrutan de momentos de calidad sin apuros.',
        color: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-500'
      },
      'extremo': {
        title: '🔥 Personalidad Aventurera',
        description: 'Buscan emociones fuertes y nuevas experiencias. Les encanta explorar y vivir momentos intensos.',
        color: 'from-red-50 to-orange-50',
        borderColor: 'border-red-500'
      },
      'hibrido': {
        title: '⚖️ Personalidad Equilibrada',
        description: 'Disfrutan de una mezcla de aventura y tranquilidad. Les gusta variar entre actividades relajadas e intensas.',
        color: 'from-purple-50 to-pink-50',
        borderColor: 'border-purple-500'
      }
    };
    return descriptions[personality] || descriptions['hibrido'];
  };

  const getActivityDescription = (activity) => {
    const activities = {
      'sedentary': '🛋️ Sedentario - Prefieren actividades sin mucho movimiento',
      'light': '🚶 Ligero - Caminatas y actividades sin esfuerzo intenso',
      'moderate': '🚴 Moderado - Actividades con movimiento regular',
      'intense': '💪 Intenso - Deportes y actividades físicas exigentes'
    };
    return activities[activity] || 'Moderado';
  };

  const getFrequencyDescription = (frequency) => {
    const frequencies = {
      'weekly': '📅 Una o más veces por semana',
      'biweekly': '📆 Cada dos semanas',
      'monthly': '🗓️ Más o menos mensual',
      'spontaneous': '⚡ Espontáneamente sin plan fijo'
    };
    return frequencies[frequency] || 'Regular';
  };

  const getSurpriseDescription = (surprise) => {
    const surprises = {
      'no_surprises': '📋 Prefieren todo planeado',
      'some_surprises': '🎁 Les gustan algunas sorpresas',
      'often_surprises': '🎉 Disfrutan de sorpresas frecuentes',
      'spontaneous': '🌀 Totalmente espontáneo'
    };
    return surprises[surprise] || 'Equilibrado';
  };

  const personDesc = getPersonalityDescription(profile.personality);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigateTo('profile')}
            className="flex items-center gap-2 text-black hover:text-red-500 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Perfil
          </motion.button>
          <h1 className="text-3xl font-black text-black">Perfil de Personalidad ❤️</h1>
          <p className="text-gray-600 mt-2">Descubre tu estilo de pareja</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Personality Type Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${personDesc.color} border-4 ${personDesc.borderColor} rounded-2xl p-8 mb-8`}
        >
          <h2 className="text-3xl font-black text-black mb-4">{personDesc.title}</h2>
          <p className="text-gray-700 text-lg leading-relaxed">{personDesc.description}</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Ages */}
          <div className="bg-gradient-to-br from-pink-50 to-red-50 border-3 border-red-500 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              Edades
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-bold">Tú:</span> {profile.age} años
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Tu pareja:</span> {profile.partnerAge} años
              </p>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-3 border-yellow-500 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-600" />
              Presupuesto
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                Nivel <span className="font-bold text-lg">{profile.budgetLevel}/5</span>
              </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded ${i < profile.budgetLevel ? 'bg-yellow-500' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-500 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" />
              Nivel de Actividad
            </h3>
            <p className="text-gray-700">{getActivityDescription(profile.profile.activityLevel)}</p>
          </div>

          {/* Frequency */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-3 border-blue-500 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Frecuencia de Citas
            </h3>
            <p className="text-gray-700">{getFrequencyDescription(profile.profile.frequency)}</p>
          </div>

          {/* Surprise Factor */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-purple-500 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-600" />
              Factor Sorpresa
            </h3>
            <p className="text-gray-700">{getSurpriseDescription(profile.profile.surpriseLevel)}</p>
          </div>

          {/* Social Setting */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-3 border-orange-500 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-600" />
              Entorno Social
            </h3>
            <p className="text-gray-700">
              {profile.profile.socialSetting === 'intimate' && '👫 Solo ustedes dos'}
              {profile.profile.socialSetting === 'with_friends' && '👥 Con amigos'}
              {profile.profile.socialSetting === 'mixed' && '🔄 Ambas opciones'}
            </p>
          </div>
        </motion.div>

        {/* Interests */}
        {profile.profile.hobbies && profile.profile.hobbies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 border-4 border-indigo-500 rounded-2xl p-8 mb-8"
          >
            <h3 className="text-2xl font-bold text-black mb-4">Intereses y Hobbies 🎯</h3>
            <div className="flex flex-wrap gap-3">
              {profile.profile.hobbies.map((hobby, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="px-4 py-2 bg-white border-2 border-indigo-500 text-indigo-700 rounded-lg font-semibold"
                >
                  {hobby}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        {profile.profile.timeline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-teal-50 to-cyan-50 border-4 border-teal-500 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-black mb-4">Meta de Citas ⏰</h3>
            <p className="text-lg text-gray-700 mb-4">
              Planean completar las 100 citas en:
            </p>
            <div className="text-4xl font-black text-teal-600">
              {profile.profile.timeline === 'one_month' && '⚡ 1 Mes'}
              {profile.profile.timeline === 'three_months' && '🎯 3 Meses'}
              {profile.profile.timeline === 'six_months' && '📅 6 Meses'}
              {profile.profile.timeline === 'one_year' && '⏰ 1 Año'}
              {profile.profile.timeline === 'two_years' && '🐢 2+ Años'}
              {profile.profile.timeline === 'no_deadline' && '∞ Sin Deadline'}
            </div>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('citas-personalizadas')}
            className="flex-1 px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold text-lg"
          >
            Ver mis 100 Citas Personalizadas 💕
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
