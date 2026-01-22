import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Star, Upload, Trash2, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const DateDetailPage = ({ dateId, navigateTo }) => {
  const [date, setDate] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDate();
  }, [dateId]);

  const loadDate = () => {
    const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    const foundDate = dates.find(d => d.id === dateId);
    setDate(foundDate);
  };

  const saveDate = (updatedDate) => {
    const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    const index = dates.findIndex(d => d.id === dateId);
    dates[index] = updatedDate;
    localStorage.setItem('coupleDates', JSON.stringify(dates));
    setDate(updatedDate);
  };

  const handleMarkComplete = () => {
    const updatedDate = { ...date, status: 'completed' };
    saveDate(updatedDate);
    toast({
      title: "¡Cita completada! 🎉",
      description: "Esta cita ha sido marcada como completada.",
    });
  };

  const handleMarkPending = () => {
    const updatedDate = { ...date, status: 'pending' };
    saveDate(updatedDate);
    toast({
      title: "Cita marcada como pendiente",
      description: "Esta cita ha sido marcada como pendiente.",
    });
  };

  const handleInputChange = (field, value) => {
    const updatedDate = { ...date, [field]: value };
    saveDate(updatedDate);
  };

  const handleRatingChange = (person, type, value) => {
    const updatedDate = {
      ...date,
      [`${person}Rating`]: {
        ...date[`${person}Rating`],
        [type]: value
      }
    };
    saveDate(updatedDate);
  };

  const handlePhotoUpload = (person) => {
    toast({
      title: "🚧 Esta función no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  if (!date) return null;

  const RatingStars = ({ person, type }) => {
    const rating = date[`${person}Rating`][type];
    const Icon = type === 'hearts' ? Heart : Star;
    const color = type === 'hearts' ? 'text-red-500' : 'text-yellow-400';

    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Icon
            key={i}
            className={`w-6 h-6 cursor-pointer transition-all duration-200 hover:scale-110 ${
              i < rating ? `${color} fill-current` : 'text-gray-300'
            }`}
            onClick={() => handleRatingChange(person, type, i + 1)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-black bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Button
            onClick={() => navigateTo('list')}
            variant="ghost"
            className="mb-4 text-black hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </Button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif text-black mb-2">
                Cita #{date.id}
              </h1>
              <input
                type="text"
                value={date.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-2xl font-serif text-gray-700 border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-black focus:outline-none bg-transparent transition-all w-full max-w-md"
                placeholder="Nombre de la cita"
              />
            </div>
            <Button
              onClick={date.status === 'completed' ? handleMarkPending : handleMarkComplete}
              className={`${
                date.status === 'completed'
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : 'bg-black hover:bg-gray-800'
              } text-white transition-all duration-300`}
            >
              {date.status === 'completed' ? 'Marcar como pendiente' : 'Marcar como completada'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Date and Location */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <Label className="text-sm font-sans text-gray-600 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha
            </Label>
            <input
              type="date"
              value={date.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-3 border-2 border-black rounded-lg font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <Label className="text-sm font-sans text-gray-600 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ubicación
            </Label>
            <input
              type="text"
              value={date.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="¿Dónde fue la cita?"
              className="w-full px-4 py-3 border-2 border-black rounded-lg font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Photo Galleries */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Daniela's POV */}
          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-4">POV: Daniela</h3>
            <Button
              onClick={() => handlePhotoUpload('daniela')}
              variant="outline"
              className="w-full border-2 border-black hover:bg-gray-50 mb-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir fotos
            </Button>
            <div className="grid grid-cols-2 gap-2 min-h-[100px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
              <p className="col-span-2 text-sm text-gray-500 text-center font-sans">
                Las fotos aparecerán aquí
              </p>
            </div>
          </div>

          {/* Eduardo's POV */}
          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-4">POV: Eduardo</h3>
            <Button
              onClick={() => handlePhotoUpload('eduardo')}
              variant="outline"
              className="w-full border-2 border-black hover:bg-gray-50 mb-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir fotos
            </Button>
            <div className="grid grid-cols-2 gap-2 min-h-[100px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
              <p className="col-span-2 text-sm text-gray-500 text-center font-sans">
                Las fotos aparecerán aquí
              </p>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Daniela's Rating */}
          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-6">Calificación de Daniela</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-sans text-gray-600 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Emocional
                </Label>
                <RatingStars person="daniela" type="hearts" />
              </div>
              <div>
                <Label className="text-sm font-sans text-gray-600 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Diversión
                </Label>
                <RatingStars person="daniela" type="stars" />
              </div>
            </div>
          </div>

          {/* Eduardo's Rating */}
          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-6">Calificación de Eduardo</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-sans text-gray-600 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Emocional
                </Label>
                <RatingStars person="eduardo" type="hearts" />
              </div>
              <div>
                <Label className="text-sm font-sans text-gray-600 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Diversión
                </Label>
                <RatingStars person="eduardo" type="stars" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Daniela's Review */}
          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-4">Reseña de Daniela</h3>
            <textarea
              value={date.danielaReview || ''}
              onChange={(e) => handleInputChange('danielaReview', e.target.value)}
              placeholder="¿Qué te pareció esta cita?"
              className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg font-sans text-black focus:outline-none focus:border-black resize-none"
            />
          </div>

          {/* Eduardo's Review */}
          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-4">Reseña de Eduardo</h3>
            <textarea
              value={date.eduardoReview || ''}
              onChange={(e) => handleInputChange('eduardoReview', e.target.value)}
              placeholder="¿Qué te pareció esta cita?"
              className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg font-sans text-black focus:outline-none focus:border-black resize-none"
            />
          </div>
        </div>

        {/* One Word */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-4">La cita en una palabra (Daniela)</h3>
            <input
              type="text"
              value={date.danielaOneWord || ''}
              onChange={(e) => handleInputChange('danielaOneWord', e.target.value)}
              placeholder="Una palabra..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-sans text-black focus:outline-none focus:border-black"
            />
          </div>

          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-4">La cita en una palabra (Eduardo)</h3>
            <input
              type="text"
              value={date.eduardoOneWord || ''}
              onChange={(e) => handleInputChange('eduardoOneWord', e.target.value)}
              placeholder="Una palabra..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-sans text-black focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Best Part */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-4">Lo mejor de la cita (Daniela)</h3>
            <textarea
              value={date.danielaBestPart || ''}
              onChange={(e) => handleInputChange('danielaBestPart', e.target.value)}
              placeholder="¿Cuál fue tu parte favorita?"
              className="w-full h-24 px-4 py-3 border-2 border-gray-300 rounded-lg font-sans text-black focus:outline-none focus:border-black resize-none"
            />
          </div>

          <div className="border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-serif text-black mb-4">Lo mejor de la cita (Eduardo)</h3>
            <textarea
              value={date.eduardoBestPart || ''}
              onChange={(e) => handleInputChange('eduardoBestPart', e.target.value)}
              placeholder="¿Cuál fue tu parte favorita?"
              className="w-full h-24 px-4 py-3 border-2 border-gray-300 rounded-lg font-sans text-black focus:outline-none focus:border-black resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateDetailPage;