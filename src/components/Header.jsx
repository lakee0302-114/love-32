import React from 'react';
import { Heart, Volume2, VolumeX, Sparkles, RefreshCw, Zap, Flame } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function Header({
  state,
  currentUserId,
  onSwitchUser,
  isMuted,
  onToggleMute,
  onOpenFirebaseModal,
}) {
  const currentUser = currentUserId === 'partnerA' ? state.partnerA : state.partnerB;
  const partnerUser = currentUserId === 'partnerA' ? state.partnerB : state.partnerA;

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/75 border-b border-rose-500/20 px-4 py-2.5 transition">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* App Title & Pro Badge */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse-heart">
              <Heart size={18} className="text-white fill-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" title="Connected in real-time" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-rose-400 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Love8
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 shadow-sm flex items-center gap-0.5">
                <Sparkles size={9} /> PRO
              </span>
              {/* Official Google Firebase Realtime Connected Badge */}
              <button
                onClick={onOpenFirebaseModal}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 flex items-center gap-1 transition shadow-sm"
                title="Google Firebase Realtime Database Connected"
              >
                <Flame size={10} className="text-amber-400 fill-amber-400 animate-pulse" />
                <span>Firebase Live</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>{currentUser.name}</span>
              <Heart size={9} className="text-rose-500 fill-rose-500 inline" />
              <span>{partnerUser.name}</span>
            </div>
          </div>
        </div>

        {/* User Switcher Pill & Sound Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Partner Switcher Button for Testing Both Sides */}
          <button
            onClick={() => {
              const next = currentUserId === 'partnerA' ? 'partnerB' : 'partnerA';
              onSwitchUser(next);
              soundManager.playKissPop();
            }}
            title="Switch viewing partner (Test both sides!)"
            className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition"
          >
            <span className="text-sm">{currentUser.avatar}</span>
            <span className="hidden sm:inline">Viewing as</span>
            <span className="font-bold text-white">{currentUser.name}</span>
            <RefreshCw size={12} className="text-rose-400 group-hover:rotate-180 transition-transform duration-300 ml-0.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-rose-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
