CREATE TABLE IF NOT EXISTS users (
  nim TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  prodi TEXT NOT NULL,
  descriptor_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nim TEXT NOT NULL,
  nama TEXT NOT NULL,
  prodi TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  date_str TEXT NOT NULL,
  time_str TEXT NOT NULL,
  similarity REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attendances_timestamp ON attendances(timestamp);
CREATE INDEX IF NOT EXISTS idx_attendances_nim ON attendances(nim);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date_str);
