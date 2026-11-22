import React, { useState } from 'react';
import {
  LayoutGrid,
  Sparkles,
  Smartphone,
  Heart,
  Battery,
  BatteryCharging,
  Compass,
  Check,
  Copy,
  Download,
  Share
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function WidgetStudio({
  state,
  currentUserName,
  partnerUserName,
  onSendHeartbeat,
  onSendQuickKiss,
}) {
  const [selectedTheme, setSelectedTheme] = useState('cyber'); // 'cyber' | 'sakura' | 'midnight' | 'sunset'
  const [selectedWidgetType, setSelectedWidgetType] = useState('distance'); // 'distance' | 'pet' | 'counter' | 'photo'
  const [copiedPWA, setCopiedPWA] = useState(false);

  const themeStyles = {
    cyber: {
      name: 'Cyber Romantic',
      bg: 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-purple-950/90 border-rose-500/40',
      text: 'text-rose-300',
      accent: 'from-rose-500 to-purple-600',
    },
    sakura: {
      name: 'Sakura Pastel',
      bg: 'bg-gradient-to-br from-pink-900/60 via-rose-950/50 to-pink-900/80 border-pink-400/50',
      text: 'text-pink-300',
      accent: 'from-pink-400 to-rose-400',
    },
    midnight: {
      name: 'Midnight Obsidian',
      bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-700',
      text: 'text-slate-200',
      accent: 'from-slate-700 to-slate-900',
    },
    sunset: {
      name: 'Royal Sunset',
      bg: 'bg-gradient-to-br from-amber-950/60 via-rose-950/50 to-purple-950/60 border-amber-500/40',
      text: 'text-amber-300',
      accent: 'from-amber-400 to-rose-500',
    },
  };

  const currentTheme = themeStyles[selectedTheme];

  const daysTogether = Math.floor(
    (new Date().getTime() - new Date(state.relationshipStartDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    soundManager.playChime();
    setCopiedPWA(true);
    setTimeout(() => setCopiedPWA(false), 2500);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Title & Pro Badge */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-rose-950/50 via-purple-950/30 to-slate-900 border border-rose-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-rose-400" />
            <h3 className="font-bold text-white text-base">Love32 Pro Widget Studio</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black">
            PRO UNLOCKED
          </span>
        </div>
        <p className="text-xs text-slate-300">
          In Love32, widgets are unlocked free. Here you get unlimited real-time lock screen and home screen widgets with custom aesthetics!
        </p>

        {/* Theme Picker */}
        <div className="mt-4">
          <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-2">
            Choose Widget Aesthetic Theme:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(themeStyles).map(([key, t]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTheme(key);
                  soundManager.playKissPop();
                }}
                className={`p-2 rounded-xl border text-[11px] font-medium transition text-center ${
                  selectedTheme === key
                    ? 'border-rose-400 bg-rose-500/20 text-white font-bold shadow'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Widget Type Selector */}
      <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1 text-xs">
        {[
          { id: 'distance', label: 'Distance & Battery' },
          { id: 'pet', label: 'Pet Garden' },
          { id: 'counter', label: 'Days Together' },
          { id: 'photo', label: 'Photo of Day' },
        ].map((w) => (
          <button
            key={w.id}
            onClick={() => {
              setSelectedWidgetType(w.id);
              soundManager.playKissPop();
            }}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition ${
              selectedWidgetType === w.id
                ? 'bg-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Smartphone Mockup Preview Frame */}
      <div className="relative mx-auto max-w-[320px] rounded-[42px] border-4 border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-rose-950/50">
        {/* Dynamic Island / Notch */}
        <div className="mx-auto h-4 w-24 rounded-full bg-slate-800 mb-3 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-slate-900 mr-2" />
          <div className="h-1.5 w-1.5 rounded-full bg-blue-900" />
        </div>

        {/* Mobile Screen Content */}
        <div className="space-y-3">
          <div className="text-center text-[10px] text-slate-400 font-medium tracking-wider">
            PREVIEW ON PHONE HOME SCREEN
          </div>

          {/* 1. Distance & Battery Widget Preview */}
          {selectedWidgetType === 'distance' && (
            <div className={`p-4 rounded-3xl border ${currentTheme.bg} shadow-lg backdrop-blur`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Compass size={14} className="text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="text-xs font-bold text-white">Distance Radar</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-300">
                  {state.partnerB.isCharging ? (
                    <BatteryCharging size={13} className="text-emerald-400" />
                  ) : (
                    <Battery size={13} className="text-slate-400" />
                  )}
                  <span>{state.partnerB.battery}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between my-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{state.partnerA.avatar}</span>
                  <div className="h-0.5 w-16 bg-dashed border-t border-dashed border-rose-400/80" />
                  <span className="text-2xl animate-bounce-subtle">{state.partnerB.avatar}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white">
                    {state.distanceKm >= 1 ? `${state.distanceKm} km` : `${state.distanceKm * 1000} m`}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold flex items-center justify-end gap-1">
                    <span>⚡</span>
                    <span>{state.partnerB.speedKmH ? `${state.partnerB.speedKmH} km/h` : 'Resting 🛋️'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 mt-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => onSendHeartbeat()}
                  className="flex-1 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Heart size={11} className="fill-current" /> Tap Heartbeat
                </button>
                <button
                  onClick={() => onSendQuickKiss()}
                  className="py-1.5 px-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 text-[10px] font-bold"
                >
                  💋 Blow Kiss
                </button>
              </div>
            </div>
          )}

          {/* 2. Pet Widget Preview */}
          {selectedWidgetType === 'pet' && (
            <div className={`p-4 rounded-3xl border ${currentTheme.bg} shadow-lg backdrop-blur`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{state.pet.name} (Lv.{state.pet.level})</span>
                <span className="text-[10px] text-amber-300 font-bold">✨ Happy</span>
              </div>
              <div className="flex items-center justify-center py-2">
                <span className="text-5xl animate-float-gentle">
                  {state.pet.type === 'bunny' ? '🐰' : state.pet.type === 'kitty' ? '🐱' : '🐲'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 mt-1">
                <div className="bg-black/30 p-1.5 rounded-xl text-center">
                  Hunger: <span className="font-bold text-amber-400">{state.pet.hunger}%</span>
                </div>
                <div className="bg-black/30 p-1.5 rounded-xl text-center">
                  Happiness: <span className="font-bold text-pink-400">{state.pet.happiness}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Days Together Counter Widget Preview */}
          {selectedWidgetType === 'counter' && (
            <div className={`p-4 rounded-3xl border ${currentTheme.bg} shadow-lg backdrop-blur text-center`}>
              <div className="text-[10px] uppercase font-bold tracking-wider text-rose-300 mb-1">
                Days in Love
              </div>
              <div className="text-4xl font-black text-white tracking-tight my-1">
                {daysTogether}
              </div>
              <div className="text-[11px] text-slate-300">
                {state.partnerA.name} & {state.partnerB.name}
              </div>
              <div className="text-[9px] text-slate-400 mt-1">
                Started Aug 14, 2023
              </div>
            </div>
          )}

          {/* 4. Photo of Day Widget Preview */}
          {selectedWidgetType === 'photo' && (
            <div className={`p-3 rounded-3xl border ${currentTheme.bg} shadow-lg backdrop-blur`}>
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-2">
                <img
                  src={state.memories[0]?.imageUrl}
                  alt="Widget memory"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] text-white">
                  {state.memories[0]?.title}
                </div>
              </div>
              <div className="text-center text-[10px] text-slate-300 italic">
                "{state.memories[0]?.note}"
              </div>
            </div>
          )}

          {/* Simulated App Icons on Phone Home Screen */}
          <div className="grid grid-cols-4 gap-3 pt-3">
            {[
              { name: 'Love32 Pro', icon: '💖', active: true },
              { name: 'Photos', icon: '🖼️' },
              { name: 'Music', icon: '🎵' },
              { name: 'Messages', icon: '💬' },
            ].map((app, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow ${
                    app.active
                      ? 'bg-gradient-to-tr from-rose-500 to-pink-500 border border-white/40'
                      : 'bg-slate-800'
                  }`}
                >
                  {app.icon}
                </div>
                <span className="text-[9px] text-slate-400 mt-1">{app.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Install / Add to Home Screen card */}
      <div className="rounded-3xl p-4 bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-white text-xs">Install as Mobile App (PWA)</h4>
          <p className="text-[11px] text-slate-400">Open on your phone browser and tap "Add to Home Screen"</p>
        </div>
        <button
          onClick={handleCopyLink}
          className="py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1 shadow transition"
        >
          {copiedPWA ? <Check size={13} /> : <Share size={13} />}
          {copiedPWA ? 'Link Copied!' : 'Share / Save'}
        </button>
      </div>
    </div>
  );
}
