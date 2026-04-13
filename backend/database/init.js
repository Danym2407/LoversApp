/**
 * Seed script — populates your own user with the 100 default couple dates.
 * Run once:  node database/init.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db     = require('./db');
const bcrypt = require('bcryptjs');

// ── 100 default date names (same order as dates.js) ──────────────────────────
const DATE_NAMES = [
  'Ir al zoológico','Ir a una sala de juegos','Viajar fuera del país','Ir al Gym',
  'Ir a un hipódromo','Ir a un escaperoom','Noche de pizza','Hacer un álbum de nosotros',
  'Ir al teatro','Pintar cuadros','Noche de Netflix','Ir al bowling','Ir a un concierto',
  'Ir al cine prime','Noche de hamburguesas','Ir a los karts','Patinar sobre hielo',
  'Hacer un picnic','Ir a una cafetería bonita','Quedarnos en una cabaña',
  'Aprender a conducir','Paseo en bicicletas','Ir al estadio','Acampar','Ir a un mirador',
  'Ir a la playa','Hacer una fogata','Ir a una heladería','Jugar paintball',
  'Ir a un planetario','Ir al circo','Ir a un casino','Aprender a cocinar juntos',
  'Ir a los juegos extremos','Hacer una pijamada','Cultivar una planta','Ir a un museo',
  'Hacer trekking','Ir a una granja','Hacer paddle','Disfrazarse en Halloween',
  'Pasear con mascotas','Ir a los baños termales','Bucear',
  'Subirse a un globo aerostático','Ir a un rooftop','Ir a ver ballet','Hacer un voluntariado',
  'Ir de shopping','Adoptar una mascota','Ir a un autocine','Hacer parapente',
  'Hacer un deporte nuevo juntos','Ir a desayunar en un lugar bonito','Volar en helicóptero',
  'Colorear un libro','Aprender a tocar un instrumento','Salir vestidos iguales',
  'Armar un lego','Ir a una feria','Ver un amanecer juntos','Ver una puesta de sol',
  'Hacer una obra de teatro en casa','Ir a jugar Laser Tag','Ir a una galería de arte',
  'Hacer cerámica','Clase de baile','Visitar la ciudad natal','Road trip','Montar a caballo',
  'Ir a un parque de aventuras','Tirolesa','Canopy','Rafting','Surf','Kitesurf',
  'Noche de spa en casa','Cocinar de otro país','Maratón de películas de terror',
  'Karaoke','Escape room virtual','Torneo de videojuegos','Noche de casino en casa',
  'Sesión de fotos juntos','Telescopio y estrellas','Visitar un acuario','Senderismo al amanecer',
  'Taller de sushi','Clase de origami','Noche de cartas','Puzzle gigante',
  'Coleccionar algo juntos','Día de parque acuático','Tarde de trivia en bar',
  'Crear un libro de recetas','Noche de magia en casa','Diseñar algo juntos',
  'Escribir cartas para el futuro','Alta cocina en casa','Maratón de Disney',
  'Conocer un pueblo mágico','Crear una tradición nueva',
];

// ── Optional: create a demo user ─────────────────────────────────────────────
function seedDemoUser() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@loversapp.com');
  if (existing) {
    console.log('Demo user already exists — skipping.');
    return existing.id;
  }

  const hash = bcrypt.hashSync('Demo1234!', 12);
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, partner_name, partner_code)
    VALUES (?, ?, ?, ?, ?)
  `).run('demo@loversapp.com', hash, 'Daniela', 'Eduardo', 'DEMO01');

  console.log(`Demo user created — id: ${result.lastInsertRowid}`);
  return result.lastInsertRowid;
}

// ── Seed couple_dates for a user ─────────────────────────────────────────────
function seedCoupleDates(userId) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO couple_dates (user_id, date_item_id)
    VALUES (?, ?)
  `);

  const seedAll = db.transaction((uid) => {
    DATE_NAMES.forEach((_name, i) => insert.run(uid, i + 1));
  });

  seedAll(userId);
  console.log(`Seeded 100 couple_dates for user ${userId}.`);
}

// ── Run ───────────────────────────────────────────────────────────────────────
const userId = seedDemoUser();
seedCoupleDates(userId);
console.log('Database initialised ✓');
