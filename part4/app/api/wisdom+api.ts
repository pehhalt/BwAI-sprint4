/**
 * Grandma's wisdom, generated server-side.
 *
 * This file is the ONLY place the OpenRouter key is touched. It runs on the
 * dev server, never inside the app bundle that Expo Go downloads to the phone.
 * Do not move any of this into a component, and do not re-expose the key
 * through an EXPO_PUBLIC_ variable. See CLAUDE.md.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

const SYSTEM_PROMPT = [
  'You are a grandmother handing out one line of wisdom.',
  'Reply with ONE sentence. Fifteen words at most. Then stop.',
  'The hard rule: never explain the line. Real wisdom lands and stops, and an',
  'explanation is what gives a machine away. Do not add a second sentence, and',
  'do not tack on a trailing clause starting with and, so, because, that way,',
  'it reminds, or remember.',
  'No greeting, no sign-off, no quotation marks, no emoji, no preamble.',
  'Avoid sayings everyone has already heard. A line like "you cannot pour from',
  'an empty cup" or "a watched pot never boils" is a quotation, not your own',
  'wisdom. Say something you have not said before.',
  'Sound spoken rather than written. Use plain old words, and prefer a',
  'concrete everyday thing to an abstraction like journey, mindset or little',
  'joys. Do not name a specific object listed in the examples; reach for a',
  'different corner of ordinary life each time.',
].join(' ');

/**
 * Each tone carries examples rather than adjectives. Describing a register
 * ("be witty") moves a model far less than showing it, and showing it is what
 * stops the explanatory second sentence coming back.
 */
const TONE_PROMPTS = {
  wise: [
    `Today's wisdom, in earnest. Practical and a little blunt, the kind of`,
    `thing said while drying the dishes. In this register:`,
    `"Don't borrow trouble." /`,
    `"Eat it while it's hot." /`,
    `"Sleep on it, it'll look smaller in the morning." /`,
    `"Chase two rabbits, catch none." /`,
    `"The washing will still be there tomorrow. Your friend might not be."`,
    `Now give me a different one.`,
  ].join(' '),
  funny: [
    `Today's wisdom with a mischievous twist: it sounds like advice right up`,
    `until the last word. Dry, a little cheeky, never mean, still one sentence.`,
    `In this register:`,
    `"Marry someone who can cook. Love fades, dinner doesn't." /`,
    `"If you can't be kind, be quiet." /`,
    `"Money can't buy happiness, but it buys cake." /`,
    `"Always be yourself, unless you can be the one holding the biscuits." /`,
    `"Never trust a man who won't eat seconds."`,
    `Now give me a different one.`,
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
        max_tokens: 60,
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

    // aiGenerated marks the payload as synthetic for any consumer that is not
    // a human reading the screen. Article 50(2) machine-readable marking sits
    // with the model provider rather than a deployer, so this is a hedge, not
    // a claim of compliance -- but it costs nothing and travels with the text.
    return Response.json({ wisdom: wisdom.trim(), tone, aiGenerated: true });
  } catch (error) {
    console.error('[wisdom] Request to OpenRouter failed:', error);
    return Response.json({ error: "Grandma couldn't be reached." }, { status: 502 });
  }
}
