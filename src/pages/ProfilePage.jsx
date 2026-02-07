import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft, Copy, Check, Trophy, Target, Users, Mail, Calendar, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilePage({ navigateTo }) {
  const [user, setUser] = useState(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [coupled, setCoupled] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [boyfriendDate, setBoyfriendDate] = useState('');
  const [personalityTest, setPersonalityTest] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [prefStats, setPrefStats] = useState({ likes: 0, dislikes: 0 });
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('loversappUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Generar código de pareja si no existe
      if (!parsedUser.partnerCode) {
        const code = generatePartnerCode();
        parsedUser.partnerCode = code;
        localStorage.setItem('loversappUser', JSON.stringify(parsedUser));
        setPartnerCode(code);
      } else {
        setPartnerCode(parsedUser.partnerCode);
      }

      // Verificar si está acoplado
      if (parsedUser.coupled) {
        setCoupled(true);
      }

      // Cargar fechas
      if (parsedUser.relationshipStartDate) {
        setRelationshipStartDate(parsedUser.relationshipStartDate);
      }
      if (parsedUser.boyfriendDate) {
        setBoyfriendDate(parsedUser.boyfriendDate);
      }

      // Cargar test de personalidad
      if (parsedUser.personalityTest) {
        setPersonalityTest(parsedUser.personalityTest);
      }

      // Cargar preferencias de citas
      if (parsedUser.citaPreferences) {
        setPreferences(parsedUser.citaPreferences);
        const likes = Object.values(parsedUser.citaPreferences).filter(p => p === 'like').length;
        const dislikes = Object.values(parsedUser.citaPreferences).filter(p => p === 'dislike').length;
        setPrefStats({ likes, dislikes });
      }
    }
  }, []);

  // Generar código único de pareja (6 caracteres alfanuméricos)
  const generatePartnerCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Copiar código al portapapeles
  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(partnerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Código copiado",
      description: "Tu código de pareja ha sido copiado al portapapeles"
    });
  };

  const formatLocalDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return '';
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Agregar pareja usando código
  const handleJoinPartner = (e) => {
    e.preventDefault();
    
    if (!inputCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de pareja"
      });
      return;
    }

    if (inputCode.toUpperCase() === partnerCode) {
      toast({
        title: "Error",
        description: "No puedes usar tu propio código. Pídele el código a tu pareja"
      });
      return;
    }

    // Aquí en una app real, verificarías el código contra la base de datos
    // Por ahora, lo guardamos como vinculado
    const updatedUser = {
      ...user,
      coupled: true,
      partnerCodeUsed: inputCode.toUpperCase()
    };
    
    localStorage.setItem('loversappUser', JSON.stringify(updatedUser));
    setCoupled(true);
    setInputCode('');
    setShowJoinForm(false);
    
    toast({
      title: "¡Vinculado!",
      description: "Ahora estás ligado como pareja en LoversApp 💕"
    });
  };

  // Agregar meta
  const handleAddGoal = (e) => {
    e.preventDefault();
    
    if (!newGoal.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una meta"
      });
      return;
    }

    const goals = user?.goals || [];
    const updatedGoals = [...goals, { id: Date.now(), text: newGoal, completed: false }];
    
    const updatedUser = {
      ...user,
      goals: updatedGoals
    };
    
    setUser(updatedUser);
    localStorage.setItem('loversappUser', JSON.stringify(updatedUser));
    setNewGoal('');
    
    toast({
      title: "Meta agregada",
      description: "Tu nueva meta ha sido agregada"
    });
  };

  // Marcar meta como completada
  const toggleGoal = (goalId) => {
    const updatedGoals = user?.goals?.map(goal =>
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ) || [];
    
    const updatedUser = {
      ...user,
      goals: updatedGoals
    };
    
    setUser(updatedUser);
    localStorage.setItem('loversappUser', JSON.stringify(updatedUser));
  };

  // Guardar fecha de inicio de relación
  const handleSaveRelationshipDate = () => {
    if (!relationshipStartDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha"
      });
      return;
    }

    const updatedUser = {
      ...user,
      relationshipStartDate
    };
    
    setUser(updatedUser);
    localStorage.setItem('loversappUser', JSON.stringify(updatedUser));
    
    toast({
      title: "Fecha guardada",
      description: "Se guardó la fecha de inicio de la relación"
    });
  };

  // Guardar fecha de novios
  const handleSaveBoyfriendDate = () => {
    if (!boyfriendDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha"
      });
      return;
    }

    const updatedUser = {
      ...user,
      boyfriendDate
    };
    
    setUser(updatedUser);
    localStorage.setItem('loversappUser', JSON.stringify(updatedUser));
    
    toast({
      title: "Fecha guardada",
      description: "Se guardó la fecha de cuando se volvieron novios"
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigateTo('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-black" />
            </motion.button>
            <h1 className="text-3xl font-black text-black">Mi Perfil</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <div>
              <p className="text-sm text-gray-600">Usuario</p>
              <h2 className="text-2xl font-bold text-black">{user?.name || 'Usuario'}</h2>
            </div>
          </div>
          {user.partner && (
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pareja</p>
                <h2 className="text-2xl font-bold text-black">{user.partner}</h2>
              </div>
            </div>
          )}
        </motion.div>

        {/* Partner Pairing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-4 border-red-500 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-bold text-black">Vincular Pareja</h3>
          </div>

          {!coupled ? (
            <div className="space-y-6">
              {/* Generate Code Section */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Tu Código de Pareja</p>
                <p className="text-xs text-gray-500 mb-3">Comparte este código con tu pareja para que se vinculen</p>
                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-100 border-2 border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-2xl font-black text-red-500 tracking-widest">
                      {partnerCode}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyCodeToClipboard}
                    className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-2 font-bold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copiar
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Join Section */}
              <div className="border-t-2 border-gray-200 pt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">¿Tu pareja ya tiene un código?</p>
                <button
                  onClick={() => setShowJoinForm(!showJoinForm)}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold"
                >
                  {showJoinForm ? 'Cancelar' : 'Ingresar Código de Pareja'}
                </button>

                {showJoinForm && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleJoinPartner}
                    className="mt-4 space-y-3"
                  >
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="Ingresa el código (6 caracteres)"
                      maxLength="6"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition text-center text-2xl font-black tracking-widest"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition font-bold"
                    >
                      Vincular Pareja
                    </motion.button>
                  </motion.form>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-50 to-yellow-50 border-2 border-red-500 rounded-xl p-6 text-center">
              <Heart className="w-8 h-8 text-red-500 fill-red-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-black">¡Ya están vinculados como pareja! 💕</p>
              <p className="text-sm text-gray-600 mt-2">Comparten todas las experiencias juntos</p>
            </div>
          )}
        </motion.div>

        {/* Relationship Dates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border-4 border-red-500 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-bold text-black">Fechas Importantes</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Relationship Start Date */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Fecha de Inicio 💕
              </label>
              <p className="text-xs text-gray-600 mb-3">Desde que empezaron a salir</p>
              <input
                type="date"
                value={relationshipStartDate}
                onChange={(e) => setRelationshipStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveRelationshipDate}
                className="w-full mt-3 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold"
              >
                Guardar
              </motion.button>
            </div>

            {/* Boyfriend Date */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Fecha de Novios 💑
              </label>
              <p className="text-xs text-gray-600 mb-3">Cuando se volvieron novios (opcional)</p>
              <input
                type="date"
                value={boyfriendDate}
                onChange={(e) => setBoyfriendDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveBoyfriendDate}
                className="w-full mt-3 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold"
              >
                Guardar
              </motion.button>
            </div>
          </div>

          {/* Display Saved Dates */}
          {relationshipStartDate && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              {relationshipStartDate && (
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-bold">Saliendo desde:</span> {new Date(relationshipStartDate).toLocaleDateString('es-ES')}
                </p>
              )}
              {boyfriendDate && (
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Novios desde:</span> {new Date(boyfriendDate).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          )}

          {(personalityTest?.birthDate || personalityTest?.partnerBirthDate) && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              {personalityTest?.birthDate && (
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-bold">Tu cumpleaños:</span> {formatLocalDate(personalityTest.birthDate)}
                </p>
              )}
              {personalityTest?.partnerBirthDate && (
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Cumpleaños de {user?.partner || 'tu pareja'}:</span> {formatLocalDate(personalityTest.partnerBirthDate)}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Personality Test Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-500 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-bold text-black">Test de Personalidad ❤️</h3>
          </div>

          {personalityTest ? (
            <div className="space-y-4">
              <div className="bg-white border-2 border-purple-300 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-3">
                  ✨ <span className="font-bold">Personalidad:</span> {personalityTest.personality.toUpperCase()}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <p className="text-xs text-gray-600">Tu edad</p>
                    <p className="font-bold text-lg text-black">{personalityTest.age} años</p>
                  </div>
                  <div className="p-3 bg-pink-100 rounded-lg">
                    <p className="text-xs text-gray-600">Edad de pareja</p>
                    <p className="font-bold text-lg text-black">{personalityTest.partnerAge} años</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg col-span-2">
                    <p className="text-xs text-gray-600">Presupuesto típico</p>
                    <p className="font-bold text-black">Nivel {personalityTest.budgetLevel}/5</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('personality-profile')}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-bold"
              >
                Ver mi Perfil de Personalidad 📊
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('citas-personalizadas')}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold"
              >
                Ver mis 100 Citas Personalizadas 💕
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const userData = JSON.parse(localStorage.getItem('loversappUser'));
                  delete userData.personalityTest;
                  localStorage.setItem('loversappUser', JSON.stringify(userData));
                  setPersonalityTest(null);
                  navigateTo('personality-test');
                  toast({
                    title: "Reiniciar Test",
                    description: "Respondiendo el test nuevamente..."
                  });
                }}
                className="w-full px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition font-bold"
              >
                Actualizar Test
              </motion.button>

              {/* Test Info */}
              {personalityTest?.completedAt && (
                <div className="text-center text-xs text-gray-600 pt-2 border-t border-purple-200">
                  <p>✓ Test completado el {new Date(personalityTest.completedAt).toLocaleDateString('es-ES')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Aún no has completado el test de personalidad. ¡Hazlo ahora para obtener citas personalizadas!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateTo('personality-test')}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-bold"
              >
                Hacer Test de Personalidad 🚀
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Preference Analytics Section */}
        {Object.keys(preferences).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.19 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 border-4 border-green-500 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-6 h-6 text-green-600" />
              <h3 className="text-2xl font-bold text-black">Preferencias de Citas 💚</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border-3 border-green-400 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ThumbsUp className="w-6 h-6 text-green-600 fill-green-600" />
                  <span className="text-4xl font-black text-green-600">{prefStats.likes}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Me gusta</p>
              </div>

              <div className="bg-white border-3 border-red-400 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ThumbsDown className="w-6 h-6 text-red-600 fill-red-600" />
                  <span className="text-4xl font-black text-red-600">{prefStats.dislikes}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">No me gusta</p>
              </div>
            </div>

            {personalityTest?.citasTimeline && (
              <div className="bg-white border-2 border-blue-300 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">⏰ Meta para completar</p>
                <p className="font-bold text-lg text-blue-600">
                  {personalityTest.citasTimeline === 'one_month' && '1 Mes ⚡'}
                  {personalityTest.citasTimeline === 'three_months' && '3 Meses 🎯'}
                  {personalityTest.citasTimeline === 'six_months' && '6 Meses 📅'}
                  {personalityTest.citasTimeline === 'one_year' && '1 Año ⏰'}
                  {personalityTest.citasTimeline === 'two_plus_years' && '2+ Años 🐢'}
                  {personalityTest.citasTimeline === 'no_deadline' && 'Sin Plazo ∞'}
                </p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo('citas-personalizadas')}
              className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold"
            >
              Ver todas mis citas y preferencias 💕
            </motion.button>
          </motion.div>
        )}

        {/* Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-4 border-yellow-500 rounded-2xl p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-yellow-600" />
            <h3 className="text-2xl font-bold text-black">Metas de Pareja</h3>
          </div>

          {/* Add Goal Form */}
          <form onSubmit={handleAddGoal} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Agregar una nueva meta..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:outline-none transition"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition font-bold"
              >
                Agregar
              </motion.button>
            </div>
          </form>

          {/* Goals List */}
          <div className="space-y-2">
            {user?.goals && user.goals.length > 0 ? (
              user.goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                    goal.completed
                      ? 'bg-gray-100 border-gray-300'
                      : 'bg-white border-yellow-300 hover:border-yellow-500'
                  }`}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => {}}
                    className="w-6 h-6 accent-yellow-600 cursor-pointer"
                  />
                  <span className={`flex-1 font-semibold ${
                    goal.completed
                      ? 'line-through text-gray-500'
                      : 'text-black'
                  }`}>
                    {goal.text}
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No has agregado metas aún. ¡Empieza ahora! 🎯</p>
            )}
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-4 border-red-500 rounded-2xl p-8 mt-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-bold text-black">Logros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Achievement Cards */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-500 rounded-xl p-6 text-center"
            >
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-bold text-black">Primer Mes</p>
              <p className="text-xs text-gray-600">Juntos hace 1 mes</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-6 text-center opacity-50"
            >
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="font-bold text-black">100 Citas</p>
              <p className="text-xs text-gray-600">Completa 100 citas</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-500 rounded-xl p-6 text-center opacity-50"
            >
              <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="font-bold text-black">Amante del Viaje</p>
              <p className="text-xs text-gray-600">Visita 10 lugares</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-500 rounded-xl p-6 text-center opacity-50"
            >
              <Mail className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="font-bold text-black">Poeta</p>
              <p className="text-xs text-gray-600">Escribe 10 cartas</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
