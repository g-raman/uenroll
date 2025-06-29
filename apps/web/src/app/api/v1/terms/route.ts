import { getAvailableTerms } from "@repo/db/queries";

export async function GET() {
  try {
    const data = await getAvailableTerms();
    return Response.json({ error: null, data });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong", data: null });
  }
}
