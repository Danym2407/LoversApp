const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

// ── 100 base citas (auto-seeded on first request) ─────────────────────────────
// [id, title, description, category, budget, personality]
const CITAS_SEED = [
  // TRANQUILO — Muy bajo
  [1,  'Ir al Zoologico de Chapultepec',   'Entrada gratuita. Mas de 200 especies. Bosque de Chapultepec Seccion 1. Abre martes a domingo.', 'Exterior', 1, 'tranquilo'],
  [2,  'Hacer un album de nosotros',        'Impriman fotos en Copias Express (Roma/Condesa) o Walmart. Compren un album en Miniso y rellenenlo juntos.', 'Interior', 1, 'tranquilo'],
  [3,  'Noche de Netflix',                  'Palomitas, cobija y maraton de su serie favorita. Costo: su suscripcion + botana de OXXO.', 'Interior', 1, 'tranquilo'],
  [4,  'Colorear un libro',                 'Libros para colorear adultos en Gandhi o El Pendulo desde $180 MXN. Tarde con musica y cafe de olla.', 'Interior', 1, 'tranquilo'],
  [5,  'Armar un rompecabezas',             'Rompecabezas de 1,000 piezas desde $150 MXN en Mercado Libre. Un dia entero de buena conversacion.', 'Interior', 1, 'tranquilo'],
  // TRANQUILO — Bajo
  [6,  'Hacer un picnic',                   'Viveros de Coyoacan o Parque Hundido. Baguette, queso, fruta y su bebida favorita. Entrada libre.', 'Exterior', 2, 'tranquilo'],
  [7,  'Ir a una cafeteria bonita',         'Blend Station (Polanco), Cardinal (Roma Norte) o Quentin (Condesa). Cafe de especialidad ~$80 MXN.', 'Gastro', 2, 'tranquilo'],
  [8,  'Ir a un mirador',                   'Torre Latinoamericana (~$130 MXN), mirador del Angel de la Independencia (gratis) o Cerro de la Estrella.', 'Exterior', 2, 'tranquilo'],
  [9,  'Paseo en bicicletas',               'ECOBICI $47 MXN/dia con registro. Ruta Reforma, Condesa-Roma o circuito Chapultepec.', 'Deportes', 2, 'tranquilo'],
  [10, 'Ir a una cafeteria de juegos',      'Ludico Cafe (Condesa) o El Juego de Pelota (Roma). Pase de juegos + bebida $120-$200 MXN. Super divertido.', 'Interior', 2, 'tranquilo'],
  // TRANQUILO — Medio
  [11, 'Ir a un museo',                     'MNA (~$90 MXN), Museo Frida Kahlo (~$270 MXN) o Museo Jumex (gratis domingos). Coyoacan o Polanco.', 'Cultural', 2, 'tranquilo'],
  [12, 'Ir al teatro',                      'Teatro Milan, Foro Shakespeare o Teatro de la Ciudad. Obras desde $200-$600 MXN. Revisen teatrocdmx.com.', 'Cultural', 3, 'tranquilo'],
  [13, 'Pintar cuadros',                    'Pintura y Relax (Condesa/Polanco/Coyoacan): sesion con instructor, materiales y copa de vino. ~$500 MXN.', 'Interior', 3, 'tranquilo'],
  [14, 'Ir a galerias de arte',             'Galeria OMR (Roma), Karen Huber (Doctores) o Lopez Quiroga (Lomas). La mayoria entrada gratuita.', 'Cultural', 2, 'tranquilo'],
  [15, 'Ir al cine prime',                  'Cinemex Platino (Antara/Perisur) o Cinepolis VIP. Asientos reclinables y servicio a tu lugar. ~$400 MXN.', 'Interior', 3, 'tranquilo'],
  // TRANQUILO — Alto
  [16, 'Ir a un spa',                       'Spa Camino Real (Polanco), Anatolia Spa (Satelite) o Temazcal en Xochimilco. Paquetes $800-$2,000 MXN/persona.', 'Romantica', 4, 'tranquilo'],
  [17, 'Ir a ver ballet',                   'Ballet Folklorico de Mexico en Bellas Artes ($200-$1,200 MXN) o Compania Nacional de Danza. Ago-mayo.', 'Cultural', 4, 'tranquilo'],
  [18, 'Ir a desayunar en un lugar bonito', 'Lardo (Polanco), Expendio de Maiz (Roma) o Rosetta (Roma). Brunch con bebida ~$400-$700 MXN/persona.', 'Gastro', 3, 'tranquilo'],
  [19, 'Quedarnos en una cabana',           'Cabanas El Zorzal (Valle de Bravo) o Los Sabinos (Tepoztlan). Viernes-domingo desde $3,000 MXN por cuarto.', 'Exterior', 4, 'tranquilo'],
  [20, 'Ir a los banos termales',           'Grutas de Tolantongo (Hidalgo, ~$300 MXN) o Ixtapan de la Sal (Edomex, $400-$700 MXN). 2 horas de CDMX.', 'Exterior', 3, 'tranquilo'],
  // TRANQUILO — Muy alto
  [21, 'Ir a la playa',                     'Acapulco (4h, $1,200 MXN/noche), Zipolite (Oaxaca) o Tulum (tren maya). Planeen con anticipacion!', 'Exterior', 5, 'tranquilo'],
  [22, 'Viajar fuera del pais',             'Vuelos a Bogota (~$6,000 MXN r/t), Miami o Lima. Planeen 2 meses antes para mejores precios.', 'Exterior', 5, 'tranquilo'],
  [23, 'Tener una cena elegante',           'Pujol (Polanco, menu degustacion ~$2,500 MXN), Quintonil o Maximo Bistrot. Reserven con semanas de anticipacion.', 'Gastro', 5, 'tranquilo'],
  [24, 'Ir a un hotel todo incluido',       'Hotel en Cancun, Huatulco o Riviera Maya. Paquetes vuelo+hotel desde ~$8,000 MXN por persona 4 dias.', 'Exterior', 5, 'tranquilo'],
  [25, 'Conocer una maravilla del mundo',   'Chichen Itza (vuelo Merida ~$4,000 MXN + tour $500 MXN). La septima maravilla del mundo a 2 horas de Merida.', 'Cultural', 5, 'tranquilo'],
  // EXTREMO — Muy bajo
  [26, 'Jugar futbol o voley',              'Canchas publicas en Parque Bicentenario, Parque Renacer o Deportivo Benito Juarez. Gratis o $50 MXN/hora.', 'Deportes', 1, 'extremo'],
  [27, 'Hacer trekking',                    'Ajusco, Desierto de los Leones o Pedregal de San Angel. Gratis. Llevar agua y calzado deportivo.', 'Exterior', 1, 'extremo'],
  [28, 'Acampar',                           'Ajusco (gratis), Parque La Marquesa (permisos $100 MXN) o Parque Nacional Nevado de Toluca. Llevar equipo.', 'Exterior', 1, 'extremo'],
  [29, 'Hacer una fogata',                  'Fogata en Ajusco, Parque Ecoturistico El Pedregal o en patio/terraza con permiso. Marshmallows y chocolate.', 'Exterior', 1, 'extremo'],
  [30, 'Cultivar una planta',               'Mercado de Plantas de Xochimilco: plantulas desde $20 MXN. Escojan una juntos y cuidenla.', 'Interior', 1, 'extremo'],
  // EXTREMO — Bajo
  [31, 'Ir al circo',                       'Circo Atayde Hermanos, Circo Barelli o Circo Fuentes-Gasca. Temporadas en Foro Sol. Entradas $150-$350 MXN.', 'Cultural', 2, 'extremo'],
  [32, 'Ir al bowling',                     'Bowling Insurgentes (Tlalpan), Boliche Galerias (Insurgentes) o Bol Pedregal. $100-$180 MXN juego + zapatos.', 'Deportes', 2, 'extremo'],
  [33, 'Patinar sobre hielo',               'Pista Ice Park Liverpool (Insurgentes Sur), Plaza de Hielo Tlahuac o Toreo Parque Central. ~$150-$250 MXN.', 'Deportes', 2, 'extremo'],
  [34, 'Ir a una maraton a correr',         'Carrera Nocturna CDMX, 15K Reforma o Carrera Bodega Aurera. Inscripcion $200-$500 MXN.', 'Deportes', 2, 'extremo'],
  [35, 'Hacernos tatuajes juntos',          'Estudio de tatuajes en CDMX: tatuajes pequenos desde $500 MXN. O tatuajes de henna en Mercado de Artesanias.', 'Interior', 2, 'extremo'],
  // EXTREMO — Medio
  [36, 'Ir a los karts',                    'PKL Autodromo (Magdalena Mixhuca), Kartodromo de Pantitlan o Xtreme Racing (Satelite). $250-$400 MXN/10 min.', 'Exterior', 3, 'extremo'],
  [37, 'Ir a un escaperoom',               'Xcape Room (Polanco), 60 Minutos (Satelite) o Escape Hunt (Santa Fe). $350-$500 MXN/persona.', 'Interior', 3, 'extremo'],
  [38, 'Jugar paintball',                   'Paintball Mexico (Naucalpan), Xtreme Paintball (Tlalpan) o Guerreros del Barro (Xochimilco). ~$400 MXN/persona.', 'Deportes', 3, 'extremo'],
  [39, 'Ir al estadio',                     'Estadio Azteca (America/Cruz Azul), Estadio Ciudad de Mexico (Diablos Rojos). Boletos $250-$1,500 MXN.', 'Deportes', 3, 'extremo'],
  [40, 'Ir a los juegos extremos',          'Six Flags Mexico (Tlalpan): mas de 30 atracciones. Entrada ~$1,000 MXN. Compren online para descuento.', 'Exterior', 3, 'extremo'],
  // EXTREMO — Alto
  [41, 'Ir a una sala de disparos',         'Club de Tiro MX (Satelite) o Campo de Tiro Militar. Experiencia inusual y segura desde $600-$1,200 MXN.', 'Interior', 4, 'extremo'],
  [42, 'Ir a un concierto',                 'Palacio de los Deportes, Foro Sol o Auditorio Nacional. Ticketmaster.com.mx. Preventa con app BBVA.', 'Cultural', 4, 'extremo'],
  [43, 'Ir a los tubulares',                'Parque Acuatico Ixtapan de la Sal (Edomex, 2h de CDMX). Dia completo $400-$600 MXN.', 'Exterior', 3, 'extremo'],
  [44, 'Ir a una sala de realidad virtual', 'VR Zone CDMX (Polanco), Meta Experience (Tlalnepantla) o PlayCity Arena. Sesiones $300-$600 MXN/30 min.', 'Interior', 3, 'extremo'],
  [45, 'Ir a un hipodromo',                'Hipodromo de las Americas (Lomas de Sotelo). Abierto vie/sab/dom. Entrada $100 MXN. Apuestas desde $20 MXN.', 'Deportes', 2, 'extremo'],
  // EXTREMO — Muy alto
  [46, 'Subirse a un globo aerostatico',    'Teotihuacan: Globos Aerostaticos de Mexico. $1,500-$2,200 MXN/persona. Sale al amanecer. Brindis incluido.', 'Exterior', 4, 'extremo'],
  [47, 'Hacer parapente',                   'Valle de Bravo (2h de CDMX): vuelo tandem con instructor ~$1,500-$2,500 MXN. Vista al lago desde el cielo.', 'Deportes', 4, 'extremo'],
  [48, 'Bucear',                            'Cenotes de Tulum (bus nocturno): bautismo de buceo ~$800-$1,200 MXN. O curso Open Water en Poza Rica.', 'Deportes', 5, 'extremo'],
  [49, 'Volar en helicoptero',              'Heliosa (CDMX): vuelo panoramico sobre la ciudad desde $2,500 MXN/persona. Despega desde aeropuerto Vallejo.', 'Exterior', 5, 'extremo'],
  [50, 'Tour en avioneta',                  'AeroCastor o Sky Express: vuelo en avioneta sobre CDMX / Iztaccihuatl desde $1,800-$3,500 MXN.', 'Exterior', 5, 'extremo'],
  // HIBRIDO — Muy bajo
  [51, 'Hacer una pijamada',                'Pijamas, snacks, pelicula de terror o comedia y charla hasta el amanecer. Precio: $0. Valor: incalculable.', 'Interior', 1, 'hibrido'],
  [52, 'Estudiar juntos',                   'Biblioteca Vasconcelos (gratis, Buena Vista) o Biblioteca Mexico (Centro). Wifi, silencio y mucha inspiracion.', 'Interior', 1, 'hibrido'],
  [53, 'Jugar un videojuego',               'Torneo de Mario Kart o Mortal Kombat en casa. Ganador elige la actividad del dia siguiente. Costo: $0.', 'Interior', 1, 'hibrido'],
  [54, 'Aprender a bailar',                 'Clases gratuitas de salsa en el Zocalo (domingos) o videos en YouTube. Tambien Escuela de Danza Popular en Tepito.', 'Cultural', 1, 'hibrido'],
  [55, 'Noche de juego de mesa',            'Catan, Uno, Jenga o Cluedo. Pueden jugar en Ludico Cafe (Condesa) por pase de $60-$120 MXN o en casa gratis.', 'Interior', 1, 'hibrido'],
  // HIBRIDO — Bajo
  [56, 'Ir a una heladeria',                'La Michoacana (por toda la ciudad), Roxy (Coyoacan) o Helado Obscuro (Roma/Condesa). Desde $30-$80 MXN copa.', 'Gastro', 1, 'hibrido'],
  [57, 'Ir a un autocinema',                'Autocinema Coyoacan, CineDrive (Perinorte) o Cine Joya. ~$250-$350 MXN por auto. Lleven cobija y botana.', 'Cultural', 2, 'hibrido'],
  [58, 'Pasear con mascotas',               'Parque Mascotas (Tlalpan), Parque Bicentenario o Parque de los Venados. Si no tienen mascota: visiten albergue UTOPIA.', 'Exterior', 1, 'hibrido'],
  [59, 'Cocinar un postre',                 'Chocoflan, pay de queso o crepes en casa. Ingredientes ~$150 MXN. Busquen la receta mas absurda y lansense.', 'Gastro', 1, 'hibrido'],
  [60, 'Noche de hamburguesas',             'Karne Guisada (Roma), Butcher & Sons (Polanco) o hagan sus propias burguers con ingredientes de Costco ($250 MXN).', 'Gastro', 2, 'hibrido'],
  // HIBRIDO — Medio
  [61, 'Noche de pizza',                    'Pizza casera con ingredientes de La Comer (~$250 MXN) o delivery de Don Peppe, Pizza del Perro Negro o Guerrin.', 'Gastro', 2, 'hibrido'],
  [62, 'Ir a una sala de juegos',           'Arcade Butterfly (Roma), Replay Lincoln (Polanco) o Fun Club (Santa Fe). Fichas + bebida desde $300 MXN/persona.', 'Interior', 3, 'hibrido'],
  [63, 'Pintar ceramica',                   'La Cita Alquimia (Condesa), Barro & Color (Roma) o Taller Ceramica CDMX. Sesion con materiales ~$400-$700 MXN.', 'Interior', 3, 'hibrido'],
  [64, 'Aprender a cocinar juntos',         'Cocina Conchita (CDMX), De Mi Rancho a Tu Cocina o La Escuela de Cocina del Centro. Clases $600-$1,200 MXN/persona.', 'Gastro', 3, 'hibrido'],
  [65, 'Acampar',                           'Corral de Piedra (Tlalpan), Parque La Marquesa o Parque Nacional Ajusco. Equipo de renta desde $300 MXN.', 'Exterior', 2, 'hibrido'],
  // HIBRIDO — Alto
  [66, 'Ir a un rooftop',                   'Terraza Cha Cha Cha (Reforma), El Mayor (Zocalo), Nikkei Garden (Polanco) o Basico (Insurgentes). Coctel ~$200 MXN.', 'Romantica', 3, 'hibrido'],
  [67, 'Ir al gym',                         'Smart Fit (desde $299 MXN/mes), Sportcity o inscribanse juntos por un mes. Reto de 30 dias en pareja.', 'Deportes', 2, 'hibrido'],
  [68, 'Ir de shopping',                    'Antara Fashion Hall (Polanco), Perisur, Altavista 147 o mercado de Coyoacan para artesanias.', 'Exterior', 4, 'hibrido'],
  [69, 'Ir a un casino',                    'BigBola (Tlalnepantla), Caliente Club (Insurgentes) o Hollywood Bets. Presupuesto fijo de $500 MXN. Diviertanse.', 'Interior', 4, 'hibrido'],
  [70, 'Ir a un festival',                  'Vive Latino, Corona Capital o MUTEK CDMX. Abonos desde $1,800-$4,500 MXN. Revisen eventbrite.com.mx.', 'Cultural', 4, 'hibrido'],
  // HIBRIDO — Muy alto
  [71, 'Un roadtrip',                       'Ruta Puebla-Oaxaca (6h), Circuito Magico (Queretaro-Guanajuato-San Miguel) o Jalisco-Puerto Vallarta. Gas ~$800 MXN.', 'Exterior', 4, 'hibrido'],
  [72, 'Ir a un acuario',                   'Acuario Inbursa (Polanco, $230-$280 MXN), Acuario de Veracruz o Acuario del Zologico de Aragon. Mas de 300 especies.', 'Cultural', 2, 'hibrido'],
  [73, 'Ir en yate',                        'Charter de yate en Acapulco ($8,000-$15,000 MXN por dia, grupo de 8) o Cancun. Snorkel y comida incluidos.', 'Exterior', 5, 'hibrido'],
  [74, 'Viajes de mochilero',               'Circuito Oaxaca ($3,000 MXN/persona bus+hostal), Baja California o Ruta Maya. Planeen con meses de anticipacion.', 'Exterior', 4, 'hibrido'],
  [75, 'Disfrazarse en Halloween',          'Carnaval Zocalo (31 oct), desfile calles de Madero o fiesta en bares de la Condesa/Roma. Disfraces desde $200 MXN.', 'Exterior', 2, 'hibrido'],
  // OUTDOOR
  [76, 'Tiro al arco',                      'Polideportivo Magdalena Mixhuca, Club Arco CDMX o Deportivo Santa Cruz Meyehualco. Intro ~$200-$350 MXN.', 'Deportes', 2, 'extremo'],
  [77, 'Canotaje',                          'Lago Mayor de Chapultepec (canoas $80 MXN/30 min) o kayak en Xochimilco Ecoturistico ($150 MXN/hora).', 'Deportes', 2, 'extremo'],
  [78, 'Montar a caballo',                  'Rancho Las Animas (Ajusco), Rancho Alegre (Tlalpan) o Club Hipico Militar. Cabalgata en bosque ~$300-$400 MXN/hora.', 'Exterior', 3, 'hibrido'],
  [79, 'Ir a una cascada',                  'Cascada La Concepcion (Edomex, 1h), Cascada Chimalacatlan (Morelos, 2h) o El Salto del Nogal (Hidalgo).', 'Exterior', 2, 'extremo'],
  [80, 'Escalar una montana',               'Iztaccihuatl (Parque Nacional Izta-Popo, permiso gratis) o Tepozteco. Requiere equipo. Agencias desde $600 MXN.', 'Deportes', 3, 'extremo'],
  // INDOOR
  [81, 'Visitar un mariposario',            'Mariposario de Chapultepec (Seccion 3, gratis), Jardin Botanico UNAM o Santuario Mariposa Monarca (nov-mar).', 'Exterior', 1, 'tranquilo'],
  [82, 'Conocer la nieve',                  'Nevado de Toluca (3h de CDMX, permiso $50 MXN) o Iztaccihuatl. Lleven ropa termica. Paisaje unico.', 'Exterior', 2, 'extremo'],
  [83, 'Ir a una granja',                   'Granja Lupita (Xochimilco), Rancho Santa Barbara (Edomex) o La Granja del Chavo (CDMX). ~$100-$200 MXN.', 'Exterior', 2, 'tranquilo'],
  [84, 'Subirse a un teleferico',           'Teleferico de Naucalpan ($30 MXN), de Monterrey (si viajan) o Teleferico de Taxco ($70 MXN). Vistas increibles.', 'Exterior', 1, 'hibrido'],
  [85, 'Ir a los tubulares (acuatico)',     'Parque Acuatico Ixtapan de la Sal (2h de CDMX). Dia completo con toboganes y albercas $400-$600 MXN.', 'Exterior', 3, 'extremo'],
  // CULTURAL
  [86, 'Dar de comer a animalitos',         'Preparen bolsas de croquetas y recorran la colonia. Un dia lleno de amor y conexion. Croquetas ~$60 MXN.', 'Exterior', 1, 'hibrido'],
  [87, 'Armar un lego',                     'Sets LEGO Creator desde $350 MXN en Toy Store o Amazon. Tarde de concentracion y trabajo en equipo.', 'Interior', 2, 'tranquilo'],
  [88, 'Aprender a tocar un instrumento',   'Tutoriales gratis en YouTube de guitarra o ukulele. O clase gratuita en Casa de Cultura de la delegacion.', 'Cultural', 1, 'tranquilo'],
  [89, 'Visitar una cueva',                 'Cuevas de Cacahuamilpa (Guerrero, 2h de CDMX, $130 MXN) o Grutas de la Estrella (Tonatico). Recorrido guiado.', 'Exterior', 2, 'extremo'],
  [90, 'Ir a un planetario',                'Planetario Luis Enrique Erro (IPN, Zacatenco) o Universum UNAM. Funciones desde $60 MXN. Reserven.', 'Interior', 1, 'tranquilo'],
  // GASTRONOMICA
  [91, 'Salir vestidos iguales',            'Compren playeras iguales en Merced ($80 MXN) o coordinen outfits en casa. Salgan a Coyoacan a tomar fotos.', 'Exterior', 1, 'hibrido'],
  [92, 'Aprender a conducir',               'AutoTresc, InstructorMovil o el estacionamiento del Estadio Azteca los domingos (desocupado). $0-$500 MXN.', 'Exterior', 2, 'hibrido'],
  [93, 'Ir a una feria navidena',           'Feria de Navidad del Zocalo (diciembre), Feria de Coyoacan o Winter Wonderland en Perisur. Gratis entrar.', 'Cultural', 1, 'tranquilo'],
  [94, 'Hacer un voluntariado',             'Banco de Alimentos de Mexico, Calle Viva AC o Un Kilo de Ayuda. Registrense con semanas de anticipacion.', 'Exterior', 1, 'hibrido'],
  [95, 'Adoptar una mascota',               'Centro de Transferencia Canina CDMX o Albergue UTOPIA (Xochimilco). Adopcion gratuita. Preparen su espacio.', 'Interior', 1, 'hibrido'],
  // DEPORTES
  [96, 'Ir a una maraton de carreras',      'Maraton CDMX (octubre), 21K Nocturna o Maraton Telcel. Inscripcion $350-$600 MXN. En pareja es mas divertido.', 'Deportes', 2, 'extremo'],
  [97, 'Hacer un deporte nuevo juntos',     'Ultimate Frisbee (Liga CDMX, gratis), padel en Club Padel CDMX o lacrosse en Parque Lira. Primer mes gratis.', 'Deportes', 2, 'extremo'],
  [98, 'Pasear en moto acuatica',           'Lago de Tequesquitengo (Morelos, 1.5h), Xochimilco con panga o playas de Acapulco. $500-$800 MXN/30 min.', 'Deportes', 4, 'extremo'],
  [99, 'Montar en camellos',                'Parque Ecologico de Xochimilco o viaje a Desierto de San Luis Potosi. ~$200-$400 MXN.', 'Exterior', 3, 'extremo'],
  [100,'Ir a un parque de diversiones',     'Six Flags Mexico (Tlalpan): mas de 30 atracciones. La mas grande de America Latina. Entrada ~$800-$1,100 MXN.', 'Exterior', 4, 'extremo'],
];

