// Base de datos de 100 citas organizadas por personalidad y presupuesto - México
// Todos los lugares, actividades y precios están enfocados en México y la Ciudad de México

const citasDatabase = {
  // TRANQUILO - Presupuesto Bajo (< $100 MXN)
  'tranquilo-very_low': [
    { id: 1, title: 'Picnic en Parque Hundido', description: 'Lleven comida preparada y disfruten del aire libre en este hermoso parque', category: 'outdoor', budget: 1, personality: 'tranquilo' },
    { id: 2, title: 'Películas en Casa', description: 'Noche de películas con palomitas caseras y manta acogedora', category: 'indoor', budget: 1, personality: 'tranquilo' },
    { id: 3, title: 'Paseo por la Ruta de los Conventos', description: 'Caminata tranquila conociendo conventos coloniales en el sur de CDMX', category: 'outdoor', budget: 1, personality: 'tranquilo' },
    { id: 4, title: 'Juegos de Mesa en Casa', description: 'Noche de juegos de estrategia con bebidas caseras y snacks', category: 'indoor', budget: 1, personality: 'tranquilo' },
    { id: 5, title: 'Lectura Conjunta en Biblioteca Vasconcelos', description: 'Lean juntos en la hermosa Biblioteca Vasconcelos, entrada gratuita', category: 'indoor', budget: 1, personality: 'tranquilo' },
  ],
  'tranquilo-low': [
    { id: 6, title: 'Café en La Merced', description: 'Visita a pequeña cafetería local, conversación relajada en zona cultural', category: 'indoor', budget: 2, personality: 'tranquilo' },
    { id: 7, title: 'Fondo de Cultura Económica', description: 'Exploren la mejor librería de México, seleccionen libros y charlen', category: 'indoor', budget: 2, personality: 'tranquilo' },
    { id: 8, title: 'Parque Chapultepec al Atardecer', description: 'Paseo tranquilo viendo la puesta de sol en el bosque más famoso de CDMX', category: 'outdoor', budget: 2, personality: 'tranquilo' },
    { id: 9, title: 'Museo Nacional de Antropología - Entrada Gratuita', description: 'Visita a museo con entrada libre en horarios especiales (domingo)', category: 'indoor', budget: 1, personality: 'tranquilo' },
    { id: 10, title: 'Mercado de Jamaica', description: 'Recorran mercado colorido, prueben comida local y charlen', category: 'outdoor', budget: 2, personality: 'tranquilo' },
  ],
  'tranquilo-medium': [
    { id: 11, title: 'Restaurante de Comida Casera - Polanco', description: 'Cena en restaurante pequeño e íntimo con comida casera mexicana', category: 'indoor', budget: 3, personality: 'tranquilo' },
    { id: 12, title: 'Masaje Terapéutico en SPA Local', description: 'Masaje relajante o reflexología juntos en spa asequible', category: 'indoor', budget: 3, personality: 'tranquilo' },
    { id: 13, title: 'Concierto Gratuito en Museo Tamayo', description: 'Evento musical gratuito en jardín del museo', category: 'outdoor', budget: 2, personality: 'tranquilo' },
    { id: 14, title: 'Clase de Yoga en Parque', description: 'Sesión conjunta de yoga en parque natural cerca de la ciudad', category: 'outdoor', budget: 3, personality: 'tranquilo' },
    { id: 15, title: 'Paseo en Bicicleta por Reforma', description: 'Recorrido tranquilo por ciclovía Paseo de la Reforma con parada para café', category: 'outdoor', budget: 2, personality: 'tranquilo' },
  ],
  'tranquilo-high': [
    { id: 16, title: 'Cena en Restaurante Michelin - Pujol', description: 'Noche especial en restaurante de lujo con gastronomía mexicana de clase mundial', category: 'indoor', budget: 4, personality: 'tranquilo' },
    { id: 17, title: 'Spa Premium en Polanco', description: 'Tratamiento completo de spa con masaje, sauna y piscina', category: 'indoor', budget: 4, personality: 'tranquilo' },
    { id: 18, title: 'Concierto Sinfónico en Palacio de Bellas Artes', description: 'Noche de música clásica en teatro elegante más icónico de México', category: 'indoor', budget: 4, personality: 'tranquilo' },
    { id: 19, title: 'Cena Privada en Casa', description: 'Chef preparando cena especial en casa con menú degustación', category: 'indoor', budget: 4, personality: 'tranquilo' },
    { id: 20, title: 'Crucero Nocturno en Xochimilco', description: 'Paseo romántico en trajinera con mariachi y vistas nocturnas', category: 'outdoor', budget: 4, personality: 'tranquilo' },
  ],
  'tranquilo-very_high': [
    { id: 21, title: 'Viaje a Oaxaca - Resort Premium', description: 'Escapada a Oaxaca con hotel 5 estrellas y gastronomía regional', category: 'outdoor', budget: 5, personality: 'tranquilo' },
    { id: 22, title: 'Degustación en Restaurante Contramar', description: 'Experiencia gastronómica en el restaurante más reconocido del país', category: 'indoor', budget: 5, personality: 'tranquilo' },
    { id: 23, title: 'Sobrevuelo en Helicóptero sobre CDMX', description: 'Vista panorámica de la ciudad desde el aire en helicóptero privado', category: 'outdoor', budget: 5, personality: 'tranquilo' },
    { id: 24, title: 'Resort en Riviera Maya - Todo Incluido', description: 'Fin de semana en resort todo incluido con servicios premium frente al mar', category: 'outdoor', budget: 5, personality: 'tranquilo' },
    { id: 25, title: 'Ópera y Cena de Gala', description: 'Noche de ópera en Palacio de Bellas Artes seguida de cena en restaurante de lujo', category: 'indoor', budget: 5, personality: 'tranquilo' },
  ],

  // EXTREMO - Presupuesto Bajo (< $100 MXN)
  'extremo-very_low': [
    { id: 26, title: 'Senderismo en Ajusco', description: 'Caminata intensa por volcán con vistas épicas de la ciudad', category: 'outdoor', budget: 1, personality: 'extremo' },
    { id: 27, title: 'Acampada en Nevado de Toluca', description: 'Noche en campamento rústico con foguata a los pies del volcán', category: 'outdoor', budget: 1, personality: 'extremo' },
    { id: 28, title: 'Torneo de Videojuegos', description: 'Competencia de videojuegos en casa con apuestas divertidas', category: 'indoor', budget: 1, personality: 'extremo' },
    { id: 29, title: 'Parkour Urbano en CDMX', description: 'Entrenamiento de parkour en zonas urbanas desafiantes', category: 'outdoor', budget: 1, personality: 'extremo' },
    { id: 30, title: 'Geocaching Urbano CDMX', description: 'Búsqueda del tesoro por toda la ciudad con pistas GPS y sorpresas', category: 'outdoor', budget: 1, personality: 'extremo' },
  ],
  'extremo-low': [
    { id: 31, title: 'Karting en Pista México', description: 'Carrera de go-karts emocionante y competitiva en pista profesional', category: 'outdoor', budget: 2, personality: 'extremo' },
    { id: 32, title: 'Concierto de Rock en Sala Multiforo', description: 'Concierto en vivo de banda de rock local en venue íntimo', category: 'indoor', budget: 2, personality: 'extremo' },
    { id: 33, title: 'Escalada en Rocódromo', description: 'Sesión de escalada deportiva con competencia amistosa', category: 'indoor', budget: 2, personality: 'extremo' },
    { id: 34, title: 'Partido de Futbol 5 en Líga Local', description: 'Juego competitivo de futsal en cancha profesional', category: 'outdoor', budget: 2, personality: 'extremo' },
    { id: 35, title: 'Discoteca en Garibaldi', description: 'Noche de baile y diversión en discoteca tradicional mexicana', category: 'indoor', budget: 2, personality: 'extremo' },
  ],
  'extremo-medium': [
    { id: 36, title: 'Paracaidismo Tándem en Veracruz', description: 'Salto en paracaídas acompañados de instructor profesional sobre el Golfo', category: 'outdoor', budget: 3, personality: 'extremo' },
    { id: 37, title: 'Surf en Playa Zihuatanejo', description: 'Lecciones de surf con instructor en la mejor playa de Guerrero', category: 'outdoor', budget: 3, personality: 'extremo' },
    { id: 38, title: 'Rally de Autos en Circuito Hermanos Rodríguez', description: 'Experiencia de conducción de alta velocidad en pista profesional', category: 'outdoor', budget: 3, personality: 'extremo' },
    { id: 39, title: 'Paintball Extremo en Bosques de CDMX', description: 'Partida intensa de paintball en campo aventurero natural', category: 'outdoor', budget: 3, personality: 'extremo' },
    { id: 40, title: 'Concierto de Artistas en Foro Sol', description: 'Concierto en vivo de artista famoso internacional o nacional', category: 'indoor', budget: 3, personality: 'extremo' },
  ],
  'extremo-high': [
    { id: 41, title: 'Buceo en Cozumel', description: 'Inmersión submarina explorando arrecife de coral y vida marina', category: 'outdoor', budget: 4, personality: 'extremo' },
    { id: 42, title: 'Heliesquí en Pico de Orizaba', description: 'Aventura extrema de heliesquí en volcán con nieve', category: 'outdoor', budget: 4, personality: 'extremo' },
    { id: 43, title: 'Festival de Música Electrónica - Fin de Semana VIP', description: 'Fin de semana en festival con acampada VIP y acceso exclusivo', category: 'outdoor', budget: 4, personality: 'extremo' },
    { id: 44, title: 'Pilotaje de Avión en Escuela de Vuelo', description: 'Experiencia de pilotaje de avión real con instructor certificado', category: 'outdoor', budget: 4, personality: 'extremo' },
    { id: 45, title: 'Club Nocturno VIP en Polanco', description: 'Noche en club nocturno premium con mesa VIP y botellas', category: 'indoor', budget: 4, personality: 'extremo' },
  ],
  'extremo-very_high': [
    { id: 46, title: 'Aventura en Selva Lacandona', description: 'Expedición de exploración en la selva tropical de Chiapas', category: 'outdoor', budget: 5, personality: 'extremo' },
    { id: 47, title: 'Viaje a Playa del Carmen - Resort de Lujo', description: 'Primera clase aérea a Riviera Maya con resort 5 estrellas', category: 'outdoor', budget: 5, personality: 'extremo' },
    { id: 48, title: 'Grand Prix de México - Entradas VIP', description: 'Acceso VIP a Gran Premio de F1 en Autódromo Hermanos Rodríguez', category: 'outdoor', budget: 5, personality: 'extremo' },
    { id: 49, title: 'Crucero de Lujo en Caribe Mexicano', description: 'Crucero de lujo con casino, conciertos y entretenimiento premium', category: 'outdoor', budget: 5, personality: 'extremo' },
    { id: 50, title: 'Safari en Reserva de Biosfera Calakmul', description: 'Safari de exploración con observación de vida salvaje en Campeche', category: 'outdoor', budget: 5, personality: 'extremo' },
  ],

  // HÍBRIDO - Presupuesto Bajo
  'hibrido-very_low': [
    { id: 51, title: 'Picnic con Juegos en Viveros de Coyoacán', description: 'Picnic relajado con juegos de mesa al aire libre en parque histórico', category: 'outdoor', budget: 1, personality: 'hibrido' },
    { id: 52, title: 'Caminata Moderada en Bosque de Tlalpan', description: 'Senderismo tranquilo con vistas hermosas del bosque de CDMX', category: 'outdoor', budget: 1, personality: 'hibrido' },
    { id: 53, title: 'Noche de Cine y Juegos', description: 'Película en casa seguida de videojuegos competitivos', category: 'indoor', budget: 1, personality: 'hibrido' },
    { id: 54, title: 'Exploración del Centro Histórico', description: 'Caminata por Zócalo y centro descubriendo plazas escondidas', category: 'outdoor', budget: 1, personality: 'hibrido' },
    { id: 55, title: 'Cocina Casera Desafiante', description: 'Preparen juntos plato complicado mexicano con desafío gastronómico', category: 'indoor', budget: 1, personality: 'hibrido' },
  ],
  'hibrido-low': [
    { id: 56, title: 'Tour en Xochimilco', description: 'Recorrido en trajinera con música y ambiente lúdico', category: 'outdoor', budget: 2, personality: 'hibrido' },
    { id: 57, title: 'Cantina Tradicional Mexicana', description: 'Visita a cantina tradicional con música en vivo y comida típica', category: 'indoor', budget: 2, personality: 'hibrido' },
    { id: 58, title: 'Competencia de Ciclismo Urbano', description: 'Carrera amistosa en bicicleta por ciclovía de CDMX', category: 'outdoor', budget: 2, personality: 'hibrido' },
    { id: 59, title: 'Galería de Arte Contemporáneo', description: 'Exposición de arte moderno mexicano con atmósfera bohemia', category: 'indoor', budget: 2, personality: 'hibrido' },
    { id: 60, title: 'Picnic-Camping en Desierto de los Leones', description: 'Día campestre con juegos y acampada improvisada en zona boscosa', category: 'outdoor', budget: 2, personality: 'hibrido' },
  ],
  'hibrido-medium': [
    { id: 61, title: 'Clase de Cocina Mexicana Gourmet', description: 'Clase de cocina con platos tradicionales mexicanos gourmet e intensos', category: 'indoor', budget: 3, personality: 'hibrido' },
    { id: 62, title: 'Rafting en Río Usumacinta', description: 'Rafting moderado con emoción en río de frontera con Guatemala', category: 'outdoor', budget: 3, personality: 'hibrido' },
    { id: 63, title: 'Noche de Karaoke en Bar Gastronómico', description: 'Karaoke en bar con ambiente relajado y comida gourmet', category: 'indoor', budget: 3, personality: 'hibrido' },
    { id: 64, title: 'Excursión a Tepoztlán', description: 'Viaje corto a pueblo mágico con piramide y gastronomía', category: 'outdoor', budget: 3, personality: 'hibrido' },
    { id: 65, title: 'Workshop de Fotografía Urbana', description: 'Clase de fotografía juntos tomando fotos de pareja en CDMX', category: 'outdoor', budget: 3, personality: 'hibrido' },
  ],
  'hibrido-high': [
    { id: 66, title: 'Tirolesa en Bosques de Tolantongo', description: 'Aventura de tirolesa entre cañones con vistas espectaculares', category: 'outdoor', budget: 4, personality: 'hibrido' },
    { id: 67, title: 'Cena Moderna en Zona Rosa', description: 'Restaurante de comida fusión con ambiente moderno y vibrante', category: 'indoor', budget: 4, personality: 'hibrido' },
    { id: 68, title: 'Tour de Mezcal en Oaxaca', description: 'Visita a palenques de mezcal con degustación y almuerzo regional', category: 'outdoor', budget: 4, personality: 'hibrido' },
    { id: 69, title: 'Concierto en Anfiteatro Silvestre', description: 'Concierto de artista conocido en anfiteatro natural', category: 'outdoor', budget: 4, personality: 'hibrido' },
    { id: 70, title: 'Escape Room Desafiante en CDMX', description: 'Escape room intenso con acertijos complejos y tema mexicano', category: 'indoor', budget: 4, personality: 'hibrido' },
  ],
  'hibrido-very_high': [
    { id: 71, title: 'Aventura Completa en Yucatán', description: 'Fin de semana con actividades de adrenalina, cenotes y cultura maya', category: 'outdoor', budget: 5, personality: 'hibrido' },
    { id: 72, title: 'Viaje a Puerto Vallarta Aventurero', description: 'Viaje a puerto con actividades aventureras y hospedaje de lujo', category: 'outdoor', budget: 5, personality: 'hibrido' },
    { id: 73, title: 'Festival Gastronómico de Veracruz', description: 'Fin de semana en festival de gastronomía y arte en puerto histórico', category: 'outdoor', budget: 5, personality: 'hibrido' },
    { id: 74, title: 'Resort de Aventura en Chinchorro', description: 'Resort todo incluido con actividades extremas en Quintana Roo', category: 'outdoor', budget: 5, personality: 'hibrido' },
    { id: 75, title: 'Experiencia Premium en Tulum', description: 'Día completo con múltiples experiencias selectas en Tulum', category: 'mixed', budget: 5, personality: 'hibrido' },
  ],
};

