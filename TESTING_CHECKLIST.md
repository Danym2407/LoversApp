# 🧪 Pruebas del Sistema - LoversApp

## Flujo Completo de Registro y Test

### ✅ Paso 1: Registro de Usuario
- [ ] Usuario navega a la app
- [ ] Hace clic en "Registrarse"
- [ ] Completa formulario con: Nombre, Nombre Pareja, Email, Contraseña
- [ ] Se muestra modal "PersonalityTestModal" ofreciendo hacer el test
- [ ] Usuario completa el registro exitosamente

### ✅ Paso 2: Modal de Test
- [ ] Modal muestra descripción del test (15 → 16 preguntas tras actualización)
- [ ] Botón "Hacer el Test Ahora" navega a PersonalityTestPage
- [ ] Botón "Omitir por Ahora" cierra modal y muestra dashboard
- [ ] Usuario puede regresar a hacer el test después

### ✅ Paso 3: Test de Personalidad (16 Preguntas)
- [ ] Pregunta 1: Fecha de nacimiento del usuario
- [ ] Pregunta 2: Fecha de nacimiento de la pareja
- [ ] Pregunta 3: Etapa de vida (school, university, professional, established)
- [ ] Pregunta 4: Tipo de personalidad del usuario (1-5 escala)
- [ ] Pregunta 5: Tipo de personalidad de la pareja
- [ ] Pregunta 6: Presupuesto típico (1-5 niveles)
- [ ] Pregunta 7: Hobbies e intereses (múltiple selección)
- [ ] Pregunta 8: Ambiente preferido (interior/exterior/ambas)
- [ ] Pregunta 9: Frecuencia de citas (semanal/bisemanal/mensual/espontáneo)
- [ ] Pregunta 10: Factor sorpresa (planeado/sorpresas ocasionales/frecuentes/espontáneo)
- [ ] Pregunta 11: Nivel de actividad física (sedentario/ligero/moderado/intenso)
- [ ] Pregunta 12: Ambiente social (solo ustedes/con amigos/ambas)
- [ ] Pregunta 13: Intereses culturales (museos/teatro/conciertos/ninguno)
- [ ] Pregunta 14: Vida nocturna (no/ocasional/a veces/frecuente)
- [ ] Pregunta 15: Preferencia de estación
- [ ] **Pregunta 16 (NUEVA)**: Timeline para completar 100 citas (1mo/3mo/6mo/1año/2+años/sin plazo)
- [ ] Pregunta 16b: Comentarios adicionales (texto opcional)
- [ ] Barra de progreso se actualiza correctamente
- [ ] Botones anterior/siguiente funcionan
- [ ] Validación: No permite avanzar sin responder pregunta actual
- [ ] Test completo → muestra pantalla de éxito con animaciones

### ✅ Paso 4: Pantalla de Éxito del Test
- [ ] Muestra ✓ CheckCircle animado
- [ ] Muestra título "¡Perfecto! 💕"
- [ ] Muestra descripción personalizada
- [ ] Muestra stats: Personalidad, Meta (si existe), Intereses
- [ ] Botón "Ver mis 100 Citas Personalizadas" funciona
- [ ] Botón "Ir al Dashboard" funciona

### ✅ Paso 5: 100 Citas Personalizadas
- [ ] Solo accesible si test está completado
- [ ] Muestra pantalla de validación si test no completado
- [ ] Muestra personalidad y presupuesto en header
- [ ] Filtros funcionan (Todas, Exterior, Interior, Cultural, Gastronómica, Deportes)
- [ ] Grid de 100 citas se muestra correctamente
- [ ] Cada cita muestra:
  - Número y título
  - Descripción
  - Categoría
  - Ubicación (si aplica)
  - Presupuesto estimado
  - Puntuación/rating
  - **Botones: "Me gusta" (👍) y "No gusta" (👎)** ← NUEVA FEATURE

### ✅ Paso 6: Sistema de Preferencias Like/Dislike
- [ ] Botón "Me gusta" cambia a verde cuando se selecciona
- [ ] Botón "No gusta" cambia a rojo cuando se selecciona
- [ ] Solo una preferencia por cita (like XOR dislike)
- [ ] Hacer clic nuevamente deselecciona la preferencia
- [ ] Preferencias se guardan en localStorage inmediatamente
- [ ] Stats se actualizan en tiempo real:
  - Total de citas
  - Contador de "Me gusta"
  - Contador de "No gusta"
  - Meta de timeline (si existe)

### ✅ Paso 7: Perfil de Usuario
- [ ] Header con información del usuario
- [ ] Sección "Fechas Importantes" (relación, novios)
- [ ] Sección "Test de Personalidad" con:
  - Personalidad calculada
  - Edades
  - Presupuesto
  - Botón "Ver mi Perfil de Personalidad" ← NUEVA PÁGINA
  - Botón "Ver mis 100 Citas Personalizadas"
  - Botón "Actualizar Test"
  - Fecha de completación del test
- [ ] **Sección "Preferencias de Citas"** (solo si tiene preferencias):
  - Contador de "Me gusta"
  - Contador de "No gusta"
  - Meta de timeline
  - Botón para ver citas personalizadas

### ✅ Paso 8: Página de Perfil de Personalidad
- [ ] Muestra descripción de tipo de personalidad
- [ ] Grid con información:
  - Edades (usuario y pareja)
  - Presupuesto (con barra visual)
  - Nivel de actividad
  - Frecuencia de citas
  - Factor sorpresa
  - Entorno social
- [ ] Sección de intereses y hobbies
- [ ] Meta de timeline
- [ ] Botón "Ver mis 100 Citas Personalizadas"

### ✅ Paso 9: Dashboard
- [ ] **Banner de sugerencia del test** (solo si no completado):
  - Título "¿Aún no han hecho el Test de Personalidad?"
  - Descripción
  - Botón "Hacer Test Ahora"
  - Botón "Más tarde"
- [ ] Test completado → no muestra banner
- [ ] Contador "Días Juntos" funciona y se actualiza
- [ ] Todas las categorías de la app accesibles
- [ ] Transición suave entre páginas

## Validaciones Importantes

### localStorage
- [ ] Datos del usuario se guardan correctamente
- [ ] `loversappUser.personalityTest` contiene:
  - completed: true
  - personality: 'tranquilo' | 'extremo' | 'hibrido'
  - budgetLevel: 1-5
  - profile: { personalityType, age, partnerAge, ... }
  - Todas las respuestas del test
  - completedAt: timestamp ISO
- [ ] `loversappUser.citaPreferences` contiene:
  - { citaId: 'like' | 'dislike', ... }

### Edge Cases
- [ ] Usuario intenta acceder a citas sin test → ve mensaje de error
- [ ] Usuario completa test, reinicia navegador → datos persisten
- [ ] Usuario cambia de like a dislike → se actualiza correctamente
- [ ] Usuario borra localStorage → app redirige a login
- [ ] Timeline vacío → se muestra sin error
- [ ] Hobbies vacío → se oculta sección sin error

## Performance
- [ ] Build compila sin errores: ✅
- [ ] No hay memory leaks en console
- [ ] Transiciones suaves (60 FPS)
- [ ] Carga de página < 2s

## UI/UX
- [ ] Colores consistentes (rojo/negro para brand)
- [ ] Botones tienen estados hover/active
- [ ] Texto legible (contraste adecuado)
- [ ] Responsive en móvil/tablet/desktop
- [ ] Animaciones no son invasivas