// ── Auto-seed base citas on module load ────────────────────────────────────────
try {
  const count = db.prepare('SELECT COUNT(*) AS c FROM citas WHERE is_custom = 0').get();
  if (count.c === 0) {
    const stmt = db.prepare(
      'INSERT OR IGNORE INTO citas (id, title, description, category, budget, personality, is_custom) VALUES (?, ?, ?, ?, ?, ?, 0)'
    );
    db.transaction(() => {
      CITAS_SEED.forEach(([id, title, desc, cat, budget, personality]) =>
        stmt.run(id, title, desc, cat, budget, personality)
      );
    })();
    console.log('[citas] Seeded 100 base citas into DB');
  }
} catch (e) {
  console.warn('[citas] Seed skipped (table may not exist yet):', e.message);
}

// ── Optional auth helper (does NOT reject unauthenticated requests) ────────────
function optionalAuth(req) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(header.slice(7), process.env.JWT_SECRET)?.id ?? null;
  } catch { return null; }
}

// ── GET /api/citas — all citas (base + caller's custom) ───────────────────────
router.get('/', (req, res) => {
  const userId = optionalAuth(req);
  const rows = userId
    ? db.prepare('SELECT * FROM citas WHERE is_custom = 0 OR created_by = ? ORDER BY id').all(userId)
    : db.prepare('SELECT * FROM citas WHERE is_custom = 0 ORDER BY id').all();
  res.json(rows);
});

