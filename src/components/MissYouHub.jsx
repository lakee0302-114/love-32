import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Send,
  Sparkles,
  Flame,
  Palette,
  Eraser,
  Save,
  Check,
  Radio,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

export default function MissYouHub({
  currentUserName,
  partnerUserName,
  onSendScreenBomb,
  onSaveDoodleToMemories,
}) {
  const [subTab, setSubTab] = useState('bomb'); // 'bomb' | 'heartbeat' | 'hug' | 'doodle'

  // Bomb state
  const [selectedEmoji, setSelectedEmoji] = useState('💖');
  const [selectedMessage, setSelectedMessage] = useState('Thinking about your sweet smile right now! 🥰');
  const [customText, setCustomText] = useState('');
  const [bombSentNotice, setBombSentNotice] = useState(false);

  const bombPresets = [
    { emoji: '💖', label: 'Floating Hearts', text: 'My heart beats only for you! 💕' },
    { emoji: '💋', label: 'Flying Kisses', text: '1,000 sweet kisses on your cheeks! 💋' },
    { emoji: '🧸', label: 'Warm Bear Hug', text: 'Sending you the biggest, warmest cuddle! 🫂' },
    { emoji: '✨', label: 'Magic Sparkles', text: 'You light up my entire world! ✨' },
    { emoji: '🥺', label: 'Need You Now', text: 'I miss your voice so much today... 🥺' },
  ];

  const handleSendBomb = () => {
    const msg = customText.trim() || selectedMessage;
    onSendScreenBomb({
      senderName: currentUserName,
      emoji: selectedEmoji,
      message: msg,
    });
    soundManager.playChime();
    setBombSentNotice(true);
    setTimeout(() => setBombSentNotice(false), 3000);
  };

  // Heartbeat Hold State
  const [isHoldingHeart, setIsHoldingHeart] = useState(false);
  const [heartbeatCount, setHeartbeatCount] = useState(0);
  const heartbeatIntervalRef = useRef(null);

  const startHeartbeat = () => {
    setIsHoldingHeart(true);
    soundManager.playHeartbeat();
    setHeartbeatCount((c) => c + 1);

    heartbeatIntervalRef.current = setInterval(() => {
      soundManager.playHeartbeat();
      setHeartbeatCount((c) => c + 1);
    }, 900);
  };

  const stopHeartbeat = () => {
    setIsHoldingHeart(false);
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
  };

  // Virtual Hug Hold State
  const [hugProgress, setHugProgress] = useState(0);
  const [isHugging, setIsHugging] = useState(false);
  const [hugComplete, setHugComplete] = useState(false);
  const hugIntervalRef = useRef(null);

  const startHug = () => {
    setIsHugging(true);
    setHugComplete(false);
    soundManager.playHeartbeat();

    hugIntervalRef.current = setInterval(() => {
      setHugProgress((prev) => {
        if (prev >= 100) {
          clearInterval(hugIntervalRef.current);
          setHugComplete(true);
          soundManager.playChime();
          try {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          } catch (e) {}
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const stopHug = () => {
    setIsHugging(false);
    if (hugIntervalRef.current) {
      clearInterval(hugIntervalRef.current);
    }
    if (hugProgress < 100) {
      setHugProgress(0);
    }
  };

  // Live Canvas Doodle
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#f43f5e');
  const [doodleSaved, setDoodleSaved] = useState(false);

  useEffect(() => {
    if (subTab === 'doodle' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [subTab]);

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeColor === '#0f172a' ? 24 : 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDoodle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDoodleToMemories({
      title: `Doodle from ${currentUserName} 🎨`,
      date: 'Just now',
      location: 'Drawn with Love',
      note: 'A special hand-drawn piece sent straight from the heart!',
      imageUrl: dataUrl,
      likes: 1,
    });
    soundManager.playChime();
    setDoodleSaved(true);
    setTimeout(() => setDoodleSaved(false), 2500);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Sub navigation pills */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        {[
          { id: 'bomb', label: 'Screen Bomb', icon: Flame },
          { id: 'heartbeat', label: 'Heartbeat', icon: Heart },
          { id: 'hug', label: 'Virtual Hug', icon: Sparkles },
          { id: 'doodle', label: 'Live Doodle', icon: Palette },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setSubTab(item.id);
                soundManager.playKissPop();
              }}
              className={`py-2 px-1 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 transition ${
                subTab === item.id
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span className="text-[10px] truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. SCREEN BOMB SUB-TAB */}
      {subTab === 'bomb' && (
        <div className="space-y-4">
          <div className="rounded-3xl p-5 bg-gradient-to-br from-rose-950/60 via-purple-950/40 to-slate-900 border border-rose-500/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white text-base">Send Love32 Screen Bomb</h3>
                <p className="text-xs text-rose-200/80">
                  Explodes on {partnerUserName}'s screen with sound & haptic hearts!
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                PRO FEATURE
              </span>
            </div>

            {/* Bomb Presets */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-slate-400 block font-medium">Select Cute Bomb Type:</label>
              <div className="grid grid-cols-5 gap-2">
                {bombPresets.map((b) => (
                  <button
                    key={b.label}
                    onClick={() => {
                      setSelectedEmoji(b.emoji);
                      setSelectedMessage(b.text);
                      soundManager.playKissPop();
                    }}
                    className={`flex flex-col items-center p-2 rounded-2xl border transition ${
                      selectedEmoji === b.emoji
                        ? 'bg-rose-500/30 border-rose-400 scale-105 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{b.emoji}</span>
                    <span className="text-[9px] text-slate-300 truncate w-full text-center">
                      {b.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Message Preview */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 block font-medium mb-1">Attached Note:</label>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-rose-500/30 text-rose-200 text-xs italic font-medium">
                "{selectedMessage}"
              </div>
            </div>

            {/* Custom note option */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Or type your own romantic message..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendBomb}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <Flame size={18} />
              Launch Screen Bomb to {partnerUserName}!
            </button>

            {bombSentNotice && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium animate-fadeIn">
                ✨ Bomb launched! Exploding on {partnerUserName}'s phone right now!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. REAL-TIME HEARTBEAT SUB-TAB */}
      {subTab === 'heartbeat' && (
        <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Radio size={13} className="text-rose-400 animate-pulse" />
            Synchronized Haptic Heartbeat
          </div>

          <h3 className="font-bold text-white text-lg mt-1 mb-1">
            Send Real-Time Heartbeats
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mb-6">
            Press and hold the heart. As long as you hold it, your simulated pulse and heartbeat audio will vibrate on {partnerUserName}'s phone!
          </p>

          {/* Big Interactive Heart Button */}
          <div className="relative my-4 flex items-center justify-center">
            {isHoldingHeart && (
              <>
                <div className="absolute w-48 h-48 rounded-full border-2 border-rose-500/50 animate-ping pointer-events-none" />
                <div className="absolute w-64 h-64 rounded-full border border-rose-500/30 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              onMouseDown={startHeartbeat}
              onMouseUp={stopHeartbeat}
              onMouseLeave={stopHeartbeat}
              onTouchStart={startHeartbeat}
              onTouchEnd={stopHeartbeat}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-200 select-none ${
                isHoldingHeart
                  ? 'bg-gradient-to-tr from-rose-600 to-pink-600 scale-110 shadow-[0_0_60px_rgba(244,63,94,0.8)]'
                  : 'bg-gradient-to-tr from-rose-500/40 to-pink-500/40 border border-rose-500/50 hover:scale-105 shadow-xl'
              }`}
            >
              <Heart
                size={54}
                className={`text-white transition-transform ${
                  isHoldingHeart ? 'fill-white animate-pulse-heart' : 'fill-rose-400'
                }`}
              />
              <span className="text-[11px] text-white/90 font-bold mt-1">
                {isHoldingHeart ? 'Sending...' : 'Hold Me'}
              </span>
            </button>
          </div>

          <div className="text-sm font-semibold text-rose-300 mt-2">
            Heartbeats Sent: <span className="text-white font-mono text-base">{heartbeatCount}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            Audio synthesized via Web Audio API • 0ms latency
          </span>
        </div>
      )}

      {/* 3. VIRTUAL HUG SIMULATOR */}
      {subTab === 'hug' && (
        <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center">
          <h3 className="font-bold text-white text-lg mb-1">Virtual Touch & Hug</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-6">
            Press and hold both thumb scanners to wrap your arms around {partnerUserName}.
          </p>

          <div className="relative my-4 flex items-center justify-center gap-8">
            <button
              onMouseDown={startHug}
              onMouseUp={stopHug}
              onTouchStart={startHug}
              onTouchEnd={stopHug}
              className={`w-28 h-36 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-300 select-none ${
                isHugging
                  ? 'border-rose-400 bg-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.5)] scale-95'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
              }`}
            >
              <span className="text-4xl mb-2">🖐️</span>
              <span className="text-[10px] text-slate-400 font-medium">Your Hand</span>
            </button>

            <button
              onMouseDown={startHug}
              onMouseUp={stopHug}
              onTouchStart={startHug}
              onTouchEnd={stopHug}
              className={`w-28 h-36 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-300 select-none ${
                isHugging
                  ? 'border-pink-400 bg-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.5)] scale-95'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
              }`}
            >
              <span className="text-4xl mb-2">🖐️</span>
              <span className="text-[10px] text-slate-400 font-medium">{partnerUserName}'s Hand</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-60 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700 mt-2">
            <div
              className="bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 h-full transition-all duration-150"
              style={{ width: `${hugProgress}%` }}
            />
          </div>

          <div className="text-xs text-slate-300 font-medium mt-3">
            {hugComplete ? (
              <span className="text-emerald-400 font-bold text-sm">
                🫂 Warm hug delivered to {partnerUserName}!
              </span>
            ) : isHugging ? (
              <span className="text-pink-300">Embracing... {hugProgress}%</span>
            ) : (
              'Hold down to hug tightly'
            )}
          </div>
        </div>
      )}

      {/* 4. LIVE DOODLE CANVAS */}
      {subTab === 'doodle' && (
        <div className="rounded-3xl p-4 bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Shared Love Canvas</h3>
              <p className="text-[11px] text-slate-400">Draw a heart or cute note for {partnerUserName}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={clearCanvas}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                title="Clear Canvas"
              >
                <Eraser size={13} /> Clear
              </button>
              <button
                onClick={saveDoodle}
                className="py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-1 shadow"
              >
                {doodleSaved ? <Check size={13} /> : <Save size={13} />}
                {doodleSaved ? 'Saved!' : 'Save & Send'}
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center touch-none">
            <canvas
              ref={canvasRef}
              width={340}
              height={260}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              className="cursor-crosshair w-full max-w-[340px] h-[260px]"
            />
          </div>

          {/* Color palette */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {[
              { color: '#f43f5e', name: 'Rose Red' },
              { color: '#ec4899', name: 'Pink' },
              { color: '#a855f7', name: 'Purple' },
              { color: '#38bdf8', name: 'Sky Blue' },
              { color: '#facc15', name: 'Yellow' },
              { color: '#ffffff', name: 'White' },
              { color: '#0f172a', name: 'Eraser' },
            ].map((c) => (
              <button
                key={c.color}
                onClick={() => setStrokeColor(c.color)}
                style={{ backgroundColor: c.color }}
                className={`w-7 h-7 rounded-full border-2 transition ${
                  strokeColor === c.color ? 'border-white scale-125 shadow-lg' : 'border-slate-800'
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
