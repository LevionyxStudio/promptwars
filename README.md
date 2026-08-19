# Guardian — AI Personal Safety Net 🛡️

**SafetyNet Challenge — Personal Safety Companion**

Guardian is an autonomous, AI-powered personal safety check-in application built for individuals walking home alone or commuting late at night. It provides continuous, intelligent monitoring, behavioral distress detection, sustained unresponsiveness tracking, and instant cloud-synced emergency notifications without requiring manual phone calls.

---

## 🌟 Key Features & AI Capabilities

1. **Google Sign-In & Cloud Firestore Sync**:
   - Universal Google Sign-In authentication (`firebase/auth`).
   - Real-time cloud sync for trusted contacts stored under `users/{uid}/contacts` using Cloud Firestore.

2. **Autonomous AI Safety Check-Ins**:
   - Every 30 seconds (configurable demo interval), **Google Gemini AI** generates dynamic, context-aware check-in questions tailored to the commuter's journey.

3. **Behavioral Distress Sentiment Analysis**:
   - **Gemini 2.5 Flash / 1.5 Flash** evaluates deep psychological and behavioral distress signals beyond simple keyword matching:
     - **Unusual Brevity**: Single-character or minimal answers under pressure (e.g. `"fine"`, `"k"`, `"."`).
     - **Forced-Calm**: Artificial, overly reassuring language (e.g. `"everything is 100% fine don't worry"`).
     - **Hesitation & Deflection**: Non-answers avoiding safety confirmation (e.g. `"why are you asking?"`).
     - **Contradictions**: Combining safe phrases with concerning context.
   - Returns a confidence score (`0.0` - `1.0`), assigned `urgencyLevel` (`MEDIUM` vs `HIGH`), and human-readable behavioral reasoning.

4. **Sustained Unresponsiveness Escalation (Phase 3)**:
   - Tracks consecutive missed check-in countdowns across the journey.
   - If **2 consecutive check-ins are missed**, Guardian automatically triggers a critical emergency dispatch to ALL contacts with distinct unresponsiveness alert framing.

5. **Hands-Free Safe Word Confirmation**:
   - Allows setting a custom safe word (e.g. `"pineapple"`) during journey setup. Typing the safe word during any check-in instantly validates safety hands-free.

6. **Smart Alert Prioritization & Emergency Dispatch**:
   - **Medium Confidence (50-74%)**: Dispatches a non-panic advisory check-in to the **Primary Contact ONLY**.
   - **High Confidence (75%+) / 2 Missed Check-Ins**: Dispatches an urgent emergency alert to **ALL Trusted Contacts**.
   - Live browser GPS coordinates (`navigator.geolocation`) with Google Maps links and direct India 112 emergency dialer support.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS v3, Lucide Icons, Canvas-Confetti.
- **Authentication & Cloud Database**: Firebase Auth (Google Sign-In) & Cloud Firestore (`users/{uid}/contacts`).
- **Serverless API Proxy**: Vercel Serverless Function (`/api/gemini.js`) protecting `GEMINI_API_KEY` server-side with 8s `AbortController` timeout protection.
- **AI Engine**: Google Gemini REST API (`gemini-2.5-flash` & `gemini-1.5-flash`) with robust offline behavioral fallback heuristics.

---

## 🚀 Quick Start & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (see `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
