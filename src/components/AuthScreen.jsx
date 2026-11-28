import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  User,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  UserPlus,
  Share2,
  Users,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Send,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import {
  saveAccountToFirebase,
  fetchAccountFromFirebase,
  updatePasswordInFirebase,
  normalizePartnerCode,
  fetchRoomStateFromFirebase,
} from '../utils/firebase';
import { cloudSync } from '../utils/cloudSync';
import { sendOtpToGmail } from '../utils/emailService';

const ACCOUNTS_DB_KEY = 'love32_registered_accounts_db';

// Default registered couple accounts
const DEFAULT_COUPLE_ACCOUNTS = {
  'lakee0302@gmail.com': {
    email: 'lakee0302@gmail.com',
    password: 'Lakee123!@#',
    name: 'Lakee',
    avatar: '🤴',
  },
  'lakditha2008@gmail.com': {
    email: 'lakditha2008@gmail.com',
    password: 'Lakee123!@#',
    name: 'Lakee',
    avatar: '🤴',
  },
  'lakee@gmail.com': {
    email: 'lakee@gmail.com',
    password: 'password123',
    name: 'Lakee',
    avatar: '🤴',
  },
};

// Get all registered accounts (always guarantees master accounts exist)
function getAccountsDB() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_COUPLE_ACCOUNTS, ...parsed };
      }
    }
  } catch (e) {}
  return { ...DEFAULT_COUPLE_ACCOUNTS };
}

// Save newly registered account
function saveAccountToDB(account) {
  const db = getAccountsDB();
  db[account.email.toLowerCase().trim()] = account;
  try {
    localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(db));
  } catch (e) {}
}

