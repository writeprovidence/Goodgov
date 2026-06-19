
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  const { data: perfect, error: e1 } = await supabase.from('perfect_quizzes').select('*').limit(5);
  console.log('Perfect Quizzes Sample:', perfect);
  
  const { data: stages, error: e2 } = await supabase.from('completed_stages').select('*').limit(5);
  console.log('Completed Stages Sample:', stages);
  
  const { data: claimed, error: e3 } = await supabase.from('claimed_quizzes').select('*').limit(5);
  console.log('Claimed Quizzes Sample:', claimed);
}

checkData();
