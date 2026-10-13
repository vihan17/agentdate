const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];

export async function geminiGenerate(prompt: string, jsonMode = false): Promise<string> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not set');
  let lastErr = '';
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const body: Record<string, unknown> = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: jsonMode ? { responseMimeType: 'application/json' } : {},
        };
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        );
        if (!res.ok) {
          lastErr = `${model}: ${res.status}`;
          if (res.status === 503 || res.status === 429) continue;
          break;
        }
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        lastErr = `${model}: empty response`;
      } catch (e) {
        lastErr = `${model}: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
  }
  throw new Error(`Gemini failed: ${lastErr}`);
}

export async function geminiJSON<T>(prompt: string): Promise<T> {
  const raw = await geminiGenerate(prompt, true);
  return JSON.parse(raw) as T;
}
