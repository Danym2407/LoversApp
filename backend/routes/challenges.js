const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// ── Challenge catalog ─────────────────────────────────────────────────────────
// id: stable integer (1–15). requiredDays / requiredCitas: minimums to unlock.
// unlockAfter: list of challenge ids that must be completed first.
const CATALOG = [
  // Básicos — always available
  { id:1,  title:'Beso Sorpresa',               description:'Dale un beso sorpresa en un momento inesperado',                        type:'kiss',       category:'basico',      icon:'💋', img:'/images/corazon.png',        requiredDays:0,  requiredCitas:0,  unlockAfter:[]     },
  { id:2,  title:'Cumplido del Día',             description:'Dale un cumplido sincero que lo/la haga sonreír de verdad',             type:'compliment', category:'basico',      icon:'💬', img:'/images/feliz.png',          requiredDays:0,  requiredCitas:0,  unlockAfter:[]     },
  { id:3,  title:'Abrazo de 30 Segundos',        description:'Abrázense sin soltarse durante 30 segundos completos',                 type:'hug',        category:'basico',      icon:'🤗', img:'/images/corazon.png',        requiredDays:0,  requiredCitas:0,  unlockAfter:[]     },
  { id:4,  title:'Mensaje de Buenos Días',       description:'Envíale el mensaje más especial de buenos días de su vida',            type:'morning',    category:'basico',      icon:'🌅', img:'/images/mensajes.png',       requiredDays:0,  requiredCitas:0,  unlockAfter:[]     },
  { id:5,  title:'Paseo de la Mano',             description:'Caminen tomados de la mano durante al menos 10 minutos',               type:'walk',       category:'basico',      icon:'🤝', img:'/images/2-corazoncitos.png', requiredDays:0,  requiredCitas:0,  unlockAfter:[]     },
  // Románticos — requieren progreso
  { id:6,  title:'Carta de Amor',                description:'Escríbele una carta a mano con todo lo que sientes por él/ella',       type:'letter',     category:'romantico',   icon:'💌', img:'/images/mensajes.png',       requiredDays:7,  requiredCitas:3,  unlockAfter:[1,2]  },
  { id:7,  title:'Recrear la Primera Cita',      description:'Vuelvan al lugar o recreen exactamente su primera cita juntos',        type:'memory',     category:'romantico',   icon:'🎞️', img:'/images/favoritos.png',      requiredDays:14, requiredCitas:5,  unlockAfter:[1]    },
  { id:8,  title:'Foto en la Próxima Cita',      description:'Tómense una foto juntos en su próxima cita y guárdenla',               type:'photo',      category:'romantico',   icon:'📸', img:'/images/momentos.png',       requiredDays:0,  requiredCitas:5,  unlockAfter:[3]    },
  { id:9,  title:'Cocinar Juntos',               description:'Preparen juntos una receta nueva que ninguno ha cocinado antes',       type:'cook',       category:'romantico',   icon:'🍳', img:'/images/retos.png',          requiredDays:7,  requiredCitas:3,  unlockAfter:[5]    },
  { id:10, title:'Sorpresa Sin Spoilers',         description:'Planea algo especial para tu pareja sin adelantar ni una pista',       type:'surprise',   category:'romantico',   icon:'🎁', img:'/images/sorpresa.png',       requiredDays:14, requiredCitas:5,  unlockAfter:[1,2,3]},
  // Experiencias — requieren progreso significativo
  { id:11, title:'Escapada de la Ciudad',         description:'Organicen una salida a un lugar que ninguno de los dos conoce bien',  type:'trip',       category:'experiencia', icon:'🚗', img:'/images/descubrir.png',      requiredDays:30, requiredCitas:10, unlockAfter:[7]    },
  { id:12, title:'Día Sin Celular',               description:'Pasen un día completo juntos sin revisar sus teléfonos',              type:'no_phone',   category:'experiencia', icon:'📵', img:'/images/retos.png',          requiredDays:14, requiredCitas:8,  unlockAfter:[9]    },
  { id:13, title:'Actividad Completamente Nueva', description:'Prueben algo que nunca hayan hecho juntos: senderismo, cerámica, baile…', type:'activity', category:'experiencia', icon:'🎭', img:'/images/descubrir.png',   requiredDays:21, requiredCitas:10, unlockAfter:[9,10] },
  { id:14, title:'Noche Solo Ustedes',            description:'Una noche especial para los dos, sin celulares ni interrupciones',    type:'night',      category:'experiencia', icon:'🌙', img:'/images/trofeo.png',         requiredDays:30, requiredCitas:8,  unlockAfter:[6,10] },
  { id:15, title:'Viaje Juntos',                  description:'Planeen y realicen un viaje real juntos, aunque sea de un solo día',  type:'travel',     category:'experiencia', icon:'✈️', img:'/images/descubrir.png',      requiredDays:60, requiredCitas:15, unlockAfter:[11]   },
];

