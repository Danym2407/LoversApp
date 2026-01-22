import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Star, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatsPage = ({ navigateTo }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    const completed = dates.filter(d => d.status === 'completed');

    if (completed.length === 0) {
      setStats({ completed: [], total: dates.length, completedCount: 0 });
      return;
    }

    // Calculate averages
    const avgDanielaHearts = completed.reduce((sum, d) => sum + d.danielaRating.hearts, 0) / completed.length;
    const avgDanielaStars = completed.reduce((sum, d) => sum + d.danielaRating.stars, 0) / completed.length;
    const avgEduardoHearts = completed.reduce((sum, d) => sum + d.eduardoRating.hearts, 0) / completed.length;
    const avgEduardoStars = completed.reduce((sum, d) => sum + d.eduardoRating.stars, 0) / completed.length;

    // Find top rated date
    const topDate = completed.reduce((top, current) => {
      const currentAvg = (current.danielaRating.hearts + current.danielaRating.stars + 
                         current.eduardoRating.hearts + current.eduardoRating.stars) / 4;
      const topAvg = (top.danielaRating.hearts + top.danielaRating.stars + 
                     top.eduardoRating.hearts + top.eduardoRating.stars) / 4;
      return currentAvg > topAvg ? current : top;
    });

    // Count locations
    const locationCounts = {};
    completed.forEach(d => {
      if (d.location) {
        locationCounts[d.location] = (locationCounts[d.location] || 0) + 1;
      }
    });
    const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0];

    // Collect words
    const allWords = [
      ...completed.map(d => d.danielaOneWord).filter(Boolean),
      ...completed.map(d => d.eduardoOneWord).filter(Boolean)
    ];

    setStats({
      completed,
      total: dates.length,
      completedCount: completed.length,
      avgDanielaHearts,
      avgDanielaStars,
      avgEduardoHearts,
      avgEduardoStars,
      topDate,
      topLocation,
      allWords
    });
  };

  if (!stats) return null;

  if (stats.completedCount === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b-2 border-black bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Button
              onClick={() => navigateTo('home')}
              variant="ghost"
              className="mb-4 text-black hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-4xl md:text-5xl font-serif text-black">Nuestras Estadísticas</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-xl text-gray-600 font-sans">
            Aún no hay citas completadas para mostrar estadísticas. ¡Empiecen su aventura! 💕
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-black bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Button
            onClick={() => navigateTo('home')}
            variant="ghost"
            className="mb-4 text-black hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-4xl md:text-5xl font-serif text-black mb-2">Nuestro Año en Citas</h1>
          <p className="text-gray-600 font-sans">Estilo Spotify Wrapped 💕</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-4 border-black rounded-lg p-8 bg-gradient-to-br from-red-50 to-yellow-50"
        >
          <div className="text-center">
            <p className="text-lg font-sans text-gray-700 mb-2">Han completado</p>
            <p className="text-7xl font-bold text-black font-mono mb-2">{stats.completedCount}</p>
            <p className="text-2xl font-serif text-gray-700">citas increíbles juntos</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
          </div>
        </motion.div>

        {/* Average Ratings */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 border-black rounded-lg p-6"
          >
            <h3 className="text-2xl font-serif text-black mb-4">Daniela</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-gray-600">Promedio emocional</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(stats.avgDanielaHearts)
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-gray-600">Promedio diversión</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(stats.avgDanielaStars)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 border-black rounded-lg p-6"
          >
            <h3 className="text-2xl font-serif text-black mb-4">Eduardo</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-gray-600">Promedio emocional</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(stats.avgEduardoHearts)
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-gray-600">Promedio diversión</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(stats.avgEduardoStars)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-2 border-black rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-white"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-black" />
            <h3 className="text-2xl font-serif text-black">Su cita mejor calificada</h3>
          </div>
          <div className="pl-8">
            <p className="text-3xl font-bold text-black font-mono mb-2">Cita #{stats.topDate.id}</p>
            <p className="text-xl font-serif text-gray-700 mb-2">{stats.topDate.name}</p>
            {stats.topDate.location && (
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="font-sans">{stats.topDate.location}</span>
              </div>
            )}
            <div className="flex gap-4 items-center">
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round((stats.topDate.danielaRating.hearts + stats.topDate.eduardoRating.hearts) / 2)
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round((stats.topDate.danielaRating.stars + stats.topDate.eduardoRating.stars) / 2)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Location */}
        {stats.topLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border-2 border-black rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-black" />
              <h3 className="text-2xl font-serif text-black">Su lugar favorito</h3>
            </div>
            <div className="pl-8">
              <p className="text-3xl font-bold text-black mb-2">{stats.topLocation[0]}</p>
              <p className="text-gray-600 font-sans">
                {stats.topLocation[1]} {stats.topLocation[1] === 1 ? 'cita' : 'citas'} aquí
              </p>
            </div>
          </motion.div>
        )}

        {/* Words Cloud */}
        {stats.allWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="border-2 border-black rounded-lg p-6"
          >
            <h3 className="text-2xl font-serif text-black mb-4">Sus citas en palabras</h3>
            <div className="flex flex-wrap gap-2">
              {stats.allWords.map((word, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-black text-white font-sans rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;