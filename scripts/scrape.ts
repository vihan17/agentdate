/* Scrape candidate LinkedIn+Instagram, keep those with both sources. Run: node --experimental-strip-types scripts/scrape.ts */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { CANDIDATES } from '../src/lib/candidates';
import { scrapeLinkedIn, scrapeInstagram } from '../src/lib/apify';

const RAW_DIR = 'data/raw';
mkdirSync(RAW_DIR, { recursive: true });

async function one(c: (typeof CANDIDATES)[number]) {
  const safe = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const outPath = `${RAW_DIR}/${safe}.json`;
  if (existsSync(outPath)) {
    const prev = JSON.parse(readFileSync(outPath, 'utf8'));
    if (prev.linkedin && prev.instagram && !prev.instagram.private) return { name: c.name, ok: true, cached: true };
  }
  let li: Record<string, unknown> | null = null;
  let ig: Record<string, unknown> | null = null;
  try {
    li = await scrapeLinkedIn(c.linkedin);
  } catch (e) {
    console.error(`LI fail ${c.name}:`, e instanceof Error ? e.message : e);
  }
  try {
    ig = await scrapeInstagram(c.instagram);
  } catch (e) {
    console.error(`IG fail ${c.name}:`, e instanceof Error ? e.message : e);
  }
  const rec = {
    name: c.name,
    slug: safe,
    linkedinUrl: c.linkedin,
    instagramUrl: c.instagram,
    linkedin: li,
    instagram: ig,
  };
  writeFileSync(outPath, JSON.stringify(rec, null, 2));
  const ok = !!li && !!ig && !(ig as { private?: boolean }).private;
  console.log(`${ok ? 'OK  ' : 'SKIP'} ${c.name} li=${!!li} ig=${!!ig}${(ig as { private?: boolean })?.private ? ' (private)' : ''}`);
  return { name: c.name, ok, cached: false };
}

async function main() {
  const limit = Number(process.argv[2] ?? CANDIDATES.length);
  const slice = CANDIDATES.slice(0, limit);
  const results: Array<{ name: string; ok: boolean }> = [];
  const CONCURRENCY = 4;
  for (let i = 0; i < slice.length; i += CONCURRENCY) {
    const batch = slice.slice(i, i + CONCURRENCY);
    const r = await Promise.all(batch.map(one));
    results.push(...r);
  }
  const okCount = results.filter((r) => r.ok).length;
  console.log(`\nDONE: ${okCount}/${results.length} usable`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
