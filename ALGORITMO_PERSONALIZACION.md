# 📊 Algoritmo de Personalización de Citas

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONDE 15 PREGUNTAS                        │
├─────────────────────────────────────────────────────────────────┤
│ 1. Tu fecha de nacimiento        → EDAD                         │
│ 2. Fecha de pareja              → EDAD PAREJA                  │
│ 3. Etapa de vida                → CONTEXTO                     │
│ 4. Tu personalidad              ┐                              │
│ 5. Personalidad de pareja       ├─→ PERSONALIDAD (calc)       │
│ 6. Presupuesto de citas         → PRESUPUESTO                 │
│ 7-15. Preferencias generales    → CONTEXTO ADICIONAL           │
└─────────────────────────────────────────────────────────────────┘
                                   ↓
                    ┌───────────────────────────────┐
                    │ CALCULA PERSONALIDAD RESULTANTE
                    │ Promedio: (Tu score + Pareja) / 2
                    │ 1.5 ≤ → TRANQUILO
                    │ 4.5 ≥ → EXTREMO
                    │ Entre → HÍBRIDO
                    └───────────────────────────────┘
                                   ↓
                    ┌───────────────────────────────┐
                    │ MAPEA PRESUPUESTO A NIVEL
                    │ $1-5   → very_low (1)
                    │ $5-15  → low (2)
                    │ $15-50 → medium (3)
                    │ $50-150 → high (4)
                    │ >$150  → very_high (5)
                    └───────────────────────────────┘
                                   ↓
                    ┌───────────────────────────────┐
                    │ CREA CLAVE: PERSONALIDAD-NIVEL
                    │ Ejemplo: "hibrido-medium"
                    │ Busca en base de datos
                    └───────────────────────────────┘
                                   ↓
                    ┌───────────────────────────────┐
                    │ GENERA 100 CITAS
                    │ - Base: 25 citas específicas
                    │ - Rellena: 75 de otras cats
                    │ - Randomiza para variedad
                    │ - Numera 1-100
                    └───────────────────────────────┘
                                   ↓
                    ┌───────────────────────────────┐
                    │ GUARDA EN LOCALSTORAGE
                    │ loversappUser.personalityTest
                    │ Incluye todas las respuestas
                    └───────────────────────────────┘
                                   ↓
                    ┌───────────────────────────────┐
                    │ USUARIO VE:
                    │ ✓ 100 citas personalizadas
                    │ ✓ Filtrable por categoría
                    │ ✓ Información de personalidad
                    │ ✓ Presupuesto por cita
                    └───────────────────────────────┘
```

## Matriz de Generación

```
                    PRESUPUESTO
                ┌────────────────────────────────┐
          very_low  low    medium   high  very_high
        ┌─────────────────────────────────────────┐
T       │   ✓      ✓      ✓        ✓      ✓     │
R       │  Pic    Café   Spa      Cena   Resort
A       │  Home   Parks  Yoga     Conc.  Viaje
N       │         Lib    Clase    Spa    Crucero
Q       │         Merc   Paseo    Hotel  Ópera
U       │                        Vuelo   Vuelo
I       │                                Premium
L       ├─────────────────────────────────────────┤
L       │   ✓      ✓      ✓        ✓      ✓     │
O       │ Sendr  Kart    Paracaid Safari  Aventura
E       │ Acampa Conc    Buceo    Helisquí Combo
        │ Parkour Escal  Rafting  Fest    VIP
        │ Búsqueda Club   Karaoke  Noche  Resort
        │ Torreo Dance   Retiro   Exp    Integral
        ├─────────────────────────────────────────┤
