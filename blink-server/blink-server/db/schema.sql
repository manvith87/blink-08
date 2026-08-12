CREATE TABLE IF NOT EXISTS courses (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id  TEXT UNIQUE NOT NULL,      -- stable key used to dedupe, e.g. "coursera-12345" or "fcc-rwd"
  title        TEXT NOT NULL,
  platform     TEXT NOT NULL,             -- Coursera, Udemy, edX, freeCodeCamp, Khan Academy, MIT OCW, Other
  category     TEXT,                      -- Programming, Data Science, AI & ML, Business, Design, ...
  level        TEXT,                      -- Beginner, Intermediate, Advanced
  duration     TEXT,                      -- free-text, e.g. "~8 wks"
  access       TEXT,                      -- "Fully free", "Free to audit", "Free preview"
  blurb        TEXT,
  url          TEXT NOT NULL,
  source       TEXT NOT NULL DEFAULT 'curated', -- curated | manual | coursera | edx | udemy
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_external_id ON courses(external_id);
CREATE INDEX IF NOT EXISTS idx_courses_platform ON courses(platform);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  bio            TEXT,
  created_at     TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at     TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sync_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  source        TEXT NOT NULL,            -- coursera | edx | udemy
  status        TEXT NOT NULL,            -- success | error
  message       TEXT,
  items_synced  INTEGER DEFAULT 0,
  synced_at     TEXT DEFAULT CURRENT_TIMESTAMP
);
