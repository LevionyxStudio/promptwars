/**
 * Guardian Gemini AI Frontend Service
 * Calls the Vercel Serverless Function /api/gemini securely.
 * Includes local fallback intent heuristics if the endpoint is unavailable.
 */

/**
 * Generate a dynamic, empathetic AI check-in message tailored to the user's journey.
 */
export const generateCheckInPrompt = async ({ 
  userName = 'there', 
  contactName = 'your emergency contact', 
  elapsedSeconds = 30, 
  locationName = 'en route' 
}) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        payload: { userName, contactName, elapsedSeconds, locationName }
      })
    });

    if (!response.ok) {
      return getFallbackCheckInPrompt(userName);
    }

    const data = await response.json();
    return data.promptText || getFallbackCheckInPrompt(userName);
  } catch {
    return getFallbackCheckInPrompt(userName);
  }
};

/**
 * Classify user response into SAFE or DISTRESS via /api/gemini serverless function.
 * Falls back to local sentiment heuristics if API is unavailable.
 */
export const classifyUserResponse = async ({ userResponse = '', promptText = '' }) => {
  const trimmed = userResponse.trim();

  // Non-response or expired countdown is classified as automatic distress
  if (!trimmed) {
    return {
      status: 'DISTRESS',
      reasoning: 'No response received within safety timeout limit',
      confidence: 1.0,
      keywordTriggered: 'TIMEOUT'
    };
  }

  const localClassification = evaluateLocalHeuristics(trimmed);

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'classify',
        payload: { userResponse: trimmed, promptText }
      })
    });

    if (!response.ok) {
      return localClassification;
    }

    const parsed = await response.json();
    return {
      status: parsed.status?.toUpperCase() === 'DISTRESS' ? 'DISTRESS' : 'SAFE',
      reasoning: parsed.reasoning || localClassification.reasoning,
      confidence: parsed.confidence || 0.95
    };
  } catch {
    return localClassification;
  }
};

/**
 * Local fallback heuristics for robust offline/no-key intent evaluation
 */
const evaluateLocalHeuristics = (text) => {
  const lower = text.toLowerCase();
  const distressKeywords = [
    'help', 'scared', 'follow', 'following', 'behind', 'creep', 'creepy',
    'stalker', 'run', 'running', 'danger', '911', 'police', 'stop', 'shadow',
    'hiding', 'grabbed', 'knife', 'gun', 'threat', 'unsafe', 'not good',
    'scary', 'someone', 'code red', 'sos', 'watch out'
  ];

  const matched = distressKeywords.find(word => lower.includes(word));
  if (matched) {
    return {
      status: 'DISTRESS',
      reasoning: `Distress indicator detected in response (matched word: "${matched}")`,
      confidence: 0.98,
      keywordTriggered: matched
    };
  }

  if (['no', 'not safe', 'bad', 'send help', 'sos'].includes(lower)) {
    return {
      status: 'DISTRESS',
      reasoning: 'Explicit negative response received during safety check-in',
      confidence: 0.99
    };
  }

  return {
    status: 'SAFE',
    reasoning: 'Response indicates normal journey progress with no safety threats detected',
    confidence: 0.92
  };
};

const getFallbackCheckInPrompt = (userName) => {
  const prompts = [
    `Hey ${userName}, Guardian safety check-in here! Just checking — is your walk going smoothly?`,
    `Hi ${userName}, hope your walk is going well. Reply here to confirm you feel safe.`,
    `Safety Check-in: Hey ${userName}, are you near your destination? Everything okay?`
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
};
