import React, { useState } from 'react';
import { Heart, Volume2, VolumeX, Sparkles, RefreshCw, KeyRound, Copy, Check, LogOut, Settings as SettingsIcon, Share2, Link as LinkIcon } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function Header({
  state,
  currentUserId,
  onSwitchUser,
  isMuted,
  onToggleMute,
  partnerCode,
  onLogout,
  onOpenSettings,
  onConnectPartnerCode,
}) {
  const currentUser = currentUserId === 'partnerA' ? state.partnerA : state.partnerB;
  const partnerUser = currentUserId === 'partnerA' ? state.partnerB : state.partnerA;
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('myCode'); // 'myCode' | 'enterCode'
  const [partnerInput, setPartnerInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleCopyCode = () => {
    if (partnerCode) {
      navigator.clipboard?.writeText(partnerCode);
      soundManager.playKissPop();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const origin = window.location.origin;
    const shareText = `Hey my love! ❤️ Join me on Love32 Ultra.\nOur Partner Code is: ${partnerCode}\nTap here to connect instantly: ${origin}/?code=${partnerCode}`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!partnerInput.trim()) return;
    if (typeof onConnectPartnerCode === 'function') {
      setIsConnecting(true);
      soundManager.playHeartbeat();
      const success = await onConnectPartnerCode(partnerInput.trim());
      setIsConnecting(false);
      if (success) {
        setShowCodeModal(false);
        setPartnerInput('');
      }
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 w-full backdrop-blur-2xl bg-slate-950/80 border-b border-rose-500/20 px-4 pb-2.5 transition select-none"
        style={{ paddingTop: 'max(10px, env(safe-area-inset-top, 10px))' }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* App Title & Pro Badge (Firebase Live icon completely removed as requested) */}
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
                  Love32
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 shadow-sm flex items-center gap-0.5">
                  <Sparkles size={9} /> PRO
                </span>

                {/* Subtle Partner Code Pill */}
                {partnerCode && (
                  <button
                    onClick={() => setShowCodeModal(true)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-700/80 hover:border-rose-500/50 text-rose-300 flex items-center gap-1 transition"
                    title="View Partner Code"
                  >
                    <KeyRound size={10} className="text-rose-400" />
                    <span>{partnerCode}</span>
                  </button>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="font-semibold text-rose-300">{currentUser.name || 'You'}</span>
                <Heart size={9} className="text-rose-500 fill-rose-500 inline" />
                <span className={partnerUser.isJoined && partnerUser.name ? 'font-semibold text-pink-300' : 'text-slate-500 italic'}>
                  {partnerUser.isJoined && partnerUser.name ? partnerUser.name : 'Waiting for partner... ⏳'}
                </span>
              </div>
            </div>
          </div>

          {/* User Profile Pill & Controls (Switcher completely removed as requested) */}
          <div className="flex items-center gap-1.5">
            {/* Active User Badge (Static, cannot switch) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-sm">
              <span className="text-sm">{currentUser.avatar}</span>
              <span className="font-bold text-white">{currentUser.name}</span>
            </div>

            {/* Settings Button (Theme & Preferences) */}
            {onOpenSettings && (
              <button
                onClick={() => {
                  soundManager.playKissPop();
                  onOpenSettings();
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition shadow-sm"
                title="Settings & Appearance"
              >
                <SettingsIcon size={15} />
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition shadow-sm"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-rose-500 dark:text-rose-400" />}
            </button>

            {/* Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800/60 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition shadow-sm"
                title="Log out / Switch Code"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Partner Code Modal: Dual Mode (Share or Connect) */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-5 max-w-sm w-full text-center space-y-3.5 shadow-2xl">
            {/* Mode Switch Tabs */}
            <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveCodeTab('myCode')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeCodeTab === 'myCode'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                My Partner Code
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab('enterCode')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeCodeTab === 'enterCode'
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Connect to Partner
              </button>
            </div>

            {activeCodeTab === 'myCode' ? (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="font-bold text-white text-base">Your Partner Code</h4>
                <p className="text-xs text-slate-400">
                  Share this code with your lover so their device pairs with yours:
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono font-black text-2xl text-rose-300 tracking-widest shadow-inner">
                  {partnerCode}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
                  >
                    <Share2 size={14} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectSubmit} className="space-y-3 animate-fadeIn text-left">
                <div className="text-center">
                  <h4 className="font-bold text-white text-base">Enter Partner's Code</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter the code sent by your partner to pair instantly:
                  </p>
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="E.g. LOVE-4634 or 4634"
                    value={partnerInput}
                    onChange={(e) => setPartnerInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm tracking-wider uppercase focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block px-1">
                    Accepts formats like <span className="text-sky-300">LOVE-4634</span> or simply the 4 numbers <span className="text-sky-300">4634</span>.
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isConnecting || !partnerInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition disabled:opacity-50"
                >
                  <LinkIcon size={14} />
                  <span>{isConnecting ? 'Connecting & Syncing...' : 'Connect to Partner 💖'}</span>
                </button>
              </form>
            )}

            <button
              onClick={() => setShowCodeModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
