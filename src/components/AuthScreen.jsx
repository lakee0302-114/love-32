import React, { useState, useEffect } from 'react';
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
  UserPlus,
  Share2,
  Users
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check URL query parameters for invite code (?code=LOVE-XXXX or ?room=LOVE-XXXX)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code') || params.get('room');
      if (codeFromUrl) {
        setPartnerInputCode(codeFromUrl.toUpperCase());
        setAvatar('🌸'); // default partner avatar
      }
    } catch (e) {}
  }, []);

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
      setStep(2);
    }, 600);
  };

  // Google 1-Click Sign-in Simulation
  const handleGoogleSignIn = () => {
    soundManager.playKissPop();
    const mockEmail = name ? `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com` : 'lakee@gmail.com';
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

  const handleCopyInviteLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://love-32.vercel.app';
    const link = `${origin}/?code=${myPairCode}`;
    navigator.clipboard?.writeText(link);
    soundManager.playKissPop();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 1. Enter as Host (Partner 1) with Own Generated Code
  const handleHostEnter = () => {
    setIsSubmitting(true);
    soundManager.playHeartbeat();

    setTimeout(() => {
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
      soundManager.playChime();

      onLoginSuccess({
        role: 'partnerA',
        email: email.trim(),
        userName: name.trim() || (email.split('@')[0] || 'Lakee'),
        userAvatar: avatar,
        partnerCode: myPairCode,
        myCode: myPairCode,
      });
    }, 800);
  };

  // 2. Enter as Partner 2 using Partner's Code
  const handleJoinWithPartnerCode = (e) => {
    e.preventDefault();
    const code = partnerInputCode.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Please enter your partner’s code (e.g. LOVE-7788)');
      return;
    }

    setIsSubmitting(true);
    soundManager.playHeartbeat();

    setTimeout(() => {
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (err) {}
      soundManager.playChime();

      onLoginSuccess({
        role: 'partnerB',
        email: email.trim(),
        userName: name.trim() || (email.split('@')[0] || 'Nethmi'),
        userAvatar: avatar,
        partnerCode: code,
        myCode: myPairCode,
      });
    }, 900);
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

            {/* Google 1-Click Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition active:scale-95 shadow-sm"
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
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase">Or use email</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {/* Display Name */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Your Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Lakee or Nethmi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Choose Avatar</label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {avatarOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAvatar(opt)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition shrink-0 ${
                        avatar === opt
                          ? 'bg-rose-500 border-2 border-white scale-110 shadow'
                          : 'bg-slate-950/80 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Google / Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="lakee@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
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

        {/* STEP 2: PARTNER CODE PAIRING (DUAL ROLE CONNECT) */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Step 2: Connect</span>
              <h3 className="text-base font-bold text-white mt-0.5">Pair with Your Partner</h3>
              <p className="text-[11px] text-slate-400">Signed in as <span className="text-rose-300 font-semibold">{name || email}</span></p>
            </div>

            {/* OPTION 1: HOST / PARTNER 1 (Generate Code) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-purple-950/40 to-slate-950 border border-rose-500/30 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-300 uppercase font-bold">
                <Sparkles size={13} />
                <span>Option A: I am Partner 1 (Host)</span>
              </div>
              <div className="text-2xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-pink-300 select-all">
                {myPairCode}
              </div>
              <p className="text-[10px] text-slate-300">Give this code to your partner to connect together</p>

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleCopyMyCode}
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-200 text-[11px] font-bold flex items-center gap-1 transition active:scale-95"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-pink-200 text-[11px] font-bold flex items-center gap-1 transition active:scale-95"
                  title="Copy direct invite link for WhatsApp"
                >
                  {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
                  <span>{copiedLink ? 'Link Copied!' : 'WhatsApp Link'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleHostEnter}
                disabled={isSubmitting}
                className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <span>Enter Room as Partner 1 (Host)</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-semibold">Or</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* OPTION 2: JOIN / PARTNER 2 (Enter Partner's Code) */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-sky-300 uppercase font-bold">
                <Users size={13} />
                <span>Option B: I am Partner 2 (Join)</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Enter the code sent by your partner:
              </p>

              <form onSubmit={handleJoinWithPartnerCode} className="space-y-2">
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
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 text-white font-bold text-xs shadow transition active:scale-95"
                  >
                    {isSubmitting ? 'Joining...' : 'Connect 💖'}
                  </button>
                </div>
                {errorMsg && <p className="text-[11px] text-rose-400">{errorMsg}</p>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
