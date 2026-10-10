// Original, readable worker. No analytics, tracking, or server-side chat API.
// Requires a network connection to download Transformers.js + model on first use.
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

env.allowLocalModels = false;
env.useBrowserCache = true;
const MODEL = 'onnx-community/SmolLM2-135M-Instruct-ONNX-MHA';
let generator;
let loading;
function report(type, message, additional = {}) {
  self.postMessage({type, message, ...additional});
}
async function loadModel() {
  if (generator) return generator;
  if (loading) return loading;
  loading = pipeline('text-generation', MODEL, {
    device: 'wasm',
    dtype: 'q4',
    progress_callback: (info) => {
      if (info.status === 'progress' && info.total) {
        const percent = Math.floor((info.loaded / info.total) * 100);
        report('progress', `Downloading AI file… ${Math.max(0, Math.min(100, percent))}%`);
      } else if (info.status === 'initiate') {
        report('progress', 'Downloading AI files…');
      } else if (info.status === 'done') {
        report('progress', 'Preparing AI files…');
      }
    }
  });
  try { generator = await loading; return generator; }
  catch (e) { loading = null; throw e; }
}
self.onmessage = async (event) => {
  const request = event.data || {};
  try {
    if (request.type === 'load') {
      report('progress','Connecting to the model source…');
      await loadModel();
      report('ready','Model loaded');
    } else if (request.type === 'generate') {
      if (!generator) throw new Error('Load the AI model first.');
      const incoming = Array.isArray(request.messages) ? request.messages : [];
      const safeHistory = incoming.filter(m =>
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' && m.content.length <= 2000
      ).slice(-8);
      const messages = [
        {role:'system', content:'You are a friendly, helpful, factual assistant. Say when you are unsure. Keep answers brief and age appropriate.'},
        ...safeHistory
      ];
      const out = await generator(messages, {max_new_tokens:100, do_sample:false});
      const generated = out?.[0]?.generated_text;
      let answer = Array.isArray(generated)
        ? generated.at(-1)?.content
        : typeof generated === 'string' ? generated : '';
      if (Array.isArray(answer)) answer = answer.map(x => x?.text ?? '').join('');
      report('answer', '', {text: String(answer || 'Sorry, I do not know.').trim().slice(0, 5000)});
    }
  } catch (e) {
    report('error', String(e?.message || e || 'Could not run AI.'));
  }
};
