const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_BASE = 'https://api.apify.com/v2';

async function apifyRun(actorId: string, input: Record<string, unknown>): Promise<Record<string, unknown>[]> {
  if (!APIFY_TOKEN) throw new Error('APIFY_TOKEN not set');
  const runRes = await fetch(`${APIFY_BASE}/acts/${encodeURIComponent(actorId)}/runs?token=${APIFY_TOKEN}&waitForFinish=90`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!runRes.ok) throw new Error(`Apify run failed: ${runRes.status} ${await runRes.text()}`);
  const run = (await runRes.json()) as { data: { id: string; status: string; defaultDatasetId: string } };
  if (run.data.status !== 'SUCCEEDED') {
    const detail = await fetch(`${APIFY_BASE}/actor-runs/${run.data.id}?token=${APIFY_TOKEN}`);
    const d = (await detail.json()) as { data?: { status: string; statusMessage?: string } };
    throw new Error(`Apify run ${run.data.status}: ${d.data?.statusMessage ?? 'unknown'}`);
  }
  const datasetId = run.data.defaultDatasetId;
  const itemsRes = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&clean=true&format=json`);
  if (!itemsRes.ok) throw new Error(`Apify dataset failed: ${itemsRes.status}`);
  return (await itemsRes.json()) as Record<string, unknown>[];
}

export async function scrapeLinkedIn(url: string): Promise<Record<string, unknown> | null> {
  const items = await apifyRun('harvestapi/linkedin-profile-scraper', {
    urls: [url],
    profileScraperMode: 'Profile details no email ($4 per 1k)',
  });
  return items[0] ?? null;
}

export async function scrapeInstagram(url: string, postLimit = 12): Promise<Record<string, unknown> | null> {
  const items = await apifyRun('apify/instagram-scraper', {
    directUrls: [url],
    resultsType: 'details',
    resultsLimit: postLimit,
  });
  return items[0] ?? null;
}
