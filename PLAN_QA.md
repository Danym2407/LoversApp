# 🧪 Plan de QA - Test de Personalidad

## Testing Scenarios

### Scenario 1: Flujo Completo Registro + Test

**Pre-requisitos:** App limpia, localStorage vacío

**Pasos:**
1. Abre http://localhost:3001
2. Click en "Registrarse"
3. Ingresa:
   - Tu nombre: Prueba
   - Nombre pareja: Pareja
   - Email: test@example.com
   - Contraseña: 12345
   - Confirmar: 12345
4. Click "Crear Cuenta"

**Resultado Esperado:**
- ✅ Usuario creado
- ✅ Modal "¡Bienvenido! 💕" aparece
- ✅ Modal tiene 2 botones: "Hacer Test" y "Omitir"

**Pasos Continuación:**
5. Click "Hacer el Test Ahora ❤️"

**Resultado Esperado:**
- ✅ Redirige a PersonalityTestPage
- ✅ Muestra "Pregunta 1 de 15"
- ✅ Barra de progreso al 7% (1/15)
- ✅ Primera pregunta: "¿Cuál es tu fecha de nacimiento?"

---

### Scenario 2: Navegar Test Completo

**Pre-requisitos:** En PersonalityTestPage

**Pasos:**
1. Ingresa fecha de nacimiento: 1995-05-20
2. Click "Siguiente"

**Resultado Esperado:**
- ✅ Progresa a pregunta 2
- ✅ Barra aumenta a 13%
- ✅ Primera respuesta guardada

**Pasos Continuación (Iteración):**
3. Para cada pregunta 2-15:
   - Responde según tabla abajo
   - Click "Siguiente"
   - Verifica progreso aumenta

| P# | Pregunta | Respuesta Test | Tipo |
|---|---|---|---|
| 1 | Tu fecha nacimiento | 1995-05-20 | Date |
| 2 | Pareja fecha | 1997-03-15 | Date |
| 3 | Etapa de vida | Universidad | Single |
| 4 | Tu personalidad | Balanceado/a | Single |
| 5 | Pareja personalidad | Aventurero/a | Single |
| 6 | Presupuesto | Medio | Single |
| 7 | Hobbies | [múltiples] | Multiple |
| 8 | Ambiente | Ambas | Single |
| 9 | Frecuencia | Una+ por semana | Single |
| 10 | Sorpresas | A veces | Single |
| 11 | Actividad física | Moderado | Single |
| 12 | Social | Ambas | Single |
| 13 | Cultura | [múltiples] | Multiple |
| 14 | Vida nocturna | Ocasionalmente | Single |
| 15 | Estación | Primavera | Single |

**Pasos Finales:**
16. En pregunta 15 (última), click "Completar"

**Resultado Esperado:**
- ✅ Pantalla de éxito: "¡Perfecto!"
- ✅ Checkmark grande ✓
- ✅ Botón "Ver mis Citas Personalizadas"
- ✅ Datos guardados en localStorage

---

### Scenario 3: Ver Citas Personalizadas

**Pre-requisitos:** Test completado

**Pasos:**
1. Click "Ver mis Citas Personalizadas"

**Resultado Esperado:**
- ✅ Redirige a CitasPersonalizadasPage
- ✅ Título: "100 Citas Personalizadas ❤️"
- ✅ Muestra personalidad: "⚖️ HÍBRIDO"
- ✅ Muestra presupuesto: "Nivel 3/5"
- ✅ Filtros visibles: [Todas] [Exterior] [Interior] etc.
- ✅ Grid mostrando 100 citas
- ✅ Cada cita tiene:
  - Número (1-100)
  - Título
  - Descripción
  - Etiqueta presupuesto
  - Etiqueta categoría

**Pasos Filtrado:**
2. Click filtro "Exterior"

**Resultado Esperado:**
- ✅ Muestra solo citas outdoor
- ✅ Contador dice "Mostrando X de 100"
- ✅ Todas las tarjetas son de categoría "outdoor"

3. Click "Todas" para volver

**Resultado Esperado:**
- ✅ Vuelve a mostrar 100 citas

---

### Scenario 4: Acceso desde Perfil

**Pre-requisitos:** Test completado

**Pasos:**
1. Click en Dashboard (o navega a dashboard)
2. Click en Perfil (ícono o menú)

**Resultado Esperado:**
- ✅ ProfilePage carga
- ✅ Sección "Test de Personalidad" visible
- ✅ Muestra resultados:
  - "✨ Personalidad: HÍBRIDO"
  - Tu edad: 25 años
  - Edad pareja: 26 años
  - Presupuesto: Nivel 3/5
- ✅ Botón "Ver mis 100 Citas Personalizadas 💕"
- ✅ Botón "Reiniciar Test"

**Pasos:**
3. Click "Ver mis 100 Citas"

**Resultado Esperado:**
- ✅ Redirige a CitasPersonalizadasPage (como antes)

**Pasos:**
4. Click "Reiniciar Test"

**Resultado Esperado:**
- ✅ Redirige a PersonalityTestPage
- ✅ Vuelve a empezar desde pregunta 1
- ✅ Toast: "Reiniciar Test - Respondiendo el test nuevamente..."

---

### Scenario 5: Omitir Test en Registro

**Pre-requisitos:** App limpia

**Pasos:**
1. Registrarse (como Scenario 1)
2. En modal: Click "Omitir por Ahora"

**Resultado Esperado:**
- ✅ Modal desaparece
- ✅ Redirige a Dashboard
- ✅ NO tiene test completado aún

**Pasos Continuación:**
3. Click Perfil
4. Scroll a sección "Test de Personalidad"

