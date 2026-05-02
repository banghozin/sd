import Parser from "rss-parser";

export type NewsCategory = "politics" | "economy" | "crypto";

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string; // ISO timestamp
  category: NewsCategory;
};

const FEED_SLOTS: Record<NewsCategory, string[]> = {
  politics: [
    "https://rss.cnn.com/rss/cnn_allpolitics.rss",
    "https://www.politico.com/rss/politics-news.xml",
    "https://feeds.foxnews.com/foxnews/politics",
    "https://www.theguardian.com/us-news/rss",
  ],
  economy: [
    "https://feeds.marketwatch.com/marketwatch/topstories",
    "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    "https://www.cnbc.com/id/15839135/device/rss/rss.html",
  ],
  crypto: [
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "https://cointelegraph.com/rss",
    "https://decrypt.co/feed",
  ],
};

const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; StocksNet/1.0; +https://stocksnet.vercel.app)",
    Accept: "application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
  },
  timeout: 8000,
});

async function fetchFeed(
  url: string,
  category: NewsCategory,
): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    if (!feed?.items?.length) return [];
    const source = feed.title || new URL(url).hostname;
    return feed.items
      .map((it): NewsItem | null => {
        const title = (it.title ?? "").trim();
        let link = it.link ?? "";
        try {
          if (link && !/^https?:/i.test(link)) link = new URL(link, url).href;
        } catch {
          /* ignore */
        }
        if (!title || !link) return null;
        const pubRaw = it.pubDate ?? it.isoDate;
        const pubDate = pubRaw ? new Date(pubRaw).toISOString() : null;
        if (!pubDate) return null;
        return {
          id: (it.guid ?? it.id ?? link).toString(),
          title,
          link,
          source,
          pubDate,
          category,
        };
      })
      .filter((x): x is NewsItem => x !== null);
  } catch {
    return [];
  }
}

function dedupAndSort(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const it of items) {
    const key = (it.title + "|" + it.link).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  out.sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));
  return out;
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const tasks: Array<Promise<NewsItem[]>> = [];
  for (const [cat, urls] of Object.entries(FEED_SLOTS) as Array<
    [NewsCategory, string[]]
  >) {
    for (const url of urls) tasks.push(fetchFeed(url, cat));
  }
  const results = await Promise.all(tasks);
  return dedupAndSort(results.flat()).slice(0, 300);
}
