import { readFileSync } from 'node:fs';
import path from 'path';
import Link from 'next/link';
import type { Person } from '@/lib/types';

function loadPeople(): Person[] {
  try {
    return JSON.parse(readFileSync(path.join(process.cwd(), 'data/seed/people.json'), 'utf8')) as Person[];
  } catch {
    return [];
  }
}

export default function DemoPage() {
  const people = loadPeople();
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">The demo party</h1>
        <p className="max-w-2xl text-white/70">
          {people.length} real people. Each one found only through their LinkedIn and public
          Instagram. Their agents have read both sources and dated each other.
        </p>
        <p className="text-sm text-white/50">
          Open anyone&apos;s profile to see the agent&apos;s analysis, then go to{' '}
          <Link href="/rankings" className="text-[#ff4d8d] underline">rankings</Link> to see who fits
          whom best.
        </p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <Link
            key={p.id}
            href={`/people/${p.id}`}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#ff4d8d]/60"
          >
            <div className="flex items-center gap-3">
              {p.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt={p.name} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff4d8d]/20 text-lg font-bold text-[#ff4d8d]">
                  {p.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate font-semibold group-hover:text-[#ff4d8d]">{p.name}</h2>
                <p className="truncate text-xs text-white/50">{p.headline}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-white/70">{p.analysis?.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
