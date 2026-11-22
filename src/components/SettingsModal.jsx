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
  Sun,
  Moon,
  Smartphone,
  Calendar,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

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
}) {
  if (!isOpen) return null;

  const [advancedMode, setAdvancedMode] = useState(true);
  const [startupPassword, setStartupPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] bg-slate-50 dark:bg-slate-900 sm:rounded-3xl border-x sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Card (Like Image 3) */}
        <div className="bg-gradient-to-r from-purple-100/70 via-pink-100/60 to-rose-100/70 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 p-5 border-b border-rose-200/50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/80 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-2xl">
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
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1">
                  ✉️ Bind Email
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Code: {partnerCode}
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

        {/* Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* 🌟 1. THEME SELECTION: DARK MODE / LIGHT MODE (USER'S EXPLICIT REQUEST) */}
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

          {/* 2. Primary Navigation Options (Image 3) */}
          <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* My Profile */}
            <div className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition">
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                <span className="text-base">🪪</span>
                <span>My profile</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </div>

            {/* Partners Profile */}
            <div className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition">
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                <span className="text-base">💖</span>
                <span>Partners' profile</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[11px] font-medium text-pink-500">
                  {partnerUser?.name || 'Waiting to join'}
                </span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* Notification */}
            <div
              onClick={() => {
                soundManager.playKissPop();
                setNotificationsEnabled(!notificationsEnabled);
              }}
              className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
            >
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                <Bell size={16} className="text-purple-500" />
                <span>Notification</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[11px]">{notificationsEnabled ? 'Open' : 'Closed'}</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* Languages */}
            <div
              onClick={() => setShowLanguagePicker(!showLanguagePicker)}
              className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
            >
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                <Globe size={16} className="text-sky-500" />
                <span>Languages</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {language}
                </span>
                <ChevronRight size={16} />
              </div>
            </div>

            {showLanguagePicker && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2 text-xs">
                <button
                  onClick={() => {
                    setLanguage('English');
                    setShowLanguagePicker(false);
                  }}
                  className={`px-3 py-1 rounded-lg ${language === 'English' ? 'bg-rose-500 text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('සිංහල');
                    setShowLanguagePicker(false);
                  }}
                  className={`px-3 py-1 rounded-lg ${language === 'සිංහල' ? 'bg-rose-500 text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  සිංහල
                </button>
              </div>
            )}

            {/* Anniversary Setting (Image 5) */}
            <div
              onClick={() => {
                soundManager.playKissPop();
                onOpenAnniversary();
              }}
              className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
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

            {/* About Phone Status (Image 2) */}
            <div
              onClick={() => {
                soundManager.playKissPop();
                onOpenPhoneStatus();
              }}
              className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
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

            {/* What Premium Includes (Image 1) */}
            <div
              onClick={() => {
                soundManager.playKissPop();
                onOpenPremium();
              }}
              className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
            >
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                <Crown size={16} className="text-amber-500 fill-amber-500" />
                <span>What Premium includes</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </div>

            {/* Account Security */}
            <div className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition">
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                <ShieldCheck size={16} className="text-indigo-500" />
                <span>Account Security</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>

          {/* 3. Advanced Toggles Card (Image 3) */}
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
                  setAdvancedMode(!advancedMode);
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
            <div className="p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">App Startup Password</span>
                <Crown size={13} className="text-amber-500 fill-amber-500" />
              </div>
              <button
                onClick={() => {
                  soundManager.playKissPop();
                  setStartupPassword(!startupPassword);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  startupPassword ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    startupPassword ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Contact Us */}
            <div className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition">
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                <MessageCircle size={16} className="text-emerald-500" />
                <span>Contact us</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </div>

            {/* App Version */}
            <div className="p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold">
                <Package size={16} className="text-purple-500" />
                <span>APP version</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500">3.24.0 (Ultra)</span>
            </div>

            {/* Privacy & Security */}
            <div className="p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition">
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

          {/* Bottom Share Banner (Image 3) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 text-white shadow-md flex items-center justify-between cursor-pointer">
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
        </div>
      </div>
    </div>
  );
}
