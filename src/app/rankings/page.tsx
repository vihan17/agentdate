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

export default function RankingsPage() {
  const people = loadPeople().filter((p) => p.analysis);
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">The match board</h1>
        <p className="max-w-2xl text-white/70">
          Every agent has read two sources — their person&apos;s LinkedIn and Instagram. Open any
          profile to run the full ranking for that person.
        </p>
      </section>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Person</th>
              <th className="hidden px-4 py-3 sm:table-cell">Agent sees them as</th>
              <th className="px-4 py-3">Seeking</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {people.map((p, i) => (
              <tr key={p.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-3 text-white/40">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="hidden px-4 py-3 text-white/60 sm:table-cell">{p.analysis!.identity}</td>
                <td className="max-w-[280px] truncate px-4 py-3 text-white/60">{p.analysis!.seeking}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/people/${p.id}`} className="text-[#ff4d8d] hover:underline">
                    see rankings →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
