export async function onRequestPost({ request, env }) {
  const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
  if (!env.AI) return new Response(JSON.stringify({ error: 'Cloudflare Workers AI binding AI is missing. Add it in Pages settings.' }), { status: 503, headers });
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const safe = messages.filter(m => ['user','assistant'].includes(m?.role) && typeof m.content === 'string').slice(-12).map(m => ({role:m.role,content:m.content.slice(0,2500)}));
    if (!safe.length || safe.at(-1).role !== 'user') return new Response(JSON.stringify({error:'Send a message first.'}),{status:400,headers});
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages: [{role:'system',content:'You are Pocket Chat, a friendly and helpful AI assistant. Answer questions clearly and accurately. If unsure, say so.'}, ...safe], max_tokens:512 });
    const answer = typeof result?.response === 'string' ? result.response.trim() : '';
    if (!answer) throw new Error('AI returned no text.');
    return new Response(JSON.stringify({answer}), {headers});
  } catch (e) {
    return new Response(JSON.stringify({error:'AI request failed. Please try again later.'}), {status:502,headers});
  }
}
export async function onRequestGet() { return Response.json({ok:true, message:'Pocket Chat API is online. POST a chat message to /api/chat.'}); }
