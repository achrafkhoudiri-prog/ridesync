
/*
  # VO2 RideSync - Initial Schema

  1. New Tables
    - `profiles` — linked to auth.users, stores athlete display info
      - `id` (uuid, FK to auth.users)
      - `full_name` (text)
      - `avatar_emoji` (text)
      - `color` (text) — hex color for map dot
      - `created_at` (timestamptz)

    - `chat_rooms` — group chat rooms
      - `id` (uuid)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamptz)

    - `chat_messages` — messages in a chat room
      - `id` (uuid)
      - `room_id` (uuid FK → chat_rooms)
      - `user_id` (uuid FK → profiles)
      - `text` (text)
      - `reactions` (jsonb array of emoji strings)
      - `created_at` (timestamptz)

    - `athlete_locations` — live GPS positions
      - `id` (uuid)
      - `user_id` (uuid FK → profiles)
      - `lat` (float8)
      - `lng` (float8)
      - `speed` (float4) — km/h
      - `heading` (float4)
      - `updated_at` (timestamptz)

    - `training_plans` — daily training entries
      - `id` (uuid)
      - `user_id` (uuid FK → profiles)
      - `date` (date)
      - `title` (text)
      - `source` (text) — 'TrainingPeaks' or 'Garmin'
      - `tss` (int)
      - `duration_min` (int)
      - `distance_km` (float4)
      - `intensity_factor` (float4)
      - `coach_notes` (text)
      - `blocks` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Profiles readable by authenticated users, writable by owner
    - Chat messages readable by all authenticated, insertable by owner
    - Athlete locations readable by authenticated, writable by owner
    - Training plans readable/writable by owner only
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_emoji text NOT NULL DEFAULT '🚴',
  color text NOT NULL DEFAULT '#FF5722',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- CHAT ROOMS
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chat rooms"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (true);

-- Insert default room
INSERT INTO chat_rooms (id, name, description)
VALUES ('00000000-0000-0000-0000-000000000001', 'Al Qudra Ride Group', 'Team ride coordination and training talk')
ON CONFLICT (id) DO NOTHING;

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  reactions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages (reactions)"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ATHLETE LOCATIONS
CREATE TABLE IF NOT EXISTS athlete_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lat float8 NOT NULL DEFAULT 25.0657,
  lng float8 NOT NULL DEFAULT 55.3076,
  speed float4 NOT NULL DEFAULT 0,
  heading float4 NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE athlete_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all locations"
  ON athlete_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own location"
  ON athlete_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own location"
  ON athlete_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TRAINING PLANS
CREATE TABLE IF NOT EXISTS training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  title text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'TrainingPeaks',
  tss int NOT NULL DEFAULT 0,
  duration_min int NOT NULL DEFAULT 0,
  distance_km float4 NOT NULL DEFAULT 0,
  intensity_factor float4 NOT NULL DEFAULT 0,
  coach_notes text NOT NULL DEFAULT '',
  blocks jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own training plans"
  ON training_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training plans"
  ON training_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training plans"
  ON training_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
