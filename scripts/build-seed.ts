/* Build seed data: analyze every scraped person with Gemini, write data/seed/people.json */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { analyzePerson } from '../src/lib/analysis';

const RAW = 'data/raw';
const OUT = 'data/seed/people.json';
mkdirSync('data/seed', { recursive: true });

interface RawFile {
  name: string;
  slug: string;
  linkedinUrl: string;
  instagramUrl: string;
  linkedin: Record<string, unknown> | null;
  instagram: Record<string, unknown> | null;
}

async function main() {
  const files = readdirSync(RAW).filter((f) => f.endsWith('.json'));
  const people: unknown[] = [];
  const existing = (() => {
    try {
      return JSON.parse(readFileSync(OUT, 'utf8')) as Array<{ id: string }>;
    } catch {
      return [] as Array<{ id: string }>;
    }
  })();
  const done = new Set(existing.map((p) => p.id));

  for (const f of files) {
    const raw = JSON.parse(readFileSync(`${RAW}/${f}`, 'utf8')) as RawFile;
    if (!raw.linkedin || !raw.instagram || (raw.instagram as { private?: boolean }).private) continue;
    if (done.has(raw.slug)) {
      people.push(existing.find((p) => p.id === raw.slug));
      continue;
    }
    try {
      const analysis = await analyzePerson(raw.name, raw.linkedin, raw.instagram);
      const li = raw.linkedin as Record<string, unknown>;
      const ig = raw.instagram as Record<string, unknown>;
      const person = {
        id: raw.slug,
        name: raw.name,
        slug: raw.slug,
        linkedinUrl: raw.linkedinUrl,
        instagramUrl: raw.instagramUrl,
        headline: (li.headline as string) ?? '',
        photo: (li.profilePicture as string) ?? (ig.profilePicUrlHD as string) ?? '',
        analysis,
      };
      people.push(person);
      writeFileSync(OUT, JSON.stringify(people, null, 2));
      console.log(`analyzed ${raw.name} (${people.length} total)`);
    } catch (e) {
      console.error(`FAIL ${raw.name}:`, e instanceof Error ? e.message : e);
    }
  }
  console.log(`\nSeed complete: ${people.length} people -> ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
