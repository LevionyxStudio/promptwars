import React, { useEffect } from 'react';
import { PartyPopper, ShieldCheck, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SafeArrivalModal({ isOpen, onClose, destination }) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-5 sm:p-6 glass-panel border border-emerald-500/40 bg-slate-900/95 rounded-2xl shadow-2xl text-center space-y-4 sm:space-y-5 max-w-[92vw]">
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/50">
          <PartyPopper className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Journey Completed</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
            Arrived Safely!
          </h3>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            You have safely reached <strong className="text-white">"{destination || 'Destination'}"</strong>. Guardian active monitoring is now concluded.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] sm:text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Simulated Safe Arrival Notification Generated.</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono pt-0.5">
            Note: In production, this would send via a real SMS/email API.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-400/20"
        >
          <Home className="w-4 h-4 text-slate-950 shrink-0" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
