-- ============================================================
-- Love Travel Globe — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. user_places
CREATE TABLE IF NOT EXISTS user_places (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_type       TEXT NOT NULL CHECK (place_type IN ('country','city','landmark')),
  country_id       TEXT NOT NULL,
  city_id          TEXT,
  landmark_id      TEXT,

  -- Generated column to reliably identify unique places regardless of NULLs.
  -- country   → "country:CN"
  -- city      → "city:CN:CN-beijing"
  -- landmark  → "landmark:CN:CN-beijing:cn-tiananmen"
  place_key TEXT GENERATED ALWAYS AS (
    CASE place_type
      WHEN 'country'  THEN 'country:'  || country_id
      WHEN 'city'     THEN 'city:'     || country_id || ':' || COALESCE(city_id, '')
      WHEN 'landmark' THEN 'landmark:' || country_id || ':' || COALESCE(city_id, '') || ':' || COALESCE(landmark_id, '')
    END
  ) STORED,

  -- Geocoding source fields — NULL for local (city/country/landmark) places
  place_source     TEXT DEFAULT 'local',   -- 'local' | 'geocoding_api'
  display_name     TEXT,                   -- canonical display name (any language)
  name_en          TEXT,                   -- English name
  country_name     TEXT,                   -- human-readable country name
  lat              DOUBLE PRECISION,       -- latitude from geocoding API
  lng              DOUBLE PRECISION,       -- longitude from geocoding API

  visited          BOOLEAN DEFAULT FALSE,
  first_visit_date DATE,
  last_visit_date  DATE,
  notes            TEXT,
  cover_photo_id   UUID,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, place_key)
);

-- 3. visit_records
CREATE TABLE IF NOT EXISTS visit_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_id   TEXT NOT NULL,
  city_id      TEXT,
  landmark_id  TEXT,
  start_date   DATE NOT NULL,
  end_date     DATE,
  start_time   TIME,
  end_time     TIME,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. photos
CREATE TABLE IF NOT EXISTS photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url     TEXT NOT NULL,
  file_path    TEXT NOT NULL,
  file_name    TEXT NOT NULL,
  title        TEXT,
  country_id   TEXT NOT NULL,
  city_id      TEXT,
  landmark_id  TEXT,
  taken_date   DATE NOT NULL,
  taken_time   TIME,
  uploaded_at  TIMESTAMPTZ DEFAULT NOW(),
  notes        TEXT,
  tags         TEXT[] DEFAULT '{}',
  visibility   TEXT DEFAULT 'private' CHECK (visibility IN ('private','shared','public')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 5. albums
CREATE TABLE IF NOT EXISTS albums (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_type     TEXT NOT NULL CHECK (album_type IN ('country','city','landmark','custom')),
  country_id     TEXT,
  city_id        TEXT,
  landmark_id    TEXT,
  title          TEXT NOT NULL,
  description    TEXT,
  cover_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 6. user_settings
CREATE TABLE IF NOT EXISTS user_settings (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_rotate           BOOLEAN DEFAULT TRUE,
  music_enabled         BOOLEAN DEFAULT FALSE,
  sound_effects_enabled BOOLEAN DEFAULT TRUE,
  music_volume          FLOAT DEFAULT 0.5,
  sfx_volume            FLOAT DEFAULT 0.7,
  preferred_language    TEXT DEFAULT 'zh',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_places   ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ── profiles ─────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ── user_places ───────────────────────────────────────────────
CREATE POLICY "user_places_select_own" ON user_places
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_places_insert_own" ON user_places
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_places_update_own" ON user_places
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_places_delete_own" ON user_places
  FOR DELETE USING (auth.uid() = user_id);

-- ── visit_records ─────────────────────────────────────────────
CREATE POLICY "visit_records_select_own" ON visit_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "visit_records_insert_own" ON visit_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "visit_records_update_own" ON visit_records
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "visit_records_delete_own" ON visit_records
  FOR DELETE USING (auth.uid() = user_id);

-- ── photos ────────────────────────────────────────────────────
CREATE POLICY "photos_select_own" ON photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "photos_insert_own" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "photos_update_own" ON photos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "photos_delete_own" ON photos
  FOR DELETE USING (auth.uid() = user_id);

-- ── albums ────────────────────────────────────────────────────
CREATE POLICY "albums_select_own" ON albums
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "albums_insert_own" ON albums
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "albums_update_own" ON albums
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "albums_delete_own" ON albums
  FOR DELETE USING (auth.uid() = user_id);

-- ── user_settings ─────────────────────────────────────────────
CREATE POLICY "user_settings_select_own" ON user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_settings_insert_own" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_settings_update_own" ON user_settings
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "user_settings_delete_own" ON user_settings
  FOR DELETE USING (auth.uid() = id);


-- ============================================================
-- Migration M001 — add geocoding fields to user_places
-- Run this block in the Supabase SQL Editor on any existing
-- installation that was created before these columns existed.
-- IF NOT EXISTS makes it safe to re-run.
-- ============================================================
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS place_source TEXT DEFAULT 'local';
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS name_en      TEXT;
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS country_name TEXT;
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS lat          DOUBLE PRECISION;
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS lng          DOUBLE PRECISION;
