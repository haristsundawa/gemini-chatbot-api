const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendBtn = document.getElementById('send-btn') || document.querySelector('button');

const BASE_URL = 'http://localhost:3000';
const history = [];

// greeting opsional
append('bot', 'Hello! How can I help you today?');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = (input.value || '').trim();
  if (!text) return;

  // tampilkan & simpan pesan user
  append('user', text);
  history.push({ role: 'user', content: text });
  input.value = '';
  setLoading(true);

  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json()
                                                 : { error: await res.text() };
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

    const answer = data?.result ?? '(no content)';
    append('bot', answer);
    history.push({ role: 'model', content: answer });

    // batasi panjang history agar request tidak membengkak
    if (history.length > 20) history.splice(0, history.length - 20);
  } catch (err) {
    append('bot', `Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

function append(sender, text){
  const row = document.createElement('div');
  row.className = `row ${sender}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  row.appendChild(bubble);
  chatBox.appendChild(row);

  // auto-scroll ke bawah
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setLoading(state){
  if (!sendBtn) return;
  sendBtn.disabled = state;
  sendBtn.textContent = state ? 'Thinking…' : 'Send';
}
