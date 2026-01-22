import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Book, TrendingUp, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const HomePage = ({ navigateTo }) => {
  const [completedCount, setCompletedCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    const completed = dates.filter(d => d.status === 'completed').length;
    setCompletedCount(completed);
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

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col gap-4 max-w-md mx-auto"
        >
          <Button
            onClick={() => navigateTo('list')}
            className="h-14 text-lg bg-black text-white hover:bg-gray-800 transition-all duration-300 border-2 border-black group"
          >
            <Book className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Ver todas las citas
          </Button>

          <Button
            onClick={handleRandomDate}
            variant="outline"
            className="h-14 text-lg bg-white text-black border-2 border-black hover:bg-gray-50 transition-all duration-300 group"
          >
            <Shuffle className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Ruleta de citas
          </Button>

          <Button
            onClick={() => navigateTo('stats')}
            variant="outline"
            className="h-14 text-lg bg-white text-black border-2 border-black hover:bg-gray-50 transition-all duration-300 group"
          >
            <TrendingUp className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Ver estadísticas
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