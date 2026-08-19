/**
 * Vercel Serverless Function — Guardian Gemini AI Proxy
 * Protects the GEMINI_API_KEY from exposure to client-side bundles.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable missing on server' });
  }

  const { action, payload } = req.body || {};

  try {
    if (action === 'generate') {
      const { userName = 'there', contactName = 'your emergency contact', elapsedSeconds = 30, locationName = 'en route' } = payload || {};
      const promptText = `You are Guardian AI, a personal safety companion for someone walking home alone or commuting late at night.
User name: "${userName}".
Elapsed time: ${elapsedSeconds} seconds near "${locationName}".
Trusted contact: "${contactName}".

Generate a brief, warm, natural check-in message (1 to 2 sentences max) asking if they feel safe. Keep it natural like a caring friend checking in.`;

      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { maxOutputTokens: 100, temperature: 0.7 }
          })
        }
      );

      if (!response.ok) {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { maxOutputTokens: 100, temperature: 0.7 }
            })
          }
        );
      }

      if (!response.ok) {
        return res.status(502).json({ error: 'Gemini API call failed' });
      }

      const data = await response.json();
      const generatedMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return res.status(200).json({ promptText: generatedMessage });
    }

    if (action === 'classify') {
      const { userResponse = '', promptText = '' } = payload || {};

      const systemInstruction = `You are a specialized behavioral & crisis sentiment analyzer for personal safety monitoring during late-night walks.
Analyze the user's response to a safety check-in prompt.
Reason deeply about genuine behavioral and psychological signals — do NOT rely solely on simple keyword matching.

Evaluate for the following subtle behavioral distress signals:
1. UNUSUAL BREVITY or single-character/one-word answers under pressure (e.g. "k", "fine", "ok", ".", "shh", "wait")
2. FORCED-CALM or OVERLY REASSURING language that feels artificial, unnatural, or forced (e.g. "everything is totally 100% fine do not worry", "nothing wrong at all trust me", "all great don't ask")
3. HESITATION, DEFLECTION, or NON-ANSWERS avoiding safety confirmation (e.g. "why are you asking?", "what time is it?", "who is this?", "umm...", "wait a second", "never mind")
4. CONTRADICTIONS (e.g. "I'm fine but someone is walking really close behind me", "all good just running fast", "safe but scared")
5. EXPLICIT DANGER or fear: "help", "following me", "stalker", "scared", "someone is behind me", "danger", "call police", "run", "shadow"

Return ONLY a valid JSON object formatted exactly like this:
{
  "status": "SAFE" or "DISTRESS",
  "confidence": float between 0.00 and 1.00,
  "reasoning": "A short, insightful 1-2 sentence human-readable behavioral explanation of why you classified it this way.",
  "urgencyLevel": "LOW" (for SAFE) or "MEDIUM" (subtle/hesitant distress, confidence 0.50-0.74) or "HIGH" (urgent/explicit distress, confidence >= 0.75)
}

SCORING RULES FOR DISTRESS:
- For subtle hesitation, one-word brevity, or forced-calm responses: set status = "DISTRESS", confidence = 0.50 - 0.74, urgencyLevel = "MEDIUM".
- For explicit threat, clear fear, or contradiction with danger: set status = "DISTRESS", confidence = 0.75 - 1.00, urgencyLevel = "HIGH".
- For clear, natural, uncoerced confirmation of safety: set status = "SAFE", confidence = 0.90 - 1.00, urgencyLevel = "LOW".`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: systemInstruction },
                { text: `Check-in Prompt: "${promptText}"\nUser Response: "${userResponse}"` }
              ]
            }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              maxOutputTokens: 200
            }
          })
        }
      );

      if (!response.ok) {
        return res.status(502).json({ error: 'Gemini API classification failed' });
      }

      const data = await response.json();
      const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!rawJsonText) {
        return res.status(502).json({ error: 'Empty response from Gemini' });
      }

      const parsed = JSON.parse(rawJsonText);
      return res.status(200).json(parsed);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
