import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Send, 
  Sparkles, 
  AlertOctagon, 
  Clock, 
  Footprints, 
  MapPin, 
  Bot, 
  Loader2,
  Key,
  AlertTriangle
} from 'lucide-react';
import { generateCheckInPrompt, classifyUserResponse } from '../services/gemini.js';
import { getDeviceLocation } from '../services/location.js';

export default function ActiveJourney({ 
  journeyData, 
  contacts = [],
  primaryContact, 
  onTriggerAlert, 
  onSafeArrival 
}) {
  const CHECK_IN_INTERVAL = 30; // 30 seconds interval
  const RESPONSE_TIMEOUT = 15; // 15 seconds to reply

  const [secondsLeft, setSecondsLeft] = useState(CHECK_IN_INTERVAL);
  const [isCheckInPending, setIsCheckInPending] = useState(false);
  const [checkInPromptText, setCheckInPromptText] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [userResponseText, setUserResponseText] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [responseTimeoutLeft, setResponseTimeoutLeft] = useState(RESPONSE_TIMEOUT);
  const [lastClassification, setLastClassification] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(journeyData?.location || null);

  // Phase 3: Track consecutive missed check-ins across the journey
  const [consecutiveMissedCheckins, setConsecutiveMissedCheckins] = useState(0);
  // Cycle key to force response timeout timer effect to restart on follow-up check-ins
  const [timeoutCycleKey, setTimeoutCycleKey] = useState(0);

  const safeWord = journeyData?.safeWord || 'pineapple';

  const mainTimerRef = useRef(null);
  const timeoutTimerRef = useRef(null);

  // Sync location from journeyData or fetch on mount if missing
  useEffect(() => {
    if (journeyData?.location) {
      setCurrentLocation(journeyData.location);
    } else {
      getDeviceLocation().then(loc => setCurrentLocation(loc));
    }
  }, [journeyData]);

  // Main 30-Second Check-in Countdown Timer
  useEffect(() => {
    if (isCheckInPending) return;

    mainTimerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(mainTimerRef.current);
          triggerCheckInModal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(mainTimerRef.current);
  }, [isCheckInPending]);

  // Response Timeout Timer (15s limit once check-in prompt opens, restarts on timeoutCycleKey change)
  useEffect(() => {
    if (!isCheckInPending || isClassifying) return;

    timeoutTimerRef.current = setInterval(() => {
      setResponseTimeoutLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeoutTimerRef.current);
          handleTimeoutDistress();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timeoutTimerRef.current);
  }, [isCheckInPending, isClassifying, timeoutCycleKey]);

  // Trigger Check-in Prompter
  const triggerCheckInModal = async () => {
    setIsCheckInPending(true);
    setIsGeneratingPrompt(true);
    setResponseTimeoutLeft(RESPONSE_TIMEOUT);

    const promptText = await generateCheckInPrompt({
      userName: 'Commuter',
      contactName: primaryContact?.name || 'Trusted Contact',
      elapsedSeconds: CHECK_IN_INTERVAL,
      locationName: journeyData?.destination || 'Walking Home'
    });

    setCheckInPromptText(promptText);
    setIsGeneratingPrompt(false);
  };

  // Handle User Response Submission & Behavioral Analysis
  const handleResponseSubmit = async (textToSubmit = userResponseText) => {
    if (isClassifying) return;
    clearInterval(timeoutTimerRef.current);

    const trimmedInput = textToSubmit.trim().toLowerCase();
    const isSafeWordMatch = trimmedInput === safeWord.toLowerCase();

    // Hands-free Safe Word instant confirmation
    if (isSafeWordMatch) {
      setConsecutiveMissedCheckins(0); // RESET missed counter
      setLastClassification({ status: 'SAFE', reasoning: `Safe word '${safeWord}' verified.` });
      setIsCheckInPending(false);
      setUserResponseText('');
      setSecondsLeft(CHECK_IN_INTERVAL);
      return;
    }

    setIsClassifying(true);
    const classification = await classifyUserResponse({
      userResponse: textToSubmit,
      promptText: checkInPromptText
    });

    setIsClassifying(false);
    setLastClassification(classification);

    if (classification.status === 'DISTRESS') {
      onTriggerAlert({
        reason: classification.reasoning,
        userResponse: textToSubmit || '(No Response / Ambiguous)',
        confidence: classification.confidence,
        urgencyLevel: classification.urgencyLevel || (classification.confidence >= 0.75 ? 'HIGH' : 'MEDIUM'),
        location: currentLocation
      });
    } else {
      // Safe response -> RESET consecutive missed counter & restart cycle
      setConsecutiveMissedCheckins(0);
      setIsCheckInPending(false);
      setUserResponseText('');
      setSecondsLeft(CHECK_IN_INTERVAL);
    }
  };

  // Phase 3 Fix 1: Consecutive Missed Check-In Handler with timeoutCycleKey restart
  const handleTimeoutDistress = async () => {
    const newMissedCount = consecutiveMissedCheckins + 1;
    setConsecutiveMissedCheckins(newMissedCount);

    if (newMissedCount >= 2) {
      // 2 consecutive missed check-ins -> Trigger HIGHEST urgency tier alert automatically!
      onTriggerAlert({
        reason: `User has been unresponsive for ${newMissedCount} consecutive check-in cycles across multiple check-ins (sustained unresponsiveness)`,
        userResponse: `[SUSTAINED UNRESPONSIVENESS - ${newMissedCount} MISSED CHECK-INS]`,
        confidence: 1.0,
        urgencyLevel: 'HIGH',
        isUnresponsiveAlert: true,
        missedCheckinsCount: newMissedCount,
        location: currentLocation
      });
    } else {
      // First missed check-in -> Prompt follow-up check-in & restart timeout timer via timeoutCycleKey
      setResponseTimeoutLeft(RESPONSE_TIMEOUT);
      setTimeoutCycleKey((prev) => prev + 1);
      setCheckInPromptText(`⚠️ URGENT FOLLOW-UP (Check-in 1/2 missed): Are you okay? Please confirm your safety or enter your safe word.`);
    }
  };

  // Preset button to simulate 2 consecutive missed check-ins
  const handleSimulateUnresponsive = () => {
    onTriggerAlert({
      reason: `User has been unresponsive for 2 consecutive check-in cycles across multiple check-ins`,
      userResponse: `[SUSTAINED UNRESPONSIVENESS - 2 MISSED CHECK-INS]`,
      confidence: 1.0,
      urgencyLevel: 'HIGH',
      isUnresponsiveAlert: true,
      missedCheckinsCount: 2,
      location: currentLocation
    });
  };

  // Manual SOS trigger handler with location fetch
  const handleManualSos = async () => {
    let loc = currentLocation;
    if (!loc || !loc.isLiveGps) {
      loc = await getDeviceLocation();
      setCurrentLocation(loc);
    }

    onTriggerAlert({
      reason: 'Manual SOS Emergency Trigger activated by user',
      userResponse: '[MANUAL SOS BUTTON PRESS]',
      confidence: 1.0,
      urgencyLevel: 'HIGH',
      location: loc
    });
  };

  // SVG progress circle calculation
  const progressPercent = ((CHECK_IN_INTERVAL - secondsLeft) / CHECK_IN_INTERVAL) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;
  const isApproachingZero = secondsLeft <= 5 && secondsLeft > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 animate-fadeIn transition-all duration-500 px-1 sm:px-0">
      {/* Active Journey Status Header */}
      <div className="glass-panel glass-panel-interactive p-4 sm:p-5 border-emerald-500/30 bg-slate-900/90 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-950/40 shrink-0">
            <Footprints className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate">Active Safety Monitoring</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-none">{journeyData?.destination || 'Walking Home'}</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 truncate max-w-[120px] sm:max-w-none">Safe Word: <strong className="text-cyan-300 font-mono">{safeWord}</strong></span>
            </p>
          </div>
        </div>

        <button
          onClick={onSafeArrival}
          className="w-full xs:w-auto flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-emerald-500/20 shrink-0"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>I Arrived Safely</span>
        </button>
      </div>

      {/* Consecutive Missed Check-In Warning Banner */}
      {consecutiveMissedCheckins > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Warning:</strong> {consecutiveMissedCheckins}/2 missed check-ins. A 2nd missed check-in will trigger an emergency dispatch.</span>
          </div>
          <button
            onClick={() => handleResponseSubmit(safeWord)}
            className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-bold text-[11px] hover:bg-amber-300 transition-all shrink-0"
          >
            Clear Counter
          </button>
        </div>
      )}

      {/* Main Countdown Dashboard (When not in pending check-in) */}
      {!isCheckInPending && (
        <div className="glass-panel p-5 sm:p-8 border-slate-800 bg-slate-900/70 text-center space-y-5 sm:space-y-6 relative overflow-hidden transition-all duration-500">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Next AI Safety Check-In</span>
            <p className="text-[11px] sm:text-xs text-slate-500">Guardian will verify your safety automatically</p>
          </div>

          {/* Countdown Ring */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-slate-800 stroke-current"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`stroke-current transition-all duration-1000 ease-linear ${
                  isApproachingZero
                    ? 'text-amber-400 animate-pulse drop-shadow-[0_0_16px_rgba(245,158,11,0.9)]'
                    : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                }`}
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight transition-all duration-500 ${
                  isApproachingZero
                    ? 'text-amber-400 glow-text-amber animate-pulse scale-105'
                    : 'text-white glow-text-emerald'
                }`}
              >
                00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest mt-0.5 sm:mt-1 transition-colors duration-500 ${
                  isApproachingZero ? 'text-amber-400 font-bold' : 'text-emerald-400'
                }`}
              >
                {isApproachingZero ? 'PROMPTING AI...' : 'SECONDS'}
              </span>
            </div>
          </div>

          {/* Quick Manual Check-in Trigger & Safe Word */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:pt-2">
            <button
              onClick={() => {
                setSecondsLeft(0);
                triggerCheckInModal();
              }}
              className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all duration-300 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Trigger Check-In Now</span>
            </button>

            <button
              onClick={() => handleResponseSubmit(safeWord)}
              className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all duration-300 active:scale-95"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Safe Word ('{safeWord}')</span>
            </button>
          </div>

          {/* Toast of last safe response */}
          {lastClassification && lastClassification.status === 'SAFE' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-center gap-2 animate-fadeIn leading-snug">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Last response classified SAFE ({lastClassification.reasoning}). Monitoring continues...</span>
            </div>
          )}
        </div>
      )}

      {/* AI Check-in Prompt Modal / Card */}
      {isCheckInPending && (
        <div className="glass-panel p-4 sm:p-8 border-amber-500/40 bg-slate-900/95 space-y-5 sm:space-y-6 shadow-2xl animate-fadeIn relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 sm:pb-4 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white font-heading">AI Safety Check-In</h4>
                <p className="text-[11px] text-slate-400">Gemini Behavioral Analysis Active</p>
              </div>
            </div>

            {/* Response Timeout Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold animate-pulse shrink-0">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{responseTimeoutLeft}s Timeout</span>
            </div>
          </div>

          {/* AI Question Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guardian AI asks:</span>
            </div>
            {isGeneratingPrompt ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                <span>Generating dynamic AI check-in message...</span>
              </div>
            ) : (
              <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed italic">
                "{checkInPromptText}"
              </p>
            )}
          </div>

          {/* User Response Input Form */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Your Response
            </label>
            <div className="relative">
              <input
                type="text"
                value={userResponseText}
                onChange={(e) => setUserResponseText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userResponseText.trim()) {
                    handleResponseSubmit();
                  }
                }}
                placeholder={`e.g. All good, or type '${safeWord}'`}
                className="w-full min-h-[48px] pl-3.5 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium transition-all"
                disabled={isClassifying}
              />
              <button
                onClick={() => handleResponseSubmit()}
                disabled={!userResponseText.trim() || isClassifying}
                className="absolute right-2 top-2 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-40 transition-all active:scale-95"
              >
                {isClassifying ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-4 h-4 text-slate-950" />
                )}
              </button>
            </div>

            {/* Quick Action Presets (Phase 2 & Phase 3) */}
            <div className="space-y-2 pt-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Simulation Presets (Click to Test):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleResponseSubmit("I'm safe, almost home!")}
                  disabled={isClassifying}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all active:scale-95"
                >
                  👍 Safe Confirmation
                </button>
                <button
                  onClick={() => handleResponseSubmit(safeWord)}
                  disabled={isClassifying}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all active:scale-95"
                >
                  🔑 Safe Word ('{safeWord}')
                </button>
                <button
                  onClick={() => handleResponseSubmit("fine")}
                  disabled={isClassifying}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all active:scale-95"
                >
                  🔍 "fine" (Subtle Brevity)
                </button>
                <button
                  onClick={handleSimulateUnresponsive}
                  disabled={isClassifying}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-extrabold transition-all active:scale-95"
                  title="Simulates 2 consecutive missed check-ins (Phase 3 Sustained Unresponsiveness)"
                >
                  🚨 2 Missed Check-Ins (Unresponsive)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Emergency SOS Trigger Button */}
      <div className="pt-1 sm:pt-2">
        <button
          onClick={handleManualSos}
          className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs sm:text-sm transition-all duration-300 active:scale-[0.98]"
        >
          <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse shrink-0" />
          <span>Manual Emergency SOS Trigger</span>
        </button>
      </div>
    </div>
  );
}
