import { GROQ_API_KEY, GROQ_API_URL, MODEL } from '../constants/Config';

export interface IdeaCard {
  id: string;
  title: string;
  summary: string;
  mergedFrom: number[];
  tags: string[];
  score: number;
  category: 'recipe' | 'study' | 'reminder' | 'tip' | 'other';
}

const SYSTEM_PROMPT = `You are a note migration engine that processes messy chat message dumps (WhatsApp, Telegram, social media, etc.).

The input may be in ANY language — Turkish, Malay, English, or mixed. You must respond with titles, summaries, and tags written in the SAME language as the majority of the input messages.

Given raw chat messages, you must:
1. DEDUP — group semantically related messages about the same topic
2. SYNTHESIZE — merge each group into one clean, useful idea
3. CATEGORIZE — assign one of: recipe, study, reminder, tip, other
4. STRUCTURE — return ONLY a valid JSON array, no prose, no markdown fences

Rules:
- Ignore greetings, reactions, and off-topic chatter
- mergedFrom contains the 1-based line numbers of messages that were merged
- score is 0-100 based on how specific and actionable the idea is
- tags are lowercase keywords (2-4 per card), in the input language
- title is short (max 6 words), in the input language
- summary is 1-2 sentences, clean and useful, in the input language

Output format (raw JSON array only — absolutely no \`\`\`json fences, no extra text before or after):
[
  {
    "id": "card_1",
    "title": "...",
    "summary": "...",
    "mergedFrom": [1, 3, 7],
    "tags": ["recipe", "dessert"],
    "score": 82,
    "category": "recipe"
  }
]`;

export async function analyzeNotes(rawText: string): Promise<IdeaCard[]> {
  if (!GROQ_API_KEY) {
    throw new Error('API key not set. Add EXPO_PUBLIC_GROQ_API_KEY to .env.local');
  }

  const lines = rawText.trim().split('\n').filter(l => l.trim());
  const numberedText = lines.map((l, i) => `${i + 1}. ${l}`).join('\n');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Process these messages and return only a JSON array of idea cards:\n\n${numberedText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? '';

  // Strip any accidental markdown fences, then extract JSON array
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in response');

  const cards: IdeaCard[] = JSON.parse(jsonMatch[0]);
  return cards;
}
