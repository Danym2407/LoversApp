// Base de datos de 100 citas reales - Ciudad de Mexico y alrededores

const citasDatabase = {
  // TRANQUILO - Muy bajo (gratis ~ $100 MXN)
  'tranquilo-very_low': [
    { id: 1,  title: 'Ir al Zoologico de Chapultepec',   description: 'Entrada gratuita. Mas de 200 especies. Bosque de Chapultepec Seccion 1. Abre martes a domingo.', category: 'Exterior', budget: 1, personality: 'tranquilo' },
    { id: 2,  title: 'Hacer un album de nosotros',        description: 'Impriman fotos en Copias Express (Roma/Condesa) o Walmart. Compren un album en Miniso y rellenenlo juntos.', category: 'Interior', budget: 1, personality: 'tranquilo' },
    { id: 3,  title: 'Noche de Netflix',                  description: 'Palomitas, cobija y maraton de su serie favorita. Costo: su suscripcion + botana de OXXO.', category: 'Interior', budget: 1, personality: 'tranquilo' },
    { id: 4,  title: 'Colorear un libro',                 description: 'Libros para colorear adultos en Gandhi o El Pendulo desde $180 MXN. Tarde con musica y cafe de olla.', category: 'Interior', budget: 1, personality: 'tranquilo' },
    { id: 5,  title: 'Armar un rompecabezas',             description: 'Rompecabezas de 1,000 piezas desde $150 MXN en Mercado Libre. Un dia entero de buena conversacion.', category: 'Interior', budget: 1, personality: 'tranquilo' },
  ],
  // TRANQUILO - Bajo ($100 - $400 MXN)
  'tranquilo-low': [
    { id: 6,  title: 'Hacer un picnic',                   description: 'Viveros de Coyoacan o Parque Hundido. Baguette, queso, fruta y su bebida favorita. Entrada libre.', category: 'Exterior', budget: 2, personality: 'tranquilo' },
    { id: 7,  title: 'Ir a una cafeteria bonita',         description: 'Blend Station (Polanco), Cardinal (Roma Norte) o Quentin (Condesa). Cafe de especialidad ~$80 MXN.', category: 'Gastro', budget: 2, personality: 'tranquilo' },
    { id: 8,  title: 'Ir a un mirador',                   description: 'Torre Latinoamericana (~$130 MXN), mirador del Angel de la Independencia (gratis) o Cerro de la Estrella.', category: 'Exterior', budget: 2, personality: 'tranquilo' },
    { id: 9,  title: 'Paseo en bicicletas',               description: 'ECOBICI $47 MXN/dia con registro. Ruta Reforma, Condesa-Roma o circuito Chapultepec. Bici sin costo extra.', category: 'Deportes', budget: 2, personality: 'tranquilo' },
    { id: 10, title: 'Ir a una cafeteria de juegos',      description: 'Ludico Cafe (Condesa) o El Juego de Pelota (Roma). Pase de juegos + bebida $120-$200 MXN. Super divertido.', category: 'Interior', budget: 2, personality: 'tranquilo' },
  ],
  // TRANQUILO - Medio ($400 - $1,200 MXN)
  'tranquilo-medium': [
    { id: 11, title: 'Ir a un museo',                     description: 'MNA (~$90 MXN), Museo Frida Kahlo (~$270 MXN) o Museo Jumex (gratis domingos). Coyoacan o Polanco.', category: 'Cultural', budget: 2, personality: 'tranquilo' },
    { id: 12, title: 'Ir al teatro',                      description: 'Teatro Milan, Foro Shakespeare o Teatro de la Ciudad. Obras desde $200-$600 MXN. Revisen teatrocdmx.com.', category: 'Cultural', budget: 3, personality: 'tranquilo' },
    { id: 13, title: 'Pintar cuadros',                    description: 'Pintura y Relax (Condesa/Polanco/Coyoacan): sesion con instructor, materiales y copa de vino. ~$500 MXN.', category: 'Interior', budget: 3, personality: 'tranquilo' },
    { id: 14, title: 'Ir a galerias de arte',             description: 'Galeria OMR (Roma), Karen Huber (Doctores) o Lopez Quiroga (Lomas). La mayoria entrada gratuita.', category: 'Cultural', budget: 2, personality: 'tranquilo' },
    { id: 15, title: 'Ir al cine prime',                  description: 'Cinemex Platino (Antara/Perisur) o Cinepolis VIP (Perisur). Asientos reclinables y servicio a tu lugar. ~$400 MXN.', category: 'Interior', budget: 3, personality: 'tranquilo' },
  ],
  // TRANQUILO - Alto ($1,200 - $3,000 MXN)
  'tranquilo-high': [
    { id: 16, title: 'Ir a un spa',                       description: 'Spa Camino Real (Polanco), Anatolia Spa (Satelite) o Temazcal en Xochimilco. Paquetes $800-$2,000 MXN/persona.', category: 'Romántica', budget: 4, personality: 'tranquilo' },
    { id: 17, title: 'Ir a ver ballet',                   description: 'Ballet Folklorico de Mexico en Bellas Artes ($200-$1,200 MXN) o Compania Nacional de Danza. Ago-mayo.', category: 'Cultural', budget: 4, personality: 'tranquilo' },
    { id: 18, title: 'Ir a desayunar en un lugar bonito', description: 'Lardo (Polanco), Expendio de Maiz (Roma) o Rosetta (Roma). Brunch con bebida ~$400-$700 MXN/persona.', category: 'Gastro', budget: 3, personality: 'tranquilo' },
    { id: 19, title: 'Quedarnos en una cabana',           description: 'Cabanas El Zorzal (Valle de Bravo) o Los Sabinos (Tepoztlan). Viernes-domingo desde $3,000 MXN por cuarto.', category: 'Exterior', budget: 4, personality: 'tranquilo' },
    { id: 20, title: 'Ir a los baños termales',           description: 'Grutas de Tolantongo (Hidalgo, ~$300 MXN entrada) o Ixtapan de la Sal (Edomex, $400-$700 MXN). 2 horas de CDMX.', category: 'Exterior', budget: 3, personality: 'tranquilo' },
  ],
  // TRANQUILO - Muy alto (> $3,000 MXN)
  'tranquilo-very_high': [
    { id: 21, title: 'Ir a la playa',                     description: 'Acapulco (4h, $1,200 MXN/noche), Zipolite (Oaxaca) o Tulum (tren maya). Planeen con anticipacion!', category: 'Exterior', budget: 5, personality: 'tranquilo' },
    { id: 22, title: 'Viajar fuera del pais',             description: 'Vuelos a Bogota (~$6,000 MXN r/t), Miami o Lima. Planeen 2 meses antes para mejores precios en Volaris/VivaAerobus.', category: 'Exterior', budget: 5, personality: 'tranquilo' },
    { id: 23, title: 'Tener una cena elegante',           description: 'Pujol (Polanco, menu degustacion ~$2,500 MXN), Quintonil o Maximo Bistrot. Reserven con semanas de anticipacion.', category: 'Gastro', budget: 5, personality: 'tranquilo' },
    { id: 24, title: 'Ir a un hotel todo incluido',       description: 'Hotel en Cancun, Huatulco o Riviera Maya. Paquetes vuelo+hotel desde ~$8,000 MXN por persona 4 dias.', category: 'Exterior', budget: 5, personality: 'tranquilo' },
    { id: 25, title: 'Conocer una maravilla del mundo',  description: 'Chichen Itza (vuelo Merida ~$4,000 MXN + tour $500 MXN). La septima maravilla del mundo a 2 horas de Merida.', category: 'Cultural', budget: 5, personality: 'tranquilo' },
  ],

  // EXTREMO - Muy bajo (gratis ~ $100 MXN)
  'extremo-very_low': [
    { id: 26, title: 'Jugar futbol o voley',              description: 'Canchas publicas en Parque Bicentenario, Parque Renacer o Deportivo Benito Juarez. Gratis o $50 MXN la hora.', category: 'Deportes', budget: 1, personality: 'extremo' },
    { id: 27, title: 'Hacer trekking',                    description: 'Ajusco, Desierto de los Leones o Pedregal de San Angel. Gratis. Llevar agua y calzado deportivo.', category: 'Exterior', budget: 1, personality: 'extremo' },
    { id: 28, title: 'Acampar',                           description: 'Ajusco (gratis), Parque La Marquesa (permisos $100 MXN) o Parque Nacional Nevado de Toluca. Llevar equipo.', category: 'Exterior', budget: 1, personality: 'extremo' },
    { id: 29, title: 'Hacer una fogata',                  description: 'Fogata en Ajusco, Parque Ecoturistico El Pedregal o en patio/terraza con permiso. Marshmallows y chocolate.', category: 'Exterior', budget: 1, personality: 'extremo' },
    { id: 30, title: 'Cultivar una planta',               description: 'Mercado de Plantas de Xochimilco: plantulas desde $20 MXN. Escojan una juntos y cuatenla.', category: 'Interior', budget: 1, personality: 'extremo' },
  ],
  // EXTREMO - Bajo ($100 - $400 MXN)
  'extremo-low': [
    { id: 31, title: 'Ir al circo',                       description: 'Circo Atayde Hermanos, Circo Barelli o Circo Fuentes-Gasca. Temporadas en Foro Sol. Entradas $150-$350 MXN.', category: 'Cultural', budget: 2, personality: 'extremo' },
    { id: 32, title: 'Ir al bowling',                     description: 'Bowling Insurgentes (Tlalpan), Boliche Galerias (Insurgentes) o Bol Pedregal. $100-$180 MXN juego + zapatos.', category: 'Deportes', budget: 2, personality: 'extremo' },
    { id: 33, title: 'Patinar sobre hielo',               description: 'Pista Ice Park Liverpool (Insurgentes Sur), Plaza de Hielo Tlahuac o Toreo Parque Central. ~$150-$250 MXN.', category: 'Deportes', budget: 2, personality: 'extremo' },
    { id: 34, title: 'Ir a una maratón a correr',         description: 'Carrera Nocturna CDMX, 15K Reforma o Carrera Bodega Aurera. Inscripcion $200-$500 MXN. sportsmexico.net.', category: 'Deportes', budget: 2, personality: 'extremo' },
    { id: 35, title: 'Hacernos tatuajes juntos',          description: 'Estudio de tatuajes en CDMX: tatuajes pequenos desde $500 MXN. O tatuajes de henna en Mercado de Artesanias.', category: 'Interior', budget: 2, personality: 'extremo' },
  ],
  // EXTREMO - Medio ($400 - $1,200 MXN)
  'extremo-medium': [
    { id: 36, title: 'Ir a los karts',                    description: 'PKL Autodromo (Magdalena Mixhuca), Kartodromo de Pantitlan o Xtreme Racing (Satelite). $250-$400 MXN 10 min.', category: 'Exterior', budget: 3, personality: 'extremo' },
    { id: 37, title: 'Ir a un escaperoom',                description: 'Xcape Room (Polanco), 60 Minutos (Satelite) o Escape Hunt (Santa Fe). $350-$500 MXN/persona. Reserven online.', category: 'Interior', budget: 3, personality: 'extremo' },
    { id: 38, title: 'Jugar paintball',                   description: 'Paintball Mexico (Naucalpan), Xtreme Paintball (Tlalpan) o Guerreros del Barro (Xochimilco). ~$400 MXN persona.', category: 'Deportes', budget: 3, personality: 'extremo' },
    { id: 39, title: 'Ir al estadio',                     description: 'Estadio Azteca (America/Cruz Azul), Estadio Ciudad de Mexico (Diablos Rojos). Boletos $250-$1,500 MXN.', category: 'Deportes', budget: 3, personality: 'extremo' },
    { id: 40, title: 'Ir a los juegos extremos',          description: 'Six Flags Mexico (Tlalpan): mas de 30 atracciones. Entrada ~$1,000 MXN. Compren online para descuento.', category: 'Exterior', budget: 3, personality: 'extremo' },
  ],
  // EXTREMO - Alto ($1,200 - $3,000 MXN)
  'extremo-high': [
    { id: 41, title: 'Ir a una sala de disparos',         description: 'Club de Tiro MX (Satelite) o Campo de Tiro Militar. Experiencia inusual y segura desde $600-$1,200 MXN.', category: 'Interior', budget: 4, personality: 'extremo' },
    { id: 42, title: 'Ir a un concierto',                 description: 'Palacio de los Deportes, Foro Sol o Auditorio Nacional. Ticketmaster.com.mx. Preventa con app BBVA.', category: 'Cultural', budget: 4, personality: 'extremo' },
    { id: 43, title: 'Ir a los tubulares',                description: 'Parque Acuatico Ixtapan de la Sal (Edomex, 2h de CDMX). Dia completo $400-$600 MXN. Albercas y toboganes.', category: 'Exterior', budget: 3, personality: 'extremo' },
    { id: 44, title: 'Ir a una sala de realidad virtual', description: 'VR Zone CDMX (Polanco), Meta Experience (Tlalnepantla) o PlayCity Arena. Sesiones $300-$600 MXN 30 min.', category: 'Interior', budget: 3, personality: 'extremo' },
    { id: 45, title: 'Ir a un hipodromo',                description: 'Hipodromo de las Americas (Lomas de Sotelo). Abierto vie/sab/dom. Entrada $100 MXN. Apuestas desde $20 MXN.', category: 'Deportes', budget: 2, personality: 'extremo' },
  ],
  // EXTREMO - Muy alto (> $3,000 MXN)
  'extremo-very_high': [
    { id: 46, title: 'Subirse a un globo aerostático',    description: 'Teotihuacan: Globos Aerostaticos de Mexico. $1,500-$2,200 MXN/persona. Sale al amanecer. Brindis incluido.', category: 'Exterior', budget: 4, personality: 'extremo' },
    { id: 47, title: 'Hacer parapente',                   description: 'Valle de Bravo (2h de CDMX): vuelo tandem con instructor ~$1,500-$2,500 MXN. Vista al lago desde el cielo.', category: 'Deportes', budget: 4, personality: 'extremo' },
    { id: 48, title: 'Bucear',                            description: 'Cenotes de Tulum (bus nocturno): bautismo de buceo ~$800-$1,200 MXN. O curso Open Water en Poza Rica.', category: 'Deportes', budget: 5, personality: 'extremo' },
    { id: 49, title: 'Volar en helicóptero',              description: 'Heliosa (CDMX): vuelo panoramico sobre la ciudad desde $2,500 MXN/persona. Despega desde aeropuerto Vallejo.', category: 'Exterior', budget: 5, personality: 'extremo' },
    { id: 50, title: 'Tour en avioneta',                  description: 'AeroCastor o Sky Express: vuelo en avioneta sobre CDMX / Iztaccihuatl desde $1,800-$3,500 MXN. Aerodromo del Valle.', category: 'Exterior', budget: 5, personality: 'extremo' },
  ],

  // HIBRIDO - Muy bajo (gratis ~ $100 MXN)
  'hibrido-very_low': [
    { id: 51, title: 'Hacer una pijamada',                description: 'Pijamas, snacks, pelicula de terror o comedia y charla hasta el amanecer. Precio: $0. Valor: incalculable.', category: 'Interior', budget: 1, personality: 'hibrido' },
    { id: 52, title: 'Estudiar juntos',                   description: 'Biblioteca Vasconcelos (gratis, Buena Vista) o Biblioteca Mexico (Centro). Wifi, silencio y mucha inspiracion.', category: 'Interior', budget: 1, personality: 'hibrido' },
    { id: 53, title: 'Jugar un videojuego',               description: 'Torneo de Mario Kart o Mortal Kombat en casa. Ganador elige la actividad del dia siguiente. Costo: $0.', category: 'Interior', budget: 1, personality: 'hibrido' },
    { id: 54, title: 'Aprender a bailar',                 description: 'Clases gratuitas de salsa en el Zocalo (domingos) o videos en YouTube. Tambien Escuela de Danza Popular en Tepito.', category: 'Cultural', budget: 1, personality: 'hibrido' },
    { id: 55, title: 'Noche de juego de mesa',            description: 'Catan, Uno, Jenga o Cluedo. Pueden jugar en Ludico Cafe (Condesa) por pase de $60-$120 MXN o en casa gratis.', category: 'Interior', budget: 1, personality: 'hibrido' },
  ],
  // HIBRIDO - Bajo ($100 - $400 MXN)
  'hibrido-low': [
    { id: 56, title: 'Ir a una heladería',                description: 'La Michoacana (por toda la ciudad), Roxy (Coyoacan) o Helado Obscuro (Roma/Condesa). Desde $30-$80 MXN copa.', category: 'Gastro', budget: 1, personality: 'hibrido' },
    { id: 57, title: 'Ir a un autocinema',                description: 'Autocinema Coyoacan, CineDrive (Perinorte) o Cine Joya. ~$250-$350 MXN por auto. Lleven cobija y botana.', category: 'Cultural', budget: 2, personality: 'hibrido' },
    { id: 58, title: 'Pasear con mascotas',               description: 'Parque Mascotas (Tlalpan), Parque Bicentenario o Parque de los Venados. Si no tienen mascota: visiten albergue UTOPIA.', category: 'Exterior', budget: 1, personality: 'hibrido' },
    { id: 59, title: 'Cocinar un postre',                 description: 'Chocoflan, pay de queso o crepes en casa. Ingredientes ~$150 MXN. Busquen la receta mas absurda y lansense.', category: 'Gastro', budget: 1, personality: 'hibrido' },
    { id: 60, title: 'Noche de hamburguesas',             description: 'Karne Guisada (Roma), Butcher & Sons (Polanco) o hagan sus propias burguers con ingredientes de Costco ($250 MXN).', category: 'Gastro', budget: 2, personality: 'hibrido' },
  ],
  // HIBRIDO - Medio ($400 - $1,200 MXN)
  'hibrido-medium': [
    { id: 61, title: 'Noche de pizza',                    description: 'Pizza casera con ingredientes de La Comer (~$250 MXN todo) o delivery de Don Peppe, Pizza del Perro Negro o Guerrin.', category: 'Gastro', budget: 2, personality: 'hibrido' },
    { id: 62, title: 'Ir a una sala de juegos',           description: 'Arcade Butterfly (Roma), Replay Lincoln (Polanco) o Fun Club (Santa Fe). Fichas + bebida desde $300 MXN por persona.', category: 'Interior', budget: 3, personality: 'hibrido' },
    { id: 63, title: 'Pintar ceramica',                   description: 'La Cita Alquimia (Condesa), Barro & Color (Roma) o Taller Ceramica CDMX. Sesion con materiales ~$400-$700 MXN.', category: 'Interior', budget: 3, personality: 'hibrido' },
    { id: 64, title: 'Aprender a cocinar juntos',         description: 'Cocina Conchita (CDMX), De Mi Rancho a Tu Cocina o La Escuela de Cocina del Centro. Clases $600-$1,200 MXN/persona.', category: 'Gastro', budget: 3, personality: 'hibrido' },
    { id: 65, title: 'Acampar',                           description: 'Corral de Piedra (Tlalpan), Parque La Marquesa o Parque Nacional Ajusco. Equipo de renta desde $300 MXN.', category: 'Exterior', budget: 2, personality: 'hibrido' },
  ],
  // HIBRIDO - Alto ($1,200 - $3,000 MXN)
  'hibrido-high': [
    { id: 66, title: 'Ir a un rooftop',                   description: 'Terraza Cha Cha Cha (Reforma), El Mayor (Zocalo), Nikkei Garden (Polanco) o Basico (Insurgentes). Coctel ~$200 MXN.', category: 'Romántica', budget: 3, personality: 'hibrido' },
    { id: 67, title: 'Ir al gym',                         description: 'Smart Fit (desde $299 MXN/mes), Sportcity o inscribanse juntos por un mes. Reto de 30 dias en pareja.', category: 'Deportes', budget: 2, personality: 'hibrido' },
    { id: 68, title: 'Ir de shopping',                    description: 'Antara Fashion Hall (Polanco), Perisur, Altavista 147 o mercado de Coyoacan para artesanias. Presupuesto a definir.', category: 'Exterior', budget: 4, personality: 'hibrido' },
    { id: 69, title: 'Ir a un casino',                    description: 'BigBola (Tlalnepantla), Caliente Club (Insurgentes) o Hollywood Bets. Presupuesto fijo de $500 MXN. Diviertanse.', category: 'Interior', budget: 4, personality: 'hibrido' },
    { id: 70, title: 'Ir a un festival',                  description: 'Vive Latino, Corona Capital o MUTEK CDMX. Abonos desde $1,800-$4,500 MXN. Revisen eventbrite.com.mx.', category: 'Cultural', budget: 4, personality: 'hibrido' },
  ],
  // HIBRIDO - Muy alto (> $3,000 MXN)
  'hibrido-very_high': [
    { id: 71, title: 'Un roadtrip',                       description: 'Ruta Puebla-Oaxaca (6h), Circuito Magico (Queretaro-Guanajuato-San Miguel) o Jalisco-Puerto Vallarta. Gas ~$800 MXN.', category: 'Exterior', budget: 4, personality: 'hibrido' },
    { id: 72, title: 'Ir a un acuario',                   description: 'Acuario Inbursa (Polanco, $230-$280 MXN), Acuario de Veracruz o Acuario del Zologico de Aragon. Mas de 300 especies.', category: 'Cultural', budget: 2, personality: 'hibrido' },
    { id: 73, title: 'Ir en yate',                        description: 'Charter de yate en Acapulco ($8,000-$15,000 MXN por dia, grupo de 8) o Cancun. Snorkel y comida incluidos.', category: 'Exterior', budget: 5, personality: 'hibrido' },
    { id: 74, title: 'Viajes de mochilero',               description: 'Circuito Oaxaca ($3,000 MXN/persona bus+hostal), Baja California o Ruta Maya. Planeen con meses de anticipacion.', category: 'Exterior', budget: 4, personality: 'hibrido' },
    { id: 75, title: 'Disfrazarse en Halloween',          description: 'Carnaval Zocalo (31 oct), desfile calles de Madero o fiesta en bares de la Condesa/Roma. Disfraces desde $200 MXN.', category: 'Exterior', budget: 2, personality: 'hibrido' },
  ],
};

