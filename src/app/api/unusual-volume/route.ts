import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { unstable_cache } from "next/cache";

const FILE_PATH = resolve(process.cwd(), "src/data/unusual-volume.json");

const getCachedSignals = unstable_cache(
  async () => {
    try {
      const raw = await readFile(FILE_PATH, "utf-8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  ["unusual-volume-json"],
  { revalidate: 60 },
);

export async function GET() {
  const data = await getCachedSignals();
  if (!data) {
    return Response.json({ error: "data unavailable" }, { status: 503 });
  }
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
