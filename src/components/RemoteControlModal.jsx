import React, { useState } from 'react';
import {
  Gamepad2,
  X,
  BellRing,
  Vibrate,
  Zap,
  Moon,
  BookOpen,
  Tv,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Smartphone,
  Battery,
  Navigation,
  Compass,
  AlertTriangle,
  Send,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

export default function RemoteControlModal({
  isOpen,
  onClose,
  currentUserName,
  partnerUserName,
  partnerUser,
  onBroadcastEvent,
  onOpenScreenShare,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState('alarm'); // 'alarm' | 'haptic' | 'lock' | 'screen' | 'ping'
  const [takeoverType, setTakeoverType] = useState('bedtime'); // 'bedtime' | 'study'
  const [customTakeoverNote, setCustomTakeoverNote] = useState('');
  const [isTestSirenPlaying, setIsTestSirenPlaying] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  if (!isOpen) return null;

  const showStatus = (msg) => {
    setActionStatus(msg);
    setTimeout(() => setActionStatus(''), 4000);
  };

  // 1. Send Emergency Siren
  const handleSendRemoteSiren = () => {
    soundManager.playLaserClick();
    if (onBroadcastEvent) {
      onBroadcastEvent('REMOTE_RING_ALERT', currentUserName, {
        timestamp: Date.now(),
        senderName: currentUserName,
      });
    }
    showStatus(`🚨 Loud Siren sent to ${partnerUserName}'s phone!`);
    if (showToast) showToast(`🚨 Siren sent to ${partnerUserName}'s phone!`);
  };

  // Test siren locally
  const handleToggleTestSiren = () => {
    if (isTestSirenPlaying) {
      soundManager.stopRemoteSiren();
      setIsTestSirenPlaying(false);
    } else {
      soundManager.playRemoteSiren();
      setIsTestSirenPlaying(true);
    }
  };

  // 2. Send Haptic Vibrations
  const hapticPresets = [
    {
      id: 'heartbeat',
      name: 'Heartbeat Thump',
      icon: '💓',
      desc: 'Double rhythmic love pulse',
      pattern: [120, 80, 150],
    },
    {
      id: 'electric',
      name: 'Electric Zap',
      icon: '⚡',
      desc: 'Triple energetic haptic buzz',
      pattern: [80, 40, 80, 40, 160],
    },
    {
      id: 'tickle',
      name: 'Gentle Tickle',
      icon: '🪶',
      desc: 'Cute high-speed butterfly flutter',
      pattern: [30, 30, 30, 30, 30, 30, 100],
    },
    {
      id: 'wakeup',
      name: 'Wake Up Shake',
      icon: '📢',
      desc: 'Intense persistent waking pulse',
      pattern: [350, 100, 350, 100, 600],
    },
  ];

  const handleSendHaptic = (preset) => {
    soundManager.playKissPop();
    soundManager.triggerVibration(preset.pattern);
    if (onBroadcastEvent) {
      onBroadcastEvent('REMOTE_VIBRATE_ALERT', currentUserName, {
        pattern: preset.pattern,
        name: preset.name,
        icon: preset.icon,
      });
    }
    showStatus(`${preset.icon} Sent "${preset.name}" vibration to ${partnerUserName}!`);
    if (showToast) showToast(`📳 Sent "${preset.name}" buzz to ${partnerUserName}!`);
  };

  // 3. Send Strobe Flash Alert
  const handleSendStrobeFlash = () => {
    soundManager.playStrobePing();
    if (onBroadcastEvent) {
      onBroadcastEvent('REMOTE_FLASH_ALERT', currentUserName, {
        duration: 3500,
        senderName: currentUserName,
      });
    }
    showStatus(`🔦 Strobe beacon triggered on ${partnerUserName}'s screen!`);
    if (showToast) showToast(`🔦 Strobe alert sent to ${partnerUserName}!`);
  };

  // 4. Send Bedtime / Study Lock Takeover
  const handleSendTakeover = () => {
    soundManager.playChime();
    const defaultNote =
      takeoverType === 'bedtime'
        ? 'Nidaaganna welaawa hari sweetheart! Phone eka thiyala nidaaganna 😴💖'
        : 'Wada karana welaawa hari! Social media nawaththala padam karamu 📖🔥';

    const note = customTakeoverNote.trim() || defaultNote;

    if (onBroadcastEvent) {
      onBroadcastEvent('REMOTE_BEDTIME_TAKEOVER', currentUserName, {
        type: takeoverType,
        message: note,
        senderName: currentUserName,
        timestamp: Date.now(),
      });
    }
    try {
      confetti({ particleCount: 60, spread: 70 });
    } catch (e) {}

    showStatus(`🔒 ${takeoverType === 'bedtime' ? 'Bedtime Lock' : 'Study Focus'} sent to ${partnerUserName}!`);
    if (showToast) showToast(`🔒 Takeover sent to ${partnerUserName}!`);
  };

  // 5. Ping Diagnostics
  const handlePingDevice = () => {
    soundManager.playKissPop();
    if (onBroadcastEvent) {
      onBroadcastEvent('REMOTE_PING_STATUS', currentUserName, {
        requestTime: Date.now(),
      });
    }
    showStatus(`📡 Ping sent! Requesting ${partnerUserName}'s latest battery and GPS...`);
    if (showToast) showToast(`📡 Diagnostic ping sent to ${partnerUserName}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-rose-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">

        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-inner">
              <Gamepad2 size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>Couple Remote Controller</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                  ONLINE
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Remotely interact & connect with <span className="text-rose-400 font-bold">{partnerUserName}</span>'s phone
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isTestSirenPlaying) {
                soundManager.stopRemoteSiren();
                setIsTestSirenPlaying(false);
              }
              onClose();
            }}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Status Banner */}
        {actionStatus && (
          <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{actionStatus}</span>
          </div>
        )}

        {/* Category Navigation Tabs */}
        <div className="flex p-2 bg-slate-900/80 border-b border-slate-800 gap-1 overflow-x-auto no-scrollbar text-[11px] font-bold select-none">
          <button
            onClick={() => setActiveTab('alarm')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'alarm'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BellRing size={13} />
            <span>Siren</span>
          </button>

          <button
            onClick={() => setActiveTab('haptic')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'haptic'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Vibrate size={13} />
            <span>Haptic</span>
          </button>

          <button
            onClick={() => setActiveTab('screen')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'screen'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tv size={13} />
            <span>Pointer</span>
          </button>

          <button
            onClick={() => setActiveTab('lock')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'lock'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Moon size={13} />
            <span>Bedtime</span>
          </button>

          <button
            onClick={() => setActiveTab('ping')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ping'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio size={13} />
            <span>Diagnostics</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">

          {/* ========================================================
              TAB 1: LOUD SIREN / FIND PHONE
             ======================================================== */}
          {activeTab === 'alarm' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 animate-pulse">
                  <BellRing size={32} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Find Partner's Phone / Wake Up Alarm</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Triggers a high-volume emergency siren and heavy vibration on <span className="text-rose-400 font-bold">{partnerUserName || 'your partner'}</span>'s phone even if on silent! It will ring until they press "I am here!".
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSendRemoteSiren}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-sm shadow-xl shadow-rose-600/30 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <BellRing size={20} className="animate-bounce" />
                    <span>RING {(partnerUserName || 'PARTNER').toUpperCase()}'S PHONE NOW 🚨</span>
                  </button>
                </div>
              </div>

              {/* Local Test Siren Button */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Volume2 size={16} className="text-rose-400" />
                  <span>Test Siren Sound Locally (on your phone)</span>
                </div>
                <button
                  onClick={handleToggleTestSiren}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] flex items-center gap-1 ${
                    isTestSirenPlaying
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isTestSirenPlaying ? (
                    <>
                      <VolumeX size={12} />
                      <span>Stop Siren</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={12} />
                      <span>Play Test</span>
                    </>
                  )}
                </button>
              </div>

              {/* Strobe Flash Shortcut */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🔦 Remote Strobe Beacon</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Flashes their phone screen with neon strobe light for 3 seconds
                  </p>
                </div>
                <button
                  onClick={handleSendStrobeFlash}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center gap-1.5"
                >
                  <Zap size={14} />
                  <span>Flash Screen</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: HAPTIC VIBRATION REMOTE
             ======================================================== */}
          {activeTab === 'haptic' && (
            <div className="space-y-3">
              <div className="text-center pb-1">
                <h3 className="text-xs font-bold text-white">Touch-Free Remote Vibrations</h3>
                <p className="text-[11px] text-slate-400">
                  Trigger physical haptic pulses in {partnerUserName}'s hands instantly
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {hapticPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSendHaptic(preset)}
                    className="p-4 rounded-2xl bg-slate-900/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-left transition group active:scale-95 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-2xl mb-1 group-hover:scale-110 transition origin-left">
                        {preset.icon}
                      </div>
                      <h4 className="text-xs font-black text-white">{preset.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{preset.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-purple-400">
                      <span>Buzz Now</span>
                      <span>⚡</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: POINTER & LIVE SCREEN SHARE
             ======================================================== */}
          {activeTab === 'screen' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-slate-900 border border-indigo-500/30 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 shadow-xl">
                  <Tv size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Live Screen & Interactive Laser Pointer</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Watch {partnerUserName}'s screen in real-time. Whenever you tap or click on their stream, an interactive <span className="text-rose-400 font-bold">Laser Pointer</span> shines on their screen at the exact touch point!
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-indigo-500/20 text-[11px] text-indigo-200 text-left space-y-1">
                  <div className="flex items-center gap-2 font-bold text-indigo-300">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>How it works:</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5 pl-1">
                    <li>Partner starts screen share with Android/browser permission</li>
                    <li>You watch live in HD with audio</li>
                    <li>Tap anywhere to point out questions, answers or formulas!</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenScreenShare) onOpenScreenShare();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white font-black text-xs shadow-xl shadow-indigo-600/30 hover:opacity-95 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Tv size={16} />
                  <span>Launch Screen Sharing & Laser Pointer 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: BEDTIME & STUDY FOCUS LOCK
             ======================================================== */}
          {activeTab === 'lock' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTakeoverType('bedtime')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      takeoverType === 'bedtime'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon size={14} />
                    <span>Bedtime Lock 😴</span>
                  </button>

                  <button
                    onClick={() => setTakeoverType('study')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      takeoverType === 'study'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen size={14} />
                    <span>Study Focus 📖</span>
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Sweet Custom Message (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={customTakeoverNote}
                    onChange={(e) => setCustomTakeoverNote(e.target.value)}
                    placeholder={
                      takeoverType === 'bedtime'
                        ? 'e.g. Nidaaganna baba, heta udema aharamu! Sweet dreams ❤️'
                        : 'e.g. Past paper eka iwara karala maawa call karanna! 📖🔥'
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>

                <button
                  onClick={handleSendTakeover}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-black text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>Send Takeover to {partnerUserName}'s Screen 🔒</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                <span>Displays a gentle, full-screen lock reminder on their phone that they can dismiss whenever ready.</span>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: DIAGNOSTICS & PING
             ======================================================== */}
          {activeTab === 'ping' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Smartphone size={16} className="text-cyan-400" />
                    <span>{partnerUserName}'s Device Info</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800">
                    Live Synced
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
                      <Battery size={13} className="text-emerald-400" />
                      <span>Battery</span>
                    </div>
                    <div className="text-sm font-black text-white">
                      {partnerUser?.battery != null ? `${partnerUser.battery}%` : 'Connecting...'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {partnerUser?.isCharging ? '⚡ Fast Charging' : 'On Battery'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
                      <Compass size={13} className="text-purple-400" />
                      <span>Speed / Motion</span>
                    </div>
                    <div className="text-sm font-black text-white">
                      {partnerUser?.speedKmH != null ? `${partnerUser.speedKmH} km/h` : '0 km/h'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {partnerUser?.activity || 'Resting 🛋️'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePingDevice}
                  className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-lg shadow-cyan-600/30 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Radio size={14} className="animate-spin" />
                  <span>Request Fresh Battery & GPS Status 📡</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>Security note: All diagnostic commands run through secure end-to-end Firebase sync with partner consent.</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
