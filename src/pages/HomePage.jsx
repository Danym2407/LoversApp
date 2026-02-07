import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Book, TrendingUp, Shuffle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const HomePage = ({ navigateTo }) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [relationshipStartDate, setRelationshipStartDate] = useState(null);
  const [boyfriendDate, setBoyfriendDate] = useState(null);
  const [timeData, setTimeData] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { toast } = useToast();

  // Calcular tiempo juntos (años, días, horas, minutos, segundos)
  const calculateDaysTogether = () => {
    const userData = localStorage.getItem('loversappUser');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.relationshipStartDate) {
        setRelationshipStartDate(user.relationshipStartDate);
        const startDate = new Date(user.relationshipStartDate);
        const now = new Date();
        
        // Calcular la diferencia
        let years = now.getFullYear() - startDate.getFullYear();
        let months = now.getMonth() - startDate.getMonth();
        let days = now.getDate() - startDate.getDate();
        
        // Ajustar si es necesario
        if (days < 0) {
          months--;
          const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          days += prevMonth.getDate();
        }
        
        if (months < 0) {
          years--;
          months += 12;
        }
        
        // Calcular horas, minutos, segundos
        let hours = now.getHours() - startDate.getHours();
        let minutes = now.getMinutes() - startDate.getMinutes();
        let seconds = now.getSeconds() - startDate.getSeconds();
        
        if (seconds < 0) {
          minutes--;
          seconds += 60;
        }
        
        if (minutes < 0) {
          hours--;
          minutes += 60;
        }
        
        if (hours < 0) {
          days--;
          hours += 24;
        }
        
        // Convertir meses a días adicionales
        const totalDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const daysInYear = 365;
        const remainingDaysAfterYears = totalDays - (years * daysInYear);
        
        setTimeData({
          years,
          days: remainingDaysAfterYears,
          hours,
          minutes,
          seconds
        });
      }
      if (user.boyfriendDate) {
        setBoyfriendDate(user.boyfriendDate);
      }
    }
  };

  useEffect(() => {
    const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    const completed = dates.filter(d => d.status === 'completed').length;
    setCompletedCount(completed);
    
    calculateDaysTogether();
    
    // Actualizar contador cada segundo
    const interval = setInterval(calculateDaysTogether, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRandomDate = () => {
    const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    const pending = dates.filter(d => d.status === 'pending');
    
    if (pending.length === 0) {
      toast({
        title: "¡Todas completadas! 🎉",
        description: "Han completado todas las citas. ¡Qué amor tan bonito!",
      });
      return;
    }

    navigateTo('roulette');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative doodles */}
      <div className="absolute top-8 left-8 text-red-500 opacity-20">
        <Heart className="w-16 h-16" fill="currentColor" />
      </div>
      <div className="absolute bottom-12 right-12 text-yellow-400 opacity-20">
        <Star className="w-20 h-20" fill="currentColor" />
      </div>
      <div className="absolute top-1/4 right-1/4 text-red-500 opacity-10">
        <Heart className="w-12 h-12" fill="currentColor" />
      </div>
      <div className="absolute bottom-1/3 left-1/4 text-yellow-400 opacity-10">
        <Star className="w-10 h-10" fill="currentColor" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-6xl md:text-7xl font-serif text-black mb-4"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          100 citas de
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className="text-4xl md:text-5xl font-serif text-black">Daniela</span>
          <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
          <span className="text-4xl md:text-5xl font-serif text-black">Eduardo</span>
        </motion.div>

        {/* Progress Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="inline-block mb-12 px-8 py-4 border-4 border-black rounded-lg"
        >
          <div className="text-7xl font-bold text-black font-mono">
            {completedCount}/100
          </div>
          <div className="text-sm text-gray-600 mt-2 font-sans">citas completadas</div>
        </motion.div>

        {/* Days Together Counter */}
        {relationshipStartDate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mb-12 px-6 py-8 border-4 border-red-500 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 mx-auto w-full max-w-lg"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="w-7 h-7 text-red-500 fill-red-500" />
              <span className="text-2xl font-bold text-red-600">Juntos</span>
              <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            </div>
            
            {/* Time Counter Grid */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {/* Años */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white border-2 border-red-500 rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-bold text-red-600 font-mono">
                  {timeData.years}
                </div>
                <div className="text-xs font-semibold text-gray-600 mt-1">Años</div>
              </motion.div>

              {/* Días */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95 }}
                className="bg-white border-2 border-red-500 rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-bold text-red-600 font-mono">
                  {timeData.days}
                </div>
                <div className="text-xs font-semibold text-gray-600 mt-1">Días</div>
              </motion.div>

              {/* Horas */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-white border-2 border-red-500 rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-bold text-red-600 font-mono">
                  {String(timeData.hours).padStart(2, '0')}
                </div>
                <div className="text-xs font-semibold text-gray-600 mt-1">Horas</div>
              </motion.div>

              {/* Minutos */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05 }}
                className="bg-white border-2 border-red-500 rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-bold text-red-600 font-mono">
                  {String(timeData.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs font-semibold text-gray-600 mt-1">Min</div>
              </motion.div>

              {/* Segundos */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-white border-2 border-red-500 rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-bold text-red-600 font-mono">
                  {String(timeData.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs font-semibold text-gray-600 mt-1">Seg</div>
              </motion.div>
            </div>

            {/* Fecha inicio */}
            <div className="text-center text-sm text-gray-600 border-t border-red-200 pt-4">
              <p className="font-semibold">Desde: {new Date(relationshipStartDate).toLocaleDateString('es-ES')}</p>
              {boyfriendDate && (
                <p className="mt-2 text-red-600 font-semibold">
                  💑 Novios desde: {new Date(boyfriendDate).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col gap-4 max-w-md mx-auto"
        >
          <Button
            onClick={() => navigateTo('dates')}
            className="h-14 text-lg bg-black text-white hover:bg-gray-800 transition-all duration-300 border-2 border-black group"
          >
            <Book className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Ver todas las citas
          </Button>

          <Button
            onClick={() => navigateTo('roulette')}
            variant="outline"
            className="h-14 text-lg bg-white text-black border-2 border-red-500 hover:bg-red-50 transition-all duration-300 group"
          >
            <Shuffle className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Ruleta de citas
          </Button>

          <Button
            onClick={() => navigateTo('stats')}
            variant="outline"
            className="h-14 text-lg bg-white text-black border-2 border-yellow-500 hover:bg-yellow-50 transition-all duration-300 group"
          >
            <TrendingUp className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Ver estadísticas
          </Button>

          <Button
            onClick={() => navigateTo('dashboard')}
            className="h-14 text-lg bg-black text-white hover:shadow-lg transition-all duration-300 border-2 border-red-500 group"
          >
            ❤️ Ir a LoversApp
          </Button>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-12 h-0.5 bg-black opacity-20 mx-auto max-w-xs"
        />
      </motion.div>
    </div>
  );
};

export default HomePage;