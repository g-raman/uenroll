import { db } from "@repo/db";
import { availableTermsTable } from "@repo/db/schema";

export async function GET() {
  const data = await db
    .select({
      term: availableTermsTable.term,
      value: availableTermsTable.value,
    })
    .from(availableTermsTable);

  if (!data) {
    return Response.json({ error: "Something went wrong", data: null });
  }

  return Response.json({ error: null, data });
}
