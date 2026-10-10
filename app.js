const $ = (id) => document.getElementById(id);
const status = $('status');
const statusDot = $('statusDot');
const loadButton = $('loadButton');
const form = $('chatForm');
const prompt = $('prompt');
const sendButton = $('sendButton');
const messages = $('messages');
const conversation = $('conversation');
const welcome = $('welcome');
const newChat = $('newChat');

let ready = false;
let busy = false;
let history = [];
let worker;

function setStatus(message, kind = '') {
  status.textContent = message;
  statusDot.className = `dot ${kind}`;
}
function updateControls() {
  prompt.disabled = !ready || busy;
  sendButton.disabled = !ready || busy || !prompt.value.trim();
}
function addMessage(who, content) {
  const item = document.createElement('div');
  item.className = `message ${who === 'You' ? 'user' : 'bot'}`;
  const speaker = document.createElement('span');
  speaker.className = 'speaker';
  speaker.textContent = who;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = content; // Never inject generated text as HTML.
  item.append(speaker, bubble);
  messages.append(item);
  conversation.scrollTop = conversation.scrollHeight;
  return item;
}
function ensureWorker() {
  if (worker) return worker;
  worker = new Worker('./ai-worker.js', { type: 'module' });
  worker.onmessage = (event) => {
    const data = event.data || {};
    if (data.type === 'progress') setStatus(data.message || 'Loading model…', 'busy');
    if (data.type === 'ready') {
      ready = true;
      busy = false;
      welcome.hidden = true;
      setStatus('AI ready · running locally', 'ready');
      updateControls();
      prompt.focus();
    }
    if (data.type === 'answer') {
      busy = false;
      const answer = String(data.text || 'I could not create a response.');
      history.push({role:'assistant', content: answer});
      addMessage('AI', answer);
      setStatus('AI ready · running locally', 'ready');
      updateControls();
      prompt.focus();
    }
    if (data.type === 'error') {
      busy = false;
      const msg = String(data.message || 'Unknown error');
      setStatus(`Error: ${msg.slice(0,150)}`, 'error');
      if (!ready) {
        loadButton.disabled = false;
        loadButton.textContent = 'Try loading again';
      } else {
        addMessage('System', 'The model had a problem. Try a shorter message or reload the page.');
        // The latest user prompt failed; remove it from the model history.
        if (history.at(-1)?.role === 'user') history.pop();
      }
      updateControls();
    }
  };
  worker.onerror = () => {
    busy = false;
    setStatus('AI worker failed. Reload this page to retry.', 'error');
    loadButton.disabled = false;
    loadButton.textContent = 'Try after reload';
    updateControls();
  };
  return worker;
}
loadButton.addEventListener('click', () => {
  busy = true;
  loadButton.disabled = true;
  loadButton.textContent = 'Loading…';
  setStatus('Starting AI download…', 'busy');
  try { ensureWorker().postMessage({type:'load'}); }
  catch { busy = false; setStatus('Could not start AI. Try a recent version of Safari.', 'error'); loadButton.disabled = false; }
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = prompt.value.trim();
  if (!ready || busy || !text) return;
  if (history.length === 0) welcome.hidden = true;
  addMessage('You', text);
  history.push({role:'user', content:text});
  prompt.value = '';
  busy = true;
  setStatus('Thinking on your device…', 'busy');
  updateControls();
  // Preserve a few turns for speed, especially on older phones.
  worker.postMessage({type:'generate', messages:history.slice(-8)});
});
prompt.addEventListener('input', () => {
  prompt.style.height = 'auto';
  prompt.style.height = `${Math.min(prompt.scrollHeight, 132)}px`;
  updateControls();
});
prompt.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    if (!sendButton.disabled) form.requestSubmit();
  }
});
newChat.addEventListener('click', () => {
  history = [];
  messages.replaceChildren();
  if (!ready) welcome.hidden = false;
  prompt.value = '';
  updateControls();
  if (ready) setStatus('New conversation · AI ready', 'ready');
});
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
updateControls();
