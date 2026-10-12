// Cloudflare Pages Function. Runs at /api/chat when deployed on Cloudflare Pages
// with a Workers AI binding named "AI" (Pages project Settings > Bindings).
const MODEL = '@cf/meta/llama-3.1-8b-instruct';
const SYSTEM_PROMPT = [
  'You are Pocket Chat, a warm and personable AI companion. Chat the way a real person would in a text conversation: natural, relaxed, and genuinely engaged.',
  'Write in a natural, human voice. Be conversational rather than formal. It is fine to use contractions, react to what the person said, ask a light follow-up question, and show a little personality or gentle humour when it fits.',
  'Keep replies believable and to the point: usually one to three short paragraphs, and shorter for casual small talk. Only use lists when they truly help. Do not lecture or over-explain.',
  'Answer questions helpfully and factually. If you do not know something, say so naturally instead of guessing, and never invent facts, sources, or figures.',
  'Never say things like "As an AI language model", never start with "Certainly!" or "Great question!", and do not pad replies with disclaimers. Just talk like a real, thoughtful person.'
].join(' ');
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 2500;
const MAX_TOKENS = 1024;
const TEMPERATURE = 0.7;
const TOP_P = 0.9;

const JSON_HEADERS = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export async function onRequestPost({ request, env }) {
  if (!env.AI) return json({ error: 'Cloudflare Workers AI binding AI is missing. Add it in Pages settings.' }, 503);
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const safe = messages
      .filter(m => ['user', 'assistant'].includes(m?.role) && typeof m.content === 'string')
      .slice(-MAX_MESSAGES)
      .map(m => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
    if (!safe.length || safe.at(-1).role !== 'user') return json({ error: 'Send a message first.' }, 400);
    const result = await env.AI.run(MODEL, {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...safe],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      top_p: TOP_P,
    });
    const answer = typeof result?.response === 'string' ? result.response.trim() : '';
    if (!answer) throw new Error('AI returned no text.');
    return json({ answer });
  } catch (e) {
    return json({ error: 'AI request failed. Please try again later.' }, 502);
  }
}

export async function onRequestGet() {
  return json({ ok: true, message: 'Pocket Chat API is online. POST a chat message to /api/chat.' });
}
