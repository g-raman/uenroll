import { createClient } from '@supabase/supabase-js';
import { configDotenv } from 'dotenv';

configDotenv({ path: 'src/config.env' });

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
