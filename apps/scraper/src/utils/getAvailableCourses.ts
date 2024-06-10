import supabase from '../supabase';

const getAvailableCourses = async () => {
  console.log('Fetching available courses...');
  const res = await supabase.from('availableCourses').select('subject').order('subject', { ascending: true });
  if (res.error) {
    console.error('Error: Something went wrong when fetching list of available courses');
    console.log(res.error);
    console.log();
  }
  const courses = res?.data?.map((course) => course.subject) as string[];
  console.log('Available courses fetched\n');
  return courses;
};
export default getAvailableCourses;
