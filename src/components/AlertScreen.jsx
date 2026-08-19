import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  MessageSquare, 
  User, 
  Navigation,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';

export default function AlertScreen({ alertData, primaryContact, onResetJourney }) {
  const [copiedLocation, setCopiedLocation] = useState(false);

  const location = alertData?.location || {
    latitude: 37.774929,
    longitude: -122.419416,
    address: 'Market St & 5th St, San Francisco, CA',
    accuracyMeters: 8,
    isLiveGps: false,
    fallbackNote: 'Using estimated location — GPS permission required for live accuracy',
    mapsUrl: 'https://maps.google.com/?q=37.774929,-122.419416'
  };

  const mapsUrl = location.mapsUrl || `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
  const timestamp = new Date().toLocaleTimeString();

  const simulatedSmsMessage = `🚨 GUARDIAN EMERGENCY ALERT: Your trusted contact might be in danger!
Location: ${location.address}
Maps Link: ${mapsUrl}
Distress Reason: ${alertData?.reason || 'No check-in response received.'}
User Input: "${alertData?.userResponse || 'No Response'}"
Time: ${timestamp}`;

  const copyLocationToClipboard = () => {
    navigator.clipboard.writeText(mapsUrl);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Strobe Emergency Header */}
      <div className="glass-panel-alert p-5 sm:p-6 rounded-2xl animate-emergency text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
          DISTRESS DETECTED — ALERT TRANSMITTED
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight glow-text-crimson">
          Emergency Alert Triggered!
        </h2>
        <p className="text-xs sm:text-sm text-rose-200/80 max-w-xl mx-auto font-medium">
          Guardian AI detected potential danger during check-in. Automated emergency dispatches have been transmitted to your primary contact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distress Classification Detail Card */}
        <div className="glass-panel p-5 border-rose-500/30 bg-slate-900/90 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-white font-heading">AI Incident Diagnostics</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Trigger Classification</span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {alertData?.reason || 'Distress sentiment recognized'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Response Captured</span>
              <p className="text-xs font-mono text-amber-300 italic">
                "{alertData?.userResponse || '[NO RESPONSE]'}"
              </p>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">AI Classification Confidence:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.round((alertData?.confidence || 0.95) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Real Location & Dispatch Context Card */}
        <div className="glass-panel p-5 border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <MapPin className="w-5 h-5" />
              <h3 className="text-base font-bold text-white font-heading">Live Dispatch Coordinates</h3>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              location.isLiveGps
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {location.isLiveGps ? 'GPS ACTIVE' : 'ESTIMATED LOCATION'}
            </span>
          </div>

          {/* Map pin / location details */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <Navigation className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">{location.address}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Lat: {location.latitude}, Lng: {location.longitude} (±{location.accuracyMeters || 10}m)
                </p>
              </div>
            </div>

            {/* Subtle note ONLY for fallback estimated location */}
            {!location.isLiveGps && (
              <p className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1.5 pt-0.5">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Using estimated location</span>
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Maps</span>
              </a>

              <button
                onClick={copyLocationToClipboard}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{copiedLocation ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Trusted Contact Phone Screen Preview */}
      <div className="glass-panel p-6 border-slate-800 bg-slate-900/95 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-200">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-heading">
              Simulated SMS Sent to {primaryContact?.name || 'Trusted Contact'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{timestamp}</span>
        </div>

        {/* SMS Bubble */}
        <div className="max-w-lg mx-auto p-4 rounded-2xl bg-slate-950 border border-rose-500/30 font-mono text-xs text-rose-200 space-y-2 leading-relaxed">
          <div className="flex items-center justify-between text-rose-400 border-b border-rose-500/20 pb-1.5 font-sans font-bold">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> TO: {primaryContact?.name} ({primaryContact?.phone || primaryContact?.email})
            </span>
            <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded">DELIVERED</span>
          </div>
          <p className="whitespace-pre-wrap">{simulatedSmsMessage}</p>
        </div>
      </div>

      {/* Emergency Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={() => alert(`SIMULATION: Calling emergency services (911) with dispatch coordinates: ${location.latitude}, ${location.longitude}`)}
          className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-rose-600/30"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call 911 Direct</span>
        </button>

        <button
          onClick={onResetJourney}
          className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>False Alarm / Return Home</span>
        </button>
      </div>
    </div>
  );
}
