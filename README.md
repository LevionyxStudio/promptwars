# Guardian — AI Personal Safety Net 🛡️

**SafetyNet Challenge — Hackathon Phase 1 & Phase 2**

Guardian is an autonomous, AI-powered personal safety check-in application built for individuals walking home alone or commuting late at night. It provides continuous, intelligent monitoring without requiring manual phone calls.

---

## 🌟 How It Works & The Role of AI

1. **Journey Initialization**: The commuter starts their walk with a single tap (**"I'm Walking Home"**).
2. **Autonomous AI Check-In**: Every 30 seconds (configurable demo interval), **Google Gemini AI** generates a dynamic, context-aware, empathetic check-in question (e.g. *"Hey Naman, just checking in — are you near 5th Ave yet? Everything okay?"*).
3. **Phase 2 Deeper Behavioral Distress Reasoning**:
   - Instead of simple keyword matching, **Gemini 2.5 Flash / 1.5 Flash** evaluates deep psychological and behavioral distress signals:
     - **Unusual Brevity**: Single-word / minimal answers under pressure (e.g. `"fine"`, `"k"`, `"."`).
     - **Forced-Calm**: Artificial, overly reassuring language (e.g. `"everything is 100% fine don't worry"`).
     - **Hesitation & Deflection**: Non-answers avoiding safety confirmation (e.g. `"why are you asking?"`, `"who is this?"`).
     - **Contradictions**: Combining safe words with concerning context (e.g. `"I'm fine but someone is walking close behind me"`).
   - Returns a confidence score (`0.0` - `1.0`), assigned `urgencyLevel` (`MEDIUM` vs `HIGH`), and a short 1-2 sentence human-readable behavioral explanation.
4. **Phase 2 Smart Alert Prioritization & Urgency Tiers**:
   - **Medium Confidence (50-74%)**: Dispatches a **Medium Advisory Check-In** notification to the **Primary Contact ONLY** with a non-panic *"check on them"* tone.
   - **High Confidence (75%+)**: Dispatches a **High Urgent Emergency Alert** to **ALL Trusted Contacts** with full emergency dispatch framing.
5. **Emergency Dispatch & Geolocation**: Live GPS coordinates (`navigator.geolocation`) with interactive Google Maps links and simulated SMS dispatch previews.

---

## 🛠️ Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS v3, Lucide Icons, Canvas-Confetti.
- **Serverless API Proxy**: Vercel Serverless Function (`/api/gemini.js`) protecting the API key server-side.
- **AI Engine**: Google Gemini REST API (`gemini-2.5-flash` & `gemini-1.5-flash`) with robust offline behavioral fallback heuristics.
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

*Note: If left unconfigured, Guardian uses built-in local behavioral sentiment heuristics so the entire check-in and distress flow runs offline/demo-ready!*

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```
