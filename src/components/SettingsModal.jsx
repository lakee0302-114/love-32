import React, { useState } from 'react';
import {
  X,
  User,
  Heart,
  Bell,
  Globe,
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  Crown,
  MessageCircle,
  Package,
  FileText,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Smartphone,
  Calendar,
  Sparkles,
  LogOut,
  Copy,
  Check,
  Share2,
  Key,
  Lock,
  Mail,
  Send,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Zap,
  Volume2,
  Phone,
  Radio,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { updatePasswordInFirebase } from '../utils/firebase';

const AVATAR_OPTIONS = [
  '🤴', '👸', '🦁', '🐱', '🐶', '🐻', '🐼', '🐰',
  '🦊', '🐨', '🦄', '🐣', '🌸', '👑', '💖', '⭐',
  '🌺', '🍓', '🥑', '🚀', '🏎️', '🧁', '🧸', '✨'
];

const QUICK_MOODS = [
  'Missing my cutie 💕',
  'At Work 💻',
  'Driving 🚗',
  'Thinking of you 🌸',
  'Sleeping 😴',
  'Online & Happy ✨',
  'Studying 📚',
  'Eating snacks 🍕'
];

const LANGUAGES = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'si', name: 'සිංහල (Sinhala)', flag: '🇱🇰' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
];

