/**
 * Guardian Gemini AI Frontend Service
 * Calls the Vercel Serverless Function /api/gemini securely.
 * Includes local behavioral fallback intent heuristics if the endpoint is unavailable.
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
 * Classify user response into SAFE or DISTRESS with behavioral reasoning & confidence score.
 * Calls /api/gemini serverless function or falls back to local behavioral heuristics.
 */
export const classifyUserResponse = async ({ userResponse = '', promptText = '' }) => {
  const trimmed = userResponse.trim();

  // Non-response or expired countdown is classified as automatic high distress
  if (!trimmed) {
    return {
      status: 'DISTRESS',
      reasoning: 'No response received within safety check-in countdown limit (15s timeout expired)',
      confidence: 1.0,
      urgencyLevel: 'HIGH',
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
    const isDistress = parsed.status?.toUpperCase() === 'DISTRESS';
    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : (isDistress ? 0.85 : 0.95);

    let urgencyLevel = parsed.urgencyLevel?.toUpperCase();
    if (!urgencyLevel) {
      if (!isDistress) urgencyLevel = 'LOW';
      else urgencyLevel = confidence >= 0.75 ? 'HIGH' : 'MEDIUM';
    }

    return {
      status: isDistress ? 'DISTRESS' : 'SAFE',
      reasoning: parsed.reasoning || localClassification.reasoning,
      confidence: Math.min(1.0, Math.max(0.0, confidence)),
      urgencyLevel: urgencyLevel
    };
  } catch {
    return localClassification;
  }
};

/**
 * Local fallback heuristics for robust offline behavioral & intent evaluation
 */
const evaluateLocalHeuristics = (text) => {
  const lower = text.toLowerCase().trim();

  // 1. Explicit Danger/Threat Keywords (High Urgency)
  const highDistressKeywords = [
    'help', 'scared', 'follow', 'following', 'behind', 'creep', 'creepy',
    'stalker', 'run', 'running', 'danger', '112', '911', 'police', 'stop', 'shadow',
    'hiding', 'grabbed', 'knife', 'gun', 'threat', 'unsafe', 'scary', 'someone',
    'code red', 'sos', 'watch out', 'attack'
  ];

  const highMatch = highDistressKeywords.find(word => lower.includes(word));
  if (highMatch) {
    return {
      status: 'DISTRESS',
      reasoning: `High distress signal recognized: Response explicitly mentions fear or threat indicator ("${highMatch}").`,
      confidence: 0.95,
      urgencyLevel: 'HIGH',
      keywordTriggered: highMatch
    };
  }

  // 2. Contradiction (combines safe words with suspicious context)
  if ((lower.includes('fine') || lower.includes('good')) && (lower.includes('close') || lower.includes('fast') || lower.includes('man') || lower.includes('guy') || lower.includes('behind'))) {
    return {
      status: 'DISTRESS',
      reasoning: 'Behavioral contradiction detected: User claims safety while describing concerning surrounding environment.',
      confidence: 0.82,
      urgencyLevel: 'HIGH'
    };
  }

  // 3. Forced-Calm / Overly Reassuring Phrases (Medium Urgency)
  const forcedCalmPhrases = [
    'totally fine', 'nothing wrong', 'trust me', 'don\'t ask', 'don\'t worry',
    'everything is fine', 'all good stop asking', 'no need to check'
  ];
  if (forcedCalmPhrases.some(phrase => lower.includes(phrase))) {
    return {
      status: 'DISTRESS',
      reasoning: 'Behavioral anomaly detected: Forced-calm or overly reassuring phrasing inconsistent with natural check-in behavior.',
      confidence: 0.68,
      urgencyLevel: 'MEDIUM'
    };
  }

  // 4. Hesitation / Deflection / Non-Answers (Medium Urgency)
  const hesitationKeywords = [
    'why', 'who is this', 'what time', 'huh', 'umm', 'wait', 'idk', 'dunno',
    'what do you mean', 'why ask', 'leave me'
  ];
  if (hesitationKeywords.some(word => lower.includes(word))) {
    return {
      status: 'DISTRESS',
      reasoning: 'Behavioral anomaly detected: Hesitation or non-answer deflecting safety confirmation.',
      confidence: 0.65,
      urgencyLevel: 'MEDIUM'
    };
  }

  // 5. Unusual Brevity under pressure (single character or 1-word text e.g. "fine", "k", "ok", ".")
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length === 1 && (['fine', 'k', 'ok', '.', 'shh', 'busy'].includes(lower) || lower.length <= 2)) {
    return {
      status: 'DISTRESS',
      reasoning: `Behavioral anomaly detected: Unusual single-word brevity ("${lower}") under check-in pressure.`,
      confidence: 0.62,
      urgencyLevel: 'MEDIUM'
    };
  }

  // 6. Natural Safe Response
  return {
    status: 'SAFE',
    reasoning: 'Response indicates normal journey progress with uncoerced safety confirmation.',
    confidence: 0.95,
    urgencyLevel: 'LOW'
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
