import React from 'react';
import { Shield, Users, AlertTriangle } from 'lucide-react';

export default function Navbar({ journeyState, contactsCount }) {
  const getStatusBadge = () => {
    switch (journeyState) {
      case 'ACTIVE':
      case 'CHECK_IN_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            ACTIVE MONITORING
          </span>
        );
      case 'ALERT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            EMERGENCY ALERT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Phase 1 Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-950/50">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-heading">
                Guardian<span className="text-emerald-400">.ai</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Phase 1 SafetyNet
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 font-medium">Autonomous Safety Companion</p>
          </div>
        </div>

        {/* Center Status (Only during Active or Alert states on md+) */}
        <div className="hidden md:flex items-center">
          {getStatusBadge()}
        </div>

        {/* Right Action Bar: AI Active Indicator + Lightweight Contact Count */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]"></span>
            <span className="text-[11px] sm:text-xs">AI Active</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-slate-300 font-mono" title={`${contactsCount} Trusted Contact(s)`}>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span>{contactsCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
