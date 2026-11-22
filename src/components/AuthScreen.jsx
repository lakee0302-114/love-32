import React, { useState } from 'react';
import { Heart, Sparkles, Copy, Check, ArrowRight, User, KeyRound, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

export default function AuthScreen({ onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1: Profile info, 2: Partner Code Pairing
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👨‍💻');
  const [myPairCode] = useState(() => 'LOVE-' + Math.floor(1000 + Math.random() * 9000));
  const [partnerInputCode, setPartnerInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const avatarOptions = ['👨‍💻', '🌸', '🤴', '👸', '🐱', '🐰', '🐻', '🦊', '✨', '💖'];

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    soundManager.playChime();
    setStep(2);
  };

  const handleCopyMyCode = () => {
    navigator.clipboard?.writeText(myPairCode);
    soundManager.playKissPop();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePairWithCode = (e) => {
    e.preventDefault();
    const code = partnerInputCode.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Please enter your partner’s code');
      return;
    }

    setIsPairing(true);
    soundManager.playHeartbeat();

    setTimeout(() => {
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (err) {}
      soundManager.playChime();

      onLoginSuccess({
        userName: name.trim(),
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
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse-heart">
            <Heart size={32} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-rose-400 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Love32 Ultra
          </h1>
          <p className="text-xs text-rose-200/80 mt-1">#1 Couple Intimacy & Real-Time Sync</p>
        </div>

        {/* STEP 1: YOUR PROFILE */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4 animate-fadeIn">
            <div className="text-center">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Step 1 of 2</span>
              <h3 className="text-base font-bold text-white mt-0.5">Create Your Profile</h3>
            </div>

            {/* Avatar Picker */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 text-center">Choose Your Avatar:</label>
              <div className="flex flex-wrap justify-center gap-2">
                {avatarOptions.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      setAvatar(av);
                      soundManager.playKissPop();
                    }}
                    className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center border transition ${
                      avatar === av
                        ? 'border-rose-400 bg-rose-500/30 scale-110 shadow-lg shadow-rose-500/30'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Your Nickname / Name:</label>
              <input
                type="text"
                required
                placeholder="E.g. Alex, Maya, Kasun..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>Continue to Partner Code</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: PARTNER CODE PAIRING */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Step 2 of 2</span>
              <h3 className="text-base font-bold text-white mt-0.5">Pair with Your Partner</h3>
            </div>

            {/* Your Own Code Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-purple-950/40 to-slate-950 border border-rose-500/30 text-center space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Your Unique Partner Code:</span>
              <div className="text-2xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-pink-300 select-all">
                {myPairCode}
              </div>
              <p className="text-[10px] text-slate-400">Share this code with your partner to connect</p>

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
            <form onSubmit={handlePairWithCode} className="space-y-3 pt-2">
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
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-white font-mono text-sm uppercase focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={isPairing}
                    className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white font-bold text-xs shadow-lg transition active:scale-95"
                  >
                    {isPairing ? 'Pairing...' : 'Connect 💖'}
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