// Citas adicionales por categoria
const citasPorCategoria = {
  'outdoor': [
    { id: 76, title: 'Tiro al arco',                      description: 'Polideportivo Magdalena Mixhuca, Club Arco CDMX o Deportivo Santa Cruz Meyehualco. Intro ~$200-$350 MXN.', category: 'Deportes', budget: 2, personality: 'extremo' },
    { id: 77, title: 'Canotaje',                          description: 'Lago Mayor de Chapultepec (canoas $80 MXN 30 min) o kayak en Xochimilco Ecoturistico ($150 MXN/hora).', category: 'Deportes', budget: 2, personality: 'extremo' },
    { id: 78, title: 'Montar a caballo',                  description: 'Rancho Las Animas (Ajusco), Rancho Alegre (Tlalpan) o Club Hipico Militar. Cabalgata en bosque ~$300-$400 MXN/hora.', category: 'Exterior', budget: 3, personality: 'hibrido' },
    { id: 79, title: 'Ir a una cascada',                  description: 'Cascada La Concepcion (Edomex, 1h), Cascada Chimalacatlan (Morelos, 2h) o El Salto del Nogal (Hidalgo).', category: 'Exterior', budget: 2, personality: 'extremo' },
    { id: 80, title: 'Escalar una montana',               description: 'Iztaccihuatl (Parque Nacional Izta-Popo, permiso gratis) o Tepozteco. Requiere equipo. Agencias desde $600 MXN.', category: 'Deportes', budget: 3, personality: 'extremo' },
  ],
  'indoor': [
    { id: 81, title: 'Visitar un mariposario',            description: 'Mariposario de Chapultepec (Seccion 3, gratis), Jardin Botanico UNAM o Santuario Mariposa Monarca (nov-mar).', category: 'Exterior', budget: 1, personality: 'tranquilo' },
    { id: 82, title: 'Conocer la nieve',                  description: 'Nevado de Toluca (3h de CDMX, permiso $50 MXN) o Iztaccihuatl. Lleven ropa termica. Paisaje unico.', category: 'Exterior', budget: 2, personality: 'extremo' },
    { id: 83, title: 'Ir a una granja',                   description: 'Granja Lupita (Xochimilco), Rancho Santa Barbara (Edomex) o La Granja del Chavo (CDMX). ~$100-$200 MXN.', category: 'Exterior', budget: 2, personality: 'tranquilo' },
    { id: 84, title: 'Subirse a un teleferico',            description: 'Teleferico de Naucalpan ($30 MXN), de Monterrey (si viajan) o Teleferico de Taxco ($70 MXN). Vistas increibles.', category: 'Exterior', budget: 1, personality: 'hibrido' },
    { id: 85, title: 'Ir a los tubulares',                description: 'Parque Acuatico Ixtapan de la Sal (2h de CDMX). Dia completo con toboganes y albercas $400-$600 MXN.', category: 'Exterior', budget: 3, personality: 'extremo' },
  ],
  'cultural': [
    { id: 86, title: 'Dar de comer a animalitos de la calle', description: 'Preparen bolsas de croquetas y recorran la colonia. Un dia lleno de amor y conexion. Croquetas ~$60 MXN.', category: 'Exterior', budget: 1, personality: 'hibrido' },
    { id: 87, title: 'Armar un lego',                     description: 'Sets LEGO Creator desde $350 MXN en Toy Store o Amazon. Tarde de concentracion y trabajo en equipo.', category: 'Interior', budget: 2, personality: 'tranquilo' },
    { id: 88, title: 'Aprender a tocar un instrumento',   description: 'Tutoriales gratis en YouTube de guitarra o ukulele. O clase gratuita en Casa de Cultura de la delegacion.', category: 'Cultural', budget: 1, personality: 'tranquilo' },
    { id: 89, title: 'Visitar una cueva',                 description: 'Cuevas de Cacahuamilpa (Guerrero, 2h de CDMX, $130 MXN) o Grutas de la Estrella (Tonatico). Recorrido guiado.', category: 'Exterior', budget: 2, personality: 'extremo' },
    { id: 90, title: 'Ir a un planetario',                description: 'Planetario Luis Enrique Erro (IPN, Zacatenco) o Universum UNAM. Funciones desde $60 MXN. Reserven.', category: 'Interior', budget: 1, personality: 'tranquilo' },
  ],
  'gastronomica': [
    { id: 91, title: 'Salir vestidos iguales',            description: 'Compren playeras iguales en Merced ($80 MXN) o coordinen outfits en casa. Salgan a Coyoacan a tomar fotos.', category: 'Exterior', budget: 1, personality: 'hibrido' },
    { id: 92, title: 'Aprender a conducir',               description: 'AutoTresc, InstructorMovil o el estacionamiento del Estadio Azteca los domingos (desocupado). $0-$500 MXN.', category: 'Exterior', budget: 2, personality: 'hibrido' },
    { id: 93, title: 'Ir a una feria navidena',           description: 'Feria de Navidad del Zocalo (diciembre), Feria de Coyoacan o Winter Wonderland en Perisur. Gratis entrar.', category: 'Cultural', budget: 1, personality: 'tranquilo' },
    { id: 94, title: 'Hacer un voluntariado',             description: 'Banco de Alimentos de Mexico, Calle Viva AC o Un Kilo de Ayuda. Registrense con semanas de anticipacion.', category: 'Exterior', budget: 1, personality: 'hibrido' },
    { id: 95, title: 'Adoptar una mascota',               description: 'Centro de Transferencia Canina CDMX o Albergue UTOPIA (Xochimilco). Adopcion gratuita. Preparen su espacio.', category: 'Interior', budget: 1, personality: 'hibrido' },
  ],
  'deportes': [
    { id: 96, title: 'Ir a una maraton de carreras',      description: 'Maraton CDMX (octubre), 21K Nocturna o Maraton Telcel. Inscripcion $350-$600 MXN. En pareja es mas divertido.', category: 'Deportes', budget: 2, personality: 'extremo' },
    { id: 97, title: 'Hacer un deporte nuevo juntos',     description: 'Ultimate Frisbee (Liga CDMX, gratis), padel en Club Padel CDMX o lacrosse en Parque Lira. Primer mes gratis.', category: 'Deportes', budget: 2, personality: 'extremo' },
    { id: 98, title: 'Pasear en moto acuatica',           description: 'Lago de Tequesquitengo (Morelos, 1.5h), Xochimilco con panga o playas de Acapulco. $500-$800 MXN 30 min.', category: 'Deportes', budget: 4, personality: 'extremo' },
    { id: 99, title: 'Montar en camellos',                description: 'Parque Ecologico de Xochimilco (when available) o viaje a Desierto de San Luis Potosi. ~$200-$400 MXN.', category: 'Exterior', budget: 3, personality: 'extremo' },
    { id: 100, title: 'Ir a un parque de diversiones',   description: 'Six Flags Mexico (Tlalpan): mas de 30 atracciones. La mas grande de America Latina. Entrada ~$800-$1,100 MXN.', category: 'Exterior', budget: 4, personality: 'extremo' },
  ],
};

export const getAllCitasFlat = (() => {
  const merged = [...Object.values(citasDatabase).flat(), ...Object.values(citasPorCategoria).flat()];
  const seen = new Set();
  return merged.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
})();

export { citasDatabase, citasPorCategoria };