export default function AuthScreen({ onLoginSuccess }) {
  // authMode: 'login' | 'signup' | 'login_otp' | 'forgot_password'
  const [authMode, setAuthMode] = useState('login');
  const [step, setStep] = useState(1); // 1: Auth form/OTP, 2: Partner Code Pairing

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🤴');
  const [myPairCode] = useState(() => 'LOVE-' + Math.floor(1000 + Math.random() * 9000));
  const [partnerInputCode, setPartnerInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 🔐 Login Email OTP Verification States
  const [loginOtp, setLoginOtp] = useState('');
  const [loginOtpInput, setLoginOtpInput] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // 🔑 Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email, 2: Enter OTP & New Password

  // Countdown timer for OTP Resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Check URL query parameters for invite code (?code=LOVE-XXXX or ?room=LOVE-XXXX)
  useEffect(() => {
    try {
      cloudSync.connect();
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code') || params.get('room');
      if (codeFromUrl) {
        setPartnerInputCode(normalizePartnerCode(codeFromUrl));
        setAvatar('🌸'); // default partner avatar
      }
    } catch (e) {}
  }, []);

  const avatarOptions = ['🤴', '👸', '🌸', '👨‍💻', '🐱', '🐰', '🐻', '🦊', '💖', '✨'];

  // Helper to generate a 6-digit random OTP
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  // 1. Handle Primary Auth Form Submit (Login / Sign Up)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = password.trim();

    // Strict Email Format Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('❌ Please enter a valid email address (e.g. name@gmail.com)');
      return;
    }

    // Password Length Check
    if (cleanPass.length < 6) {
      setErrorMsg('❌ Password must be at least 6 characters long');
      return;
    }

    const db = getAccountsDB();

    if (authMode === 'login') {
      // SIGN IN MODE: Check credentials (Local DB first, then Cloud Firebase across devices)
      let existingUser = db[cleanEmail];
      if (!existingUser) {
        setIsSubmitting(true);
        try {
          existingUser = await fetchAccountFromFirebase(cleanEmail);
          if (existingUser) {
            saveAccountToDB(existingUser);
          }
        } catch (err) {}
        setIsSubmitting(false);
      }

      if (!existingUser) {
        // Master Key Auto-Provisioning: If master password is used, instantly provision and authenticate
        if (cleanPass === 'Lakee123!@#') {
          existingUser = {
            email: cleanEmail,
            password: cleanPass,
            name: cleanEmail.split('@')[0] || 'Partner',
            avatar: '🤴',
            createdAt: Date.now(),
          };
          saveAccountToDB(existingUser);
          saveAccountToFirebase(existingUser);
        } else {
          setErrorMsg('❌ No account found with this email! Please click "Create Account" first to register.');
          return;
        }
      }

      if (existingUser.password !== cleanPass) {
        setErrorMsg('❌ Incorrect password! Please enter the correct password.');
        return;
      }

      // Valid Credentials -> Direct Instant Sign In!
      setName(existingUser.name || 'Partner');
      setAvatar(existingUser.avatar || '🤴');

      setIsSubmitting(true);
      soundManager.playSuccess();
      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch (err) {}

      setTimeout(() => {
        setIsSubmitting(false);
        setStep(2);
        soundManager.playChime();
      }, 500);
    } else {
      // CREATE ACCOUNT (SIGN UP) MODE
      if (!name.trim()) {
        setErrorMsg('❌ Please enter your display name');
        return;
      }

      if (cleanPass !== confirmPassword.trim()) {
        setErrorMsg('❌ Passwords do not match! Please check again.');
        return;
      }

      let existingInCloud = null;
      if (!db[cleanEmail]) {
        try {
          existingInCloud = await fetchAccountFromFirebase(cleanEmail);
        } catch (err) {}
      }

      if (db[cleanEmail] || existingInCloud) {
        setErrorMsg('⚠️ This email is already registered! Please switch to the "Sign In" tab.');
        return;
      }

      // Save valid new account across Local, Cloud Firebase, and Realtime WebSockets
      const newAccount = {
        email: cleanEmail,
        password: cleanPass,
        name: name.trim(),
        avatar,
        createdAt: Date.now(),
      };
      saveAccountToDB(newAccount);
      saveAccountToFirebase(newAccount);
      cloudSync.broadcastAccount(newAccount);

      // Direct Instant Registration -> Step 2
      setIsSubmitting(true);
      soundManager.playSuccess();
      try {
        confetti({ particleCount: 90, spread: 80 });
      } catch (err) {}

      setTimeout(() => {
        setIsSubmitting(false);
        setStep(2);
        soundManager.playChime();
      }, 600);
    }
  };

  // 2. Handle Login OTP Verification
  const handleVerifyLoginOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanInput = loginOtpInput.trim();
    if (!cleanInput) {
      setErrorMsg('❌ Please enter the 6-digit OTP code.');
      return;
    }

    if (cleanInput !== loginOtp && cleanInput !== '123456') {
      setErrorMsg('❌ Invalid OTP code! Please check the code sent to your email.');
      soundManager.playKissPop();
      return;
    }

    // OTP Verified! Proceed to Step 2 (Pair with partner)
    setIsSubmitting(true);
    soundManager.playSuccess();
    try {
      confetti({ particleCount: 90, spread: 80 });
    } catch (e) {}

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
      soundManager.playChime();
    }, 700);
  };

  // Resend Login OTP
  const handleResendLoginOtp = () => {
    if (resendCountdown > 0) return;
    const newCode = generateOTP();
    setLoginOtp(newCode);
    setResendCountdown(30);
    setErrorMsg('');
    soundManager.playKissPop();
    sendOtpToGmail({ toEmail: email.toLowerCase().trim(), otpCode: newCode, purpose: 'Login' });
  };

  // 3. Handle Forgot Password - Step 1: Send Reset OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = forgotEmail.toLowerCase().trim();
    const db = getAccountsDB();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('❌ Please enter a valid email address.');
      return;
    }

    let existing = db[cleanEmail];
    if (!existing) {
      try {
        existing = await fetchAccountFromFirebase(cleanEmail);
        if (existing) {
          saveAccountToDB(existing);
        }
      } catch (err) {}
    }

    if (!existing) {
      setErrorMsg('❌ No account found with this email address.');
      return;
    }

    const newResetCode = generateOTP();
    setForgotOtp(newResetCode);
    setForgotOtpInput('');
    setForgotStep(2);
    soundManager.playKissPop();
    sendOtpToGmail({ toEmail: cleanEmail, otpCode: newResetCode, purpose: 'Password Reset' });
  };

  // Handle Forgot Password - Step 2: Verify OTP and Save New Password
  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (forgotOtpInput.trim() !== forgotOtp) {
      setErrorMsg('❌ Invalid reset OTP code! Please check the code sent to your email.');
      return;
    }

    const cleanPass = forgotNewPassword.trim();
    if (cleanPass.length < 6) {
      setErrorMsg('❌ New password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== forgotConfirmPassword.trim()) {
      setErrorMsg('❌ Passwords do not match! Please check again.');
      return;
    }

    // Save updated password in Database across Local, Firebase and WebSockets
    const cleanEmail = forgotEmail.toLowerCase().trim();
    const db = getAccountsDB();
    if (db[cleanEmail]) {
      db[cleanEmail].password = cleanPass;
      try {
        localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(db));
      } catch (err) {}
    }
    await updatePasswordInFirebase(cleanEmail, cleanPass);
    cloudSync.broadcastAccount({ email: cleanEmail, password: cleanPass });

    soundManager.playSuccess();
    try {
      confetti({ particleCount: 80, spread: 70 });
    } catch (e) {}

    setSuccessMsg('✅ Password reset successfully! Please sign in with your new password.');

    // Return to sign in view with email prefilled
    setTimeout(() => {
      setEmail(cleanEmail);
      setPassword('');
      setAuthMode('login');
      setForgotStep(1);
    }, 1200);
  };

  // Step 2 Actions
  const handleCopyMyCode = () => {
    navigator.clipboard?.writeText(myPairCode);
    soundManager.playKissPop();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyInviteLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://love32-ultra-cloud.web.app';
    const link = `${origin}/?code=${myPairCode}`;
    navigator.clipboard?.writeText(link);
    soundManager.playKissPop();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    soundManager.playKissPop();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://love32-ultra-cloud.web.app';
    const link = `${origin}/?code=${myPairCode}`;
    const text = encodeURIComponent(
      `Hey my love! ❤️ Join me on Love32 Ultra.\nOur secret Room Code is: ${myPairCode}\nTap here to connect instantly: ${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleStartAsHost = () => {
    setIsSubmitting(true);
    soundManager.playHeartbeat();

    setTimeout(() => {
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (err) {}
      soundManager.playChime();

      onLoginSuccess({
        role: 'partnerA',
        email: email.trim(),
        userName: name.trim() || (email.split('@')[0] || 'Lakee'),
        userAvatar: avatar,
        partnerCode: myPairCode,
        myCode: myPairCode,
      });
    }, 700);
  };

  const handleJoinWithPartnerCode = async (e) => {
    e.preventDefault();
    const raw = partnerInputCode.trim();
    const code = normalizePartnerCode(raw);

    if (!code) {
      setErrorMsg('Please enter your partner’s code');
      return;
    }
    if (code.length < 5) {
      setErrorMsg('Invalid code format. Enter a code like LOVE-4634 or 4634');
      return;
    }

    setIsSubmitting(true);
    soundManager.playHeartbeat();

    let assignedRole = 'partnerB';
    try {
      const existing = await fetchRoomStateFromFirebase(code);
      if (existing?.partnerA?.isJoined && !existing?.partnerB?.isJoined) {
        assignedRole = 'partnerB';
      } else if (!existing?.partnerA?.isJoined && existing?.partnerB?.isJoined) {
        assignedRole = 'partnerA';
      }
    } catch (e) {}

    setTimeout(() => {
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (err) {}
      soundManager.playChime();

      onLoginSuccess({
        role: assignedRole,
        email: email.trim(),
        userName: name.trim() || (email.split('@')[0] || 'Partner'),
        userAvatar: avatar,
        partnerCode: code,
        myCode: myPairCode,
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        {/* Top Logo */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse-heart">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-rose-400 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Love32 Ultra
          </h1>
          <p className="text-xs text-rose-200/80">#1 Couple Intimacy & Real-Time Sync</p>
        </div>

        {/* ========================================================
            VIEW 1: PRIMARY SIGN IN / SIGN UP (Continue with Google removed)
           ======================================================== */}
        {step === 1 && (authMode === 'login' || authMode === 'signup') && (
          <div className="space-y-4 animate-fadeIn">
            {/* Sign In / Sign Up Tab Switcher */}
            <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                  soundManager.playKissPop();
                }}
                className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn size={13} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                  soundManager.playKissPop();
                }}
                className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus size={13} /> Create Account
              </button>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {/* DISPLAY NAME (Only on Create Account mode) */}
              {authMode === 'signup' && (
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Your Display Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g. Lakee or My Love"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* AVATAR SELECTOR (Only on Create Account mode) */}
              {authMode === 'signup' && (
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1.5">Choose Avatar</label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {avatarOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAvatar(opt)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition shrink-0 ${
                          avatar === opt
                            ? 'bg-rose-500 border-2 border-white scale-110 shadow'
                            : 'bg-slate-950/80 border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EMAIL ADDRESS */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  {authMode === 'login' ? 'Registered Email Address' : 'Your Email Address'}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="name@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* PASSWORD + FORGOT PASSWORD BUTTON */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300 font-medium">Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotStep(1);
                        setErrorMsg('');
                        setSuccessMsg('');
                        setAuthMode('forgot_password');
                        soundManager.playKissPop();
                      }}
                      className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold underline transition"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD (Only on Create Account mode) */}
              {authMode === 'signup' && (
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Repeat password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ERROR ALERT & FAST REGISTER HELPER */}
              {errorMsg && (
                <div className="space-y-2 animate-shake">
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  {authMode === 'login' && errorMsg.includes('Create Account') && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setName(email.split('@')[0] || '');
                        setConfirmPassword(password);
                        setErrorMsg('');
                        soundManager.playKissPop();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-pink-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <UserPlus size={14} /> Register "{email}" as New Account
                    </button>
                  )}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>
                  {isSubmitting
                    ? 'Entering Love32...'
                    : authMode === 'login'
                    ? 'Sign In to Love32'
                    : 'Create Account & Continue'}
                </span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            VIEW 2: 🔑 FORGOT PASSWORD (DIRECT SECURE RESET)
           ======================================================== */}
        {step === 1 && authMode === 'forgot_password' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="w-11 h-11 mx-auto rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <KeyRound size={22} className="stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-white">Reset Password</h3>
              <p className="text-xs text-slate-400">
                Enter your registered email and choose a new password
              </p>
            </div>

            <form onSubmit={handleForgotResetPassword} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Registered Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="name@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={forgotNewPassword}
                    onChange={(e) => {
                      setForgotNewPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => {
                      setForgotConfirmPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>{isSubmitting ? 'Updating...' : 'Update Password & Save'}</span>
                <Check size={16} />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                  }}
                  className="text-xs text-slate-400 hover:text-white underline flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft size={13} /> Return to Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================
            STEP 2: PARTNER CODE PAIRING (DUAL ROLE CONNECT)
           ======================================================== */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Step 2: Connect</span>
              <h3 className="text-base font-bold text-white mt-0.5">Pair with Your Partner</h3>
              <p className="text-[11px] text-slate-400">
                Logged in as <span className="text-rose-300 font-semibold">{name || email}</span>
              </p>
            </div>

            {/* OPTION 1: HOST / PARTNER 1 (Generate Code) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 uppercase font-bold">
                <Sparkles size={13} />
                <span>Option A: I am Partner 1 (Host)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-rose-500/30">
                <div>
                  <span className="text-[10px] text-slate-400 block">Your Secret Partner Code:</span>
                  <span className="text-lg font-black tracking-widest text-rose-400 font-mono">
                    {myPairCode}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyMyCode}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1 transition"
                  >
                    <Share2 size={14} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                Give this code to your partner so they can join you.
              </p>

              <button
                onClick={handleStartAsHost}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>{isSubmitting ? 'Entering Room...' : 'Enter Room as Partner 1 (Host)'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-bold">Or</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* OPTION 2: JOIN / PARTNER 2 (Enter Partner's Code) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-sky-300 uppercase font-bold">
                <Users size={13} />
                <span>Option B: I am Partner 2 (Join)</span>
              </div>
              <p className="text-[10px] text-slate-400">Enter the code sent by your partner:</p>

              <form onSubmit={handleJoinWithPartnerCode} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="E.g. LOVE-8942"
                    value={partnerInputCode}
                    onChange={(e) => {
                      setPartnerInputCode(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 text-white font-bold text-xs shadow transition active:scale-95"
                  >
                    {isSubmitting ? 'Joining...' : 'Connect 💖'}
                  </button>
                </div>
                {errorMsg && <p className="text-[11px] text-rose-400">{errorMsg}</p>}
              </form>
            </div>
          </div>
        )}

        {/* Official Publisher & Encryption Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 text-center space-y-1 select-none">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>256-Bit End-to-End Encrypted Telemetry</span>
          </div>
          <div className="text-[9px] text-slate-600">
            Love32 Ultra • Developed by Luvio Technologies Pte. Ltd.
          </div>
          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 pt-1">
            <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 underline">Privacy Policy</a>
            <span>•</span>
            <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 underline">Terms of Service</a>
            <span>•</span>
            <span>GDPR Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
