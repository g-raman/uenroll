import { createClient } from 'jsr:@supabase/supabase-js';
import { CourseDetails } from './utils/types.ts';
import 'jsr:@std/dotenv/load';

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseKey = Deno.env.get('SUPABASE_KEY') as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function upsertCourseDetails(details: CourseDetails): Promise<void> {
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

  const { error: sessionInsertError } = await supabase.from('sessions').insert(details.sessions);
  if (sessionInsertError) {
    console.log(sessionInsertError);
    console.log();
    return;
  }
  for (let i = 0; i < details.courses.length; i++) {
    console.log(`Updated data for ${details.courses[i].courseCode}`);
  }
}

export default supabase;
