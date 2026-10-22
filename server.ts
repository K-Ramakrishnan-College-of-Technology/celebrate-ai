import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Security: limit body size and parse JSON safely
app.use(express.json({ limit: '2mb' }));

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper: Sanitize string
function sanitizeString(str: any, maxLen = 500): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

// Comprehensive Plan Generator
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const rawType = sanitizeString(req.body.eventType, 50) || 'Celebration';
    const rawTitle = sanitizeString(req.body.title, 120) || 'Special Celebration';
    const rawGuestCount = Math.min(50000, Math.max(1, Number(req.body.guestCount) || 50));
    const rawBudget = Math.min(50000000, Math.max(100, Number(req.body.budget) || 5000));
    const rawVibe = sanitizeString(req.body.vibe, 400) || 'Warm, elegant, and joyful';
    const rawLocation = sanitizeString(req.body.location, 200) || 'Indoor / Outdoor hybrid';
    const rawNotes = sanitizeString(req.body.notes, 500) || 'None';
    const rawDate = sanitizeString(req.body.date, 30) || 'Upcoming';

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unconfigured. Please ensure GEMINI_API_KEY is attached.',
      });
    }

    const prompt = `You are a world-class luxury and community event planner.
Generate a comprehensive celebration plan with high precision, creative flair, and realistic numbers.

Event Details:
- Type: ${rawType}
- Title: ${rawTitle}
- Guest Count: ${rawGuestCount} guests
- Total Budget: $${rawBudget}
- Aesthetic & Vibe: ${rawVibe}
- Location / Setting: ${rawLocation}
- Event Date: ${rawDate}
- Specific Requests / Notes: ${rawNotes}

Provide a structured JSON output with:
1. "creativeVision":
   - "themeTitle": An imaginative, elegant theme name
   - "conceptStatement": 2-sentence evocative description of the guest experience
   - "palette": Array of 4-5 colors, each with "name", "hex" (valid 6-digit hex code e.g. #D4AF37), and "usage"
   - "signatureDrinkOrTreat": Name and brief description of a signature mocktail, cocktail, or artisanal treat
   - "signatureActivity": Standout interactive moment or tradition
   - "atmosphereNotes": Lighting, scents, and floral/decor ambiance notes

2. "budgetCategories":
   Array of 6-8 categories covering the entire $${rawBudget} budget:
   - "category": e.g. "Venue & Rentals", "Catering & Bar", "Photography & Video", "Music & Entertainment", "Florals & Decor", "Favors & Stationery", "Contingency Fund"
   - "percentage": e.g. 35
   - "targetAmount": allocated dollars (must sum up to approximately $${rawBudget})
   - "tips": 1 high-value insider negotiation or cost-saving tip
   - "essential": boolean

3. "timeline":
   Array of 8-12 chronological day-of run-of-show milestones:
   - "time": e.g. "10:00 AM", "01:30 PM", "04:00 PM"
   - "phase": e.g. "Morning Prep", "Arrival & Welcome", "Ceremony / Kickoff", "Dining & Toasts", "Celebration & Dancing", "Send-Off"
   - "title": Concise milestone name
   - "description": What happens, music/cues, guest flow
   - "responsibleParty": Who manages it
   - "bufferMinutes": Number of minutes of safety buffer included

4. "vendors":
   Array of 6-8 essential vendors for this exact celebration:
   - "category": e.g. "Venue", "Catering", "Photographer", "DJ / Band", "Florist", "Cake Designer"
   - "targetBudget": dollar amount
   - "bookingTimeline": when to book relative to event date
   - "keyRequirements": What must be confirmed
   - "topQuestionsToAsk": Array of 3 sharp vetting questions before signing contract
   - "status": "Researching"

5. "ideas":
   Array of 4-6 high-impact ideas:
   - "category": e.g. "Welcome Moment", "Guest Keepsake", "Photo Opportunity", "Entertainment Twist"
   - "title": Creative name
   - "description": Detailed practical idea
   - "estimatedCost": e.g. "$150 - $300"
   - "diyFriendly": boolean`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite event director. Return clean, valid JSON with exact requested structure without markdown fences.',
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '{}';
    const cleaned = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsedData = JSON.parse(cleaned);

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating celebration plan:', error);
    return res.status(500).json({
      error: 'Failed to synthesize celebration plan with AI. Please check inputs and try again.',
    });
  }
});

