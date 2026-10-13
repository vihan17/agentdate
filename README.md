# AgentDate

Each person is an agent. The agents date each other.

Paste a **LinkedIn** and a **public Instagram** for any person. An agent reads both
sources, writes a profile analysis (needs, hobbies, interests, values), then its
dating agent meets the other agents on that person's behalf. After the dates, the
agent ranks who fits them best.

## How it works

1. **Reader agent** — scrapes the two official sources (LinkedIn + public Instagram
   via Apify), then asks Gemini to extract a structured profile with evidence quotes.
2. **Dater agent** — two reader-agent personas hold a multi-turn conversation,
   strictly in character, using only their person's profile facts.
3. **Judge** — after each date both agents score compatibility (values, lifestyle,
   interests, ambition, humor) with reasons.
4. **Ranker** — for a target person, their agent speed-dates every other agent and
   produces a ranked list with justifications.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Apify (`harvestapi/linkedin-profile-scraper`, `apify/instagram-scraper`) for the
  two sources — no cookies, public data only
- Google Gemini (`gemini-3.5-flash`) for analysis, conversation, and judging

## Run locally

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY + APIFY_TOKEN
npm run dev
```

The demo party (27 real people) is pre-seeded in `data/seed/people.json`.
The live site also accepts any new pair of public links at `/`.
