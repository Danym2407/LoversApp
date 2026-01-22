import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Star, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const DatesListPage = ({ navigateTo }) => {
  const [dates, setDates] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDates();
  }, []);

  const loadDates = () => {
    const storedDates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    const sortedDates = storedDates.sort((a, b) => a.priority - b.priority);
    setDates(sortedDates);
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newDates = [...dates];
    const draggedDate = newDates[draggedItem];
    newDates.splice(draggedItem, 1);
    newDates.splice(index, 0, draggedDate);

    // Update priorities
    newDates.forEach((date, idx) => {
      date.priority = idx + 1;
    });

    setDates(newDates);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    if (draggedItem !== null) {
      localStorage.setItem('coupleDates', JSON.stringify(dates));
      toast({
        title: "Orden actualizado",
        description: "Las prioridades de las citas han sido guardadas.",
      });
    }
    setDraggedItem(null);
  };

  const completedCount = dates.filter(d => d.status === 'completed').length;

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
          <h1 className="text-4xl md:text-5xl font-serif text-black mb-2">Nuestras 100 Citas</h1>
          <p className="text-gray-600 font-sans">
            {completedCount} completadas • {100 - completedCount} pendientes
          </p>
        </div>
      </div>

      {/* Dates Grid */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6 p-4 bg-gray-50 border-2 border-black rounded-lg">
          <p className="text-sm text-gray-700 font-sans flex items-center gap-2">
            <GripVertical className="w-4 h-4" />
            Arrastra las citas para cambiar su prioridad
          </p>
        </div>

        <div className="grid gap-4">
          {dates.map((date, index) => (
            <motion.div
              key={date.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`border-2 border-black rounded-lg p-4 cursor-move hover:shadow-lg transition-all duration-300 ${
                date.status === 'completed' ? 'bg-gray-50' : 'bg-white'
              } ${draggedItem === index ? 'opacity-50' : ''}`}
              onClick={() => navigateTo('detail', date.id)}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-black font-mono">#{date.id}</span>
                    <span className="text-lg font-serif text-black">{date.name}</span>
                  </div>
                  
                  {date.status === 'completed' && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {date.date && <span className="font-sans">{date.date}</span>}
                      {date.location && <span className="font-sans">• {date.location}</span>}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  {date.status === 'completed' ? (
                    <>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Heart
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round((date.danielaRating.hearts + date.eduardoRating.hearts) / 2)
                                ? 'text-red-500 fill-red-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round((date.danielaRating.stars + date.eduardoRating.stars) / 2)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-white border-2 border-black text-black text-xs font-sans rounded-full">
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatesListPage;