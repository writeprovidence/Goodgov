
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabase() {
  console.log('Checking Supabase connection...');
  
  // Try to list tables implicitly by querying one
  const { data, error } = await supabase
    .from('perfect_quizzes')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error connecting to Supabase or perfect_quizzes table:', error.message);
    if (error.message.includes('relation "perfect_quizzes" does not exist')) {
        console.log('TIP: It seems the table "perfect_quizzes" is missing. Please run the SQL in SUPABASE_SETUP.md');
    }
  } else {
    console.log('Supabase connection successful. perfect_quizzes table exists.');
  }

  const { data: stagesData, error: stagesError } = await supabase
    .from('completed_stages')
    .select('*', { count: 'exact', head: true });

  if (stagesError) {
    console.error('Error with completed_stages table:', stagesError.message);
  } else {
    console.log('completed_stages table exists.');
  }

  const { data: claimedData, error: claimedError } = await supabase
    .from('claimed_quizzes')
    .select('*', { count: 'exact', head: true });

  if (claimedError) {
    console.error('Error with claimed_quizzes table:', claimedError.message);
  } else {
    console.log('claimed_quizzes table exists.');
  }
}

checkSupabase();
