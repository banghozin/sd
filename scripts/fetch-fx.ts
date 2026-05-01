import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ENDPOINT = "https://api.frankfurter.dev/v1/latest?from=USD&to=KRW";
const OUT_PATH = resolve("src/data/fx.json");

type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

async function main() {
  console.log(`[fx] fetching ${ENDPOINT}`);
  const r = await fetch(ENDPOINT, {
    headers: { Accept: "application/json" },
  });
  if (!r.ok) {
    throw new Error(`Frankfurter responded ${r.status}: ${await r.text()}`);
  }
  const data = (await r.json()) as FrankfurterResponse;
  const usdKrw = data.rates?.KRW;
  if (!Number.isFinite(usdKrw)) {
    throw new Error("Missing KRW rate in response");
  }

  const out = {
    pair: "USD/KRW",
    rate: usdKrw,
    asOf: data.date,
    fetchedAt: new Date().toISOString(),
    source: "Frankfurter (ECB)",
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`[fx] wrote ${OUT_PATH} · 1 USD = ${usdKrw.toFixed(2)} KRW (asOf ${data.date})`);
}

main().catch((err) => {
  console.error("[fx] failed:", err);
  process.exit(1);
});
