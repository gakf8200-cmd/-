import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_SYSTEM_DATA } from './src/data/seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK with required telemetry headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Ensure data persistence directory exists
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function initializeDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SYSTEM_DATA, null, 2), 'utf-8');
      console.log('Database initialized with default seed data for Horizon Infrastructure Contracting Co.');
    }
  } catch (err) {
    console.error('Failed to initialize local JSON database:', err);
  }
}

function getDatabaseData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  return INITIAL_SYSTEM_DATA;
}

function saveDatabaseData(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving database file:', err);
    return false;
  }
}

initializeDatabase();

// --- REST API Endpoints ---

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    company: 'شركة أفق البنية التحتية للمقاولات',
    branches: 5,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/data', (_req: Request, res: Response) => {
  const data = getDatabaseData();
  res.json(data);
});

app.post('/api/data', (req: Request, res: Response) => {
  const incomingData = req.body;
  if (!incomingData || !incomingData.branches) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  const success = saveDatabaseData(incomingData);
  if (success) {
    res.json({ success: true, timestamp: new Date().toISOString() });
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

app.post('/api/reset', (_req: Request, res: Response) => {
  const success = saveDatabaseData(INITIAL_SYSTEM_DATA);
  if (success) {
    res.json({ success: true, message: 'Reset to default seed data' });
  } else {
    res.status(500).json({ error: 'Failed to reset' });
  }
});

// --- Gemini Multi-turn Chat Endpoint ---
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, message, model, systemSummary } = req.body;
    // Model selection defaults to gemini-3.5-flash for general tasks, as requested in prompt guidelines
    const modelToUse = model || 'gemini-3.5-flash';

    const systemInstruction = `أنت "المستشار التشغيلي الذكي لشركة أفق البنية التحتية للمقاولات" (Horizon Infrastructure Contracting Co.).
الشركة متخصصة في مقاولات البنية التحتية وتملك 5 فروع في المملكة العربية السعودية:
1. فرع مكة المكرمة
2. فرع الرياض
3. فرع أبها
4. فرع سبت العلايا
5. فرع النماص

دورك ومسؤولياتك:
- تقديم استشارات وحلول تشغيلية فورية لإدارة الفرق الميدانية، أسطول المعدات والآليات، جدول الصيانة الوقائية والطارئة، قطع الغيار، ومصروفات التشغيل.
- الإجابة بدقة عن شؤون العمالة، الكفالات، تجديد الإقامات، والإجازات، وحل النزاعات والقضايا العمالية وفق نظام العمل السعودي.
- اقتراح آليات لرفع كفاءة النقل والمناقلات بين الفروع وخفض تكاليف الصيانة وتسريع مراحل الإصلاح العشر.
- تحدث دائماً باللغة العربية الفصحى المهنية بأسلوب هندسي دقيق وإجراءات مرقمة وواضحة.

${systemSummary ? `\n[بيانات النظام الميدانية الحالية في الوقت الفعلي]:\n${systemSummary}\n` : ''}`;

    // Construct conversation history for @google/genai
    const formattedContents: any[] = [];
    if (Array.isArray(messages)) {
      for (const m of messages) {
        if (m.text && typeof m.text === 'string') {
          formattedContents.push({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          });
        }
      }
    }

    if (message && typeof message === 'string') {
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    if (formattedContents.length === 0) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || 'عذراً، لم أتمكن من استخراج رد مناسب. يرجى إعادة المحاولة.',
      model: modelToUse,
    });
  } catch (error: any) {
    console.error('Error generating Gemini response in server.ts:', error);
    res.status(500).json({
      error: 'Failed to generate response from Gemini API',
      details: error?.message || 'Unknown server error',
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ofooq Infrastructure Management System running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
