/**
 * Grandma's wisdom, generated server-side.
 *
 * This file is the ONLY place the OpenRouter key is touched. It runs on the
 * dev server, never inside the app bundle that Expo Go downloads to the phone.
 * Do not move any of this into a component, and do not re-expose the key
 * through an EXPO_PUBLIC_ variable. See CLAUDE.md.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = [
  'You are a warm, sharp-witted grandmother handing out a single piece of',
  'wisdom for the day. Reply with one or two short sentences and nothing else:',
  'no greeting, no sign-off, no quotation marks, no emoji, no preamble like',
  '"Here is your wisdom". Speak plainly, as if to someone you love.',
].join(' ');

const TONE_PROMPTS = {
  funny: [
    "Give me today's wisdom with a mischievous, funny twist. It should raise a",
    'smile — dry, a little cheeky, the kind of thing that sounds like advice',
    'until you reach the end. Keep it kind; never mean.',
  ].join(' '),
  wise: [
    "Give me today's wisdom in earnest. Something calm and genuinely useful",
    'about living well. Plain-spoken and specific — avoid greeting-card',
    'platitudes and vague uplift.',
  ].join(' '),
} as const;

type Tone = keyof typeof TONE_PROMPTS;

function isTone(value: unknown): value is Tone {
  // hasOwn, not `in`: `in` walks the prototype chain, so "toString" and
  // "constructor" would pass validation and fail later as a confusing 502
  // instead of an honest 400.
  return typeof value === 'string' && Object.hasOwn(TONE_PROMPTS, value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const tone = (body as { tone?: unknown } | null)?.tone;
  if (!isTone(tone)) {
    return Response.json(
      { error: 'Field "tone" must be either "funny" or "wise".' },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    // Logged on the server only. The client never sees key details.
    console.error(
      '[wisdom] OPENROUTER_API_KEY is not set. Add it to .env and restart the dev server.'
    );
    return Response.json(
      { error: 'The server is not configured with an OpenRouter key.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        temperature: 0.9,
        max_tokens: 120,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: TONE_PROMPTS[tone] },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[wisdom] OpenRouter ${response.status}: ${await response.text()}`);
      return Response.json({ error: "Grandma couldn't be reached." }, { status: 502 });
    }

    const data = await response.json();
    const wisdom: unknown = data?.choices?.[0]?.message?.content;

    if (typeof wisdom !== 'string' || wisdom.trim().length === 0) {
      console.error('[wisdom] OpenRouter returned no usable content.');
      return Response.json({ error: 'Grandma had nothing to say.' }, { status: 502 });
    }

    return Response.json({ wisdom: wisdom.trim(), tone });
  } catch (error) {
    console.error('[wisdom] Request to OpenRouter failed:', error);
    return Response.json({ error: "Grandma couldn't be reached." }, { status: 502 });
  }
}