// Vendor RFP / Outreach Message Generator
app.post('/api/generate-vendor-rfp', async (req: Request, res: Response) => {
  try {
    const rawCategory = sanitizeString(req.body.vendorCategory, 80) || 'Vendor';
    const rawTitle = sanitizeString(req.body.eventTitle, 120) || 'Celebration';
    const rawType = sanitizeString(req.body.eventType, 50) || 'Event';
    const rawDate = sanitizeString(req.body.date, 30) || 'Upcoming date';
    const rawLocation = sanitizeString(req.body.location, 150) || 'Local venue';
    const rawGuestCount = Math.max(1, Number(req.body.guestCount) || 50);
    const rawBudget = Number(req.body.estimatedBudget) || 2000;
    const rawNotes = sanitizeString(req.body.customNotes, 400);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const prompt = `Draft a professional, warm, and highly effective inquiry / RFP email to send to a potential ${rawCategory} for an upcoming celebration.

Event Context:
- Event: ${rawTitle} (${rawType})
- Date: ${rawDate}
- Location: ${rawLocation}
- Guest Count: ${rawGuestCount}
- Allocated Budget for this service: $${rawBudget}
- Special requirements/notes: ${rawNotes || 'Seeking quotes and availability.'}

Draft a complete, polite message including:
- Subject line (clear, includes date and event name)
- Friendly greeting and enthusiasm for their work
- Key event specs clearly bulleted (date, venue, guest count, estimated hours)
- Specific services needed
- Request for sample packages, pricing guide, and scheduling a brief discovery call
- Clear call-to-action`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You write concise, warm, professional vendor inquiries that get fast, prioritized replies.',
      },
    });

    return res.json({ rfpMessage: response.text });
  } catch (error: any) {
    console.error('Error drafting vendor RFP:', error);
    return res.status(500).json({ error: 'Failed to generate RFP message.' });
  }
});

// Budget Optimization & Advice
app.post('/api/optimize-budget', async (req: Request, res: Response) => {
  try {
    const rawBudget = Number(req.body.totalBudget) || 5000;
    const rawType = sanitizeString(req.body.eventType, 50) || 'Celebration';
    const rawGuestCount = Number(req.body.guestCount) || 50;
    const currentExpenses = Array.isArray(req.body.currentExpenses) ? req.body.currentExpenses.slice(0, 50) : [];

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const prompt = `Analyze this event budget and provide expert optimization advice.
Event Type: ${rawType}
Guest Count: ${rawGuestCount}
Total Budget: $${rawBudget}
Current Itemized Expenses:
${JSON.stringify(currentExpenses, null, 2)}

Provide JSON response with:
1. "summaryAnalysis": 2 sentences assessing whether budget is on track, under, or over-extended.
2. "costSavingHacks": Array of 3-4 specific high-impact tactics to save money without sacrificing guest experience.
3. "reallocationSuggestions": Array of 2-3 categories where funds should be increased or decreased.
4. "negotiationTips": 2 practical tips when discussing contracts with vendors.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error optimizing budget:', error);
    return res.status(500).json({ error: 'Failed to optimize budget.' });
  }
});

// Toast & Speech Generator
app.post('/api/generate-speech', async (req: Request, res: Response) => {
  try {
    const rawRole = sanitizeString(req.body.speakerRole, 60) || 'Friend';
    const rawHonoree = sanitizeString(req.body.honoreeName, 80) || 'Guest of Honor';
    const rawRelationship = sanitizeString(req.body.relationship, 100) || 'Close friend';
    const rawTone = sanitizeString(req.body.tone, 80) || 'Warm, heartfelt';
    const rawStories = sanitizeString(req.body.memorableStories, 500) || 'Celebration of love and adventures.';
    const rawType = sanitizeString(req.body.eventType, 50) || 'Celebration';

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const prompt = `Write a memorable celebration speech/toast.
- Speaker Role: ${rawRole}
- Honoree/Celebrant: ${rawHonoree}
- Relationship: ${rawRelationship}
- Event Type: ${rawType}
- Desired Tone: ${rawTone}
- Personal details & anecdotes: ${rawStories}

Output JSON with:
1. "title": catchy speech title
2. "estimatedDuration": e.g. "3-4 minutes (around 450 words)"
3. "speechText": Full speech formatted with stage delivery cues in brackets (e.g. [Pause for laughter], [Look toward Sarah], [Raise glass])
4. "deliveryTips": Array of 3 practical advice items for speaking comfortably in front of guests`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating speech:', error);
    return res.status(500).json({ error: 'Failed to generate speech.' });
  }
});

// Quick Interactive Brainstorm
app.post('/api/brainstorm-ideas', async (req: Request, res: Response) => {
  try {
    const rawType = sanitizeString(req.body.eventType, 50) || 'Celebration';
    const rawTopic = sanitizeString(req.body.topic, 100) || 'Creative ideas';
    const rawVibe = sanitizeString(req.body.vibe, 200) || 'Joyful';
    const rawGuestCount = Number(req.body.guestCount) || 50;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const prompt = `Brainstorm 5 innovative, charming ideas for a celebration.
- Event Type: ${rawType}
- Focus Area / Topic: ${rawTopic}
- Vibe: ${rawVibe}
- Guest Count: ${rawGuestCount}

Return JSON array of 5 objects, each with:
- "title": Catchy idea name
- "description": Practical, delightful description
- "proTip": 1 insider tip to execute it smoothly
- "costLevel": "$" | "$$" | "$$$"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    return res.json({ ideas: parsed });
  } catch (error: any) {
    console.error('Error brainstorming:', error);
    return res.status(500).json({ error: 'Failed to brainstorm ideas.' });
  }
});

// Setup Vite Dev Server Middleware or Static Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    const fs = await import('fs');
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const rawTemplate = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const template = await vite.transformIndexHtml(url, rawTemplate);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const serverPort = Number(process.env.PORT) || 3000;
  app.listen(serverPort, '0.0.0.0', () => {
    console.log(`Celebration & Event Planner server listening on http://0.0.0.0:${serverPort}`);
  });
}

startServer();
