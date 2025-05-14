/*
  # Add single player support
  
  1. Changes
    - Add `is_single_player` column to game_rooms table
    - Update RLS policies to use correct auth function
  
  2. Security
    - Maintain existing RLS policies with correct auth function
    - Ensure proper access control for single player games
*/

-- Add is_single_player column to game_rooms
ALTER TABLE game_rooms 
ADD COLUMN is_single_player boolean DEFAULT false;

-- Update existing policies to handle single player games
DROP POLICY IF EXISTS "Anyone can view game rooms" ON game_rooms;
CREATE POLICY "Anyone can view game rooms"
ON game_rooms
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create game rooms" ON game_rooms;
CREATE POLICY "Authenticated users can create game rooms"
ON game_rooms
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Game creators can update their own game rooms" ON game_rooms;
CREATE POLICY "Game creators can update their own game rooms"
ON game_rooms
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);