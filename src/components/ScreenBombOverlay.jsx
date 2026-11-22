import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { Heart, Sparkles, X, Flame } from 'lucide-react';

export default function ScreenBombOverlay({ bombData, onClose }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!bombData) return;

    soundManager.playChime();
    soundManager.playKissPop();

    // Trigger sweet confetti explosion
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#a855f7', '#fb7185', '#ffd1dc'],
      });
    } catch (e) {
      // safe fallback
    }

    // Generate floating icons
    const newParticles = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      size: Math.random() * 28 + 18,
      speed: Math.random() * 2 + 2,
      emoji: bombData.emoji || '💖',
      delay: Math.random() * 0.8,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      onClose();
    }, 5500);

    return () => clearTimeout(timer);
  }, [bombData]);

  if (!bombData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fadeIn p-4 overflow-hidden">
      {/* Floating background particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-float-gentle pointer-events-none transition-all select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.speed}s`,
            opacity: 0.85,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Main Love Alert Card */}
      <div className="relative max-w-sm w-full bg-gradient-to-br from-rose-950/90 via-pink-950/80 to-purple-950/90 border-2 border-rose-500/50 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(244,63,94,0.4)] transform animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
        >
          <X size={18} />
        </button>

        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse-heart">
            {bombData.emoji || '💖'}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-1.5 shadow">
            <Sparkles size={16} />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Flame size={13} className="text-rose-400 animate-pulse" />
          Love32 Ultra Screen Bomb!
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          {bombData.senderName} sent you a Love Bomb!
        </h3>

        <p className="text-pink-200/90 font-medium text-base mb-6 px-2 italic">
          "{bombData.message || 'I am missing you so much right now!'}"
        </p>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              soundManager.playHeartbeat();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <Heart size={16} className="fill-current" />
            Send Heartbeat Back
          </button>
        </div>
      </div>
    </div>
  );
}
