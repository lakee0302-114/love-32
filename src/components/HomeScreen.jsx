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
  ShieldCheck,
  CheckCircle2,
  Circle,
  Plus,
  ListTodo,
  Crosshair,
  Radio,
  Share2,
  KeyRound,
  Users
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import GoogleMapView from './GoogleMapView';

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
  onToggleBucketItem,
  onAddBucketItem,
  partnerCode,
  onOpenSettings,
  onOpenAnniversary,
  onOpenPremium,
  onOpenPhoneStatus,
  onOpenStudyHub,
  theme,
}) {
  const [viewMode, setViewMode] = useState('googleMap'); // 'googleMap' (Default - Love8 Google Map) | 'classicRadar'
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

  const [isLocating, setIsLocating] = useState(false);
  const [newBucketDream, setNewBucketDream] = useState('');

  const handleGetRealGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser/device.');
      return;
    }
    setIsLocating(true);
    soundManager.playKissPop();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(3);
        const lng = pos.coords.longitude.toFixed(3);
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
        soundManager.playSuccess();
        onUpdateSpeed && onUpdateSpeed(speed, speed > 10 ? 'In Vehicle 🚗' : speed > 2 ? 'Walking 🚶' : 'Resting 🛋️');
        alert(`📍 Real GPS Located!\nCoordinates: ${lat}, ${lng}\nLive Motion: ${speed} km/h`);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not retrieve GPS coordinates. Please allow location access in your browser settings.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleAddBucketSubmit = (e) => {
    e.preventDefault();
    if (!newBucketDream.trim()) return;
    onAddBucketItem && onAddBucketItem(newBucketDream.trim());
    setNewBucketDream('');
  };

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

  const handleSaveStatus = (e) => {
    e.preventDefault();
    onUpdateMyStatus(newStatus, newMood);
    setShowStatusModal(false);
    soundManager.playChime();
  };

  // 🌟 GOOGLE MAP VIEW (Matches User Screenshot from Love8)
  if (viewMode === 'googleMap') {
    return (
      <div className="relative w-full h-[calc(100vh-65px)]">
        <GoogleMapView
          state={state}
          currentUserId={currentUserId}
          onOpenSettings={onOpenSettings}
          onOpenAnniversary={onOpenAnniversary}
          onOpenPremium={onOpenPremium}
          onOpenPhoneStatus={onOpenPhoneStatus}
          onSendHeartbeat={onSendHeartbeat}
          onSendQuickKiss={onSendQuickKiss}
          onSendNudge={onSendNudge}
          onOpenMissYou={onOpenMissYou}
          onUpdateMyStatus={onUpdateMyStatus}
          onUpdateDistance={onUpdateDistance}
          onUpdateSpeed={onUpdateSpeed}
          onToggleBucketItem={onToggleBucketItem}
          onAddBucketItem={onAddBucketItem}
          partnerCode={partnerCode}
          theme={theme}
        />

        {/* Floating Quick Button for A/L Study Hub */}
        <button
          type="button"
          onClick={() => {
            soundManager.playKissPop();
            if (onOpenStudyHub) onOpenStudyHub();
          }}
          className="absolute top-16 left-3.5 z-20 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-rose-900/90 border border-indigo-400/40 shadow-xl text-[10px] font-black text-white hover:scale-105 active:scale-95 transition flex items-center gap-1.5 backdrop-blur-md"
          title="Open A/L Study & Quiz Hub"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>🎓 A/L Study Hub</span>
        </button>

        {/* Floating switch to classic radar */}
        <button
          type="button"
          onClick={() => {
            soundManager.playKissPop();
            setViewMode('classicRadar');
          }}
          className="absolute top-16 right-3.5 z-20 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl text-[10px] font-black text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
          title="Switch to Classic Radar View"
        >
          <span>🎯</span>
          <span>Radar View</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Return to Google Map Button */}
      <button
        type="button"
        onClick={() => {
          soundManager.playKissPop();
          setViewMode('googleMap');
        }}
        className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition"
      >
        <span>🗺️</span>
        <span>Back to Google Map View (Love8 Style)</span>
      </button>
      {/* 1. Days Together / Partner Connection Banner */}
      {!partnerUser.isJoined ? (
        <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-purple-950/70 via-slate-900/90 to-rose-950/70 border border-rose-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>Partner Connection Pending</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Code: {partnerCode}</span>
          </div>
          <div>
            <h3 className="text-base font-black text-white">Waiting for Your Partner to Connect 💖</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Share your secret Partner Code with your loved one. As soon as they enter it, your live locations, distance & speed will sync!
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (partnerCode) {
                  navigator.clipboard?.writeText(partnerCode);
                  soundManager.playKissPop();
                  alert(`Partner Code ${partnerCode} copied to clipboard! Send it to your partner.`);
                }
              }}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-95"
            >
              <KeyRound size={13} className="text-rose-400" />
              <span>Copy Code ({partnerCode || 'LOVE'})</span>
            </button>
            <button
              onClick={() => {
                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://love-32.vercel.app';
                const shareUrl = `https://wa.me/?text=${encodeURIComponent(`Hey my love! Connect with me on Love32 Ultra with my Partner Code: ${partnerCode} 💖 Link: ${origin}/?code=${partnerCode}`)}`;
                window.open(shareUrl, '_blank');
              }}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Share2 size={13} />
              <span>WhatsApp Invite</span>
            </button>
          </div>
        </div>
      ) : (
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
      )}

      {/* 2. Interactive Distance Radar with Real-Time Speed Badges */}
      <div className="relative rounded-3xl p-5 bg-slate-900/70 border border-slate-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <NavIcon size={16} className="text-rose-400 animate-spin" style={{ animationDuration: '8s' }} />
            <h3 className="text-sm font-bold text-white tracking-wide">Live Distance Radar</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleGetRealGPS}
              disabled={isLocating}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Calibrate Phone GPS"
            >
              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isLocating ? 'animate-ping' : 'animate-pulse'}`} />
              <Crosshair size={11} className={isLocating ? 'animate-spin' : ''} />
              <span>{isLocating ? 'Calibrating...' : 'Live GPS Satellite Active'}</span>
            </button>
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
          <div className="z-10 bg-slate-950/90 border border-rose-500/50 rounded-2xl px-3.5 py-1.5 shadow-[0_0_25px_rgba(244,63,94,0.3)] text-center backdrop-blur">
            <div className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300">
              {partnerUser.isJoined && state.distanceKm !== null && state.distanceKm !== undefined
                ? state.distanceKm >= 1
                  ? `${state.distanceKm} km`
                  : `${Math.round(state.distanceKm * 1000)} m`
                : '-- km'}
            </div>
            <div className="text-[9px] text-slate-400 font-medium">
              {partnerUser.isJoined ? 'Live Satellite GPS 🛰️' : 'Waiting for Partner ⏳'}
            </div>
          </div>

          {/* Partner Avatar + Speed Badge */}
          <div className="absolute right-6 flex flex-col items-center">
            {partnerUser.isJoined ? (
              <>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(244,63,94,0.4)] border-2 border-white/80 animate-bounce-subtle">
                    {partnerUser.avatar || '💖'}
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                    Love
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-pink-300 mt-1 max-w-[75px] truncate text-center">
                  {partnerUser.name}
                </span>
                <div className="mt-0.5 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/40 text-[10px] font-bold text-rose-300 shadow">
                  <Gauge size={10} className="text-rose-400" />
                  <span>{partnerUser.speedKmH ? `${partnerUser.speedKmH} km/h` : '0 km/h'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-dashed border-rose-500/50 flex items-center justify-center text-xl text-rose-400 animate-pulse">
                    ⏳
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
                    Partner
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 mt-1 max-w-[85px] truncate text-center">
                  Not Connected
                </span>
                <div className="mt-0.5 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-500">
                  ⏳ Pending
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Status & Weather details */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
          {/* Partner's Live Card */}
          <div className="bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800">
            {partnerUser.isJoined ? (
              <>
                <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
                  <span>{partnerUser.name}'s Status</span>
                  <span className="text-[9px] text-emerald-400">● Live</span>
                </div>
                <div className="text-white font-medium text-xs truncate">
                  {partnerUser.status}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1">
                  <CloudSun size={12} className="text-amber-400" />
                  <span>{partnerUser.weather || 'Online'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] mt-1 text-pink-300">
                  <Activity size={12} className="text-rose-400" />
                  <span className="font-semibold">{partnerUser.activity || 'Resting 🛋️'}</span>
                  <span className="text-[10px] text-slate-400">({partnerUser.speedKmH || 0} km/h)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] mt-1 text-slate-300">
                  {partnerUser.isCharging ? (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Zap size={13} className="fill-emerald-400 animate-pulse" />
                      <span>{partnerUser.battery}% Charging</span>
                    </div>
                  ) : partnerUser.battery < 20 ? (
                    <div className="flex items-center gap-1 text-rose-400 font-bold">
                      <BatteryLow size={13} className="animate-pulse" />
                      <span>{partnerUser.battery}% Low Battery!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Battery size={13} className="text-slate-300" />
                      <span>{partnerUser.battery}% Phone Battery</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col justify-between py-0.5">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
                    <span>Partner Status</span>
                    <span className="text-[9px] text-amber-400">⏳ Pending</span>
                  </div>
                  <div className="text-slate-200 font-bold text-xs">
                    Not connected yet
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    Real GPS, battery & speed will appear when partner joins with code.
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-rose-300 font-semibold flex items-center gap-1">
                  <KeyRound size={11} className="text-rose-400" />
                  <span>Code: {partnerCode}</span>
                </div>
              </div>
            )}
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
              {currentUser.isCharging ? (
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Zap size={13} className="fill-emerald-400 animate-pulse" />
                  <span>{currentUser.battery}% Charging</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Battery size={13} className="text-slate-400" />
                  <span>{currentUser.battery}% Phone Battery</span>
                </div>
              )}
              <span className="text-[9px] text-sky-400 ml-auto font-mono">
                {currentUser.coords ? `${currentUser.coords.lat.toFixed(2)}°, ${currentUser.coords.lng.toFixed(2)}°` : 'Live GPS'}
              </span>
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
              <span className="font-semibold text-rose-300">
                {partnerUser.isJoined ? partnerUser.name : 'Partner'}
              </span>
              <span className="text-[10px] text-rose-400">
                {partnerUser.isJoined ? '● Live GPS' : '⏳ Pending'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-black text-white font-mono">
                {partnerUser.isJoined ? (partnerUser.speedKmH ?? 0) : '--'}
              </span>
              <span className="text-xs text-rose-300 font-bold uppercase">km/h</span>
            </div>
            <div className="text-[11px] font-medium text-slate-300 flex items-center gap-1 truncate">
              <span>{partnerUser.isJoined ? (partnerUser.activity || 'Resting 🛋️') : 'Waiting for partner... ⏳'}</span>
            </div>
            {/* Speedometer progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${partnerUser.isJoined ? Math.min(100, ((partnerUser.speedKmH || 0) / 120) * 100) : 0}%` }}
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

        {/* Automatic GPS Speed Telemetry HUD (Love32 Pro Feature) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span>Auto-Detecting Speed from Device Sensors</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Sensor Active
            </span>
          </div>

          {/* Activity Category Grid */}
          <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
            <div className={`p-2 rounded-xl border transition ${
              (currentUser.speedKmH || 0) < 2
                ? 'bg-rose-500/25 border-rose-500 text-white font-bold shadow-sm'
                : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
            }`}>
              <div className="text-base">🛋️</div>
              <div className="text-[10px] mt-0.5">Resting</div>
              <div className="text-[9px] text-slate-500">&lt; 2 km/h</div>
            </div>

            <div className={`p-2 rounded-xl border transition ${
              (currentUser.speedKmH || 0) >= 2 && (currentUser.speedKmH || 0) < 7
                ? 'bg-rose-500/25 border-rose-500 text-white font-bold shadow-sm'
                : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
            }`}>
              <div className="text-base">🚶</div>
              <div className="text-[10px] mt-0.5">Walking</div>
              <div className="text-[9px] text-slate-500">2 - 6 km/h</div>
            </div>

            <div className={`p-2 rounded-xl border transition ${
              (currentUser.speedKmH || 0) >= 7 && (currentUser.speedKmH || 0) < 18
                ? 'bg-rose-500/25 border-rose-500 text-white font-bold shadow-sm'
                : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
            }`}>
              <div className="text-base">🚴</div>
              <div className="text-[10px] mt-0.5">Cycling</div>
              <div className="text-[9px] text-slate-500">7 - 17 km/h</div>
            </div>

            <div className={`p-2 rounded-xl border transition ${
              (currentUser.speedKmH || 0) >= 18
                ? 'bg-rose-500/25 border-rose-500 text-white font-bold shadow-sm'
                : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
            }`}>
              <div className="text-base">🚗</div>
              <div className="text-[10px] mt-0.5">Vehicle</div>
              <div className="text-[9px] text-slate-500">&gt; 18 km/h</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Speedometer detects physical motion automatically</span>
            </span>
            <button
              onClick={handleGetRealGPS}
              className="text-sky-400 hover:text-sky-300 font-semibold underline flex items-center gap-1"
            >
              <Crosshair size={11} />
              <span>Calibrate</span>
            </button>
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

      {/* 5. COUPLE SHARED BUCKET LIST & DREAMS (LOVE32 PRO FEATURE) */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-900/90 via-slate-950 to-purple-950/30 border border-purple-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <ListTodo size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Couple Bucket List & Dreams</h3>
              <p className="text-[10px] text-purple-300">
                {(state.bucketList || []).filter((b) => b.completed).length} of {(state.bucketList || []).length} adventures completed!
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {Math.round((((state.bucketList || []).filter((b) => b.completed).length) / Math.max(1, (state.bucketList || []).length)) * 100)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.round((((state.bucketList || []).filter((b) => b.completed).length) / Math.max(1, (state.bucketList || []).length)) * 100)}%`,
            }}
          />
        </div>

        {/* Bucket List Items */}
        <div className="space-y-2">
          {(state.bucketList || []).map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleBucketItem && onToggleBucketItem(item.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                item.completed
                  ? 'bg-purple-950/20 border-purple-500/40 text-slate-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-purple-500/40 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {item.completed ? (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <Circle size={18} className="text-slate-600 shrink-0 hover:text-purple-400" />
                )}
                <span className={`text-xs font-medium truncate ${item.completed ? 'line-through text-slate-500' : ''}`}>
                  {item.title}
                </span>
              </div>
              {item.completed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold shrink-0">
                  Done ✨
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Add new bucket dream form */}
        <form onSubmit={handleAddBucketSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            value={newBucketDream}
            onChange={(e) => setNewBucketDream(e.target.value)}
            placeholder="Add a new dream goal together..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-purple-600/30 transition active:scale-95"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </form>
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
