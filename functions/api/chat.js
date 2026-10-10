// Cloudflare Pages Function. Runs at /api/chat when deployed on Cloudflare Pages
// with a Workers AI binding named "AI" (Pages project Settings > Bindings).
const MODEL = '@cf/meta/llama-3.1-8b-instruct';
const SYSTEM_PROMPT = 'You are Pocket Chat, a friendly and helpful AI assistant. Answer questions clearly and accurately. If unsure, say so. Use short paragraphs and lists when helpful.';
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 2500;
const MAX_TOKENS = 1024;

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
