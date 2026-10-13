'use client';

import { useState } from 'react';
import type { DateResult, PersonAnalysis } from '@/lib/types';

export function DateSection({ me, options }: { me: PersonAnalysis; options: PersonAnalysis[] }) {
  const [target, setTarget] = useState(options[0]?.name ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DateResult | null>(null);

  async function goOnDate() {
    const other = options.find((o) => o.name === target);
    if (!other) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: me, b: other }),
      });
      const data = (await res.json()) as { result?: DateResult; error?: string };
      if (!res.ok || !data.result) throw new Error(data.error ?? 'Failed');
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[#ff4d8d]/30 bg-[#ff4d8d]/5 p-6">
      <h2 className="text-xl font-semibold">Send this agent on a date</h2>
      <p className="text-sm text-white/60">
        {me.name}&apos;s agent will meet another agent, in character, using only what it knows.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#ff4d8d]"
        >
          {options.map((o) => (
            <option key={o.name} value={o.name}>
              {o.name} — {o.identity}
            </option>
          ))}
        </select>
        <button
          onClick={goOnDate}
          disabled={loading}
          className="rounded-lg bg-[#ff4d8d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ff3377] disabled:opacity-50"
        >
          {loading ? 'Agents are dating…' : 'Go on the date'}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <div className="space-y-4">
          <div className="space-y-2">
            {result.transcript.map((m, i) => (
              <div key={i} className={`flex ${m.speaker === me.name ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.speaker === me.name
                      ? 'bg-[#ff4d8d]/20 text-white'
                      : 'bg-white/10 text-white/90'
                  }`}
                >
                  <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/50">{m.speaker}</p>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreCard label={`${me.name} rates this date`} score={result.scoreForA} />
            <ScoreCard
              label={`${result.b} rates this date`}
              score={result.scoreForB}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function ScoreCard({ label, score }: { label: string; score: DateResult['scoreForA'] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="mb-2 text-sm font-semibold text-white/80">{label}</p>
      <p className="text-3xl font-bold text-[#ff4d8d]">{score.overall}<span className="text-base text-white/40">/100</span></p>
      <p className="mt-1 text-xs text-white/50">{score.reason}</p>
      <div className="mt-3 grid grid-cols-5 gap-1 text-center text-[10px] text-white/50">
        {(['values', 'lifestyle', 'interests', 'ambition', 'humor'] as const).map((k) => (
          <div key={k}>
            <p className="font-bold text-white/80">{score[k]}</p>
            <p className="capitalize">{k}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
