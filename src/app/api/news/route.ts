import { unstable_cache } from "next/cache";
import { fetchAllNews } from "@/lib/news-fetcher";

const getCachedNews = unstable_cache(
  async () => {
    const items = await fetchAllNews();
    return { items, fetchedAt: new Date().toISOString() };
  },
  ["news-feed"],
  { revalidate: 60, tags: ["news"] },
);

export async function GET() {
  const data = await getCachedNews();
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
