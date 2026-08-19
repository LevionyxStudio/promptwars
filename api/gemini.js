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
      const systemInstruction = `You are a specialized crisis sentiment analyzer for personal safety.
Analyze the user's response to a safety check-in prompt.
Determine if the user is SAFE or in DISTRESS.

Return ONLY a valid JSON object formatted exactly like this:
{
  "status": "SAFE" or "DISTRESS",
  "reasoning": "Brief 1-sentence explanation of why",
  "confidence": 0.0 to 1.0
}

Classify as DISTRESS if:
- Explicit words of danger/fear: "help", "following me", "stalker", "scared", "someone is behind me", "stop", "danger", "call police", "run", "shadow", "creepy"
- Subdued/forced panic signals or standard distress codes (e.g. "code red", "bad", "no", "not safe", "hiding")
- Hesitant, ambiguous distress, or expressing discomfort

Classify as SAFE if:
- Standard positive/neutral updates: "I'm fine", "All good", "Just turning onto my street", "Home soon", "Safe", "Everything is okay"`;

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
              maxOutputTokens: 150
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
