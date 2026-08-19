import React, { useState } from 'react';
import { Shield, Sparkles, Footprints, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../services/firebase.js';

export default function LoginScreen({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 animate-fadeIn z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-emerald-500/30 shadow-xl shadow-emerald-950/60 mb-2">
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> AI Safety Companion
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
            Guardian<span className="text-emerald-400">.ai</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Autonomous late-night safety monitoring powered by Gemini AI and Cloud Sync.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-6 sm:p-8 border-slate-800 bg-slate-900/80 space-y-6 shadow-2xl rounded-2xl relative">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sign in to sync your safety contacts securely across all your devices.</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 text-center font-medium">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full min-h-[52px] flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl shadow-white/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
            ) : (
              <>
                {/* Official Google G Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Feature Highlights */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Autonomous Check-Ins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Cloud Firestore Sync</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Guardian SafetyNet • Hackathon Phase 2 • Firebase Auth & Cloud Sync
        </p>
      </div>
    </div>
  );
}
