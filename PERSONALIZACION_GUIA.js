// ARCHIVO DE REFERENCIA - Cómo usar CitasAleatoriasPage
// Este archivo contiene ejemplos de cómo personalizar la página

// 1. PARA AGREGAR MÁS CITAS
// ─────────────────────────────
// Editar: src/data/citas.js

// Agregar nueva cita:
const nuevaCita = {
  id: 101,  // Importante: usar ID único
  title: 'Nombre de la cita',
  description: 'Descripción de qué hacer',
  category: 'outdoor',  // outdoor, indoor, cultural, gastronomica, deportes, mixed
  budget: 3,  // 1: muy bajo, 2: bajo, 3: medio, 4: alto, 5: muy alto
  personality: 'hibrido'  // tranquilo, extremo, hibrido
};

// 2. PARA CAMBIAR COLORES
// ─────────────────────────────
// Editar: src/pages/CitasAleatoriasPage.jsx

// Línea ~245 - Cambiar gradiente principal:
className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600"

// Línea ~120 - Cambiar color de Like button:
className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"

// 3. PARA PERSONALIZAR ICONOS Y EMOJIS
// ─────────────────────────────
// Línea ~64 - Cambiar emoji en categoría:
getCategoryEmoji = (category) => {
  const emojis = {
    outdoor: '🏔️',      // Cambiar de 🏞️ a 🏔️
    indoor: '🏢',       // Cambiar de 🏠 a 🏢
    cultural: '🎪',     // Cambiar de 🎭 a 🎪
    gastronomica: '🍕', // Cambiar de 🍽️ a 🍕
    deportes: '🏋️',    // Cambiar de ⚽ a 🏋️
    mixed: '🎊'         // Cambiar de 🎉 a 🎊
  };
  return emojis[category] || '📍';
};

// 4. PARA CAMBIAR TEXTOS Y ETIQUETAS
// ─────────────────────────────
// Línea ~20 - Cambiar presupuestos:
budgetLevels = {
  very_low: '💵 Presupuesto Apretado',
  low: '💵💵 Económico',
  medium: '💵💵💵 Normal',
  high: '💵💵💵💵 Generoso',
  very_high: '💵💵💵💵💵 Sin Límite'
};

// Línea ~32 - Cambiar personalidades:
personalities = {
  tranquilo: '😌 Relajado',
  extremo: '🤘 Salvaje',
  hibrido: '🎭 Balanceado'
};

// 5. PARA AGREGAR FILTROS
// ─────────────────────────────
// Ejemplo: Filtrar por presupuesto
const handleBudgetFilter = (budget) => {
  const filtered = availableCitas.filter(cita => cita.budget <= budget);
  setAvailableCitas(filtered);
};

// Agregar en JSX:
<div className="flex gap-2 mb-4">
  <button onClick={() => handleBudgetFilter(1)}>💰</button>
  <button onClick={() => handleBudgetFilter(2)}>💰💰</button>
  <button onClick={() => handleBudgetFilter(3)}>💰💰💰</button>
</div>

// 6. PARA AGREGAR BÚSQUEDA
// ─────────────────────────────
const handleSearch = (query) => {
  const filtered = availableCitas.filter(cita => 
    cita.title.toLowerCase().includes(query.toLowerCase()) ||
    cita.description.toLowerCase().includes(query.toLowerCase())
  );
  setAvailableCitas(filtered);
};

// 7. PARA AGREGAR COMPARTIR EN REDES
// ─────────────────────────────
const handleShare = (cita) => {
  const text = `Me encanta esta cita: ${cita.title} - ${cita.description}`;
  
  // Compartir en WhatsApp
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  
  // O copiar al portapapeles
  navigator.clipboard.writeText(text);
};

// 8. PARA CAMBIAR ANIMACIONES
// ─────────────────────────────
// Línea ~145 - Cambiar duración:
initial={{ opacity: 0, scale: 0.8, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ duration: 0.5 }}  // Cambiar de 0.3 a 0.5

// O cambiar tipo:
transition={{ duration: 0.3, type: "spring", stiffness: 100 }}

