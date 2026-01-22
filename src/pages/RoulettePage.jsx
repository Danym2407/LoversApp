import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Star, Volume2, VolumeX, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const RoulettePage = ({ navigateTo }) => {
  const [dates, setDates] = useState([]);
  const [pendingDates, setPendingDates] = useState([]);
  const [gameState, setGameState] = useState('idle'); // idle, spinning, envelope, card
  const [selectedDate, setSelectedDate] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const wheelRef = useRef(null);
  const { toast } = useToast();

  // Load dates
  useEffect(() => {
    const storedDates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    setDates(storedDates);
    const pending = storedDates.filter(d => d.status === 'pending');
    setPendingDates(pending);
  }, []);

  // Spin Logic
  const spinWheel = () => {
    if (pendingDates.length === 0) {
      toast({
        title: "¡Misión cumplida! 🎉",
        description: "Ya no quedan citas pendientes. ¡Han completado su diario!",
      });
      return;
    }

    setGameState('spinning');
    
    // Pick random date
    const randomIndex = Math.floor(Math.random() * pendingDates.length);
    const result = pendingDates[randomIndex];
    setSelectedDate(result);

    // Calculate rotation: current + (5 to 10 full spins) + random segment offset
    // This ensures it always spins forward significantly
    const spins = 360 * (5 + Math.random() * 5); 
    const randomOffset = Math.random() * 360;
    const newRotation = rotation + spins + randomOffset;
    
    setRotation(newRotation);

    // Play sound if not muted (Placeholder logic)
    if (!isMuted) {
      // In a real app, you would play an audio file here
      // const audio = new Audio('/spin.mp3');
      // audio.play().catch(e => console.log('Audio play failed'));
    }

    // Wait for spin animation to finish (approx 4 seconds based on CSS transition)
    setTimeout(() => {
      setGameState('envelope');
    }, 4000);
  };

  const openEnvelope = () => {
    setGameState('card');
    if (!isMuted) {
      // Celebration sound placeholder
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setSelectedDate(null);
  };

  // Confetti Component
  const Confetti = () => {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: -50, 
              x: Math.random() * window.innerWidth,
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              y: window.innerHeight + 100, 
              rotate: Math.random() * 360,
              opacity: 0
            }}
            transition={{ 
              duration: 2 + Math.random() * 3,
              ease: "linear",
              delay: Math.random() * 0.5
            }}
            className="absolute top-0"
          >
            {i % 2 === 0 ? (
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            ) : (
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 transform -rotate-12"><Heart size={64} /></div>
        <div className="absolute bottom-20 right-20 transform rotate-12"><Star size={64} /></div>
        <div className="absolute top-1/2 left-20 transform rotate-45"><Star size={48} /></div>
        <div className="absolute bottom-10 left-1/3 transform -rotate-12"><Heart size={48} /></div>
      </div>

      {/* Header */}
      <div className="p-6 flex justify-between items-center z-10">
        <Button
          onClick={() => navigateTo('home')}
          variant="ghost"
          className="text-black hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <Button
          onClick={() => setIsMuted(!isMuted)}
          variant="ghost"
          size="icon"
          className="text-black hover:bg-gray-100 rounded-full"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <AnimatePresence mode="wait">
          
          {/* STATE: WHEEL */}
          {(gameState === 'idle' || gameState === 'spinning') && (
            <motion.div
              key="wheel-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
              className="flex flex-col items-center"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-black mb-12 text-center">
                ¿Qué cita nos toca?
              </h2>

              <div className="relative mb-12">
                {/* Pointer */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                  <motion.div
                    animate={gameState === 'spinning' ? { rotate: [-10, 10, -10] } : {}}
                    transition={{ repeat: Infinity, duration: 0.2 }}
                  >
                    <Heart className="w-12 h-12 text-red-500 fill-red-500 drop-shadow-md" />
                  </motion.div>
                </div>

                {/* The Wheel */}
                <div className="relative w-80 h-80 md:w-96 md:h-96">
                  {/* Outer rim */}
                  <div className="absolute inset-0 rounded-full border-8 border-black bg-white shadow-xl overflow-hidden">
                    <motion.div
                      ref={wheelRef}
                      className="w-full h-full relative"
                      animate={{ rotate: rotation }}
                      transition={{ 
                        duration: 4, 
                        ease: [0.15, 0, 0.15, 1] // Custom bezier for realistic spin-down
                      }}
                    >
                      {/* Wheel Segments - Visual only */}
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-full h-full top-0 left-0"
                          style={{ transform: `rotate(${i * 30}deg)` }}
                        >
                          <div className="w-1 h-1/2 mx-auto bg-gray-100 origin-bottom mt-0" />
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-400">
                            {['★', '♥', '★', '♥'][i % 4]}
                          </div>
                        </div>
                      ))}
                      
                      {/* Center Hub */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-32 h-32 rounded-full border-4 border-black bg-white flex items-center justify-center z-10">
                            <span className="font-serif text-xl italic">Daniela & Eduardo</span>
                         </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <Button
                onClick={spinWheel}
                disabled={gameState === 'spinning'}
                className="h-16 px-12 text-xl bg-black text-white hover:bg-gray-800 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {gameState === 'spinning' ? (
                  <span className="flex items-center">
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                    Girando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Girar la ruleta
                    <Star className="w-5 h-5 ml-2 group-hover:rotate-180 transition-transform duration-500 text-yellow-400 fill-yellow-400" />
                  </span>
                )}
              </Button>
            </motion.div>
          )}

          {/* STATE: ENVELOPE */}
          {gameState === 'envelope' && (
            <motion.div
              key="envelope-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center cursor-pointer"
              onClick={openEnvelope}
            >
               <h2 className="text-3xl font-serif text-black mb-8 animate-pulse">
                ¡Tenemos una cita! Toca para abrir 💌
              </h2>

              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative w-80 h-56"
              >
                {/* Envelope Back */}
                <div className="absolute inset-0 bg-gray-100 border-2 border-black rounded-lg shadow-xl" />
                
                {/* Envelope Flap (Closed) */}
                <div className="absolute top-0 left-0 w-full h-0 border-l-[160px] border-l-transparent border-t-[100px] border-t-gray-200 border-r-[160px] border-r-transparent drop-shadow-sm origin-top" />
                
                {/* Envelope Bottom Folds */}
                <div className="absolute bottom-0 left-0 w-full h-0 border-l-[160px] border-l-transparent border-b-[112px] border-b-white border-r-[160px] border-r-transparent rounded-b-lg opacity-90" />
                
                {/* Wax Seal */}
                <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-md border-4 border-red-700">
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* STATE: CARD REVEAL */}
          {gameState === 'card' && selectedDate && (
            <motion.div
              key="card-result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center w-full max-w-md px-4"
            >
              <Confetti />
              
              <div className="bg-white p-8 rounded-lg shadow-2xl border-4 border-black w-full text-center relative mb-8">
                {/* Card Decoration */}
                <div className="absolute top-4 left-4"><Heart className="w-6 h-6 text-red-500" /></div>
                <div className="absolute top-4 right-4"><Star className="w-6 h-6 text-yellow-400" /></div>
                <div className="absolute bottom-4 left-4"><Star className="w-6 h-6 text-yellow-400" /></div>
                <div className="absolute bottom-4 right-4"><Heart className="w-6 h-6 text-red-500" /></div>

                <div className="mb-6">
                  <span className="inline-block px-4 py-1 bg-black text-white rounded-full font-mono text-sm mb-4">
                    CITA #{selectedDate.id}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-serif text-black leading-tight mb-2">
                    {selectedDate.name}
                  </h3>
                </div>

                <div className="w-full h-0.5 bg-gray-100 my-6" />

                <div className="space-y-4">
                  <Button
                    onClick={() => navigateTo('detail', selectedDate.id)}
                    className="w-full h-14 text-lg bg-black text-white hover:bg-gray-800 transition-all rounded-lg group"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Ver detalles de la cita
                  </Button>
                  
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="w-full h-14 text-lg border-2 border-black hover:bg-gray-50 transition-all rounded-lg"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Girar otra vez
                  </Button>
                </div>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-500 font-serif italic"
              >
                Esta será su próxima historia juntos 💌
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoulettePage;