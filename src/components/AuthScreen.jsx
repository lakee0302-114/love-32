import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  User,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Flame,
  LogIn,
  UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

export default function AuthScreen({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [step, setStep] = useState(1); // 1: Auth form, 2: Partner Code Pairing

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🤴');
  const [myPairCode] = useState(() => 'LOVE-' + Math.floor(1000 + Math.random() * 9000));
  const [partnerInputCode, setPartnerInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const avatarOptions = ['🤴', '👸', '🌸', '👨‍💻', '🐱', '🐰', '🐻', '🦊', '💖', '✨'];

  // Handle Email + Password Submit (Login or Sign Up)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Google/Email address');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    soundManager.playKissPop();

    setTimeout(() => {
      setIsSubmitting(false);
      soundManager.playChime();
      // Move to Step 2: Partner Code Connection
      setStep(2);
    }, 800);
  };

  // Google 1-Click Sign-in Simulation
  const handleGoogleSignIn = () => {
    soundManager.playKissPop();
    const mockEmail = name ? `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com` : 'user@gmail.com';
    setEmail(mockEmail);
    setPassword('google-auth-token-secured');
    soundManager.playChime();
    setStep(2);
  };

  const handleCopyMyCode = () => {
    navigator.clipboard?.writeText(myPairCode);
    soundManager.playKissPop();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Final Step: Pair with Partner Code
  const handlePairWithCode = (e) => {
    e.preventDefault();
    const code = partnerInputCode.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Please enter your partner’s code');
      return;
    }

    setIsSubmitting(true);
    soundManager.playHeartbeat();

    setTimeout(() => {
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (err) {}
      soundManager.playChime();

      onLoginSuccess({
        email: email.trim(),
        userName: name.trim() || email.split('@')[0],
        userAvatar: avatar,
        partnerCode: code,
        myCode: myPairCode,
      });
    }, 1200);
  };

  const handleSoloDemo = () => {
    soundManager.playKissPop();
    try {
      confetti({ particleCount: 60, spread: 70 });
    } catch (err) {}
    onLoginSuccess({
      email: email.trim() || 'demo@gmail.com',
      userName: name.trim() || 'My Love',
      userAvatar: avatar,
      partnerCode: myPairCode,
      myCode: myPairCode,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        {/* Top Logo */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse-heart">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-rose-400 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Love32 Ultra
          </h1>
          <p className="text-xs text-rose-200/80">#1 Couple Intimacy & Real-Time Sync</p>
        </div>

        {/* STEP 1: GOOGLE EMAIL & PASSWORD AUTHENTICATION */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Sign In / Sign Up Tab Switcher */}
            <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                  soundManager.playKissPop();
                }}
                className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn size={13} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                  soundManager.playKissPop();
                }}
                className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus size={13} /> Create Account
              </button>
            </div>

            {/* Google 1-Click Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase">Or with Email</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {/* Nickname & Avatar (on Sign Up) */}
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Pick Your Avatar:</label>
                    <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                      {avatarOptions.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => {
                            setAvatar(av);
                            soundManager.playKissPop();
                          }}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition ${
                            avatar === av
                              ? 'border-rose-400 bg-rose-500/30 scale-110 shadow'
                              : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Your Name / Nickname:</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="E.g. Alex, Maya, Lakee..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Input */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Google / Email Address:</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Password:</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] text-center">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>{isSubmitting ? 'Authenticating...' : authMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: PARTNER CODE PAIRING */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Step 2: Connect</span>
              <h3 className="text-base font-bold text-white mt-0.5">Pair with Your Partner</h3>
              <p className="text-[11px] text-slate-400">Signed in as <span className="text-rose-300 font-semibold">{email}</span></p>
            </div>

            {/* Your Own Partner Code Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-purple-950/40 to-slate-950 border border-rose-500/30 text-center space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Your Unique Partner Code:</span>
              <div className="text-2xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-pink-300 select-all">
                {myPairCode}
              </div>
              <p className="text-[10px] text-slate-400">Share this code with your partner</p>

              <button
                type="button"
                onClick={handleCopyMyCode}
                className="mx-auto py-1.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy My Code'}</span>
              </button>
            </div>

            {/* Input Partner Code Form */}
            <form onSubmit={handlePairWithCode} className="space-y-3 pt-1">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Enter Your Partner’s Code:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="E.g. LOVE-8942"
                    value={partnerInputCode}
                    onChange={(e) => {
                      setPartnerInputCode(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-white font-mono text-xs uppercase focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white font-bold text-xs shadow-lg transition active:scale-95"
                  >
                    {isSubmitting ? 'Pairing...' : 'Connect 💖'}
                  </button>
                </div>
                {errorMsg && <p className="text-[11px] text-rose-400 mt-1">{errorMsg}</p>}
              </div>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase">Or</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* Quick Demo Enter Button */}
            <button
              type="button"
              onClick={handleSoloDemo}
              className="w-full py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
            >
              Start in Solo / Demo Mode ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
