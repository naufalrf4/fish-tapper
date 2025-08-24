-- Fish Tapper Game - Supabase Database Setup
-- Run this SQL in your Supabase SQL editor

-- Create the scores table
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 24),
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "public can read scores" 
  ON public.scores 
  FOR SELECT 
  TO anon 
  USING (true);

-- Create policy for public insert access with validation
CREATE POLICY "public can insert scores" 
  ON public.scores 
  FOR INSERT 
  TO anon 
  WITH CHECK (
    score >= 0 AND 
    char_length(name) BETWEEN 1 AND 24
  );

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_scores_score_created 
  ON public.scores(score DESC, created_at DESC);

-- Optional: Insert some sample data for testing
-- Uncomment the lines below if you want sample data
/*
INSERT INTO public.scores (name, score) VALUES
  ('Alice', 15),
  ('Bob', 23),
  ('Charlie', 19),
  ('Diana', 31),
  ('Eve', 27),
  ('Frank', 12),
  ('Grace', 35),
  ('Henry', 20),
  ('Iris', 28),
  ('Jack', 18);
*/
