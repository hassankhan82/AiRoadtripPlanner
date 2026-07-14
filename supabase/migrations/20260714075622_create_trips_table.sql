/*
# Create trips table (single-tenant, no auth)

1. New Tables
- `trips`
  - `id` (uuid, primary key)
  - `origin` (text, not null) — starting city name
  - `destination` (text, not null) — target city name
  - `selected_route_type` (text, not null) — which route variant was chosen: 'closest' | 'scenic' | 'least_traffic' | 'ai_best'
  - `route_summary` (jsonb, not null) — serialized route details (path, distance, duration, highlights)
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `trips`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no-auth app).
*/

CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin text NOT NULL,
  destination text NOT NULL,
  selected_route_type text NOT NULL CHECK (selected_route_type IN ('closest','scenic','least_traffic','ai_best')),
  route_summary jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_trips" ON trips;
CREATE POLICY "anon_select_trips" ON trips FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_trips" ON trips;
CREATE POLICY "anon_insert_trips" ON trips FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_trips" ON trips;
CREATE POLICY "anon_update_trips" ON trips FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_trips" ON trips;
CREATE POLICY "anon_delete_trips" ON trips FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips (created_at DESC);
