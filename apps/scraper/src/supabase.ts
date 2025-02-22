import { createClient } from "@supabase/supabase-js";
import "jsr:@std/dotenv/load";
import { CourseDetails, Subject, Term } from "./utils/types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_KEY") as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

const getAvailableTerms = async (): Promise<Term[]> => {
  console.log("Fetching available terms...");
  const res = await supabase
    .from("availableTerms")
    .select("term,value")
    .order("term", { ascending: true });
  if (res.error) {
    console.error(
      "Error: Something went wrong when fetching list of available terms",
    );
    console.log(res.error);
    console.log();
  }

  const terms = res.data as Term[];
  console.log("Available terms fetched\n");
  return terms;
};

export const getAvailableCourses = async () => {
  console.log("Fetching available courses...");
  const res = await supabase
    .from("availableCourses")
    .select("subject")
    .order("subject", { ascending: true });
  if (res.error) {
    console.error(
      "Error: Something went wrong when fetching list of available courses",
    );
    console.log(res.error);
    console.log();
  }
  const courses = res?.data?.map((course) => course.subject) as string[];
  console.log("Available courses fetched\n");
  return courses;
};

export const upsertCourseDetails = async (
  details: CourseDetails,
): Promise<void> => {
  const { error: courseInsertError } = await supabase
    .from("courses")
    .upsert(details.courses);

  if (courseInsertError) {
    console.log(courseInsertError);
    console.log();
    return;
  }

  const { error: componentInsertError } = await supabase
    .from("courseComponents")
    .upsert(details.courseComponents);

  if (componentInsertError) {
    console.log(componentInsertError);
    console.log();
    return;
  }

  const { error: sessionInsertError } = await supabase
    .from("sessions")
    .insert(details.sessions);
  if (sessionInsertError) {
    console.log(sessionInsertError);
    console.log();
    return;
  }
  for (let i = 0; i < details.courses.length; i++) {
    console.log(`Updated data for ${details.courses[i].courseCode}`);
  }
};

export const updateAvailableTerms = async (
  availableTerms: Term[],
): Promise<void> => {
  console.log("Inserting new available terms...");

  const { error } = await supabase
    .from("availableTerms")
    .upsert(availableTerms, { onConflict: "term" })
    .select();
  if (error) {
    console.error(
      "Error: Something went wrong when inserting new available terms data",
    );
    console.log(error);
    return;
  }
  console.log("Successfully inserted new available terms");
};

export const updateAvailableSubjects = async (
  availableCourses: Subject[],
): Promise<void> => {
  console.log("Inserting new available subjects...");
  const { error } = await supabase
    .from("availableCourses")
    .upsert(availableCourses, { onConflict: "subject" })
    .select();

  if (error) {
    console.error(
      "Error: Something went wrong when inserting new available subjects data",
    );
    console.log(error);
    return;
  }
  console.log("Successfully inserted new available subjects");
};

export default getAvailableTerms;
