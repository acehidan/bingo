/*
  # Create initial tables for Bingo Multiplayer

  1. New Tables
    - `game_rooms`
      - `id` (uuid, primary key)
      - `name` (text, game name)
      - `created_by` (uuid, creator's user ID)
      - `creator_name` (text, creator's name)
      - `status` (text, game status: waiting, playing, finished)
      - `player_count` (integer, number of players)
      - `created_at` (timestamp)
    - `player_games`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references game_rooms.id)
      - `user_id` (uuid, player's user ID)
      - `has_won` (boolean, whether player has won)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies for reading, creating, and updating game rooms
    - Policies for player game records
*/

-- Create game_rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  created_by uuid NOT NULL,
  creator_name text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  player_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create player_games table
CREATE TABLE IF NOT EXISTS player_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  has_won boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_games ENABLE ROW LEVEL SECURITY;

-- Game room policies
CREATE POLICY "Anyone can view game rooms"
  ON game_rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create game rooms"
  ON game_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Game creators can update their own game rooms"
  ON game_rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Player game policies
CREATE POLICY "Players can view their own games"
  ON player_games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view all player_games"
  ON player_games
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Players can create their own player records"
  ON player_games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can update their own records"
  ON player_games
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);