export default function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  partnerUser,
  theme,
  onToggleTheme,
  onOpenAnniversary,
  onOpenPhoneStatus,
  onOpenPremium,
  onLogout,
  partnerCode,
  userEmail = 'lakee0302@gmail.com',
  onUpdateProfile,
  onSendHeartbeat,
  onSendQuickKiss,
  showToast = () => {},
  state = {},
}) {
  if (!isOpen) return null;

  // Navigation Sub-view state
  // null = main menu | 'my_profile' | 'partner_profile' | 'bind_email' | 'notifications' | 'languages' | 'account_security' | 'startup_password' | 'contact_us' | 'app_version' | 'privacy_security' | 'share_and_win'
  const [activeSubView, setActiveSubView] = useState(null);

  // General settings state
  const [advancedMode, setAdvancedMode] = useState(true);
  const [startupPasswordEnabled, setStartupPasswordEnabled] = useState(false);
  const [startupPin, setStartupPin] = useState('1234');
  const [newPinInput, setNewPinInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  // Notification toggles
  const [notifMaster, setNotifMaster] = useState(true);
  const [notifKisses, setNotifKisses] = useState(true);
  const [notifBattery, setNotifBattery] = useState(true);
  const [notifSpeed, setNotifSpeed] = useState(true);
  const [notifSound, setNotifSound] = useState(true);

  // Profile Edit State
  const [editName, setEditName] = useState(currentUser?.name || 'Lakee');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '🤴');
  const [editMood, setEditMood] = useState(currentUser?.status || 'Missing my cutie 💕');

  // Account Security state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Feedback form state
  const [feedbackCategory, setFeedbackCategory] = useState('General Feedback 💡');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // App version check state
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  // Copied state
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = (text, message = 'Copied to clipboard! 📋') => {
    soundManager.playKissPop();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    showToast(message);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveProfile = () => {
    soundManager.playKissPop();
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim() || 'Lakee',
        avatar: editAvatar,
        status: editMood.trim(),
      });
    }
    showToast('✨ Profile updated successfully!');
    setActiveSubView(null);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('⚠️ Password must be at least 6 characters!');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('⚠️ Passwords do not match!');
      return;
    }

    setPasswordUpdating(true);
    soundManager.playKissPop();
    try {
      await updatePasswordInFirebase(userEmail, newPassword);
      // update local credentials if stored
      try {
        const storedUsers = JSON.parse(localStorage.getItem('love8_registered_users') || '{}');
        if (storedUsers[userEmail.toLowerCase()]) {
          storedUsers[userEmail.toLowerCase()].password = newPassword;
          localStorage.setItem('love8_registered_users', JSON.stringify(storedUsers));
        }
      } catch (e) {}

      showToast('🔐 Password updated successfully in Firebase!');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSubView(null);
    } catch (err) {
      showToast('⚠️ Error updating password');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleSendFeedback = () => {
    if (!feedbackMessage.trim()) {
      showToast('⚠️ Please write a message before sending!');
      return;
    }
    soundManager.playKissPop();
    setFeedbackSubmitted(true);
    showToast('💖 Thank you! Your feedback has been received!');
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackSubmitted(false);
      setActiveSubView(null);
    }, 1500);
  };

  const handleCheckUpdate = () => {
    soundManager.playKissPop();
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateStatus('🎉 You are using the latest Love32 Ultra v1.0.2 (Build 32403)!');
      showToast('🎉 Already on the newest version!');
    }, 1200);
  };

  const isPartnerJoined = Boolean(partnerUser && partnerUser.isJoined && partnerUser.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] bg-slate-50 dark:bg-slate-900 sm:rounded-3xl border-x sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* ======================================================== */}
        {/* SUB-VIEW HEADER (If navigating into a section)           */}
        {/* ======================================================== */}
        {activeSubView ? (
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 sticky top-0 z-10">
            <button
              onClick={() => {
                soundManager.playKissPop();
                setActiveSubView(null);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={18} />
              <span>Settings</span>
            </button>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
              {activeSubView === 'my_profile' && 'My Profile'}
              {activeSubView === 'partner_profile' && "Partner's Profile"}
              {activeSubView === 'bind_email' && 'Bind Email'}
              {activeSubView === 'notifications' && 'Notification Settings'}
              {activeSubView === 'languages' && 'Languages'}
              {activeSubView === 'account_security' && 'Account Security'}
              {activeSubView === 'startup_password' && 'App Startup Password'}
              {activeSubView === 'contact_us' && 'Contact Us'}
              {activeSubView === 'app_version' && 'App Version'}
              {activeSubView === 'privacy_security' && 'Privacy & Security'}
              {activeSubView === 'share_and_win' && 'Share & Win'}
            </h3>
            <button
              onClick={() => {
                soundManager.playKissPop();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center transition"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          /* ======================================================== */
          /* MAIN SETTINGS HEADER (Matches Screenshot)                */
          /* ======================================================== */
          <div className="bg-gradient-to-r from-purple-100/70 via-pink-100/60 to-rose-100/70 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 p-5 border-b border-rose-200/50 dark:border-slate-800 flex items-center justify-between">
            <div
              onClick={() => {
                soundManager.playKissPop();
                setActiveSubView('my_profile');
              }}
              className="flex items-center gap-3 cursor-pointer group"
              title="Click to edit profile"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/80 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-2xl group-hover:scale-105 transition">
                  {currentUser?.avatar || '🤴'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] shadow">
                  ✏️
                </div>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{currentUser?.name || 'Lakee'}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 shadow-sm">
                    PRO
                  </span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playKissPop();
                      setActiveSubView('bind_email');
                    }}
                    className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1 hover:bg-purple-200 transition"
                  >
                    ✉️ Bind Email
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(partnerCode, `Copied Partner Code: ${partnerCode} 📋`);
                    }}
                    className="text-[10px] font-mono text-slate-500 hover:text-purple-600 transition flex items-center gap-0.5"
                    title="Click to copy code"
                  >
                    Code: {partnerCode}
                    <Copy size={9} className="opacity-70 ml-0.5" />
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playKissPop();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center shadow-sm transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCROLLABLE BODY CONTENT                                  */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: MY PROFILE                                 */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'my_profile' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-100 to-rose-100 dark:from-slate-800 dark:to-purple-950 border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center text-4xl animate-bounce-subtle">
                  {editAvatar}
                </div>
                <div className="mt-2 text-xs font-bold text-slate-500">Pick Your Avatar Emoji</div>
                
                {/* Avatar Emoji Grid */}
                <div className="grid grid-cols-6 gap-2 mt-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        soundManager.playKissPop();
                        setEditAvatar(emoji);
                      }}
                      className={`text-2xl p-1.5 rounded-xl transition ${
                        editAvatar === emoji
                          ? 'bg-rose-500/20 border-2 border-rose-500 scale-110 shadow-sm'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Mood Inputs */}
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Current Mood / Tagline
                  </label>
                  <input
                    type="text"
                    value={editMood}
                    onChange={(e) => setEditMood(e.target.value)}
                    placeholder="e.g. Missing my cutie 💕"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  {/* Quick Mood Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {QUICK_MOODS.map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => {
                          soundManager.playKissPop();
                          setEditMood(mood);
                        }}
                        className={`text-[10px] px-2 py-1 rounded-full border transition ${
                          editMood === mood
                            ? 'bg-rose-500 text-white font-bold border-rose-500'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Account Email:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    {userEmail}
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <Check size={18} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: PARTNER'S PROFILE                          */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'partner_profile' && (
            <div className="space-y-4 animate-fadeIn">
              {isPartnerJoined ? (
                /* Partner is Connected */
                <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-200 to-rose-200 dark:from-slate-800 dark:to-pink-950 border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center text-4xl">
                      {partnerUser.avatar || '🌸'}
                    </div>
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {partnerUser.name}
                    </h3>
                    <p className="text-xs text-pink-500 font-bold mt-0.5">
                      {partnerUser.status || 'Connected with you 💕'}
                    </p>
                  </div>

                  {/* Partner Telemetry Cards */}
                  <div className="grid grid-cols-2 gap-2 text-left pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Battery</div>
                      <div className="text-sm font-extrabold text-emerald-500 mt-0.5 flex items-center gap-1">
                        <span>🔋 {partnerUser.battery ?? 88}%</span>
                        {partnerUser.isCharging && <span className="text-[10px] text-amber-500">⚡ Charging</span>}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Travel Speed</div>
                      <div className="text-sm font-extrabold text-sky-500 mt-0.5">
                        🚗 {partnerUser.speedKmH ?? 0} km/h
                      </div>
                    </div>
                  </div>

                  {/* Quick Interaction Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playKissPop();
                        if (onSendQuickKiss) onSendQuickKiss();
                        showToast(`💋 Blew a kiss to ${partnerUser.name}!`);
                      }}
                      className="py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition flex items-center justify-center gap-1.5"
                    >
                      <span>💋 Blow Kiss</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playHeartbeat();
                        if (onSendHeartbeat) onSendHeartbeat();
                        showToast(`💓 Heartbeat sent to ${partnerUser.name}!`);
                      }}
                      className="py-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-300 font-bold text-xs border border-pink-200 dark:border-pink-900 hover:bg-pink-100 transition flex items-center justify-center gap-1.5"
                    >
                      <span>💓 Send Heartbeat</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Partner is NOT Connected (Waiting to join) */
                <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-500 flex items-center justify-center text-3xl animate-pulse-heart">
                    💖
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Waiting for Partner to Join
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Share your unique Partner Code with your loved one. As soon as they enter it on their device, your live radar will connect!
                    </p>
                  </div>

                  {/* Code Card */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border-2 border-dashed border-rose-400 dark:border-rose-600">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Your Unique Partner Code
                    </div>
                    <div className="text-2xl font-black font-mono tracking-wider text-rose-600 dark:text-rose-400 my-1">
                      {partnerCode}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(partnerCode, `Copied Partner Code: ${partnerCode} 📋`)}
                      className="mt-1 px-4 py-1.5 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow hover:bg-rose-600 transition inline-flex items-center gap-1.5"
                    >
                      <Copy size={13} />
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* Share buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}?code=${partnerCode}`;
                        const text = `Join me on Love32 Ultra with Partner Code: ${partnerCode} 💕\n${shareUrl}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
                    >
                      <span>💬 Share via WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}?code=${partnerCode}`;
                        copyToClipboard(shareUrl, 'Invite link copied to clipboard! 📋');
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
                    >
                      <Share2 size={14} />
                      <span>Copy Invite Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: BIND EMAIL                                 */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'bind_email' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Email Account Linked
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your account is permanently bound to this email.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Bound Email</div>
                  <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-white mt-0.5 flex items-center justify-between">
                    <span>{userEmail}</span>
                    <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950">
                      Verified ✅
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-left text-xs text-purple-700 dark:text-purple-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span>Real-time Multi-Device Sync</span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    Use this email and your password to log in from any phone or browser. All your partner data and settings will instantly restore.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: NOTIFICATIONS                              */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'notifications' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white">Push Notifications</div>
                    <div className="text-[10px] text-slate-500">Master alert switch for all activity</div>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playKissPop();
                      setNotifMaster(!notifMaster);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      notifMaster ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifMaster ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Kisses & Heartbeats</div>
                    <div className="text-[10px] text-slate-500">Alert when partner blows kiss or heartbeat</div>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playKissPop();
                      setNotifKisses(!notifKisses);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      notifKisses ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifKisses ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Low Battery Warning</div>
                    <div className="text-[10px] text-slate-500">Notify when partner phone battery drops &lt; 20%</div>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playKissPop();
                      setNotifBattery(!notifBattery);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      notifBattery ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifBattery ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Travel & Speed Alerts</div>
                    <div className="text-[10px] text-slate-500">Notify when partner is on the move / driving</div>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playKissPop();
                      setNotifSpeed(!notifSpeed);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      notifSpeed ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifSpeed ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">In-App Sound FX</div>
                    <div className="text-[10px] text-slate-500">Play romantic pop & heartbeat chimes</div>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playKissPop();
                      setNotifSound(!notifSound);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      notifSound ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifSound ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Test Sound Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playKissPop();
                  showToast('🔔 Playing cute test alert sound!');
                }}
                className="w-full py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-900 hover:bg-purple-100 transition flex items-center justify-center gap-2"
              >
                <Volume2 size={16} />
                <span>Test Alert Sound</span>
              </button>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: LANGUAGES                                  */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'languages' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => {
                      soundManager.playKissPop();
                      setSelectedLanguage(lang.name);
                      showToast(`Language set to ${lang.name}! 🌐`);
                      setTimeout(() => setActiveSubView(null), 300);
                    }}
                    className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
                  >
                    <div className="flex items-center gap-3 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                    {selectedLanguage === lang.name && (
                      <Check size={16} className="text-rose-500 font-bold" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: ACCOUNT SECURITY                           */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'account_security' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Security Status Card */}
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Security Status: High Protection
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Protected by Resend 2FA Email OTP & Firebase RTDB
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Email 2FA Verification:</span>
                    <span className="font-bold text-emerald-500">Active (Resend API) ✅</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Realtime Cloud DB:</span>
                    <span className="font-bold text-indigo-500">AES-256 Encrypted</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Current Session:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Android / Web Active 🟢</span>
                  </div>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Key size={15} className="text-indigo-500" />
                  <span>Change Password</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  disabled={passwordUpdating}
                  onClick={handleUpdatePassword}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock size={14} />
                  <span>{passwordUpdating ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: APP STARTUP PASSWORD                       */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'startup_password' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      App Lock on Startup
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Require a 4-digit PIN every time Love32 opens
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playKissPop();
                      setStartupPasswordEnabled(!startupPasswordEnabled);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      startupPasswordEnabled ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        startupPasswordEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {startupPasswordEnabled && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">
                      Set 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1234"
                      className="w-full px-3 py-2 text-center tracking-widest text-lg font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPinInput.length === 4) {
                          soundManager.playKissPop();
                          setStartupPin(newPinInput);
                          showToast('🔒 4-digit PIN saved successfully!');
                          setActiveSubView(null);
                        } else {
                          showToast('⚠️ Please enter exactly 4 digits');
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow transition"
                    >
                      Save App PIN
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: CONTACT US                                 */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'contact_us' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
                <div className="text-center pb-2">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Need Help or Have Feedback?
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    We respond within 24 hours to help every couple!
                  </p>
                </div>

                {/* Direct buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.open(
                        `https://api.whatsapp.com/send?text=${encodeURIComponent('Hi Love32 Team, I need assistance with my app.')}`,
                        '_blank'
                      );
                    }}
                    className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-emerald-100 transition"
                  >
                    <span className="text-lg">💬</span>
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `mailto:support@love-32.app?subject=Love32 Support Request&body=Account Email: ${userEmail}`;
                    }}
                    className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-300 font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-sky-100 transition"
                  >
                    <Mail size={18} />
                    <span>Email Us</span>
                  </button>
                </div>

                {/* In-app Message Form */}
                <div className="pt-2 space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">
                    Direct Feedback Form
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option>General Feedback 💡</option>
                    <option>Report a Bug 🐛</option>
                    <option>Feature Request 🚀</option>
                    <option>Other Question ❓</option>
                  </select>

                  <textarea
                    rows={3}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Tell us what you love or what we can improve..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  />

                  <button
                    type="button"
                    onClick={handleSendFeedback}
                    className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>Send Feedback</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: APP VERSION                                */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'app_version' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-3xl shadow-lg">
                  💖
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Love32 Ultra
                  </h3>
                  <p className="text-xs text-rose-500 font-bold mt-0.5">
                    Version 3.24.1 (Build 32403 - APK v1.0.2)
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Release Channel:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Production Android / Web</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Firebase Realtime DB:</span>
                    <span className="font-bold text-emerald-500">Connected 🟢</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Email Dispatch:</span>
                    <span className="font-bold text-purple-500">Resend Verified ✉️</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isCheckingUpdate}
                  onClick={handleCheckUpdate}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-500 text-white font-bold text-xs shadow hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={isCheckingUpdate ? 'animate-spin' : ''} />
                  <span>{isCheckingUpdate ? 'Checking for Updates...' : 'Check for Updates'}</span>
                </button>

                {updateStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                    {updateStatus}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: PRIVACY & SECURITY                         */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'privacy_security' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-2.5 text-xs font-extrabold text-slate-900 dark:text-white">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span>Your Privacy & Data Rights</span>
                </div>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                      🔒 1-on-1 End-to-End Room Isolation
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Your location, speed, battery, and love actions are shared strictly with the single partner paired to your unique room code.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                      📍 Real-Time Location Transparency
                    </div>
                    <p className="text-[11px] text-slate-500">
                      GPS coordinates are transmitted solely between both devices and never shared with advertisers or third-party brokers.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                      🛡️ Zero Tracking Ads
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Love32 Ultra contains zero ad SDKs and does not monitor user activity across apps or websites.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear local telemetry cache and reload?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition"
                >
                  Clear Local Cache & Reset
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-VIEW: SHARE & WIN                                */}
          {/* ---------------------------------------------------- */}
          {activeSubView === 'share_and_win' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg space-y-3">
                <span className="text-4xl">🎁</span>
                <h3 className="text-lg font-black uppercase tracking-wide">
                  Share Love32 & Win Ultra VIP
                </h3>
                <p className="text-xs text-white/90">
                  Invite your partner or another couple to Love32 Ultra and enjoy all premium features!
                </p>

                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl font-mono font-black text-xl tracking-wider">
                  {partnerCode}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}?code=${partnerCode}`;
                      copyToClipboard(shareUrl, 'Invite link copied to clipboard! 📋');
                    }}
                    className="w-full py-2.5 rounded-xl bg-white text-slate-950 font-extrabold text-xs shadow hover:bg-slate-100 transition"
                  >
                    Copy Invite Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}?code=${partnerCode}`;
                      const text = `Join me on Love32 Ultra with Partner Code: ${partnerCode} 💕\n${shareUrl}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow transition"
                  >
                    Share via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MAIN SETTINGS MENU (When activeSubView is null)           */}
          {/* ======================================================== */}
          {!activeSubView && (
            <>
              {/* 🌟 1. THEME SELECTION: DARK MODE / LIGHT MODE */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Sun size={15} className="text-amber-500" />
                    <span>Appearance & Theme</span>
                  </span>
                  <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider">
                    {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playKissPop();
                      if (theme !== 'light') onToggleTheme('light');
                    }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                      theme === 'light'
                        ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-sm ring-2 ring-rose-300'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Sun size={15} className="text-amber-500" />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playKissPop();
                      if (theme !== 'dark') onToggleTheme('dark');
                    }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-rose-500 text-white shadow-sm ring-2 ring-rose-500'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Moon size={15} className="text-indigo-400" />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>

              {/* 2. Primary Navigation Options */}
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80">
                {/* My Profile */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    setActiveSubView('my_profile');
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <span className="text-base">🪪</span>
                    <span>My profile</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>

                {/* Partners Profile */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    setActiveSubView('partner_profile');
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <span className="text-base">💖</span>
                    <span>Partners' profile</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[11px] font-medium text-pink-500">
                      {isPartnerJoined ? partnerUser.name : 'Waiting to join'}
                    </span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* Notification */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    setActiveSubView('notifications');
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <Bell size={16} className="text-purple-500" />
                    <span>Notification</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[11px]">{notifMaster ? 'Open' : 'Closed'}</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* Languages */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    setActiveSubView('languages');
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <Globe size={16} className="text-sky-500" />
                    <span>Languages</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {selectedLanguage}
                    </span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* Anniversary Setting */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    onOpenAnniversary();
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <Calendar size={16} className="text-pink-500" />
                    <span>Anniversary Date Setting</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[11px] text-pink-500 font-bold">Edit</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* About Phone Status */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    onOpenPhoneStatus();
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <Smartphone size={16} className="text-emerald-500" />
                    <span>About Phone Status</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[11px] text-emerald-500 font-semibold">Standard / Advanced</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* What Premium Includes */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    onOpenPremium();
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <Crown size={16} className="text-amber-500 fill-amber-500" />
                    <span>What Premium includes</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>

                {/* Account Security */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    setActiveSubView('account_security');
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <ShieldCheck size={16} className="text-indigo-500" />
                    <span>Account Security</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>

              {/* 3. Advanced Toggles Card */}
              <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80">
                {/* Advanced Mode Toggle */}
                <div className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Advanced Mode</span>
                    <Crown size={13} className="text-amber-500 fill-amber-500" />
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playKissPop();
                      const next = !advancedMode;
                      setAdvancedMode(next);
                      showToast(next ? '⚡ Advanced Radar & Sensor mode activated!' : 'Standard telemetry mode');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      advancedMode ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        advancedMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* App Startup Password Toggle */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    setActiveSubView('startup_password');
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">App Startup Password</span>
                    <Crown size={13} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playKissPop();
                        setStartupPasswordEnabled(!startupPasswordEnabled);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        startupPasswordEnabled ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          startupPasswordEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>

                {/* Contact Us */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    setActiveSubView('contact_us');
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <MessageCircle size={16} className="text-emerald-500" />
                    <span>Contact us</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>

                {/* App Version */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    setActiveSubView('app_version');
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <Package size={16} className="text-purple-500" />
                    <span>APP version</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[11px] font-mono font-bold text-slate-500">v1.0.2 (Ultra)</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* Privacy & Security */}
                <div
                  onClick={() => {
                    soundManager.playKissPop();
                    setActiveSubView('privacy_security');
                  }}
                  className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                    <FileText size={16} className="text-sky-500" />
                    <span>Privacy & Security</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={() => {
                    soundManager.playKissPop();
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/30 flex items-center justify-center gap-2 transition"
                >
                  <LogOut size={15} />
                  <span>Log Out / Switch Account</span>
                </button>
              )}

              {/* Bottom Share Banner */}
              <div
                onClick={() => {
                  soundManager.playKissPop();
                  setActiveSubView('share_and_win');
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 text-white shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 active:scale-[0.99] transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="text-xs font-black tracking-wide uppercase">Share & Win</div>
                    <div className="text-[10px] text-white/90">Invite couples & earn rewards</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white text-slate-950 text-[10px] font-extrabold shadow">
                  Claim
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}