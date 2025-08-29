const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitBtn = document.getElementById('send-btn');


const BASE_URL = 'http://localhost:3000';

// simpan percakapan
const history = [];

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  append('user', userMessage);
  input.value = '';
  setLoading(true);

  history.push({ role: 'user', content: userMessage });

  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    // parse robust: JSON kalau ada, fallback ke text
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : { error: await res.text() };
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

    const answer = data?.result ?? '(no content)';
    append('bot', answer);
    history.push({ role: 'model', content: answer });

    // batasi history biar body nggak kegedean
    if (history.length > 10) history.splice(0, history.length - 10);
  } catch (err) {
    append('bot', `Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

function append(sender, text) {
  const el = document.createElement('div');
  el.className = `message ${sender}`;
  el.textContent = text;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setLoading(state) {
  submitBtn.disabled = state;
  submitBtn.textContent = state ? 'Thinking…' : 'Send';
}
