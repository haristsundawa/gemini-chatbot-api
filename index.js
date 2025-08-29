// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// ---- Gemini setup ----
const GEMINI_MODEL = 'gemini-2.5-flash';
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

// Helper ambil teks dari respons Gemini
function extractText(resp) {
  try {
    if (typeof resp?.response?.text === 'function') {
      return resp.response.text();
    }
    const text =
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.response?.candidates?.[0]?.content?.text;
    return text ?? JSON.stringify(resp, null, 2);
  } catch (err) {
    console.error('Error extracting text:', err);
    return JSON.stringify(resp, null, 2);
  }
}

// ---- Routes ----

// kirim index.html saat akses root
app.get('/', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// API chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) throw new Error('messages must be an array');

    const contents = messages.map((m) => ({
      role: m.role || 'user',
      parts: [{ text: String(m.content ?? '') }],
    }));

    const resp = await model.generateContent({ contents });
    res.json({ result: extractText(resp) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server ready on http://localhost:${PORT}`)
);
