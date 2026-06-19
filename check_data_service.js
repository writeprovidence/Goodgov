
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  const { data: perfect, error: e1 } = await supabase.from('perfect_quizzes').select('*').limit(5);
  console.log('Perfect Quizzes (as Service Role):', perfect);
  
  const { data: stages, error: e2 } = await supabase.from('completed_stages').select('*').limit(5);
  console.log('Completed Stages (as Service Role):', stages);
  
  const { data: claimed, error: e3 } = await supabase.from('claimed_quizzes').select('*').limit(5);
  console.log('Claimed Quizzes (as Service Role):', claimed);
}

checkData();
