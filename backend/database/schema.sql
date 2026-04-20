-- LoversApp Database Schema
-- SQLite 3

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  email                  TEXT    NOT NULL UNIQUE,
  password_hash          TEXT    NOT NULL,
  name                   TEXT    NOT NULL,
  partner_name           TEXT,
  partner_code           TEXT    UNIQUE,           -- 6-char code shown in profile
  coupled_user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  relationship_start_date TEXT,                    -- ISO date
  boyfriend_date          TEXT,                    -- ISO date
  greeting_message       TEXT    DEFAULT 'Buenos días, mi amor',
  greeting_subtext       TEXT    DEFAULT 'Hoy les toca una cita especial ✦',
  personality_test       TEXT,                     -- JSON blob
  created_at             TEXT    NOT NULL DEFAULT (datetime('now')),
  last_login             TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- couple_dates  (the 100-date bucket list per user)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS couple_dates (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_item_id    INTEGER NOT NULL,                -- 1-100 from initialDates
  status          TEXT    NOT NULL DEFAULT 'pending', -- pending | completed | skipped
  scheduled_date  TEXT,                            -- ISO date
  location        TEXT,

  -- Partner 1 review (the account owner)
  p1_hearts       INTEGER DEFAULT 0,
  p1_stars        INTEGER DEFAULT 0,
  p1_review       TEXT,
  p1_one_word     TEXT,
  p1_best_part    TEXT,

  -- Partner 2 review
  p2_hearts       INTEGER DEFAULT 0,
  p2_stars        INTEGER DEFAULT 0,
  p2_review       TEXT,
  p2_one_word     TEXT,
  p2_best_part    TEXT,

  liked           INTEGER NOT NULL DEFAULT 0,      -- boolean
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),

  UNIQUE(user_id, date_item_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- cita_swipes  (citas aleatorias: like / dislike per user)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cita_swipes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cita_id    INTEGER NOT NULL,
  action     TEXT    NOT NULL CHECK(action IN ('like','dislike')),
  swiped_at  TEXT    NOT NULL DEFAULT (datetime('now')),

  UNIQUE(user_id, cita_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- cita_preferences  (citas personalizadas: like / dislike per user)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cita_preferences (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cita_id     INTEGER NOT NULL,
  preference  TEXT    NOT NULL CHECK(preference IN ('like','dislike')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),

  UNIQUE(user_id, cita_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- letters  (cartas digitales)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS letters (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_name  TEXT    NOT NULL DEFAULT 'Tú',
  title      TEXT    NOT NULL,
  content    TEXT    NOT NULL,
  favorite   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- moments  (momentos / fotos + recuerdos)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS moments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT,
  date        TEXT    NOT NULL,    -- ISO date YYYY-MM-DD
  image       TEXT,                -- URL or emoji
  favorite    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- challenges  (retos diarios)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL,
  type         TEXT    NOT NULL,   -- kiss | compliment | surprise | ...
  completed    INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,

  UNIQUE(user_id, challenge_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- calendar_events
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  date        TEXT    NOT NULL,    -- ISO date
  type        TEXT,                -- birthday | anniversary | date | custom ...
  color       TEXT,
  source_id   INTEGER,             -- id in origin table, if synced
  source_type TEXT,                -- 'moment' | 'important_date' | 'manual'
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- timeline_events
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT,
  date        TEXT    NOT NULL,    -- ISO date
  type        TEXT,
  source_id   INTEGER,
  source_type TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- important_dates  (fechas importantes: aniversarios, cumpleaños, etc.)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS important_dates (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  date        TEXT    NOT NULL,
  icon        TEXT,
  description TEXT,
  recurring   INTEGER NOT NULL DEFAULT 1,  -- repeat yearly
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- countdowns
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS countdowns (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  target_date TEXT    NOT NULL,
  description TEXT,
  icon        TEXT    DEFAULT '⏳',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- citas  (100 base date ideas + user-created custom citas)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citas (
  id          INTEGER PRIMARY KEY,          -- 1-100 reserved for base; >100 for custom
  title       TEXT    NOT NULL,
  description TEXT,
  category    TEXT,
  budget      INTEGER,                      -- 1=very_low … 5=very_high
  personality TEXT,                         -- tranquilo | hibrido | extremo
  is_custom   INTEGER NOT NULL DEFAULT 0,   -- 1 = user-created
  created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- cita_completions  (user marks a cita as completed, with optional review)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cita_completions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cita_id      INTEGER NOT NULL,
  lugar        TEXT,
  sentimiento  TEXT,
  romantica    INTEGER DEFAULT 0,
  divertida    INTEGER DEFAULT 0,
  fecha        TEXT,
  photos       TEXT,                        -- JSON array of image URLs
  completed_at TEXT    NOT NULL DEFAULT (datetime('now')),

  UNIQUE(user_id, cita_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- achievements  (static catalog — seeded once by the route module)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id          TEXT    PRIMARY KEY,  -- e.g. 'first_week', '10_citas'
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL,
  type        TEXT    NOT NULL,     -- days_together | citas | experiencia
  target      INTEGER NOT NULL,
  icon        TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- user_achievements  (unlocks — immutable once inserted)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT    NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at    TEXT    NOT NULL DEFAULT (datetime('now')),

  UNIQUE(user_id, achievement_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes for common lookups
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_couple_dates_user    ON couple_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_cita_swipes_user     ON cita_swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_cita_prefs_user      ON cita_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_user         ON letters(user_id);
CREATE INDEX IF NOT EXISTS idx_moments_user         ON moments(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user      ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user        ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_user        ON timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_user ON important_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_countdowns_user      ON countdowns(user_id);
CREATE INDEX IF NOT EXISTS idx_citas_personality    ON citas(personality);
CREATE INDEX IF NOT EXISTS idx_completions_user     ON cita_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- game_interactions  (memory system for games)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_interactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type   TEXT    NOT NULL CHECK(game_type IN ('question','truth','dare','dice')),
  content_id  TEXT    NOT NULL,   -- stable string key for the content item
  status      TEXT    NOT NULL DEFAULT 'seen'
              CHECK(status IN ('seen','answered','liked','skipped')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),

  UNIQUE(user_id, game_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_game_interactions_user ON game_interactions(user_id, game_type);
