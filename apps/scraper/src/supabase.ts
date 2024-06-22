import { createClient } from '@supabase/supabase-js';
import { configDotenv } from 'dotenv';
import { CourseDetails } from './utils/types';

configDotenv({ path: 'src/config.env' });

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function upsertCourseDetails(details: CourseDetails) {
  const { error: courseInsertError } = await supabase.from('courses').upsert(details.courses);

  if (courseInsertError) {
    console.log(courseInsertError);
    console.log();
    return;
  }

  const { error: componentInsertError } = await supabase.from('courseComponents').upsert(details.courseComponents);

  if (componentInsertError) {
    console.log(componentInsertError);
    console.log();
    return;
  }

  const { error: sessionInsertError } = await supabase.from('sessions').upsert(details.sessions);
  if (sessionInsertError) {
    console.log(sessionInsertError);
    console.log();
    return;
  }
}

export async function markAllAsDeleted(term: string): Promise<void> {
  const { data, error } = await supabase.from('courses').update({ isDeleted: true }).eq('term', term);
  console.log(data);
  console.log(error);
  await supabase.from('courseComponents').update({ isDeleted: true }).eq('term', term);
  await supabase.from('sessions').update({ isDeleted: true }).eq('term', term);
}

export default supabase;
