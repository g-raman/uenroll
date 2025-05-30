export const dynamic = "force-static";

import { db } from "@repo/db";
import { coursesTable } from "@repo/db/schema";

type Params = Promise<{ term: string }>;
export async function GET(req: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;

  if (!params.term) {
    return Response.json({
      error: "Specify the term before searching all courses",
      data: null,
    });
  }

  const res = await db
    .select({
      courseCode: coursesTable.courseCode,
      courseTitle: coursesTable.courseTitle,
    })
    .from(coursesTable)
    .limit(3500);

  if (!res) {
    return Response.json({ error: "No available courses", data: null });
  }

  return Response.json({ error: null, data: res });
}
