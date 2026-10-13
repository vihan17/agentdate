import { geminiJSON } from './gemini';
import type { DateResult, DateScore, PersonAnalysis } from './types';

function personCard(p: PersonAnalysis): string {
  return `Name: ${p.name}
Identity: ${p.identity}
Needs: ${p.needs.join(', ')}
Hobbies: ${p.hobbies.join(', ')}
Interests: ${p.interests.join(', ')}
Values: ${p.values.join(', ')}
Lifestyle: ${p.lifestyle}
Personality: ${p.personality}
Seeking: ${p.seeking}`;
}

interface DateLLM {
  transcript: Array<{ speaker: string; text: string }>;
  scoreForA: Omit<DateScore, 'reason'> & { reason: string };
  scoreForB: Omit<DateScore, 'reason'> & { reason: string };
}

export async function runDate(a: PersonAnalysis, b: PersonAnalysis): Promise<DateResult> {
  const prompt = `You simulate a first date between two AI agents, each dating ON BEHALF of their real person.
Stay strictly in-character using ONLY each person's profile facts. Be warm, natural, a little playful.

AGENT A represents:
${personCard(a)}

AGENT B represents:
${personCard(b)}

Write a 6-turn conversation (A opens, alternating). Each line <= 40 words.
Then score compatibility 0-100 on each axis (values, lifestyle, interests, ambition, humor) plus "overall",
with a one-line "reason" per person. Respond with STRICT JSON:
{
  "transcript":[{"speaker":"${a.name}"|"${b.name}","text":"..."}],
  "scoreForA":{"values":n,"lifestyle":n,"interests":n,"ambition":n,"humor":n,"overall":n,"reason":"..."},
  "scoreForB":{"values":n,"lifestyle":n,"interests":n,"ambition":n,"humor":n,"overall":n,"reason":"..."}
}`;

  const r = await geminiJSON<DateLLM>(prompt);
  return {
    a: a.name,
    b: b.name,
    transcript: r.transcript,
    scoreForA: r.scoreForA,
    scoreForB: r.scoreForB,
  };
}

export async function rankMatches(
  target: PersonAnalysis,
  candidates: PersonAnalysis[]
): Promise<Array<{ name: string; score: number; reason: string }>> {
  const cards = candidates.map((c, i) => `${i + 1}. ${personCard(c)}`).join('\n\n');

  const prompt = `Agent for ${target.name} just went on quick "speed dates" with these people (via their dating agents):
${cards}

Target agent profile:
${personCard(target)}

Score each candidate 0-100 for long-term fit WITH ${target.name}, based on value alignment,
lifestyle compatibility, complementary needs, and shared interests. Respond with STRICT JSON:
{"matches":[{"name":"exact name from list","score":n,"reason":"one sentence"}]}
Include ALL candidates, sorted best-first.`;

  const r = await geminiJSON<{ matches: Array<{ name: string; score: number; reason: string }> }>(prompt);
  return r.matches;
}
