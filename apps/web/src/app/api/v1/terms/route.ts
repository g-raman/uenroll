import { getAvailableTerms } from "@repo/db/queries";

export async function GET() {
  const data = await getAvailableTerms();

  if (data.isErr()) {
    console.error(data.error);
    return Response.json({ error: "Something went wrong", data: null });
  }

  return Response.json({ error: null, data: data.value });
}
