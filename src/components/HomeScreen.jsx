import React, { useState, useEffect } from 'react';
import {
  Heart,
  Battery,
  BatteryCharging,
  BatteryLow,
  MapPin,
  Clock,
  Sparkles,
  CloudSun,
  Navigation as NavIcon,
  Send,
  Zap,
  Smile,
  BellRing,
  Gauge,
  Car,
  Footprints,
  Bike,
  Activity,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function HomeScreen({
  state,
  currentUserId,
  onSendHeartbeat,
  onSendQuickKiss,
  onSendNudge,
  onOpenMissYou,
  onUpdateMyStatus,
  onUpdateDistance,
  onUpdateSpeed,
}) {
  const currentUser = currentUserId === 'partnerA' ? state.partnerA : state.partnerB;
  const partnerUser = currentUserId === 'partnerA' ? state.partnerB : state.partnerA;

  // Days together live ticker
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(state.relationshipStartDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [state.relationshipStartDate]);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState(currentUser.status);
  const [newMood, setNewMood] = useState(currentUser.mood);

  // Speed controls for current user
  const [customSpeed, setCustomSpeed] = useState(currentUser.speedKmH || 0);

  useEffect(() => {
    setCustomSpeed(currentUser.speedKmH || 0);
  }, [currentUser.speedKmH]);

  const moodPresets = [
    '🥰 In Love',
    '🥺 Missing You',
    '😴 Sleeping',
    '🍕 Hungry',
    '💪 At Gym',
    '📚 Studying',
    '💼 Busy Working',
    '☕ Coffee Time',
  ];

  const speedPresets = [
    { label: 'Resting / Home', speed: 0, icon: '🛋️', activity: 'Resting 🛋️' },
    { label: 'Walking', speed: 4.5, icon: '🚶', activity: 'Walking 🚶' },
    { label: 'Jogging', speed: 9.0, icon: '🏃', activity: 'Jogging 🏃' },
    { label: 'Cycling', speed: 20, icon: '🚴', activity: 'Cycling 🚴' },
    { label: 'In Vehicle', speed: 52, icon: '🚗', activity: 'Driving 🚗' },
    { label: 'Highway Express', speed: 95, icon: '⚡', activity: 'Express Driving ⚡' },
  ];

  const handleSaveStatus = (e) => {
    e.preventDefault();
    onUpdateMyStatus(newStatus, newMood);
    setShowStatusModal(false);
    soundManager.playChime();
  };

  const handleApplySpeedPreset = (preset) => {
    if (onUpdateSpeed) {
      onUpdateSpeed(currentUserId, preset.speed, preset.activity);
      soundManager.playKissPop();
    }
  };

  const handleCustomSpeedSlider = (e) => {
    const val = parseFloat(e.target.value);
    setCustomSpeed(val);
    let act = 'Resting 🛋️';
    if (val > 0 && val <= 6) act = 'Walking 🚶';
    else if (val > 6 && val <= 14) act = 'Jogging 🏃';
    else if (val > 14 && val <= 30) act = 'Cycling 🚴';
    else if (val > 30 && val <= 85) act = 'Driving 🚗';
    else if (val > 85) act = 'Express Speed ⚡';

    if (onUpdateSpeed) {
      onUpdateSpeed(currentUserId, val, act);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* 1. Days Together Counter Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-rose-950/70 via-pink-950/50 to-slate-900/80 border border-rose-500/30 shadow-xl">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Heart size={14} className="text-rose-400 fill-rose-400 animate-pulse-heart" />
            <span>Love Journey Together</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Day #{timeTogether.days}
          </span>
        </div>

        {/* Live Timer Grid */}
        <div className="grid grid-cols-4 gap-2 text-center my-2">
          <div className="bg-slate-950/50 backdrop-blur rounded-2xl p-2.5 border border-rose-500/20 shadow-inner">
            <div className="text-2xl font-black text-white tracking-tight">{timeTogether.days}</div>
            <div className="text-[10px] text-rose-300/80 uppercase font-medium">Days</div>
          </div>
          <div className="bg-slate-950/50 backdrop-blur rounded-2xl p-2.5 border border-rose-500/20 shadow-inner">
            <div className="text-2xl font-black text-pink-200 tracking-tight">{timeTogether.hours}</div>
            <div className="text-[10px] text-pink-300/80 uppercase font-medium">Hours</div>
          </div>
          <div className="bg-slate-950/50 backdrop-blur rounded-2xl p-2.5 border border-rose-500/20 shadow-inner">
            <div className="text-2xl font-black text-rose-200 tracking-tight">{timeTogether.minutes}</div>
            <div className="text-[10px] text-rose-300/80 uppercase font-medium">Mins</div>
          </div>
          <div className="bg-slate-950/50 backdrop-blur rounded-2xl p-2.5 border border-rose-500/20 shadow-inner">
            <div className="text-2xl font-black text-amber-300 tracking-tight">{timeTogether.seconds}</div>
            <div className="text-[10px] text-amber-300/80 uppercase font-medium">Secs</div>
          </div>
        </div>

        <div className="text-center mt-3 text-xs text-rose-200/80 italic">
          "Every second with you is my favorite memory."
        </div>
      </div>

      {/* 2. Interactive Distance Radar with Real-Time Speed Badges */}
      <div className="relative rounded-3xl p-5 bg-slate-900/70 border border-slate-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <NavIcon size={16} className="text-rose-400 animate-spin" style={{ animationDuration: '8s' }} />
            <h3 className="text-sm font-bold text-white tracking-wide">Live Distance Radar</h3>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={state.distanceKm}
              onChange={(e) => onUpdateDistance(parseFloat(e.target.value))}
              className="text-[11px] bg-slate-800 border border-slate-700 text-rose-300 rounded-lg px-2 py-1 outline-none cursor-pointer"
              title="Simulate distance"
            >
              <option value="0.05">Same Room (50m)</option>
              <option value="5.2">In City (5.2 km)</option>
              <option value="114.5">Kandy - Colombo (114 km)</option>
              <option value="8420">Long Distance (8,420 km)</option>
            </select>
          </div>
        </div>

        {/* Visual Radar Container */}
        <div className="relative h-48 w-full rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-center overflow-hidden">
          {/* Radar background concentric circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full border border-rose-500/10" />
            <div className="absolute w-40 h-40 rounded-full border border-rose-500/15" />
            <div className="absolute w-24 h-24 rounded-full border border-rose-500/25" />
            {/* Pulsing radar beam */}
            <div className="absolute w-48 h-48 rounded-full border border-rose-500/30 animate-radar-ring pointer-events-none" />
          </div>

          {/* Connection line between lovers */}
          <div className="absolute w-3/5 h-0.5 bg-gradient-to-r from-rose-500/40 via-pink-400 to-purple-500/40 border-t border-dashed border-pink-300/60" />

          {/* User A Avatar + Speed Badge */}
          <div className="absolute left-6 flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(56,189,248,0.4)] border-2 border-white/80">
                {currentUser.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500 text-white font-bold">
                You
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-300 mt-1 max-w-[75px] truncate text-center">
              {currentUser.name}
            </span>
            {/* Speed Badge */}
            <div className="mt-0.5 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-sky-950/90 border border-sky-500/40 text-[10px] font-bold text-sky-300 shadow">
              <Gauge size={10} className="text-sky-400" />
              <span>{currentUser.speedKmH ? `${currentUser.speedKmH} km/h` : '0 km/h'}</span>
            </div>
          </div>

          {/* Center Distance Badge */}
          <div className="z-10 bg-slate-950/90 border border-rose-500/50 rounded-2xl px-3 py-1.5 shadow-[0_0_25px_rgba(244,63,94,0.3)] text-center backdrop-blur">
            <div className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300">
              {state.distanceKm >= 1 ? `${state.distanceKm} km` : `${state.distanceKm * 1000} m`}
            </div>
            <div className="text-[9px] text-slate-400 font-medium">
              {state.distanceKm < 1 ? 'Right beside you 💑' : 'Hearts connected 💖'}
            </div>
          </div>

          {/* Partner Avatar + Speed Badge */}
          <div className="absolute right-6 flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(244,63,94,0.4)] border-2 border-white/80 animate-bounce-subtle">
                {partnerUser.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                Love
              </span>
            </div>
            <span className="text-[11px] font-semibold text-pink-300 mt-1 max-w-[75px] truncate text-center">
              {partnerUser.name}
            </span>
            {/* Speed Badge */}
            <div className="mt-0.5 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/40 text-[10px] font-bold text-rose-300 shadow">
              <Gauge size={10} className="text-rose-400" />
              <span>{partnerUser.speedKmH ? `${partnerUser.speedKmH} km/h` : '0 km/h'}</span>
            </div>
          </div>
        </div>

        {/* Live Status & Weather details */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
          {/* Partner's Live Card */}
          <div className="bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
              <span>{partnerUser.name}'s Status</span>
              <span className="text-[9px] text-emerald-400">● Live</span>
            </div>
            <div className="text-white font-medium text-xs truncate">
              {partnerUser.status}
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1">
              <CloudSun size={12} className="text-amber-400" />
              <span>{partnerUser.weather}</span>
            </div>
            {/* Travel motion status */}
            <div className="flex items-center gap-1.5 text-[11px] mt-1 text-pink-300">
              <Activity size={12} className="text-rose-400" />
              <span className="font-semibold">{partnerUser.activity || 'Resting 🛋️'}</span>
              <span className="text-[10px] text-slate-400">({partnerUser.speedKmH || 0} km/h)</span>
            </div>
            {/* Battery Indicator with Alert */}
            <div className="flex items-center gap-1.5 text-[11px] mt-1 text-slate-300">
              {partnerUser.isCharging ? (
                <BatteryCharging size={13} className="text-emerald-400" />
              ) : partnerUser.battery < 20 ? (
                <BatteryLow size={13} className="text-rose-400 animate-pulse" />
              ) : (
                <Battery size={13} className="text-slate-400" />
              )}
              <span>{partnerUser.battery}%</span>
              {partnerUser.isCharging && (
                <span className="text-[9px] text-emerald-400 font-semibold">(Charging)</span>
              )}
              {partnerUser.battery < 20 && !partnerUser.isCharging && (
                <span className="text-[9px] text-rose-400 font-bold">Low Battery!</span>
              )}
            </div>
          </div>

          {/* Your Live Card with Update Button */}
          <div className="bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
                <span>Your Status</span>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                >
                  Edit
                </button>
              </div>
              <div className="text-white font-medium text-xs truncate">
                {currentUser.status}
              </div>
              <div className="text-slate-400 text-[11px] mt-1 truncate">
                Mood: {currentUser.mood}
              </div>
              {/* Travel motion status */}
              <div className="flex items-center gap-1.5 text-[11px] mt-1 text-sky-300">
                <Activity size={12} className="text-sky-400" />
                <span className="font-semibold">{currentUser.activity || 'Resting 🛋️'}</span>
                <span className="text-[10px] text-slate-400">({currentUser.speedKmH || 0} km/h)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1">
              <Battery size={13} className="text-slate-400" />
              <span>{currentUser.battery}%</span>
              <span className="text-[9px] text-sky-400 ml-auto">{currentUser.location.split(',')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DEDICATED LIVE SPEEDOMETER & TRAVEL TRACKER (LOVE8 PRO FEATURE) */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-900/90 via-slate-950 to-rose-950/40 border border-slate-800 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-slate-950">
              <Gauge size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Real-Time Travel Speedometer
              </h3>
              <p className="text-[10px] text-slate-400">Live motion tracking & travel safety</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black uppercase tracking-tight">
            PRO FEATURE
          </span>
        </div>

        {/* Dual Live Speedometer Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Your Speedometer Card */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-sky-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-sky-300">You ({currentUser.name})</span>
              <span className="text-[10px] text-sky-400">● Moving</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-black text-white font-mono">
                {currentUser.speedKmH ?? 0}
              </span>
              <span className="text-xs text-sky-300 font-bold uppercase">km/h</span>
            </div>
            <div className="text-[11px] font-medium text-slate-300 flex items-center gap-1 truncate">
              <span>{currentUser.activity || 'Resting 🛋️'}</span>
            </div>
            {/* Speedometer progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ((currentUser.speedKmH || 0) / 120) * 100)}%` }}
              />
            </div>
          </div>

          {/* Partner's Speedometer Card */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-rose-300">{partnerUser.name}</span>
              <span className="text-[10px] text-rose-400">● Live GPS</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-black text-white font-mono">
                {partnerUser.speedKmH ?? 0}
              </span>
              <span className="text-xs text-rose-300 font-bold uppercase">km/h</span>
            </div>
            <div className="text-[11px] font-medium text-slate-300 flex items-center gap-1 truncate">
              <span>{partnerUser.activity || 'Resting 🛋️'}</span>
            </div>
            {/* Speedometer progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ((partnerUser.speedKmH || 0) / 120) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Travel Safety Note */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs">
          <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
          <span>
            {currentUser.speedKmH > 70 || partnerUser.speedKmH > 70
              ? '🚗 Traveling on expressway. Drive safely and stay alert!'
              : currentUser.speedKmH > 0 || partnerUser.speedKmH > 0
              ? '✨ Both movements are securely synced with real-time GPS telemetry.'
              : '🛋️ Both are currently resting safely at home.'}
          </span>
        </div>

        {/* Speed Controls for Current User */}
        <div className="pt-2 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Set Your Travel Speed:
            </span>
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
              <span>{currentUser.avatar}</span>
              <span>{currentUser.name}</span>
            </span>
          </div>

          {/* Quick Speed Presets */}
          <div className="grid grid-cols-3 gap-1.5">
            {speedPresets.map((p) => (
              <button
                key={p.label}
                onClick={() => handleApplySpeedPreset(p)}
                className={`p-2 rounded-xl border text-left transition flex items-center gap-1.5 ${
                  currentUser.speedKmH === p.speed
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span className="text-base">{p.icon}</span>
                <div className="truncate">
                  <div className="text-[11px] font-bold truncate">{p.label}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{p.speed} km/h</div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Speed Slider */}
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="text-[11px]">Fine-tune Speed:</span>
              <span className="font-mono font-bold text-amber-300">{customSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="130"
              step="1"
              value={customSpeed}
              onChange={handleCustomSpeedSlider}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Quick Romantic Action Triggers */}
      <div className="rounded-3xl p-4 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900/60 border border-rose-500/20">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" /> Quick Romantic Touches
          </span>
          <span className="text-[10px] text-slate-400">Instant on partner screen</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => onSendHeartbeat()}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition group active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition">
              <Heart size={20} className="fill-current" />
            </div>
            <span className="text-xs font-semibold text-rose-200 mt-2">Heartbeat</span>
            <span className="text-[10px] text-slate-400">Audio + Pulse</span>
          </button>

          <button
            onClick={() => onSendQuickKiss()}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition group active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition">
              <span className="text-xl">💋</span>
            </div>
            <span className="text-xs font-semibold text-pink-200 mt-2">Blow Kiss</span>
            <span className="text-[10px] text-slate-400">Kiss Pop</span>
          </button>

          <button
            onClick={() => onOpenMissYou()}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition group active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition">
              <span className="text-xl">💣</span>
            </div>
            <span className="text-xs font-semibold text-purple-200 mt-2">Miss You Bomb</span>
            <span className="text-[10px] text-slate-400">Screen Flash</span>
          </button>
        </div>
      </div>

      {/* Status Edit Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full space-y-4">
            <h4 className="font-bold text-white text-base">Update Your Status & Mood</h4>
            
            <div>
              <label className="text-xs text-slate-400 mb-1 block">What are you doing?</label>
              <input
                type="text"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="E.g. Thinking of you, Having lunch..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Pick Mood:</label>
              <div className="flex flex-wrap gap-1.5">
                {moodPresets.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setNewMood(m)}
                    className={`text-xs px-2.5 py-1 rounded-xl transition ${
                      newMood === m
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-500/30"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