// 9. PARA EXPORTAR/IMPORTAR DATOS
// ─────────────────────────────
const handleExportData = () => {
  const data = {
    favorites: JSON.parse(localStorage.getItem('favoritesCitas') || '[]'),
    stats: {
      likes: stats.like,
      dislikes: stats.dislike
    }
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'citas-favoritas.json';
  a.click();
};

// 10. PARA AGREGAR HISTORIAL
// ─────────────────────────────
const addToHistory = (cita, action) => {  // action: 'like' o 'dislike'
  const history = JSON.parse(localStorage.getItem('citasHistorial') || '[]');
  history.push({
    cita: cita.id,
    titulo: cita.title,
    action: action,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('citasHistorial', JSON.stringify(history));
};

// Usar en handleLike y handleDislike:
const handleLike = () => {
  // ... código existente ...
  addToHistory(currentCita, 'like');
};

// 11. PARA CAMBIAR LÍMITE DE FAVORITOS MOSTRADOS
// ─────────────────────────────
// Línea ~385 - Cambiar de 4 a 8:
{favorites.slice(0, 8).map(cita => (
  // ...
))}

// 12. PARA AGREGAR VALIDACIÓN
// ─────────────────────────────
const validateCita = (cita) => {
  return (
    cita.id &&
    cita.title &&
    cita.description &&
    cita.category &&
    cita.budget >= 1 && cita.budget <= 5 &&
    ['tranquilo', 'extremo', 'hibrido'].includes(cita.personality)
  );
};

// Usar al cargar:
const loadAvailableCitas = () => {
  const allCitas = [...];
  const validCitas = allCitas.filter(validateCita);
  setAvailableCitas(validCitas);
};

// 13. PARA AGREGAR NOTIFICACIONES
// ─────────────────────────────
const handleDislike = () => {
  // ... código existente ...
  
  if (availableCitas.length <= 5) {
    toast({
      title: "⚠️ Pocas citas restantes",
      description: `Solo ${availableCitas.length - 1} citas disponibles`,
    });
  }
};

// 14. PARA INTEGRAR CON CALENDARIO
// ─────────────────────────────
const handleScheduleCita = (cita) => {
  navigateTo('calendar', {
    citaData: {
      title: cita.title,
      description: cita.description,
      budget: cita.budget
    }
  });
};

// 15. PARA AGREGAR DIFICULTAD
// ─────────────────────────────
// En citas.js:
{
  id: 1,
  title: 'Picnic',
  description: '...',
  category: 'outdoor',
  budget: 1,
  personality: 'tranquilo',
  difficulty: 1  // 1: fácil, 2: medio, 3: difícil
}

// En CitasAleatoriasPage.jsx:
const getDifficultyEmoji = (difficulty) => {
  return ['🟢', '🟡', '🔴'][difficulty - 1];
};

// ARCHIVOS RELACIONADOS
// ─────────────────────────────
// - src/data/citas.js
// - src/pages/CitasAleatoriasPage.jsx
// - src/pages/DashboardPage.jsx
// - src/App.jsx

// VARIABLES DE AMBIENTE (si se necesitan)
// ─────────────────────────────
// VITE_API_URL=http://localhost:3001
// VITE_APP_NAME=LoversApp

// LOCALSTORAGE KEYS
// ─────────────────────────────
// 'citasAleatorias' - Citas disponibles y rechazadas
// 'favoritesCitas' - Citas marcadas como Me Gusta
// 'citasHistorial' - Historial de acciones (opcional)

// POSIBLES EXTENSIONES
// ─────────────────────────────
// 1. Agregar base de datos de backend
// 2. Sistema de usuarios para sincronizar datos
// 3. API de geolocalización para citas cercanas
// 4. Sistema de recomendaciones basado en IA
// 5. Integración con Google Maps/Uber Eats
// 6. Sistema de reseñas y ratings
// 7. Recordatorios push notifications
// 8. Multiplayer para competir con parejas

console.log('✅ CitasAleatoriasPage configurada y lista');
