import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { upsertCalendarEvent } from '@/lib/eventSync';

export default function PersonalityTestPage({ navigateTo }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const questions = [
    {
      id: 'birthDate',
      type: 'date',
      question: '¿Cuál es tu fecha de nacimiento?',
      subtitle: 'Esto nos ayuda a entender mejor tu etapa de vida',
      options: null
    },
    {
      id: 'partnerBirthDate',
      type: 'date',
      question: '¿Cuál es la fecha de nacimiento de tu pareja?',
      subtitle: 'Para tener una visión completa de ambos',
      options: null
    },
    {
      id: 'lifeStage',
      type: 'single',
      question: '¿En qué etapa de vida están?',
      subtitle: 'Selecciona la que mejor aplique',
      options: [
        { id: 'secondary', label: '🏫 Secundaria' },
        { id: 'high_school', label: '📚 Preparatoria' },
        { id: 'university', label: '🎓 Universidad' },
        { id: 'professional', label: '💼 Profesionales' },
        { id: 'established', label: '🏡 Establecidos' }
      ]
    },
    {
      id: 'personalityType',
      type: 'single',
      question: '¿Cómo describirías tu personalidad general?',
      subtitle: 'Tu naturaleza predominante',
      options: [
        { id: 'very_calm', label: '😌 Muy tranquilo/a' },
        { id: 'calm', label: '😊 Tranquilo/a' },
        { id: 'balanced', label: '⚖️ Balanceado/a' },
        { id: 'adventurous', label: '🎢 Aventurero/a' },
        { id: 'very_adventurous', label: '🔥 Muy aventurero/a' }
      ]
    },
    {
      id: 'partnerPersonality',
      type: 'single',
      question: '¿Cómo describirías la personalidad de tu pareja?',
      subtitle: 'Su naturaleza predominante',
      options: [
        { id: 'very_calm', label: '😌 Muy tranquilo/a' },
        { id: 'calm', label: '😊 Tranquilo/a' },
        { id: 'balanced', label: '⚖️ Balanceado/a' },
        { id: 'adventurous', label: '🎢 Aventurero/a' },
        { id: 'very_adventurous', label: '🔥 Muy aventurero/a' }
      ]
    },
    {
      id: 'budget',
      type: 'single',
      question: '¿Cuál es vuestro presupuesto típico para citas?',
      subtitle: 'Esto nos ayuda a sugerir opciones acordes',
      options: [
        { id: 'very_low', label: '💰 Muy bajo (< $100 MXN)' },
        { id: 'low', label: '💵 Bajo ($100-300 MXN)' },
        { id: 'medium', label: '💴 Medio ($300-800 MXN)' },
        { id: 'high', label: '💶 Alto ($800-2,500 MXN)' },
        { id: 'very_high', label: '💎 Muy alto (> $2,500 MXN)' }
      ]
    },
    {
      id: 'hobbies',
      type: 'multiple',
      question: '¿Cuáles son vuestros hobbies e intereses? (Selecciona varios)',
      subtitle: 'Nos ayuda a personalizar las citas',
      options: [
        { id: 'sports', label: '⚽ Deportes' },
        { id: 'arts', label: '🎨 Artes' },
        { id: 'music', label: '🎵 Música' },
        { id: 'movies', label: '🎬 Películas/Series' },
        { id: 'outdoor', label: '🏕️ Actividades al aire libre' },
        { id: 'food', label: '🍽️ Gastronomía' },
        { id: 'travel', label: '✈️ Viajes' },
        { id: 'gaming', label: '🎮 Videojuegos' },
        { id: 'tech', label: '💻 Tecnología' },
        { id: 'books', label: '📖 Literatura' }
      ]
    },
    {
      id: 'preferredEnvironment',
      type: 'single',
      question: '¿Prefieren citas más en...',
      subtitle: 'Tu zona de confort',
      options: [
        { id: 'indoor', label: '🏠 Interior (cafés, cines, restaurantes)' },
        { id: 'outdoor', label: '🌳 Exterior (parques, plazas, naturaleza)' },
        { id: 'mixed', label: '🔄 Ambas por igual' }
      ]
    },
    {
      id: 'dateFrequency',
      type: 'single',
      question: '¿Con qué frecuencia prefieren salir?',
      subtitle: 'Para ajustar el ritmo de citas',
      options: [
        { id: 'weekly', label: '📅 Una o más veces por semana' },
        { id: 'biweekly', label: '📆 Cada dos semanas' },
        { id: 'monthly', label: '🗓️ Más o menos mensual' },
        { id: 'spontaneous', label: '⚡ Espontáneamente' }
      ]
    },
    {
      id: 'surpriseFactor',
      type: 'single',
      question: '¿Qué tan importantes son las sorpresas?',
      subtitle: 'Nivel de espontaneidad que disfrutan',
      options: [
        { id: 'no_surprises', label: '📋 Prefiero planeado' },
        { id: 'some_surprises', label: '🎁 Algunas sorpresas' },
        { id: 'often_surprises', label: '🎉 Sorpresas frecuentes' },
        { id: 'spontaneous', label: '🌀 Totalmente espontáneo' }
      ]
    },
    {
      id: 'physicalActivity',
      type: 'single',
      question: '¿Qué nivel de actividad física prefieren?',
      subtitle: 'Para equilibrar citas activas vs relajadas',
      options: [
        { id: 'sedentary', label: '🛋️ Sedentario' },
        { id: 'light', label: '🚶 Ligero' },
        { id: 'moderate', label: '🚴 Moderado' },
        { id: 'intense', label: '💪 Intenso' }
      ]
    },
    {
      id: 'socialSettings',
      type: 'single',
      question: '¿Prefieren citas sociales o íntimas?',
      subtitle: 'Con amigos o solo ustedes dos',
      options: [
        { id: 'intimate', label: '👫 Solo nosotros dos' },
        { id: 'with_friends', label: '👥 Con amigos' },
        { id: 'mixed', label: '🔄 Ambas' }
      ]
    },
    {
      id: 'culturalInterests',
      type: 'multiple',
      question: '¿Qué tipo de actividades culturales les llaman?',
      subtitle: 'Selecciona varias opciones',
      options: [
        { id: 'museums', label: '🖼️ Museos' },
        { id: 'theater', label: '🎭 Teatro' },
        { id: 'concerts', label: '🎤 Conciertos' },
        { id: 'exhibitions', label: '🎨 Exposiciones' },
        { id: 'none', label: '❌ Ninguna en particular' }
      ]
    },
    {
      id: 'nightLife',
      type: 'single',
      question: '¿Les interesa la vida nocturna?',
      subtitle: 'Bares, discotecas, después de cena, etc.',
      options: [
        { id: 'not_interested', label: '😴 No nos interesa' },
        { id: 'occasional', label: '🌙 Ocasionalmente' },
        { id: 'sometimes', label: '⭐ A veces' },
        { id: 'often', label: '🌃 Muy a menudo' }
      ]
    },
    {
      id: 'seasonPreference',
      type: 'single',
      question: '¿En qué estación se sienten mejor citas?',
      subtitle: 'Para ajustar sugerencias',
      options: [
        { id: 'spring', label: '🌸 Primavera' },
        { id: 'summer', label: '☀️ Verano' },
        { id: 'fall', label: '🍂 Otoño' },
        { id: 'winter', label: '❄️ Invierno' },
        { id: 'any', label: '🔄 Cualquier época' }
      ]
    },
    {
      id: 'citasTimeline',
      type: 'single',
      question: '¿En cuánto tiempo planean terminar las 100 citas?',
      subtitle: 'Meta realista para disfrutar juntos',
      options: [
        { id: 'one_month', label: '⚡ 1 mes (intenso!)' },
        { id: 'three_months', label: '🎯 3 meses (rápido)' },
        { id: 'six_months', label: '📅 6 meses (moderado)' },
        { id: 'one_year', label: '⏰ 1 año (tranquilo)' },
        { id: 'two_years', label: '🐢 2+ años (sin prisa)' },
        { id: 'no_deadline', label: '∞ Sin fecha límite' }
      ]
    },
    {
      id: 'additionalComments',
      type: 'text',
      question: '¿Algo más que debamos saber?',
      subtitle: 'Preferencias especiales, fobias, alergias, etc. (opcional)',
      placeholder: 'Cuéntanos más sobre ustedes...'
    }
  ];

  const calculatePersonality = (testAnswers) => {
    // Calcular puntuación de aventura basada en múltiples factores
    const personalityScores = {
      'very_calm': 1,
      'calm': 2,
      'balanced': 3,
      'adventurous': 4,
      'very_adventurous': 5
    };
    
    const activityScores = {
      'sedentary': 1,
      'light': 2,
      'moderate': 3,
      'intense': 4
    };
    
    const surpriseScores = {
      'no_surprises': 1,
      'some_surprises': 2,
      'often_surprises': 4,
      'spontaneous': 5
    };
    
    const nightLifeScores = {
      'not_interested': 1,
      'occasional': 2,
      'sometimes': 3,
      'often': 5
    };
    
    // Calcular promedio de personalidad
    const myPersonalityScore = personalityScores[testAnswers.personalityType] || 3;
    const partnerPersonalityScore = personalityScores[testAnswers.partnerPersonality] || 3;
    const personalityAvg = (myPersonalityScore + partnerPersonalityScore) / 2;
    
    // Calcular promedio de actividad
    const activityScore = activityScores[testAnswers.physicalActivity] || 2;
    
    // Calcular promedio de sorpresas
    const surpriseScore = surpriseScores[testAnswers.surpriseFactor] || 2;
    
    // Calcular promedio de vida nocturna
    const nightLifeScore = nightLifeScores[testAnswers.nightLife] || 1;
    
    // Puntuación total combinada (0-5 escala)
    const adventureScore = (personalityAvg + activityScore + surpriseScore + nightLifeScore) / 4;
    
    // Clasificar personalidad basada en múltiples factores
    if (adventureScore <= 2) return 'tranquilo';
    if (adventureScore >= 3.8) return 'extremo';
    return 'hibrido';
  };

  const calculateBudgetLevel = (budget) => {
    const budgetMap = {
      'very_low': 1,
      'low': 2,
      'medium': 3,
      'high': 4,
      'very_high': 5
    };
    return budgetMap[budget] || 3;
  };

  const generatePersonalityProfile = (testAnswers) => {
    // Generar un perfil detallado del usuario
    const profile = {
      personalityType: testAnswers.personalityType,
      partnerPersonalityType: testAnswers.partnerPersonality,
      activityLevel: testAnswers.physicalActivity,
      surpriseLevel: testAnswers.surpriseFactor,
      socialSetting: testAnswers.socialSettings,
      environment: testAnswers.preferredEnvironment,
      frequency: testAnswers.dateFrequency,
      nightLife: testAnswers.nightLife,
      culturalInterests: testAnswers.culturalInterests || [],
      timeline: testAnswers.citasTimeline,
      seasonPreference: testAnswers.seasonPreference,
      hobbies: testAnswers.hobbies || [],
      budget: testAnswers.budget,
      additionalNotes: testAnswers.additionalComments
    };
    return profile;
  };

  const handleAnswer = (questionId, value) => {
    const question = questions[currentQuestion];
    
    if (question.type === 'multiple') {
      const current = answers[questionId] || [];
      if (current.includes(value)) {
        setAnswers({
          ...answers,
          [questionId]: current.filter(v => v !== value)
        });
      } else {
        setAnswers({
          ...answers,
          [questionId]: [...current, value]
        });
      }
    } else {
      setAnswers({
        ...answers,
        [questionId]: value
      });
    }
  };

  const handleNext = () => {
    const question = questions[currentQuestion];
    
    if (!answers[question.id]) {
      toast({
        title: 'Por favor responde',
        description: 'Completa esta pregunta antes de continuar'
      });
      return;
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    const personality = calculatePersonality(answers);
    const budgetLevel = calculateBudgetLevel(answers.budget);
    const detailedProfile = generatePersonalityProfile(answers);
    
    const testResult = {
      completed: true,
      personality,
      budgetLevel,
      profile: detailedProfile,
      age: calculateAge(answers.birthDate),
      partnerAge: calculateAge(answers.partnerBirthDate),
      ...answers,
      completedAt: new Date().toISOString()
    };
    
    // Guardar en localStorage
    const userData = JSON.parse(localStorage.getItem('loversappUser') || '{}');
    userData.personalityTest = testResult;
    localStorage.setItem('loversappUser', JSON.stringify(userData));

    const normalizeToCurrentYear = (dateStr) => {
      if (!dateStr) return null;
      const [year, month, day] = dateStr.split('-').map(Number);
      if (!year || !month || !day) return null;
      const now = new Date();
      const normalized = new Date(now.getFullYear(), month - 1, day);
      const yyyy = normalized.getFullYear();
      const mm = String(normalized.getMonth() + 1).padStart(2, '0');
      const dd = String(normalized.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const upsertImportantDate = ({
      sourceType,
      title,
      dateStr,
      description,
      type,
      icon,
      color
    }) => {
      if (!dateStr) return;
      const normalizedDate = normalizeToCurrentYear(dateStr);
      if (!normalizedDate) return;

      const stored = JSON.parse(localStorage.getItem('importantDates') || '[]');
      const existing = stored.find((item) => item.sourceType === sourceType);
      const baseItem = {
        title,
        date: normalizedDate,
        description,
        type,
        icon,
        color,
        sourceType
      };

      const updated = existing
        ? stored.map((item) => (item.id === existing.id ? { ...item, ...baseItem } : item))
        : [{ id: Date.now(), ...baseItem }, ...stored];

      const savedItem = existing
        ? updated.find((item) => item.id === existing.id)
        : updated[0];

      localStorage.setItem('importantDates', JSON.stringify(updated));

      upsertCalendarEvent({
        title: `${type === 'birthday' ? 'Cumpleaños' : 'Fecha'}: ${title}`,
        description: description || 'Fecha importante',
        dateStr: normalizedDate,
        sourceType: 'important-date',
        sourceId: savedItem.id
      });
    };

    const userName = userData.name?.trim() || '';
    const partnerName = userData.partner?.trim() || '';

    upsertImportantDate({
      sourceType: 'user-birthday',
      title: userName ? `Cumpleaños de ${userName}` : 'Tu cumpleaños',
      dateStr: answers.birthDate,
      description: 'Cumpleaños',
      type: 'birthday',
      icon: '🎂',
      color: 'from-blue-500 to-cyan-500'
    });

    upsertImportantDate({
      sourceType: 'partner-birthday',
      title: partnerName ? `Cumpleaños de ${partnerName}` : 'Cumpleaños de tu pareja',
      dateStr: answers.partnerBirthDate,
      description: 'Cumpleaños',
      type: 'birthday',
      icon: '🎂',
      color: 'from-blue-500 to-cyan-500'
    });
    
    setCompleted(true);
    
    toast({
      title: '¡Test completado!',
      description: 'Hemos personalizado tus 100 citas especiales'
    });
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isAnswered = answers[questions[currentQuestion].id];

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-lg opacity-50"
              />
              <CheckCircle className="w-28 h-28 text-red-500 mx-auto fill-red-500 relative z-10" />
            </div>
          </motion.div>

          {/* Success Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-4xl font-black text-black mb-4">¡Perfecto! 💕</h1>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Hemos personalizado vuestras <span className="font-bold text-red-500">100 citas especiales</span> según vuestra personalidad, edad, presupuesto y preferencias.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white border-3 border-red-500 rounded-xl p-4 mb-8 space-y-2"
          >
            <p className="text-sm text-gray-600">
              <span className="font-bold text-black">Personalidad:</span> {answers.personalityType ? answers.personalityType.replace(/_/g, ' ').toUpperCase() : 'Equilibrada'}
            </p>
            {answers.citasTimeline && (
              <p className="text-sm text-gray-600">
                <span className="font-bold text-black">Meta:</span> Completar en {answers.citasTimeline.replace(/_/g, ' ').toUpperCase()}
              </p>
            )}
            {answers.hobbies && answers.hobbies.length > 0 && (
              <p className="text-sm text-gray-600">
                <span className="font-bold text-black">Intereses:</span> {answers.hobbies.join(', ')}
              </p>
            )}
          </motion.div>

          {/* Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('citas-personalizadas')}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition font-bold text-lg border-3 border-red-600"
          >
            Ver mis 100 Citas Personalizadas ❤️
          </motion.button>

          {/* Alternative Action */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={() => navigateTo('dashboard')}
            className="w-full mt-3 px-6 py-2 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition font-semibold"
          >
            Ir al Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-black">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2 text-black hover:text-red-500 transition mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-black mb-2">Conocerte Mejor ❤️</h1>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-red-500 h-2 rounded-full transition-all"
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Pregunta {currentQuestion + 1} de {questions.length}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h2 className="text-2xl font-bold text-black mb-2">{question.question}</h2>
          <p className="text-gray-600 mb-6">{question.subtitle}</p>

          {/* Render según tipo de pregunta */}
          {question.type === 'date' && (
            <input
              type="date"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
            />
          )}

          {question.type === 'text' && (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none h-32"
            />
          )}

          {(question.type === 'single' || question.type === 'multiple') && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(question.id, option.id)}
                  className={`w-full p-4 border-2 rounded-lg transition text-left font-semibold ${
                    question.type === 'multiple'
                      ? answers[question.id]?.includes(option.id)
                        ? 'border-red-500 bg-red-50 text-black'
                        : 'border-gray-300 hover:border-red-500 text-black'
                      : answers[question.id] === option.id
                      ? 'border-red-500 bg-red-50 text-black'
                      : 'border-gray-300 hover:border-red-500 text-black'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {currentQuestion === questions.length - 1 ? 'Completar' : 'Siguiente'}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
