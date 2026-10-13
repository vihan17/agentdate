import { geminiJSON } from './gemini';
import type { PersonAnalysis } from './types';

export async function analyzePerson(
  name: string,
  linkedin: Record<string, unknown> | null,
  instagram: Record<string, unknown> | null
): Promise<PersonAnalysis> {
  const liSummary = linkedin
    ? JSON.stringify({
        name: `${linkedin.firstName} ${linkedin.lastName}`,
        headline: linkedin.headline,
        about: linkedin.about,
        location: linkedin.location,
        experience: linkedin.experience,
        education: linkedin.education,
        interests: linkedin.interests,
      }).slice(0, 6000)
    : 'no LinkedIn data';

  const igSummary = instagram
    ? JSON.stringify({
        username: instagram.username,
        fullName: instagram.fullName,
        biography: instagram.biography,
        followers: instagram.followersCount,
        externalUrl: instagram.externalUrl,
        recentPosts: Array.isArray(instagram.latestPosts)
          ? (instagram.latestPosts as Array<Record<string, unknown>>).slice(0, 10).map((p) => ({
              caption: p.caption,
              hashtags: p.hashtags,
              likes: p.likesCount,
            }))
          : [],
      }).slice(0, 6000)
    : 'no Instagram data';

  const prompt = `You are a perceptive agent analyzing a real person from their two public sources: LinkedIn and Instagram.
Person: ${name}

LINKEDIN:
${liSummary}

INSTAGRAM:
${igSummary}

Based ONLY on this evidence, produce a dating-profile analysis. Respond with STRICT JSON:
{
  "name": string,
  "identity": "one-line who they are (job/role/vibe)",
  "needs": ["3-5 emotional/life needs evident from the data"],
  "hobbies": ["3-6 hobbies"],
  "interests": ["3-6 interests/passions"],
  "values": ["3-5 core values"],
  "lifestyle": "one sentence on their lifestyle",
  "personality": "one sentence personality sketch",
  "seeking": "one sentence: what kind of partner would fit them, inferred from the data",
  "summary": "2-3 sentence warm summary a friend would write",
  "evidence": [{"source":"linkedin"|"instagram","quote":"short direct quote or data point from above"}]
}
Only include what the data supports. Be specific, not generic.`;

  return geminiJSON<PersonAnalysis>(prompt);
}
