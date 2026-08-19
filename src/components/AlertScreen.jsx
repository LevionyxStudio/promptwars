import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  MessageSquare, 
  User, 
  Navigation,
  ExternalLink,
  Copy,
  Bug,
  BrainCircuit,
  BellRing,
  Clock
} from 'lucide-react';

export default function AlertScreen({ alertData, contacts = [], primaryContact, onResetJourney }) {
  const [copiedLocation, setCopiedLocation] = useState(false);

  const isUnresponsiveAlert = alertData?.isUnresponsiveAlert || alertData?.missedCheckinsCount >= 2;

  // Confidence Tier Threshold: >= 75% triggers High Urgent Emergency (All contacts); < 75% triggers Medium Advisory Check-In (Primary contact only)
  const confidence = isUnresponsiveAlert ? 1.0 : (alertData?.confidence ?? 0.95);
  const isHighUrgency = isUnresponsiveAlert || confidence >= 0.75 || alertData?.urgencyLevel === 'HIGH';

  // Smart Contact Filtering: Medium Confidence notifies ONLY Primary Contact; High Confidence notifies ALL Contacts
  const notifiedContacts = isHighUrgency
    ? (contacts.length > 0 ? contacts : [primaryContact].filter(Boolean))
    : [primaryContact || contacts[0]].filter(Boolean);

  const location = alertData?.location || {
    latitude: 28.613939,
    longitude: 77.209021,
    address: 'Connaught Place, New Delhi, India',
    accuracyMeters: 25,
    isLiveGps: false,
    fallbackNote: 'Location permission denied — showing default location',
    rawError: { code: 1, codeName: 'PERMISSION_DENIED', message: 'User denied Geolocation' },
    mapsUrl: 'https://maps.google.com/?q=28.613939,77.209021'
  };

  const mapsUrl = location.mapsUrl || `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
  const timestamp = new Date().toLocaleTimeString();

  const copyLocationToClipboard = () => {
    navigator.clipboard.writeText(mapsUrl);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2000);
  };

  const getSmsMessageForContact = (contact) => {
    if (isUnresponsiveAlert) {
      return `🚨 GUARDIAN URGENT UNRESPONSIVENESS ALERT: User has been unresponsive for 2 consecutive check-in cycles (no response received across multiple check-ins)!
Reason: ${alertData?.reason || 'Sustained unresponsiveness detected.'}
Location: ${location.address}
Maps Link: ${mapsUrl}
Time: ${timestamp}`;
    } else if (isHighUrgency) {
      return `🚨 GUARDIAN URGENT EMERGENCY ALERT: High distress confidence (${Math.round(confidence * 100)}%)!
User Input: "${alertData?.userResponse || '[NO RESPONSE]'}"
AI Reasoning: ${alertData?.reason || 'Distress signal detected.'}
Location: ${location.address}
Maps Link: ${mapsUrl}
Time: ${timestamp}`;
    } else {
      return `⚠️ GUARDIAN ADVISORY CHECK-IN: Guardian AI detected subtle hesitation (${Math.round(confidence * 100)}% confidence). Please send a quick text or call to verify they are okay.
User Input: "${alertData?.userResponse || '[BRIEF RESPONSE]'}"
AI Reasoning: ${alertData?.reason || 'Subtle behavioral anomaly detected.'}
Location: ${location.address}
Maps Link: ${mapsUrl}
Time: ${timestamp}`;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 animate-fadeIn px-1 sm:px-0">
      {/* Strobe Emergency Header */}
      <div className={`p-4 sm:p-6 rounded-2xl text-center space-y-2.5 transition-all ${
        isHighUrgency ? 'glass-panel-alert animate-emergency' : 'glass-panel border-amber-500/50 bg-slate-900/95'
      }`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider border"
          style={{
            backgroundColor: isHighUrgency ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
            color: isHighUrgency ? '#fca5a5' : '#fcd34d',
            borderColor: isHighUrgency ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'
          }}>
          <AlertTriangle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isHighUrgency ? 'animate-bounce text-rose-400' : 'text-amber-400'}`} />
          <span>
            {isUnresponsiveAlert
              ? 'SUSTAINED UNRESPONSIVENESS (2 MISSED CHECK-INS) — ALL-CONTACT DISPATCH'
              : isHighUrgency
                ? 'HIGH CONFIDENCE (75%+) — URGENT EMERGENCY DISPATCH'
                : 'MEDIUM CONFIDENCE (50-74%) — ADVISORY CHECK-IN DISPATCH'}
          </span>
        </div>

        <h2 className={`text-xl sm:text-3xl font-black font-heading tracking-tight ${
          isHighUrgency ? 'text-white glow-text-crimson' : 'text-amber-300 glow-text-amber'
        }`}>
          {isUnresponsiveAlert
            ? 'Sustained Unresponsiveness Emergency Alert!'
            : isHighUrgency
              ? 'High Distress Emergency Alert!'
              : 'Advisory Safety Check-In Triggered'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium leading-relaxed px-2">
          {isUnresponsiveAlert
            ? 'User has been unresponsive for 2 consecutive check-in cycles with zero response. Simulated emergency notifications generated for ALL trusted contacts.'
            : isHighUrgency
              ? 'Guardian AI detected high-confidence distress signals. Simulated emergency notifications generated for ALL trusted contacts.'
              : 'Guardian AI detected subtle behavioral hesitation. Simulated non-panic advisory check-in generated for primary contact only.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Deeper Distress AI Diagnostics Card */}
        <div className="glass-panel p-4 sm:p-5 border-emerald-500/30 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              {isUnresponsiveAlert ? <Clock className="w-5 h-5 shrink-0 text-rose-400" /> : <BrainCircuit className="w-5 h-5 shrink-0" />}
              <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                {isUnresponsiveAlert ? 'Unresponsiveness Sensor Diagnostics' : 'Behavioral AI Diagnostics'}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {isUnresponsiveAlert ? 'PHASE 3 UNRESPONSIVE' : 'PHASE 2 REASONING'}
            </span>
          </div>

          <div className="space-y-3">
            {/* Fix 3: Dynamic Urgency Tier & Real Calculated Confidence Percentage */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">AI Confidence Score:</span>
                <span className={`font-mono font-extrabold ${isHighUrgency ? 'text-rose-400' : 'text-amber-400'}`}>
                  {Math.round(confidence * 100)}% ({isUnresponsiveAlert ? 'CRITICAL UNRESPONSIVE' : isHighUrgency ? 'HIGH TIER' : 'MEDIUM TIER'})
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isHighUrgency 
                      ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600' 
                      : 'bg-gradient-to-r from-teal-500 to-amber-400'
                  }`}
                  style={{ width: `${Math.round(confidence * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* AI Behavioral Reasoning / Unresponsiveness Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                {isUnresponsiveAlert ? 'Unresponsiveness Escalation Reason' : 'AI Behavioral Reasoning'}
              </span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                "{alertData?.reason || 'User unresponsive for multiple check-ins'}"
              </p>
            </div>

            {/* Captured User Response */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Response Captured</span>
              <p className="text-xs font-mono text-amber-300 italic break-words">
                "{alertData?.userResponse || '[NO RESPONSE]'}"
              </p>
            </div>
          </div>
        </div>

        {/* Real Location & Dispatch Context Card */}
        <div className="glass-panel p-4 sm:p-5 border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <MapPin className="w-5 h-5 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate">Live Dispatch Location</h3>
            </div>
            <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
              location.isLiveGps
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {location.isLiveGps ? 'GPS ACTIVE' : 'DEFAULT LOCATION'}
            </span>
          </div>

          {/* Map pin / location details */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <Navigation className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{location.address}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  Lat: {location.latitude}, Lng: {location.longitude} (±{location.accuracyMeters || 10}m)
                </p>
              </div>
            </div>

            {/* Clear fallback message ONLY when location.isLiveGps === false */}
            {!location.isLiveGps && (
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1 font-mono">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 font-sans">
                  <Bug className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Geolocation Diagnostics:</span>
                </div>
                <p className="text-[11px] leading-tight break-words">Reason: {location.fallbackNote}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 min-h-[40px] py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Open Maps</span>
              </a>

              <button
                onClick={copyLocationToClipboard}
                className="flex items-center justify-center gap-1.5 min-h-[40px] py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{copiedLocation ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Alert Prioritization Contacts List */}
      <div className="glass-panel p-4 sm:p-6 border-slate-800 bg-slate-900/95 space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2 text-slate-200">
            <BellRing className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white font-heading">
              Smart Alert Contact Prioritization
            </h3>
          </div>
          <span className="text-[11px] font-mono font-semibold text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">
            {isUnresponsiveAlert 
              ? `UNRESPONSIVE EMERGENCY: ALL ${notifiedContacts.length} CONTACTS DISPATCHED` 
              : isHighUrgency
                ? `HIGH URGENCY: ALL ${notifiedContacts.length} CONTACTS DISPATCHED`
                : `MEDIUM URGENCY: PRIMARY ONLY (1/${contacts.length || 1})`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(contacts.length > 0 ? contacts : [primaryContact].filter(Boolean)).map((contact) => {
            const isNotified = notifiedContacts.some(c => c.id === contact.id);
            return (
              <div 
                key={contact.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isNotified
                    ? (isHighUrgency ? 'bg-rose-500/10 border-rose-500/40' : 'bg-amber-500/10 border-amber-500/40')
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-white truncate">{contact.name}</span>
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border shrink-0 ${
                    isNotified
                      ? (isHighUrgency ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40')
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isNotified ? (isHighUrgency ? 'URGENT DISPATCH' : 'ADVISORY CHECK-IN') : 'STANDBY'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate">{contact.phone || contact.email}</p>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  {isNotified
                    ? (isHighUrgency ? 'Simulated emergency SMS preview generated' : 'Simulated advisory SMS preview generated')
                    : 'Standby mode (not notified at medium confidence)'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fix 2: Simulated Trusted Contact Phone Screen Preview Cards (Honest Wording) */}
      <div className="glass-panel p-4 sm:p-6 border-slate-800 bg-slate-900/95 space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2 text-slate-200">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white font-heading">
              Simulated Emergency SMS Previews
            </h3>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400 font-mono">{timestamp}</span>
        </div>

        <div className="space-y-3">
          {notifiedContacts.map((contact) => (
            <div 
              key={contact.id}
              className={`p-3.5 sm:p-4 rounded-2xl bg-slate-950 border font-mono text-[11px] sm:text-xs space-y-2 leading-relaxed break-words ${
                isHighUrgency ? 'border-rose-500/30 text-rose-200' : 'border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between border-b pb-1.5 font-sans font-bold gap-1"
                style={{ borderColor: isHighUrgency ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)' }}>
                <span className="flex items-center gap-1 truncate max-w-[220px] sm:max-w-none">
                  <User className="w-3.5 h-3.5 shrink-0" /> TO: {contact.name} ({contact.phone || contact.email})
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded shrink-0 font-mono uppercase"
                  style={{
                    backgroundColor: isHighUrgency ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                    color: isHighUrgency ? '#fca5a5' : '#fcd34d'
                  }}>
                  SIMULATED PREVIEW
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{getSmsMessageForContact(contact)}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 font-mono text-center pt-1">
          Note: In production, this would send via a real SMS/email API (e.g. Twilio / Resend).
        </p>
      </div>

      {/* Emergency Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <a
          href="tel:112"
          onClick={() => alert(`SIMULATION: Dialing India Unified Emergency Services (112) with dispatch coordinates: ${location.latitude}, ${location.longitude}`)}
          className="w-full sm:w-1/2 min-h-[48px] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-rose-600/30"
        >
          <PhoneCall className="w-4 h-4 shrink-0" />
          <span>Call 112 Direct</span>
        </a>

        <button
          onClick={onResetJourney}
          className="w-full sm:w-1/2 min-h-[48px] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>False Alarm / Return Home</span>
        </button>
      </div>
    </div>
  );
}
