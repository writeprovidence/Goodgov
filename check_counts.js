
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCounts() {
  const { count: perfect } = await supabase.from('perfect_quizzes').select('*', { count: 'exact', head: true });
  const { count: stages } = await supabase.from('completed_stages').select('*', { count: 'exact', head: true });
  const { count: claimed } = await supabase.from('claimed_quizzes').select('*', { count: 'exact', head: true });
  
  console.log('--- Database Counts ---');
  console.log('Perfect Quizzes:', perfect);
  console.log('Completed Stages:', stages);
  console.log('Claimed Quizzes:', claimed);
  
  if (perfect > 0) {
    const { data } = await supabase.from('perfect_quizzes').select('*').limit(5);
    console.log('Sample Perfect Quiz:', data[0]);
  }
}

checkCounts();
