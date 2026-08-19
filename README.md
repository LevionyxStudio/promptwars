# Guardian — AI Personal Safety Net 🛡️

**SafetyNet Challenge — Hackathon Phase 1**

Guardian is an autonomous, AI-powered personal safety check-in application built for individuals walking home alone or commuting late at night. It provides continuous, intelligent monitoring without requiring manual check-in phone calls.

---

## 🌟 How It Works & The Role of AI

1. **Journey Initialization**: The commuter starts their walk with a single tap (**"I'm Walking Home"**).
2. **Autonomous AI Check-In**: Every 30 seconds (configurable demo interval), **Google Gemini AI** generates a dynamic, context-aware, empathetic check-in question (e.g. *"Hey Naman, just checking in — are you near 5th Ave yet? Everything okay?"*).
3. **Sentiment & Crisis Classification**:
   - The user's response is analyzed by **Gemini 2.5 Flash / 1.5 Flash** using a structured JSON classification schema into `SAFE` vs `DISTRESS`.
   - **Distress Triggers**: Explicit danger keywords, subdued/forced panic signals, negative responses, or non-response within a 15-second countdown timeout.
4. **Emergency Dispatch Alert**: If distress is detected, Guardian instantly activates an Emergency Alert View simulating automated SMS dispatches to trusted contacts with live GPS coordinates and street-level context.

---

## 🛠️ Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS v3, Lucide Icons, Canvas-Confetti.
- **Serverless API Proxy**: Vercel Serverless Function (`/api/gemini.js`) protecting the API key server-side.
- **AI Integration**: Google Gemini REST API (`gemini-2.5-flash` & `gemini-1.5-flash`) with client-side fallback intent heuristics.
- **State & Storage**: Client-side React state + `localStorage` for trusted contact persistence.

---

## 🚀 Quick Start & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Gemini API Key
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Deploying to Vercel
When deploying to Vercel, ensure you add `GEMINI_API_KEY` in your Vercel Project Settings:
> **Vercel Dashboard** $\rightarrow$ **Project Settings** $\rightarrow$ **Environment Variables** $\rightarrow$ Add `GEMINI_API_KEY`.

*Note: If left unconfigured, Guardian uses built-in local sentiment heuristics so the entire check-in and distress flow runs offline/demo-ready!*

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```
