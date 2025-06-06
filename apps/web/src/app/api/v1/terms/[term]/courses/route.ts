export const dynamic = "force-static";

import { getAvailableCoursesByTerm } from "@repo/db/queries";

type Params = Promise<{ term: string }>;
export async function GET(req: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;

  if (!params.term) {
    return Response.json({
      error: "Specify the term before searching all courses",
      data: null,
    });
  }

  const courses = await getAvailableCoursesByTerm(params.term);

  if (!courses) {
    return Response.json({ error: "No available courses", data: null });
  }

  return Response.json({ error: null, data: courses });
}
