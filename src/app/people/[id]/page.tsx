import { readFileSync } from 'node:fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Person } from '@/lib/types';
import { DateSection } from '@/components/DateSection';
import { RankSection } from '@/components/RankSection';

function loadPeople(): Person[] {
  try {
    return JSON.parse(readFileSync(path.join(process.cwd(), 'data/seed/people.json'), 'utf8')) as Person[];
  } catch {
    return [];
  }
}

export default async function PersonPage({ params }: { params: { id: string } }) {
  const people = loadPeople();
  const person = people.find((p) => p.id === params.id);
  if (!person?.analysis) notFound();
  const others = people.filter((p) => p.id !== person.id).map((p) => p.analysis!).filter(Boolean);

  return (
    <div className="space-y-10">
      <section className="flex items-center gap-5">
        {person.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.photo} alt={person.name} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ff4d8d]/20 text-3xl font-bold text-[#ff4d8d]">
            {person.name[0]}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{person.name}</h1>
          <p className="text-white/60">{person.analysis.identity}</p>
          <p className="mt-1 text-xs text-white/40">
            Sources:{' '}
            <a href={person.linkedinUrl} target="_blank" rel="noreferrer" className="underline hover:text-white/70">LinkedIn</a>
            {' · '}
            <a href={person.instagramUrl} target="_blank" rel="noreferrer" className="underline hover:text-white/70">Instagram</a>
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What the agent found</h2>
        <p className="text-white/80">{person.analysis.summary}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Needs', person.analysis.needs],
              ['Hobbies', person.analysis.hobbies],
              ['Interests', person.analysis.interests],
              ['Values', person.analysis.values],
            ] as const
          ).map(([title, items]) => (
            <div key={title} className="rounded-xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#ff4d8d]">{title}</h3>
              <ul className="space-y-1 text-sm text-white/80">
                {items.map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="space-y-1 text-sm text-white/70">
          <p><span className="font-medium text-white/90">Lifestyle:</span> {person.analysis.lifestyle}</p>
          <p><span className="font-medium text-white/90">Personality:</span> {person.analysis.personality}</p>
          <p><span className="font-medium text-white/90">Seeking:</span> {person.analysis.seeking}</p>
        </div>
        {person.analysis.evidence?.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">Evidence from sources</h3>
            <ul className="space-y-1.5 text-sm text-white/60">
              {person.analysis.evidence.map((ev, i) => (
                <li key={i}>
                  <span className="uppercase text-[10px] font-bold text-[#ff4d8d]">{ev.source}</span>{' '}
                  &ldquo;{ev.quote}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <DateSection me={person.analysis} options={others.slice(0, 8)} />
      <RankSection target={person.analysis} candidates={others} />

      <p className="text-center text-sm text-white/40">
        <Link href="/demo" className="underline hover:text-white/60">← back to the party</Link>
      </p>
    </div>
  );
}
