import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PersonalityTestModal from '@/components/PersonalityTestModal';

const LoginPage = ({ onLoginSuccess, onClose, defaultTab = 'login', onStartTest }) => {
  const [isLogin, setIsLogin] = useState(defaultTab === 'login');
  const [formData, setFormData] = useState({
    name: '',
    partner: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [isRegistration, setIsRegistration] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulamos un pequeño delay
    setTimeout(() => {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          toast({
            title: "Error",
            description: "Por favor completa todos los campos"
          });
          setLoading(false);
          return;
        }

        // Guardamos los datos en localStorage (sin borrar nombre/pareja)
        const existingUser = JSON.parse(localStorage.getItem('loversappUser') || '{}');
        const user = {
          ...existingUser,
          email: formData.email,
          loginDate: new Date().toISOString()
        };
        localStorage.setItem('loversappUser', JSON.stringify(user));
        
        toast({
          title: "¡Bienvenido! 💕",
          description: "Has iniciado sesión correctamente"
        });
        
        setLoading(false);
        onLoginSuccess();
      } else {
        // Registro
        if (!formData.name || !formData.partner || !formData.email || !formData.password || !formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Por favor completa todos los campos"
          });
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Las contraseñas no coinciden"
          });
          setLoading(false);
          return;
        }

        // Guardamos los datos en localStorage
        const user = {
          name: formData.name,
          partner: formData.partner,
          email: formData.email,
          createdDate: new Date().toISOString()
        };
        localStorage.setItem('loversappUser', JSON.stringify(user));
        
        toast({
          title: "¡Bienvenidos! 💕",
          description: `${formData.name} y ${formData.partner}, su cuenta fue creada`
        });

        setLoading(false);
        setIsRegistration(true);
        setShowTestModal(true);
      }
    }, 800);
  };

  const handleStartTest = () => {
    setShowTestModal(false);
    onLoginSuccess();
    onStartTest?.();
  };

  const handleSkipTest = () => {
    setShowTestModal(false);
    onLoginSuccess();
  };

  return (
    <>
      <PersonalityTestModal 
        isOpen={showTestModal} 
        onStart={handleStartTest}
        onSkip={handleSkipTest}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed top-10 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-purple-200 rounded-full opacity-10 blur-3xl pointer-events-none" />

      {/* Close Button */}
      {onClose && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
          className="fixed top-6 right-6 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition z-50"
        >
          <X className="w-6 h-6" />
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black text-red-500 mb-2"
          >
            LoversApp
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            Nuestra app de pareja
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                isLogin
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                !isLogin
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Tu nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej: Daniela"
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Partner Field */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Nombre de tu pareja
                  </label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="partner"
                      value={formData.partner}
                      onChange={handleInputChange}
                      placeholder="Ej: Eduardo"
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Confirm Password Field (only for register) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-6 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all"
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>

          {/* Demo Mode Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-xs text-yellow-800 font-semibold">
              💡 Nota: Esta es una demostración. Los datos se guardan localmente en tu navegador.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
};

export default LoginPage;