H       │   ✓      ✓      ✓        ✓      ✓     │
I       │ Picnic  Tur    Cocina   Tirolesa Aventura
B       │ Ciclismo Bar    Rafting  Cena    Viaje
R       │ Jgos    Galería Karaoke  Vinos   Fest
I       │ Explore Acampa Workshop Conc    Resort
D       │ Cocina         Escape    VIP    Integral
O       └─────────────────────────────────────────┘
```

## Tabla de Ejemplos

### TRANQUILO + VERY_LOW ($1-5)
| # | Cita | Descripción |
|---|---|---|
| 1 | Picnic en Parque | Comida casera bajo estrellas |
| 2 | Películas en Casa | Palomitas y manta |
| 3 | Paseo Naturaleza | Caminata observando naturaleza |
| 4 | Juegos de Mesa | Entretenimiento en hogar |
| 5 | Lectura Conjunta | Compartir libro favorito |

### EXTREMO + MEDIUM ($15-50)
| # | Cita | Descripción |
|---|---|---|
| 36 | Paracaidismo Tándem | Salto acompañado instructor |
| 37 | Surf/Esquí Acuático | Lecciones con adrenalina |
| 38 | Rally de Autos | Conducción de velocidad |
| 39 | Paintball Extremo | Partida intensa |
| 40 | Concierto Artistas | Banda internacionales |

### HÍBRIDO + HIGH ($50-150)
| # | Cita | Descripción |
|---|---|---|
| 66 | Tirolesa en Bosque | Aventura entre árboles |
| 67 | Cena Moderna | Fusión con ambiente moderno |
| 68 | Tour de Vinos | Bodega con degustación |
| 69 | Concierto Premium | Artista conocido amphiteatro |
| 70 | Escape Room | Acertijos complejos |

## Propiedades de Cada Cita

```javascript
{
  id: 1,                              // Número único 1-100
  title: "Picnic en el Parque",       // Nombre atractivo
  description: "Lleven comida...",    // Instrucciones detalladas
  category: "outdoor",                // outdoor/indoor/cultural/gastronomica/deportes
  budget: 1,                          // 1-5 (very_low a very_high)
  personality: "tranquilo"            // tranquilo/extremo/hibrido
}
```

## Atributos de Categoría

```
OUTDOOR (Exterior):
- Picnic, Senderismo, Parques, Naturaleza, Acampada, Paseos

INDOOR (Interior):
- Cine, Juegos, Cafés, Museos, Restaurantes, Spas, Teatro

CULTURAL:
- Museos, Teatro, Exposiciones, Conciertos, Ballet, Documentales

GASTRONÓMICA:
- Restaurantes, Food Tours, Clases de Cocina, Catás, Brunch

DEPORTES:
- Yoga, Baile, Tenis, Equitación, Maratón, Escalada
```

## Criterios de Selección

Cuando el usuario completa el test, el algoritmo:

1. **Calcula Personalidad**
   ```
   Escala: 1 (muy tranquilo) → 5 (muy aventurero)
   Ejemplo: Tu=2 + Pareja=4 = Promedio 3 = HÍBRIDO
   ```

2. **Clasifica Presupuesto**
   ```
   Pregunta: "Presupuesto típico para citas"
   Respuesta USD → Mapea a Nivel 1-5
   ```

3. **Busca Citas Base**
   ```
   Key = "hibrido-medium"
   Obtiene: 25 citas específicamente diseñadas
   ```

4. **Completa hasta 100**
   ```
   Necesita: 75 más
   Fuentes: Otras categorías aleatorias
   Mezcla: Mantiene proporción personalidad
   ```

5. **Aplica Orden Aleatorio**
   ```
   Randomiza (shuffle) los 100
   Enumera 1-100 en nuevo orden
   Guarda resultado completo
   ```

## Ventajas del Algoritmo

✅ **Personalizado**: Basado en 15 datos puntuales
✅ **Escalable**: Soporta 3×5=15 combinaciones base
✅ **Variado**: 100 citas por usuario, aleatorizado
✅ **Flexible**: Puedes reiniciar test cuando quieras
✅ **Persistente**: Guardado en localStorage
✅ **Filtrable**: 6 categorías para navegar
✅ **Informativo**: Cada cita tiene descripción clara

## Futuras Mejoras

- 🔄 **Aprendizaje**: Analizar qué citas completan más
- ⭐ **Favoritos**: Permitir guardar favoritas
- 📊 **Análisis**: Mostrar distribución de personalidad
- 🤝 **Comparación**: Ver si coinciden perfiles
- 🎯 **Sugerencias**: Proponer citas basado en estado ánimo
- 📅 **Integración**: Sugerir citas en días vacíos del calendario

---

*Este algoritmo genera una experiencia única para cada pareja, considerando su personalidad, edad, etapa de vida y recursos económicos.*
