import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  AlertOctagon, 
  Clock, 
  Footprints, 
  MapPin, 
  Bot, 
  UserCheck, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { generateCheckInPrompt, classifyUserResponse } from '../services/gemini.js';
import { getDeviceLocation } from '../services/location.js';

export default function ActiveJourney({ 
  journeyData, 
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

  // Response Timeout Timer (15s limit once check-in prompt opens)
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
  }, [isCheckInPending, isClassifying]);

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

  // Handle User Response Submission
  const handleResponseSubmit = async (textToSubmit = userResponseText) => {
    if (isClassifying) return;
    clearInterval(timeoutTimerRef.current);

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
        location: currentLocation
      });
    } else {
      // Safe response -> reset cycle
      setIsCheckInPending(false);
      setUserResponseText('');
      setSecondsLeft(CHECK_IN_INTERVAL);
    }
  };

  // Timeout distress handler
  const handleTimeoutDistress = async () => {
    setIsClassifying(true);
    const classification = await classifyUserResponse({
      userResponse: '',
      promptText: checkInPromptText
    });
    setIsClassifying(false);

    onTriggerAlert({
      reason: 'No response received within safety check-in countdown limit (15s timeout expired)',
      userResponse: '[NO RESPONSE - TIMEOUT EXPIRED]',
      confidence: 1.0,
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
      location: loc
    });
  };

  // SVG progress circle calculation
  const progressPercent = ((CHECK_IN_INTERVAL - secondsLeft) / CHECK_IN_INTERVAL) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;
  const isApproachingZero = secondsLeft <= 5 && secondsLeft > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn transition-all duration-500">
      {/* Active Journey Status Header */}
      <div className="glass-panel glass-panel-interactive p-4 sm:p-5 border-emerald-500/30 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-950/40">
            <Footprints className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-base font-bold text-white font-heading">Active Safety Monitoring</h3>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{journeyData?.destination || 'Walking Home'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Dispatch: {primaryContact?.name}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onSafeArrival}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all duration-300 hover:scale-[1.03] shadow-sm hover:shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>I Arrived Safely</span>
        </button>
      </div>

      {/* Main Countdown Dashboard (When not in pending check-in) */}
      {!isCheckInPending && (
        <div className="glass-panel p-8 border-slate-800 bg-slate-900/70 text-center space-y-6 relative overflow-hidden transition-all duration-500">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next AI Safety Check-In</span>
            <p className="text-xs text-slate-500">Guardian will verify your safety automatically</p>
          </div>

          {/* Countdown Ring with Glowing Pulse near 0 */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
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
                className={`text-4xl font-extrabold font-mono tracking-tight transition-all duration-500 ${
                  isApproachingZero
                    ? 'text-amber-400 glow-text-amber animate-pulse scale-105'
                    : 'text-white glow-text-emerald'
                }`}
              >
                00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-widest mt-1 transition-colors duration-500 ${
                  isApproachingZero ? 'text-amber-400 font-bold' : 'text-emerald-400'
                }`}
              >
                {isApproachingZero ? 'PROMPTING AI...' : 'SECONDS'}
              </span>
            </div>
          </div>

          {/* Quick Manual Check-in Trigger */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSecondsLeft(0);
                triggerCheckInModal();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all duration-300 hover:scale-[1.03]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Trigger Check-In Now</span>
            </button>
          </div>

          {/* Toast of last safe response */}
          {lastClassification && lastClassification.status === 'SAFE' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Last response classified SAFE. Monitoring continues...</span>
            </div>
          )}
        </div>
      )}

      {/* AI Check-in Prompt Modal / Card */}
      {isCheckInPending && (
        <div className="glass-panel p-6 sm:p-8 border-amber-500/40 bg-slate-900/95 space-y-6 shadow-2xl animate-fadeIn relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-heading">AI Safety Check-In</h4>
                <p className="text-xs text-slate-400">Powered by Gemini AI</p>
              </div>
            </div>

            {/* Response Timeout Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{responseTimeoutLeft}s Timeout</span>
            </div>
          </div>

          {/* AI Question Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guardian AI asks:</span>
            </div>
            {isGeneratingPrompt ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Generating dynamic AI check-in message...</span>
              </div>
            ) : (
              <p className="text-base text-slate-100 font-medium leading-relaxed italic">
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
                placeholder="e.g. All good, just turning the corner onto my street"
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium transition-all"
                disabled={isClassifying}
              />
              <button
                onClick={() => handleResponseSubmit()}
                disabled={!userResponseText.trim() || isClassifying}
                className="absolute right-2 top-2 p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
              >
                {isClassifying ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-4 h-4 text-slate-950" />
                )}
              </button>
            </div>

            {/* Quick Action Preset Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleResponseSubmit("I'm safe, almost home!")}
                disabled={isClassifying}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                👍 "I'm safe, almost home!"
              </button>
              <button
                onClick={() => handleResponseSubmit("All good, just walking")}
                disabled={isClassifying}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                👌 "All good, just walking"
              </button>
              <button
                onClick={() => handleResponseSubmit("Someone is following me, I feel unsafe")}
                disabled={isClassifying}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                ⚠️ "Someone is following me!" (Test Distress)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Emergency SOS Trigger Button */}
      <div className="pt-2">
        <button
          onClick={handleManualSos}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-rose-500/10 active:scale-[0.99]"
        >
          <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
          <span>Manual Emergency SOS Trigger</span>
        </button>
      </div>
    </div>
  );
}
