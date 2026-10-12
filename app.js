const $ = id => document.getElementById(id);
const status = $('status'), statusDot = $('statusDot'), form = $('chatForm'), prompt = $('prompt'), sendButton = $('sendButton'), micButton = $('micButton'), messages = $('messages'), conversation = $('conversation'), welcome = $('welcome'), newChat = $('newChat'), loadButton = $('loadButton');

let history = [], busy = false, abortController = null, recognition = null, listening = false, dictatedBase = '';

function setStatus(message, kind = '') {
  status.textContent = message;
  statusDot.className = `dot ${kind}`;
}

function controls() {
  prompt.disabled = busy;
  sendButton.disabled = !busy && !prompt.value.trim();
  sendButton.textContent = busy ? '■' : '↑';
  sendButton.classList.toggle('stop', busy);
  sendButton.setAttribute('aria-label', busy ? 'Stop generating' : 'Send message');
  sendButton.type = busy ? 'button' : 'submit';
  micButton.disabled = busy;
}

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addCopyButton(footer, bubble) {
  const btn = document.createElement('button');
  btn.className = 'copy-button';
  btn.type = 'button';
  btn.textContent = 'Copy';
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(bubble.textContent);
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    } catch {
      btn.textContent = 'Failed';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    }
  });
  footer.append(btn);
}

function addMessage(who, content) {
  const item = document.createElement('div');
  item.className = `message ${who === 'You' ? 'user' : 'bot'}`;
  const speaker = document.createElement('span');
  speaker.className = 'speaker';
  speaker.textContent = who;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = content;
  const footer = document.createElement('div');
  footer.className = 'bubble-footer';
  const stamp = document.createElement('span');
  stamp.className = 'timestamp';
  stamp.textContent = timeNow();
  footer.append(stamp);
  if (who === 'AI') addCopyButton(footer, bubble);
  item.append(speaker, bubble, footer);
  messages.append(item);
  scrollIfNearBottom();
}

function scrollIfNearBottom(force = false) {
  const nearBottom = conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight < 120;
  if (force || nearBottom) conversation.scrollTop = conversation.scrollHeight;
}

// --- Voice input (Web Speech API, where supported) ---
const SpeechRecognition = self.SpeechRecognition || self.webkitSpeechRecognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;
  micButton.hidden = false;

  recognition.addEventListener('result', (e) => {
    let text = '';
    for (const result of e.results) text += result[0].transcript;
    prompt.value = (dictatedBase + text).slice(0, 1000);
    prompt.dispatchEvent(new Event('input'));
  });
  recognition.addEventListener('end', () => stopDictation());
  recognition.addEventListener('error', (e) => {
    stopDictation();
    setStatus(`Voice input failed (${e.error || 'unknown'})`, 'error');
  });
}

function startDictation() {
  if (!recognition || busy || listening) return;
  dictatedBase = prompt.value ? prompt.value.trimEnd() + ' ' : '';
  try {
    recognition.start();
    listening = true;
    micButton.classList.add('listening');
    setStatus('Listening… speak now', 'busy');
  } catch { /* start() throws if already started */ }
}

function stopDictation() {
  if (!listening) return;
  listening = false;
  micButton.classList.remove('listening');
  recognition.stop();
  setStatus('Cloud AI ready', 'ready');
  prompt.focus();
}

micButton.addEventListener('click', () => (listening ? stopDictation() : startDictation()));

// --- Spoken replies (text-to-speech) ---
let speakReplies = 'speechSynthesis' in self;
function speak(text) {
  if (!speakReplies) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 600));
  speechSynthesis.speak(utterance);
}

// --- App wiring ---
welcome.hidden = true;
loadButton.hidden = true;
prompt.placeholder = 'Ask Pocket Chat anything…';
setStatus('Cloud AI · checking connection…', 'busy');
fetch('./api/chat')
  .then(async r => {
    if (!r.ok) throw Error();
    setStatus('Cloud AI ready', 'ready');
  })
  .catch(() => setStatus('Cloud AI not connected · deploy on Cloudflare Pages', 'error'));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = prompt.value.trim();
  if (busy || !text) return;
  if (listening) stopDictation();
  addMessage('You', text);
  history.push({ role: 'user', content: text });
  prompt.value = '';
  busy = true;
  abortController = new AbortController();
  controls();
  setStatus('Thinking…', 'busy');
  try {
    const response = await fetch('./api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) }),
      signal: abortController.signal
    });
    const data = await response.json();
    if (!response.ok || !data.answer) throw Error(data.error || 'AI unavailable');
    addMessage('AI', data.answer);
    history.push({ role: 'assistant', content: data.answer });
    speak(data.answer);
    setStatus('Cloud AI ready', 'ready');
  } catch (err) {
    if (err.name === 'AbortError') {
      addMessage('System', 'Stopped.');
      setStatus('Cloud AI ready', 'ready');
    } else {
      addMessage('System', 'Could not reach the cloud AI. ' + err.message);
      setStatus('AI connection error', 'error');
    }
    history.pop();
  } finally {
    busy = false;
    abortController = null;
    controls();
    prompt.focus();
  }
});

sendButton.addEventListener('click', () => {
  if (busy && abortController) abortController.abort();
  if ('speechSynthesis' in self) speechSynthesis.cancel();
});

prompt.addEventListener('input', () => {
  prompt.style.height = 'auto';
  prompt.style.height = `${Math.min(prompt.scrollHeight, 132)}px`;
  controls();
});
prompt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    if (!sendButton.disabled && sendButton.type === 'submit') form.requestSubmit();
  }
});

newChat.addEventListener('click', () => {
  history = [];
  messages.replaceChildren();
  prompt.value = '';
  controls();
});

// Remove the old offline cache so updated app.js is fetched after deployment.
if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));

controls();