// ── GET /api/citas/completed — completed cita IDs for current user ─────────────
router.get('/completed', requireAuth, (req, res) => {
  const rows = db.prepare(
    'SELECT cita_id, lugar, sentimiento, romantica, divertida, fecha, photos, completed_at FROM cita_completions WHERE user_id = ? ORDER BY completed_at DESC'
  ).all(req.user.id);
  // Parse photos JSON
  res.json(rows.map(r => ({ ...r, photos: r.photos ? JSON.parse(r.photos) : [] })));
});

// ── GET /api/citas/random — random cita excluding already-completed ────────────
router.get('/random', (req, res) => {
  const userId = optionalAuth(req);
  const row = userId
    ? db.prepare(`
        SELECT * FROM citas
        WHERE is_custom = 0
          AND id NOT IN (SELECT cita_id FROM cita_completions WHERE user_id = ?)
        ORDER BY RANDOM() LIMIT 1
      `).get(userId)
    : db.prepare('SELECT * FROM citas WHERE is_custom = 0 ORDER BY RANDOM() LIMIT 1').get();
  res.json(row || null);
});

// ── GET /api/citas/:id — single cita by ID ────────────────────────────────────
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0)
    return res.status(400).json({ error: 'ID inválido' });
  const row = db.prepare('SELECT * FROM citas WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Cita no encontrada' });
  res.json(row);
});

