const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/challenges — all challenges with completion status for current user
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT challenge_id, type, completed, completed_at
    FROM challenges WHERE user_id = ?
  `).all(req.user.id);
  res.json(rows);
});

// POST /api/challenges/:challengeId/toggle — mark complete / incomplete
router.post('/:challengeId/toggle', (req, res) => {
  const { type } = req.body;
  const challengeId = Number(req.params.challengeId);

  const existing = db.prepare(`
    SELECT * FROM challenges WHERE user_id = ? AND challenge_id = ?
  `).get(req.user.id, challengeId);

  if (!existing) {
    // Insert as completed
    db.prepare(`
      INSERT INTO challenges (user_id, challenge_id, type, completed, completed_at)
      VALUES (?, ?, ?, 1, datetime('now'))
    `).run(req.user.id, challengeId, type || 'custom');
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

// GET /api/challenges/stats
router.get('/stats', (req, res) => {
  const row = db.prepare(`
    SELECT
      SUM(type = 'kiss'       AND completed = 1) AS kisses,
      SUM(type = 'compliment' AND completed = 1) AS compliments,
      SUM(type = 'surprise'   AND completed = 1) AS surprises,
      SUM(completed = 1) AS total_completed
    FROM challenges WHERE user_id = ?
  `).get(req.user.id);
  res.json(row);
});

module.exports = router;
