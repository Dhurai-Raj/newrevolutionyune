CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user', -- 'user', 'admin'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'free', -- 'free', 'active', 'past_due', 'canceled'
  current_period_end INTEGER, -- Unix epoch timestamp
  free_downloads_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL, -- original high quality audio path in R2
  preview_url TEXT NOT NULL, -- compressed/watermarked audio path in R2
  thumbnail_url TEXT NOT NULL, -- image path in R2
  duration INTEGER NOT NULL, -- duration in seconds
  genre TEXT NOT NULL,
  mood TEXT NOT NULL,
  instrument TEXT,
  bpm INTEGER NOT NULL,
  vocals TEXT DEFAULT 'Instrumental', -- 'Vocals', 'Instrumental', etc.
  language TEXT DEFAULT 'English',
  tags TEXT NOT NULL, -- comma separated values
  is_free INTEGER DEFAULT 1, -- 1 = free, 0 = premium
  is_featured INTEGER DEFAULT 0,
  is_trending INTEGER DEFAULT 0,
  waveform_data TEXT NOT NULL, -- serialized JSON array of numbers
  downloads_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS downloads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  license_id TEXT UNIQUE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(track_id) REFERENCES tracks(id)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  PRIMARY KEY (user_id, track_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(track_id) REFERENCES tracks(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Seed an admin user (password is 'admin123' hashed with bcrypt or dummy for local testing)
-- We will use standard JWT and bcrypt-js on backend
INSERT OR IGNORE INTO users (id, email, password_hash, role)
VALUES ('admin-uuid-0000-0000-000000000000', 'admin@royaltune.com', '$2a$10$Q7YmI1C2a8m3uWJ3/z8V.eC5Mlh7O6v.5uD.s88ZqK6l.Zqg2aOyy', 'admin');
