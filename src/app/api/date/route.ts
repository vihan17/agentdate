import { NextResponse } from 'next/server';
import { runDate } from '@/lib/dating';
import type { PersonAnalysis } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { a: PersonAnalysis; b: PersonAnalysis };
    if (!body.a?.name || !body.b?.name) {
      return NextResponse.json({ error: 'Two analyzed agents are required.' }, { status: 400 });
    }
    const result = await runDate(body.a, body.b);
    return NextResponse.json({ result });
  } catch (e) {
    console.error('date error', e);
    return NextResponse.json({ error: 'The date failed to run. Try again.' }, { status: 500 });
  }
}