// ── Dynamic challenge builder ─────────────────────────────────────────────────
function buildChallenges(userId) {
  // User context
  const user = db.prepare('SELECT relationship_start_date FROM users WHERE id = ?').get(userId);
  let daysTogether = 0;
  if (user && user.relationship_start_date) {
    const start = new Date(user.relationship_start_date);
    const now   = new Date();
    daysTogether = Math.max(0, Math.floor((now - start) / 86400000));
  }

  // Citas completed (couple_dates bucket list)
  const citasRow = db.prepare(
    `SELECT COUNT(*) AS cnt FROM couple_dates WHERE user_id = ? AND status = 'completed'`
  ).get(userId);
  const citasCompleted = citasRow ? citasRow.cnt : 0;

  // Which challenges this user has completed
  const doneRows = db.prepare(
    `SELECT challenge_id, completed_at FROM challenges WHERE user_id = ? AND completed = 1`
  ).all(userId);
  const completedMap = {};
  doneRows.forEach(r => { completedMap[r.challenge_id] = r.completed_at; });
  const completedIds = new Set(Object.keys(completedMap).map(Number));

  // Build result with lock logic
  const challenges = CATALOG.map(ch => {
    let locked = false;
    let lockReason = null;

    if (ch.requiredDays > daysTogether) {
      locked = true;
      lockReason = `Lleven ${ch.requiredDays} días juntos`;
    } else if (ch.requiredCitas > citasCompleted) {
      locked = true;
      lockReason = `Completen ${ch.requiredCitas} citas`;
    } else {
      const missing = ch.unlockAfter.filter(id => !completedIds.has(id));
      if (missing.length) {
        const titles = missing.map(id => {
          const c = CATALOG.find(x => x.id === id);
          return c ? `"${c.title}"` : `Reto ${id}`;
        });
        locked = true;
        lockReason = `Completa primero: ${titles.join(', ')}`;
      }
    }

    return {
      id:           ch.id,
      title:        ch.title,
      description:  ch.description,
      type:         ch.type,
      category:     ch.category,
      icon:         ch.icon,
      img:          ch.img,
      completed:    completedIds.has(ch.id),
      completed_at: completedMap[ch.id] || null,
      locked,
      lockReason,
    };
  });

  return { challenges, context: { daysTogether, citasCompleted } };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/challenges — dynamic list with completion + lock state
router.get('/', (req, res) => {
  try {
    res.json(buildChallenges(req.user.id));
  } catch (err) {
    console.error('[challenges] GET error:', err.message);
    res.status(500).json({ error: 'Error al cargar retos' });
  }
});

// POST /api/challenges/:challengeId/toggle — mark complete / incomplete
router.post('/:challengeId/toggle', (req, res) => {
  const challengeId = Number(req.params.challengeId);
  const catalogItem = CATALOG.find(c => c.id === challengeId);
  const type = catalogItem ? catalogItem.type : (req.body.type || 'custom');

  const existing = db.prepare(
    `SELECT * FROM challenges WHERE user_id = ? AND challenge_id = ?`
  ).get(req.user.id, challengeId);

  if (!existing) {
    db.prepare(`
      INSERT INTO challenges (user_id, challenge_id, type, completed, completed_at)
      VALUES (?, ?, ?, 1, datetime('now'))
    `).run(req.user.id, challengeId, type);
    return res.json({ completed: true });
  }

  const next = existing.completed ? 0 : 1;
  db.prepare(`
    UPDATE challenges
    SET completed = ?, completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END
    WHERE user_id = ? AND challenge_id = ?
  `).run(next, next, req.user.id, challengeId);

  res.json({ completed: !!next });
});

// GET /api/challenges/stats — kept for backward compat
router.get('/stats', (req, res) => {
  const row = db.prepare(`
    SELECT
      SUM(completed = 1) AS total_completed,
      SUM(type IN ('kiss','compliment','hug','morning','walk') AND completed = 1) AS basicos,
      SUM(type IN ('letter','memory','photo','cook','surprise') AND completed = 1) AS romanticos,
      SUM(type IN ('trip','no_phone','activity','night','travel') AND completed = 1) AS experiencias
    FROM challenges WHERE user_id = ?
  `).get(req.user.id);
  res.json(row);
});

module.exports = router;
