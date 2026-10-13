import { NextResponse } from 'next/server';
import { rankMatches } from '@/lib/dating';
import type { PersonAnalysis } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { target: PersonAnalysis; candidates: PersonAnalysis[] };
    if (!body.target?.name || !Array.isArray(body.candidates) || body.candidates.length === 0) {
      return NextResponse.json({ error: 'A target agent and candidate list are required.' }, { status: 400 });
    }
    const matches = await rankMatches(body.target, body.candidates);
    return NextResponse.json({ matches });
  } catch (e) {
    console.error('rank error', e);
    return NextResponse.json({ error: 'Ranking failed. Try again.' }, { status: 500 });
  }
}