// ── POST /api/citas — create a custom cita ────────────────────────────────────
router.post('/', requireAuth, (req, res) => {
  const { title, description, category, budget } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'title es obligatorio' });

  const result = db.prepare(
    'INSERT INTO citas (title, description, category, budget, is_custom, created_by) VALUES (?, ?, ?, ?, 1, ?)'
  ).run(title.trim(), description || null, category || null, budget ? Number(budget) : null, req.user.id);

  res.status(201).json(db.prepare('SELECT * FROM citas WHERE id = ?').get(result.lastInsertRowid));
});

// ── POST /api/citas/:id/complete — mark a cita completed (with review) ─────────
router.post('/:id/complete', requireAuth, (req, res) => {
  const citaId = Number(req.params.id);
  if (!Number.isInteger(citaId) || citaId <= 0)
    return res.status(400).json({ error: 'ID inválido' });

  const { lugar, sentimiento, romantica, divertida, fecha, photos } = req.body;

  // 1. Upsert cita completion
  db.prepare(`
    INSERT INTO cita_completions (user_id, cita_id, lugar, sentimiento, romantica, divertida, fecha, photos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, cita_id) DO UPDATE SET
      lugar        = excluded.lugar,
      sentimiento  = excluded.sentimiento,
      romantica    = excluded.romantica,
      divertida    = excluded.divertida,
      fecha        = excluded.fecha,
      photos       = excluded.photos,
      completed_at = datetime('now')
  `).run(
    req.user.id, citaId,
    lugar || null, sentimiento || null,
    romantica ? Number(romantica) : 0,
    divertida ? Number(divertida) : 0,
    fecha || null,
    photos ? JSON.stringify(photos) : null
  );

  // 2. Resolve cita title for auto-saved records
  const citaRow = db.prepare('SELECT title FROM citas WHERE id = ?').get(citaId);
  const citaTitle      = citaRow?.title || `Cita #${citaId}`;
  const completionDate = fecha || new Date().toISOString().split('T')[0];

  // 3. Auto-save to calendar_events (idempotent — skips if already exists)
  db.prepare(`
    INSERT INTO calendar_events (user_id, title, date, type, source_id, source_type)
    SELECT ?, ?, ?, 'date', ?, 'cita_completion'
    WHERE NOT EXISTS (
      SELECT 1 FROM calendar_events
      WHERE user_id = ? AND source_type = 'cita_completion' AND source_id = ?
    )
  `).run(req.user.id, citaTitle, completionDate, citaId, req.user.id, citaId);

  // 4. Auto-save to moments (idempotent — skips if already exists)
  const momentDesc = [
    sentimiento ? sentimiento : null,
    lugar       ? `En: ${lugar}` : null,
  ].filter(Boolean).join(' · ') || 'Cita completada';
  db.prepare(`
    INSERT INTO moments (user_id, title, description, date, image, favorite, source_id, source_type)
    SELECT ?, ?, ?, ?, ?, 0, ?, 'cita_completion'
    WHERE NOT EXISTS (
      SELECT 1 FROM moments
      WHERE user_id = ? AND source_type = 'cita_completion' AND source_id = ?
    )
  `).run(
    req.user.id, citaTitle, momentDesc, completionDate,
    '/images/recuerdos.png', citaId,
    req.user.id, citaId
  );

  res.status(201).json({ ok: true });
});

// ── DELETE /api/citas/completed/:id — undo completion ─────────────────────────
router.delete('/completed/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM cita_completions WHERE user_id = ? AND cita_id = ?')
    .run(req.user.id, Number(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
