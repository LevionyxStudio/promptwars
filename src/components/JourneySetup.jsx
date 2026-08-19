import React, { useState } from 'react';
import { Footprints, Shield, ArrowRight, MapPin, Clock } from 'lucide-react';

export default function JourneySetup({ onStartJourney, primaryContact }) {
  const [destination, setDestination] = useState('Home (Main Residence)');
  const [journeyNote, setJourneyNote] = useState('Walking from late night study hub');

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Hero Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" /> Guardian AI Safety Net
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
          Late Night Commute? <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Never Walk Alone.
          </span>
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Guardian monitors your journey autonomously. If you don't respond safely to check-ins, your trusted contact gets immediate emergency dispatches.
        </p>
      </div>

      {/* Main Start Card */}
      <div className="glass-panel p-6 sm:p-8 border-slate-700/80 bg-slate-900/80 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Destination & Note Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Destination Tag
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Walking home from Metro Station"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Journey Context / Note
            </label>
            <input
              type="text"
              value={journeyNote}
              onChange={(e) => setJourneyNote(e.target.value)}
              placeholder="e.g. Taking 4th St walkway"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Safety Parameters Box */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Check-in Frequency:
            </span>
            <span className="font-mono text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              30s Demo Mode
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Dispatch Contact:
            </span>
            <span className="text-emerald-300 font-semibold">
              {primaryContact ? primaryContact.name : 'No Contact Configured'}
            </span>
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={() => onStartJourney({ destination, journeyNote })}
          disabled={!primaryContact}
          className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-lg shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Footprints className="w-6 h-6 text-slate-950 group-hover:scale-110 transition-transform" />
          <span>I'm Walking Home</span>
          <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
        </button>

        {!primaryContact && (
          <p className="text-center text-xs text-rose-400 font-medium">
            ⚠️ Please add a trusted contact below before starting your journey.
          </p>
        )}
      </div>
    </div>
  );
}
