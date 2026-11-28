import React from 'react';
import {
  Settings as SettingsIcon,
  Share2,
  Heart,
  Crown,
  Sparkles,
  Shield,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Flame,
  BookHeart,
  PawPrint,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function ProfileScreen({
  state,
  currentUserId,
  onOpenSettings,
  onOpenPremium,
  onOpenAnniversary,
  partnerCode,
}) {
  const currentUser = currentUserId === 'partnerA' ? state.partnerA : state.partnerB;
  const partnerUser = currentUserId === 'partnerA' ? state.partnerB : state.partnerA;
  const isPartnerJoined = Boolean(partnerUser && partnerUser.isJoined && partnerUser.name);

  // Calculate days together
  const calculateDaysTogether = () => {
    if (!isPartnerJoined || !state.relationshipStartDate) return '--';
    const start = new Date(state.relationshipStartDate).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  const daysTogether = calculateDaysTogether();

  const handleShare = () => {
    soundManager.playKissPop();
    const shareUrl = window.location.origin + '?code=' + (partnerCode || 'LOVE-7788');
    if (navigator.share) {
      navigator.share({
        title: 'Love32 Ultra',
        text: `Join me on Love32 Ultra with Partner Code: ${partnerCode || 'LOVE-7788'} 💖`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareUrl);
      alert(`Copied Invite Link with Code: ${partnerCode || 'LOVE-7788'} 💖`);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Header Bar (Image 4) */}
      <div className="flex items-center justify-between pt-1 pb-2">
        {/* Hexagon Settings Icon */}
        <button
          onClick={() => {
            soundManager.playKissPop();
            onOpenSettings();
          }}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition active:scale-95"
          title="Open Settings"
        >
          <SettingsIcon size={20} />
        </button>

        {/* Share Icon */}
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition active:scale-95"
          title="Share Love32 Invite"
        >
          <Share2 size={19} />
        </button>
      </div>

      {/* Couple Avatars Header */}
      <div className="text-center py-2 relative">
        <div className="flex items-center justify-center gap-6">
          {/* Partner Left */}
          {isPartnerJoined ? (
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-200 to-indigo-200 dark:from-slate-800 dark:to-indigo-950/80 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-3xl">
                  {partnerUser.avatar || '🌸'}
                </div>
              </div>
              <span className="font-bold text-xs text-slate-800 dark:text-white mt-1.5">
                {partnerUser.name}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleShare}
              className="flex flex-col items-center group cursor-pointer active:scale-95 transition"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-pink-400 dark:border-pink-500/60 bg-pink-500/10 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition">
                  ➕
                </div>
                <span className="absolute -bottom-1 -right-1 text-[8px] px-1 py-0.2 rounded-full bg-rose-500 text-white font-black animate-pulse">
                  PAIR
                </span>
              </div>
              <span className="font-extrabold text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                No Partner Yet
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Tap to Connect 💕
              </span>
            </button>
          )}

          {/* Center Connection Indicator */}
          <div className="flex flex-col items-center justify-center relative -mt-3">
            {isPartnerJoined ? (
              <>
                <div className="text-lg animate-bounce-subtle">✨</div>
                <div className="text-xl animate-pulse-heart">💖</div>
                <div className="text-xs text-rose-500 font-bold mt-0.5">☁️ 💤</div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold mb-0.5">Partner Code</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono font-black text-xs shadow-sm">
                  {partnerCode || 'LOVE-4634'}
                </span>
                <span className="text-[9px] text-slate-400 mt-1">1-on-1 Private</span>
              </div>
            )}
          </div>

          {/* You Right (e.g. Lakee) */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-200 to-rose-200 dark:from-slate-800 dark:to-rose-950/80 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-3xl">
                {currentUser.avatar || '🤴'}
              </div>
            </div>
            <span className="font-bold text-xs text-slate-800 dark:text-white mt-1.5">
              {currentUser.name || 'Lakee'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              You
            </span>
          </div>
        </div>
      </div>

      {/* Partner Connection Banner if Unjoined */}
      {!isPartnerJoined && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-500/15 via-purple-500/15 to-pink-500/15 border-2 border-dashed border-rose-400/50 dark:border-rose-500/40 text-center space-y-2.5 animate-fadeIn">
          <div className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            <span>💕</span>
            <span>You Have Not Paired with a Partner Yet</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Love32 Ultra requires pairing with your lover's device to sync live distance, study streams, and love streaks!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-500">Your Partner Code:</span>
            <span className="text-base font-black font-mono text-rose-500">{partnerCode}</span>
          </div>
          <div>
            <button
              type="button"
              onClick={handleShare}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg active:scale-95 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share Code via WhatsApp / Message</span>
            </button>
          </div>
        </div>
      )}

      {/* 6 Stats Grid Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Together for */}
        <div
          onClick={() => {
            soundManager.playKissPop();
            onOpenAnniversary();
          }}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center cursor-pointer hover:border-pink-300 transition"
        >
          <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center text-base mb-1">
            💑
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Together for
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            {isPartnerJoined ? daysTogether : '--'}
          </span>
        </div>

        {/* Love Story */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center text-base mb-1">
            📖
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Love Story
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            {isPartnerJoined ? (state.memories?.length || 0) : 0}
          </span>
        </div>

        {/* Pet */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-base mb-1">
            🐾
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Pet
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            {isPartnerJoined ? `Lv.${state.pet?.level || 1}` : 'Egg 🥚'}
          </span>
        </div>

        {/* MissU */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-base mb-1">
            💋
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            MissU
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            {isPartnerJoined ? (state.missYouCount || 0) : 0}
          </span>
        </div>

        {/* Intimacy */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center text-base mb-1">
            🌈
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Intimacy
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            {isPartnerJoined ? `${state.intimacyPercent || 100}%` : '0%'}
          </span>
        </div>

        {/* Love Streak */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center text-base mb-1">
            🔥
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Love Streak
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            {isPartnerJoined ? (state.loveStreakDays || 1) : 0}
          </span>
        </div>
      </div>

      {/* Premium Subscription Banner (Image 4) */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 border border-pink-200/80 dark:border-slate-800 shadow-md">
        <div className="relative z-10 max-w-[65%]">
          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider inline-block mb-1.5 shadow-sm">
            Premium
          </span>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
            One subscription, both enjoy
          </h3>
          <button
            onClick={() => {
              soundManager.playKissPop();
              onOpenPremium();
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition"
          >
            Claim Now
          </button>
        </div>

        {/* Mini map illustration placeholder on the right */}
        <div className="absolute top-2 right-2 w-28 h-28 rounded-2xl bg-pink-100/60 dark:bg-purple-900/20 border border-pink-200/50 dark:border-purple-800/30 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="relative text-center">
            <span className="text-2xl">🗺️</span>
            <div className="text-[9px] font-bold text-pink-600 dark:text-pink-300">Live GPS</div>
          </div>
        </div>
      </div>

      {/* Permissions & FAQ Grid (Image 4) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            soundManager.playKissPop();
            onOpenSettings();
          }}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95 transition"
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Permissions</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold">
            ⚠️ 9
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playKissPop();
            onOpenSettings();
          }}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95 transition"
        >
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-purple-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">FAQ</span>
          </div>
          <span className="text-slate-400 text-xs">›</span>
        </button>
      </div>

      {/* Account Bind Warning Alert (Image 4) */}
      <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 flex items-center justify-between text-xs text-sky-800 dark:text-sky-300">
        <div className="flex items-center gap-2 flex-1 pr-2">
          <span className="text-sm">ℹ️</span>
          <span className="text-[11px] leading-snug">
            Your data may be lost if you don't link your email or account.{' '}
            <button
              onClick={() => {
                soundManager.playKissPop();
                onOpenSettings();
              }}
              className="font-bold underline text-indigo-600 dark:text-indigo-400"
            >
              Bind Now
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
