import { supabase, isSupabaseConfigured } from './supabase';

// Insert a new score into the database
export async function insertScore(name, score) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - score not saved');
    return { error: 'Database not configured. Score saved locally only.' };
  }

  try {
    const { data, error } = await supabase
      .from('scores')
      .insert([{ name, score }])
      .select();

    if (error) {
      console.error('Failed to insert score:', error);
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    console.error('Network error inserting score:', err);
    return { error: 'Network error. Please check your connection.' };
  }
}

// Fetch all scores from the database
export async function fetchTopScores() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - returning empty leaderboard');
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('scores')
      .select('name, score, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch scores:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (err) {
    console.error('Network error fetching scores:', err);
    return { data: [], error: 'Network error. Please check your connection.' };
  }
}
