import { getCourse, processCourse } from "@repo/db/queries";

type Params = Promise<{ term: string; courseCode: string }>;
export async function GET(req: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;

  if (!params.term) {
    return Response.json({
      error: "Specify the term before searching for a course",
      data: null,
    });
  }

  if (!params.courseCode) {
    return Response.json({ error: "Specify a course", data: null });
  }

  const termParam = params.term.trim() as string;
  const courseCodeParam = params.courseCode
    .trim()
    .replaceAll(/ /g, "")
    .toUpperCase() as string;

  const containsNumber = (str: string): boolean => /\d/.test(str);
  const containsLetters = (str: string): boolean => /[a-zA-Z]/.test(str);

  if (!containsNumber(courseCodeParam) || !containsLetters(courseCodeParam)) {
    return Response.json({ error: "Not a valid course code", data: null });
  }

  const course = await getCourse(termParam, courseCodeParam);
  const result = processCourse(course);

  if (result.isErr()) {
    return Response.json({ error: result.error.message, data: null });
  }

  return Response.json({ error: null, data: result.value });
}
