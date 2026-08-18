import { getUnusualVolume } from "@/lib/remote-data";

export async function GET() {
  const data = await getUnusualVolume();
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
