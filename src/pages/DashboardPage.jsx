import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Ticket, Gamepad2, Flame, Mail, Clock, Image, Bell, Hourglass, User as UserIcon, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage({ navigateTo, onLogout, onOpenLogin, isAuthenticated }) {
  const [user, setUser] = useState(null);
  const [timeData, setTimeData] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [relationshipStartDate, setRelationshipStartDate] = useState(null);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);
  const [dismissTestBanner, setDismissTestBanner] = useState(false);

  const calculateDaysTogether = () => {
    const userData = localStorage.getItem('loversappUser');
    if (userData) {
      const userData_obj = JSON.parse(userData);
      if (userData_obj.relationshipStartDate) {
        setRelationshipStartDate(userData_obj.relationshipStartDate);
        const startDate = new Date(userData_obj.relationshipStartDate);
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
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('loversappUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setHasCompletedTest(!!parsedUser.personalityTest?.completed);
    }

    calculateDaysTogether();
    
    // Actualizar contador cada segundo
    const interval = setInterval(calculateDaysTogether, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    if (user?.name && user?.partner) {
      return `${user.name} & ${user.partner}`;
    }
    return 'LoversApp 💕';
  };
  const categories = [
    {
      id: 'home',
      title: '100 Citas',
      description: 'Nuestras citas favoritas',
      icon: Heart,
      color: 'border-red-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-red-500'
    },
    {
      id: 'calendar',
      title: 'Calendario',
      description: 'Vista de todos los meses',
      icon: Calendar,
      color: 'border-yellow-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-yellow-600'
    },
    {
      id: 'registry',
      title: 'Registro de Salidas',
      description: 'Dónde hemos estado',
      icon: Ticket,
      color: 'border-red-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-red-500'
    },
    {
      id: 'games',
      title: 'Jueguito',
      description: 'Juega con tu pareja',
      icon: Gamepad2,
      color: 'border-yellow-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-yellow-600'
    },
    {
      id: 'challenges',
      title: 'Retos Diarios',
      description: 'Beso, cumplido, sorpresa',
      icon: Flame,
      color: 'border-red-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-red-500'
    },
    {
      id: 'letters',
      title: 'Cartas Digitales',
      description: 'Mensajes especiales',
      icon: Mail,
      color: 'border-red-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-red-500'
    },
    {
      id: 'timeline',
      title: 'Línea del Tiempo',
      description: 'Nuestra historia juntos',
      icon: Clock,
      color: 'border-yellow-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-yellow-600'
    },
    {
      id: 'moments',
      title: 'Momentos Favoritos',
      description: 'Recuerdos con nota y fecha',
      icon: Image,
      color: 'border-red-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-red-500'
    },
    {
      id: 'important-dates',
      title: 'Fechas Importantes',
      description: 'Aniversarios y especiales',
      icon: Bell,
      color: 'border-yellow-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-yellow-600'
    },
    {
      id: 'countdown',
      title: 'Countdown',
      description: 'Citas y viajes próximos',
      icon: Hourglass,
      color: 'border-red-500',
      bgColor: 'bg-white',
      textColor: 'text-black',
      accentColor: 'text-red-500'
    },
    {
      id: 'citas-aleatorias',
      title: '🎲 Citas Aleatorias',
      description: 'Descubre citas mexicanas',
      icon: Heart,
      color: 'border-pink-500',
      bgColor: 'bg-gradient-to-br from-pink-50 to-blue-50',
      textColor: 'text-black',
      accentColor: 'text-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            {/* User Profile Icon - Left */}
            {isAuthenticated && user && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigateTo('profile')}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition group"
                title="Mi Perfil"
              >
                <UserIcon className="w-6 h-6 text-black group-hover:text-red-500 transition" />
                <span className="font-semibold text-black group-hover:text-red-500 transition text-sm">
                  {user.name}
                </span>
              </motion.button>
            )}
            {!isAuthenticated && (
              <div></div>
            )}
            
            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  {/* Login Button (Black) */}
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => onOpenLogin('login')}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-bold"
                  >
                    Iniciar Sesión
                  </motion.button>
                  
                  {/* Register Button (Red) */}
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    onClick={() => onOpenLogin('register')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-bold"
                  >
                    Registrarse
                  </motion.button>
                </>
              ) : (
                /* Logout Button (only if authenticated) */
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={onLogout}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-semibold"
                >
                  Salir
                </motion.button>
              )}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black">
              LoversApp
              <span className="text-red-500 ml-2">💕</span>
            </h1>
            <p className="text-black mt-2 font-semibold">Nuestra app de pareja</p>
            
            {/* Days Together Counter */}
            {relationshipStartDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 inline-block px-6 py-2 border-2 border-red-500 rounded-full bg-red-50"
              >
                <p className="text-sm font-bold text-red-600">
                  Días Juntos: <span className="text-lg font-mono">{timeData.years}a {timeData.days}d {String(timeData.hours).padStart(2, '0')}:{String(timeData.minutes).padStart(2, '0')}:{String(timeData.seconds).padStart(2, '0')}</span>
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Test Completion Banner */}
        {isAuthenticated && !hasCompletedTest && !dismissTestBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 bg-gradient-to-r from-purple-100 via-red-100 to-pink-100 border-3 border-red-500 rounded-2xl p-6 flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-bold text-black mb-2">
                ¿Aún no han hecho el Test de Personalidad? 🔥
              </h3>
              <p className="text-gray-700">
                Responde 16 preguntas en 5 minutos para recibir <span className="font-bold text-red-600">100 citas personalizadas</span> diseñadas especialmente para ustedes.
              </p>
            </div>
            <div className="flex gap-3 ml-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateTo('personality-test')}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold whitespace-nowrap"
              >
                Hacer Test Ahora
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDismissTestBanner(true)}
                className="px-4 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition font-bold"
              >
                Más tarde
              </motion.button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                onClick={() => navigateTo(category.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                {/* Card Background */}
                <div className={`${category.bgColor} rounded-2xl p-6 h-40 border-3 ${category.color} transition-all duration-300 shadow-lg hover:shadow-2xl hover:border-black`}>
                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center text-center">
                    <div className={`mb-3 p-3 rounded-full bg-black ${category.accentColor}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`font-bold ${category.textColor} text-sm md:text-base leading-tight`}>
                      {category.title}
                    </h3>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
