const express  = require('express');
const router   = express.Router();
const db       = require('../database/db');
const requireAuth = require('../middleware/auth');

// Ensure table exists (idempotent — schema.sql handles it, but belt+suspenders)
db.exec(`
  CREATE TABLE IF NOT EXISTS game_interactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_type   TEXT    NOT NULL CHECK(game_type IN ('question','truth','dare','dice')),
    content_id  TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'seen'
                CHECK(status IN ('seen','answered','liked','skipped')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, game_type, content_id)
  );
  CREATE INDEX IF NOT EXISTS idx_game_interactions_user ON game_interactions(user_id, game_type);
`);

// ── GET /api/games/interactions?game_type=question ────────────────────────────
// Returns all interactions for the current user (optionally filtered by game_type)
router.get('/interactions', requireAuth, (req, res) => {
  const { game_type } = req.query;
  let rows;
  if (game_type) {
    rows = db.prepare(
      'SELECT * FROM game_interactions WHERE user_id = ? AND game_type = ? ORDER BY updated_at DESC'
    ).all(req.user.id, game_type);
  } else {
    rows = db.prepare(
      'SELECT * FROM game_interactions WHERE user_id = ? ORDER BY updated_at DESC'
    ).all(req.user.id);
  }
  res.json(rows);
});

// ── POST /api/games/interactions ─────────────────────────────────────────────
// Upsert a single interaction (seen / answered / liked / skipped)
router.post('/interactions', requireAuth, (req, res) => {
  const { game_type, content_id, status } = req.body;

  if (!game_type || !content_id || !status) {
    return res.status(400).json({ error: 'game_type, content_id y status son requeridos' });
  }

  const VALID_TYPES   = ['question','truth','dare','dice'];
  const VALID_STATUS  = ['seen','answered','liked','skipped'];

  if (!VALID_TYPES.includes(game_type))   return res.status(400).json({ error: 'game_type inválido' });
  if (!VALID_STATUS.includes(status))     return res.status(400).json({ error: 'status inválido' });

  db.prepare(`
    INSERT INTO game_interactions (user_id, game_type, content_id, status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, game_type, content_id)
    DO UPDATE SET status = excluded.status, updated_at = datetime('now')
  `).run(req.user.id, game_type, content_id, status);

  const row = db.prepare(
    'SELECT * FROM game_interactions WHERE user_id = ? AND game_type = ? AND content_id = ?'
  ).get(req.user.id, game_type, content_id);

  res.json(row);
});

// ── DELETE /api/games/interactions?game_type=question ────────────────────────
// Reset interactions for a given game_type (or all if omitted)
router.delete('/interactions', requireAuth, (req, res) => {
  const { game_type } = req.query;
  if (game_type) {
    db.prepare('DELETE FROM game_interactions WHERE user_id = ? AND game_type = ?')
      .run(req.user.id, game_type);
  } else {
    db.prepare('DELETE FROM game_interactions WHERE user_id = ?').run(req.user.id);
  }
  res.json({ ok: true });
});

// ── GET /api/games/memories ───────────────────────────────────────────────────
// Returns a summary for the "Memorias" game tab:
// - completed couple_dates (up to 10 most recent)
// - moments (up to 5 most recent)
// - user_achievements (all unlocked)
router.get('/memories', requireAuth, (req, res) => {
  const userId = req.user.id;

  const completedDates = db.prepare(`
    SELECT cd.date_item_id, cd.updated_at, cd.p1_review, cd.scheduled_date, cd.location
    FROM couple_dates cd
    WHERE cd.user_id = ? AND cd.status = 'completed'
    ORDER BY cd.updated_at DESC
    LIMIT 10
  `).all(userId);

  const moments = db.prepare(`
    SELECT id, title, description, date, image, favorite
    FROM moments
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT 5
  `).all(userId);

  const achievements = db.prepare(`
    SELECT ua.achievement_id, ua.unlocked_at, a.title, a.icon, a.description
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = ?
    ORDER BY ua.unlocked_at DESC
  `).all(userId);

  res.json({ completedDates, moments, achievements });
});

module.exports = router;
