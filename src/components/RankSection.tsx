'use client';

import { useState } from 'react';
import type { PersonAnalysis } from '@/lib/types';

interface Match {
  name: string;
  score: number;
  reason: string;
}

export function RankSection({ target, candidates }: { target: PersonAnalysis; candidates: PersonAnalysis[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState<Match[] | null>(null);

  async function rank() {
    setLoading(true);
    setError('');
    setMatches(null);
    try {
      const res = await fetch('/api/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, candidates }),
      });
      const data = (await res.json()) as { matches?: Match[]; error?: string };
      if (!res.ok || !data.matches) throw new Error(data.error ?? 'Failed');
      setMatches(data.matches);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">Who fits {target.name} best?</h2>
      <p className="text-sm text-white/60">
        The agent speed-dates every other agent and ranks who fits them best.
      </p>
      <button
        onClick={rank}
        disabled={loading}
        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50"
      >
        {loading ? 'Agents are speed-dating everyone…' : `Rank all ${candidates.length} candidates`}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {matches && (
        <ol className="space-y-2">
          {matches.map((m, i) => (
            <li key={m.name} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-3.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ff4d8d]/20 text-sm font-bold text-[#ff4d8d]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-lg font-bold text-[#ff4d8d]">{m.score}</p>
                </div>
                <p className="text-sm text-white/60">{m.reason}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