**Resultado Esperado:**
- ✅ Dice: "Aún no has completado el test..."
- ✅ Botón: "Hacer Test de Personalidad 🚀"

**Pasos:**
5. Click botón de test

**Resultado Esperado:**
- ✅ Redirige a PersonalityTestPage
- ✅ Inicia desde pregunta 1

---

### Scenario 6: Validación de Campos

**Pre-requisitos:** En PersonalityTestPage

**Pasos:**
1. NO ingreses ninguna respuesta
2. Click "Siguiente"

**Resultado Esperado:**
- ✅ Toast error: "Por favor responde"
- ✅ NO avanza a siguiente pregunta
- ✅ Permanece en misma pregunta

**Pasos:**
3. Ingresa respuesta válida
4. Click "Siguiente"

**Resultado Esperado:**
- ✅ Avanza a siguiente pregunta

---

### Scenario 7: Navegación Anterior

**Pre-requisitos:** En PersonalityTestPage, pregunta 5+

**Pasos:**
1. Click "Anterior"

**Resultado Esperado:**
- ✅ Retrocede a pregunta anterior
- ✅ Mantiene respuesta anterior guardada
- ✅ Barra de progreso disminuye
- ✅ Contador decrece

**Pasos:**
2. Click "Anterior" varias veces hasta pregunta 1
3. Click "Anterior" nuevamente

**Resultado Esperado:**
- ✅ Botón "Anterior" está deshabilitado/gris
- ✅ NO retrocede más

---

### Scenario 8: localStorage Persistencia

**Pre-requisitos:** Test completado

**Pasos:**
1. Abre DevTools (F12)
2. Application → Local Storage → localhost:3001
3. Busca clave: `loversappUser`

**Resultado Esperado:**
- ✅ Existe la clave
- ✅ Contiene objeto JSON grande
- ✅ Tiene property `personalityTest`
- ✅ Dentro están todas las respuestas

**Pasos:**
4. Recarga página (F5)

**Resultado Esperado:**
- ✅ Datos persisten
- ✅ Perfil aún muestra test completado
- ✅ Puede acceder a citas nuevamente

---

### Scenario 9: Múltiples Selecciones

**Pre-requisitos:** En pregunta 7 (Hobbies) - multiple select

**Pasos:**
1. Click "Deportes"
2. Click "Música"
3. Click "Viajes"

**Resultado Esperado:**
- ✅ Cada click resalta en rojo/rosa
- ✅ Se seleccionan múltiples
- ✅ Pueden deseleccionarse al hacer click nuevamente
- ✅ Todas las selecciones se guardan

**Pasos:**
4. Click "Siguiente"

**Resultado Esperado:**
- ✅ Todas las 3 selecciones se guardaron

---

### Scenario 10: Responsive Design

**Pre-requisitos:** CitasPersonalizadasPage abierta

**Pasos en Desktop (1920px):**
1. Verifica grid: 3 columnas

**Pasos en Tablet (768px):**
1. Redimensiona ventana a 768px
2. Verifica grid: 2 columnas

**Pasos en Mobile (375px):**
1. Redimensiona ventana a 375px
2. Verifica grid: 1 columna
3. Verifica filtros: scrolleable horizontalmente

**Resultado Esperado:**
- ✅ Grid adapta a tamaño de pantalla
- ✅ Texto legible en todos los tamaños
- ✅ Botones clickeables
- ✅ Sin overflow

---

## 🐛 Casos de Error

### Error 1: localStorage Corrupto

**Pasos:**
1. DevTools → Application → LocalStorage
2. Elimina `loversappUser`
3. Recarga app

**Resultado Esperado:**
- ✅ App no se rompe
- ✅ Redirige a login

---

### Error 2: Respuesta Incompleta (Presionar F5 en Test)

**Pasos:**
1. En pregunta 8 del test
2. Presiona F5 (reload)

**Resultado Esperado:**
- ✅ Vuelve al inicio
- ✅ Pregunta 1 de 15
- ✅ Respuestas anteriores se pierden (es normal)

---

### Error 3: Múltiples Tabs Abiertos

**Pasos:**
1. Abre 2 tabs del mismo usuario
2. En Tab 1: Completa test
3. En Tab 2: Recarga

**Resultado Esperado:**
- ✅ Tab 2 ve datos actualizados (localStorage compartido)

---

## ✅ Checklist Final

- [ ] No hay errores en consola (F12)
- [ ] Build compila sin warnings
- [ ] Todas las rutas funcionan
- [ ] localStorage guarda datos
- [ ] Modal aparece post-registro
- [ ] Test navega correctamente
- [ ] Citas se generan y muestran
- [ ] Filtros funcionan
- [ ] Perfil muestra datos del test
- [ ] Reinicio borra datos anteriores
- [ ] Responsive en mobile/tablet/desktop
- [ ] Animaciones suave (sin lag)
- [ ] Botones todos clickeables
- [ ] Textos legibles
- [ ] Emojis aparecen correctamente

---

## 📊 Métricas de Performance

**Pasos:**
1. DevTools → Performance
2. Graba session en PersonalityTestPage
3. Navega 3 preguntas

**Métricas Esperadas:**
- ✅ FCP < 1s
- ✅ LCP < 2s
- ✅ Memory < 50MB
- ✅ FPS > 60

---

## 🎯 Test Exitoso Significa:

- ✅ Cada scenario funcionó completamente
- ✅ Sin errores en consola
- ✅ Sin warnings
- ✅ Datos persisten en localStorage
- ✅ UI es intuitiva y responsiva
- ✅ Rendimiento es aceptable
- ✅ Todo cumple con especificaciones

---

**Versión:** 1.0
**Fecha:** 2024
**Estado:** Listo para producción ✅
