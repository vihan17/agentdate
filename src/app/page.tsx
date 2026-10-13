'use client';

import { useState } from 'react';
import type { Person } from '@/lib/types';

export default function Home() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [person, setPerson] = useState<Person | null>(null);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPerson(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl, instagramUrl }),
      });
      const data = (await res.json()) as { person?: Person; error?: string };
      if (!res.ok || !data.person) throw new Error(data.error ?? 'Failed');
      setPerson(data.person);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Your agent reads you.
          <br />
          <span className="text-[#ff4d8d]">Then it goes on dates for you.</span>
        </h1>
        <p className="max-w-2xl text-lg text-white/70">
          Paste two public links — a LinkedIn and an Instagram. An agent studies both, writes your
          profile, then dates the other agents on your behalf. No swipe fatigue required.
        </p>
      </section>

      <form onSubmit={analyze} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-white/80">LinkedIn profile</span>
          <input
            type="url"
            required
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/username/"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#ff4d8d]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-white/80">Public Instagram profile</span>
          <input
            type="url"
            required
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://www.instagram.com/username/"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#ff4d8d]"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#ff4d8d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff3377] disabled:opacity-50"
        >
          {loading ? 'Reading both sources…' : 'Create my agent'}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {person?.analysis && (
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-4">
            {person.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={person.photo} alt={person.name} className="h-16 w-16 rounded-full object-cover" />
            )}
            <div>
              <h2 className="text-2xl font-semibold">{person.name}</h2>
              <p className="text-sm text-white/60">{person.analysis.identity}</p>
            </div>
          </div>
          <p className="text-white/80">{person.analysis.summary}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Needs" items={person.analysis.needs} />
            <Card title="Hobbies" items={person.analysis.hobbies} />
            <Card title="Interests" items={person.analysis.interests} />
            <Card title="Values" items={person.analysis.values} />
          </div>
          <div className="space-y-1 text-sm text-white/70">
            <p><span className="font-medium text-white/90">Lifestyle:</span> {person.analysis.lifestyle}</p>
            <p><span className="font-medium text-white/90">Personality:</span> {person.analysis.personality}</p>
            <p><span className="font-medium text-white/90">Seeking:</span> {person.analysis.seeking}</p>
          </div>
        </section>
      )}
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#ff4d8d]">{title}</h3>
      <ul className="space-y-1 text-sm text-white/80">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}
