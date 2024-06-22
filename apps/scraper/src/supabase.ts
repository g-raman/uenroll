import { createClient } from '@supabase/supabase-js';
import { configDotenv } from 'dotenv';
import { CourseDetails } from './utils/types';

configDotenv({ path: 'src/config.env' });

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function upsertCourseDetails(details: CourseDetails) {
  const { error: courseInsertError } = await supabase.from('courses').insert(details.courses);

  if (courseInsertError) {
    console.log(courseInsertError);
    console.log();
    return;
  }

  const { error: componentInsertError } = await supabase.from('courseComponents').insert(details.courseComponents);

  if (componentInsertError) {
    console.log(componentInsertError);
    console.log();
    return;
  }

  const { error: sessionInsertError } = await supabase.from('sessions').insert(details.sessions);
  if (sessionInsertError) {
    console.log(sessionInsertError);
    console.log();
    return;
  }
}

export default supabase;
