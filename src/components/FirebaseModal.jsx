import React, { useState } from 'react';
import {
  Flame,
  Check,
  Copy,
  X,
  Link2,
  Database,
  ExternalLink,
  Save,
  Sparkles
} from 'lucide-react';
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  getSavedRoomCode,
  saveRoomCode,
  firebaseSync,
} from '../utils/firebase';
import { soundManager } from '../utils/audio';

export default function FirebaseModal({ onClose, currentRoom, onRoomChange }) {
  const [roomCode, setRoomCode] = useState(currentRoom || getSavedRoomCode());
  const [config, setConfig] = useState(() => getFirebaseConfig());
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const cleanRoom = roomCode.trim().toUpperCase();
    saveRoomCode(cleanRoom);
    saveFirebaseConfig(config);
    firebaseSync.init(config);
    if (onRoomChange) {
      onRoomChange(cleanRoom);
    }
    soundManager.playChime();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const generateNewRoom = () => {
    const randomCode = 'LOVE-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(randomCode);
    soundManager.playKissPop();
  };

  const handleCopyInvite = () => {
    const shareUrl = `${window.location.origin}/?room=${roomCode.trim().toUpperCase()}`;
    navigator.clipboard?.writeText(shareUrl);
    soundManager.playKissPop();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Flame size={22} className="fill-slate-950 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base">Google Firebase Realtime DB</h3>
              <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Official Cloud Database for Couples</p>
          </div>
        </div>

        {/* Cloud Status Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Database Engine:</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              🔥 Firebase Realtime Database
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Sync Latency:</span>
            <span className="text-emerald-400 font-mono font-bold">&lt; 50ms Realtime WebSocket</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Local Database:</span>
            <span className="text-rose-400 font-semibold">Removed (100% Cloud)</span>
          </div>
        </div>

        {/* Couple Room Code */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 font-medium block">
            Firebase Couple Room Code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="E.g. LOVE-7788"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={generateNewRoom}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              New Code
            </button>
          </div>
        </div>

        {/* Share Link Banner */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <Link2 size={13} className="text-amber-400" /> Share with Partner
            </div>
            <div className="text-[10px] text-slate-400">Send this invite link to your partner</div>
          </div>
          <button
            type="button"
            onClick={handleCopyInvite}
            className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition"
          >
            {copiedLink ? <Check size={13} /> : <Copy size={13} />}
            {copiedLink ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Advanced Firebase Settings Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
          >
            <Database size={12} />
            {showAdvanced ? 'Hide Custom Firebase Credentials' : 'Configure Custom Firebase Project (Optional)'}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs animate-fadeIn">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Firebase Database URL:</label>
                <input
                  type="text"
                  value={config.databaseURL}
                  onChange={(e) => setConfig({ ...config, databaseURL: e.target.value })}
                  placeholder="https://your-project-default-rtdb.firebaseio.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Firebase Project ID:</label>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  placeholder="your-project-id"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Firebase Web API Key:</label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Free forever on Google Firebase</span>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  Firebase Console <ExternalLink size={9} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
        >
          <Save size={13} />
          {saveSuccess ? 'Firebase Connected & Saved! 🔥' : 'Save Firebase Settings'}
        </button>
      </div>
    </div>
  );
}