// Citas adicionales por categoría - MUSEOS CDMX y ACTIVIDADES
const citasPorCategoria = {
  'outdoor': [
    { id: 76, title: 'Picnic en Chapultepec al Atardecer', description: 'Picnic básico viendo la puesta de sol en bosque histórico', category: 'outdoor', budget: 1, personality: 'tranquilo' },
    { id: 77, title: 'Senderismo Desafiante Desierto de Leones', description: 'Caminata montañosa con vistas épicas de la Sierra Madre', category: 'outdoor', budget: 2, personality: 'extremo' },
    { id: 78, title: 'Vuelo en Globo Aerostático', description: 'Vuelo en globo aerostático al amanecer sobre el valle de México', category: 'outdoor', budget: 4, personality: 'hibrido' },
    { id: 79, title: 'Glamping en Tepoztlán', description: 'Glamping en zona natural con comodidades frente a pirámide', category: 'outdoor', budget: 4, personality: 'hibrido' },
    { id: 80, title: 'Excursión a Cascada de Tolantongo', description: 'Viaje a cascada natural con baño en aguas termales', category: 'outdoor', budget: 2, personality: 'extremo' },
  ],
  'indoor': [
    { id: 81, title: 'Museo Nacional de Antropología - Tour Privado', description: 'Tour privado nocturno en museo histórico más importante de México', category: 'indoor', budget: 3, personality: 'tranquilo' },
    { id: 82, title: 'Museo Frida Kahlo - Visita Romántica', description: 'Visita a casa azul con degustación de comida tradicional', category: 'indoor', budget: 3, personality: 'tranquilo' },
    { id: 83, title: 'Museo Tamayo - Arte Contemporáneo', description: 'Exposición de arte contemporáneo internacional con café cultural', category: 'indoor', budget: 3, personality: 'hibrido' },
    { id: 84, title: 'Museo Memoria y Tolerancia', description: 'Tour temático en museo interactivo con reflexión profunda', category: 'indoor', budget: 3, personality: 'hibrido' },
    { id: 85, title: 'Museo Nacional de Historia - Castillo Chapultepec', description: 'Recorrido histórico en castillo con vistas panorámicas', category: 'indoor', budget: 3, personality: 'tranquilo' },
  ],
  'cultural': [
    { id: 86, title: 'Galería de Arte Mexicano - Bellas Artes', description: 'Exhibición de arte mexicano en galería más prestigiosa del país', category: 'cultural', budget: 2, personality: 'tranquilo' },
    { id: 87, title: 'Teatro de Comedia en Centro Histórico', description: 'Función de comedia en vivo en teatro tradicional con cena', category: 'cultural', budget: 3, personality: 'hibrido' },
    { id: 88, title: 'Ballet Folclórico en Palacio de Bellas Artes', description: 'Presentación de ballet folclórico mexicano en teatro histórico', category: 'cultural', budget: 4, personality: 'tranquilo' },
    { id: 89, title: 'Museo Jumex - Arte Moderno', description: 'Colección de arte moderno en museo diseñado por arquitecto mundialmente conocido', category: 'cultural', budget: 3, personality: 'hibrido' },
    { id: 90, title: 'Festival de Cine Independiente', description: 'Noche de películas independientes mexicanas y diálogos', category: 'cultural', budget: 3, personality: 'hibrido' },
  ],
  'gastronomica': [
    { id: 91, title: 'Cena de Fusión Mexicana-Internacional', description: 'Restaurante con comida fusión de culturas en ambiente moderno', category: 'gastronomica', budget: 3, personality: 'hibrido' },
    { id: 92, title: 'Food Tour por Coyoacán', description: 'Recorrido de comida callejera probando especialidades locales', category: 'gastronomica', budget: 2, personality: 'extremo' },
    { id: 93, title: 'Clase de Cocina Mexicana', description: 'Clase preparando moles, tamales y platillos tradicionales', category: 'gastronomica', budget: 3, personality: 'hibrido' },
    { id: 94, title: 'Cata de Pulques Artesanales', description: 'Visita a pulquería con degustación y maridaje con antojitos', category: 'gastronomica', budget: 3, personality: 'extremo' },
    { id: 95, title: 'Brunch en Zona de Restaurantes', description: 'Brunch en restaurante con ambiente relajado y champagne', category: 'gastronomica', budget: 4, personality: 'tranquilo' },
  ],
  'deportes': [
    { id: 96, title: 'Clase de Baile Mexicano', description: 'Lección de folclore mexicano, salsa o danza contemporánea', category: 'deportes', budget: 2, personality: 'extremo' },
    { id: 97, title: 'Partido de Tenis Amistoso', description: 'Partido amistoso de tenis con entrenador en club deportivo', category: 'deportes', budget: 3, personality: 'extremo' },
    { id: 98, title: 'Yoga en Parque Viveros', description: 'Sesión de yoga al aire libre en parque tranquilo de Coyoacán', category: 'deportes', budget: 2, personality: 'tranquilo' },
    { id: 99, title: 'Equitación en Rancho', description: 'Paseo a caballo por senderos naturales en rancho cercano a CDMX', category: 'deportes', budget: 3, personality: 'hibrido' },
    { id: 100, title: 'Carrera Atlética Divertida', description: 'Competencia de atletismo amistosa con premios y celebración', category: 'deportes', budget: 2, personality: 'extremo' },
  ],
};

export { citasDatabase, citasPorCategoria };
