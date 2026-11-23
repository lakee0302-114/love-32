import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  BookOpen,
  Timer,
  Swords,
  Send,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  HelpCircle,
  Award,
  Flame,
  Clock,
  ChevronRight,
  Coffee,
  Droplets,
  Bell,
  Heart,
  ChevronLeft,
  RotateCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { AL_SUBJECTS, AL_QUESTIONS, AL_FORMULA_CARDS } from '../data/alQuestions';

export default function ALStudyHub({
  state,
  currentUserId,
  currentUserName,
  partnerUserName,
  onUpdateState,
  onBroadcastEvent,
  showToast,
}) {
  const isPartnerA = currentUserId === 'partnerA';
  const myName = currentUserName || (isPartnerA ? 'Lakee' : 'Partner');
  const partnerName = partnerUserName || (isPartnerA ? 'Partner' : 'Lakee');

  const alData = state.alStudy || {
    examYear: '2026',
    activeSession: null,
    todayMinutes: { partnerA: 50, partnerB: 45 },
    streakDays: 4,
    sharedTargets: [],
    customChallenges: [],
    quizScores: { partnerA: 20, partnerB: 20 },
  };

  const [activeSubTab, setActiveSubTab] = useState('room'); // 'room' | 'quiz' | 'challenge' | 'targets' | 'formulas'

  // Exam Countdown (November 2026 A/L approx date: Nov 15, 2026)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    const targetDate = new Date('2026-11-15T08:30:00');
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        setTimeLeft({ days, hours, minutes });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------
  // 1. LIVE STUDY ROOM (POMODORO & AMBIENCE)
  // ----------------------------------------------------
  const [selectedDuration, setSelectedDuration] = useState(25); // 25, 45, 60
  const [selectedSubject, setSelectedSubject] = useState('physics');
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeAmbient, setActiveAmbient] = useState(null); // 'rain' | 'whitenoise' | 'lofi' | null
  const timerIntervalRef = useRef(null);

  // Sync with active session in state
  const remoteSession = alData.activeSession;
  const isPartnerStudying = Boolean(remoteSession && remoteSession.isRunning && remoteSession.startedBy !== myName);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            soundManager.playTimerDone();
            try {
              confetti({ particleCount: 100, spread: 80 });
            } catch (e) {}
            if (showToast) showToast('🎉 Study Session Completed! Amazing job!');
            // Add minutes to today
            const updatedMins = {
              ...alData.todayMinutes,
              [currentUserId]: (alData.todayMinutes?.[currentUserId] || 0) + selectedDuration,
            };
            handleUpdateStudyData({
              ...alData,
              todayMinutes: updatedMins,
              activeSession: null,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning, selectedDuration]);

  const handleStartTimer = () => {
    soundManager.playChime();
    setIsTimerRunning(true);
    const sessionData = {
      startedBy: myName,
      subject: selectedSubject,
      duration: selectedDuration,
      startTimestamp: Date.now(),
      isRunning: true,
    };
    handleUpdateStudyData({
      ...alData,
      activeSession: sessionData,
    });
    if (onBroadcastEvent) {
      onBroadcastEvent('study_session_start', myName, {
        subject: selectedSubject,
        duration: selectedDuration,
      });
    }
    if (showToast) showToast(`🚀 Started ${selectedDuration}m ${selectedSubject.toUpperCase()} session!`);
  };

  const handlePauseTimer = () => {
    soundManager.playKissPop();
    setIsTimerRunning(false);
    handleUpdateStudyData({
      ...alData,
      activeSession: null,
    });
  };

  const handleResetTimer = (dur = selectedDuration) => {
    soundManager.playKissPop();
    setIsTimerRunning(false);
    setSecondsRemaining(dur * 60);
    handleUpdateStudyData({
      ...alData,
      activeSession: null,
    });
  };

  const handleJoinPartnerSession = () => {
    if (!remoteSession) return;
    soundManager.playSuccess();
    setSelectedSubject(remoteSession.subject || 'physics');
    setSelectedDuration(remoteSession.duration || 25);
    setSecondsRemaining((remoteSession.duration || 25) * 60);
    setIsTimerRunning(true);
    if (showToast) showToast(`💖 Joined ${partnerName}'s study session!`);
  };

  const handleToggleAmbient = (type) => {
    if (activeAmbient === type) {
      soundManager.stopAmbient();
      setActiveAmbient(null);
    } else {
      soundManager.startAmbient(type);
      setActiveAmbient(type);
      if (showToast) {
        showToast(type === 'rain' ? '🌧️ Rain Ambience Playing' : type === 'whitenoise' ? '📖 Library Focus Playing' : '🎧 Warm Lo-Fi Playing');
      }
    }
  };

  const sendStudyReaction = (reactionType) => {
    soundManager.playKissPop();
    let text = '';
    if (reactionType === 'nudge') {
      soundManager.playNudge();
      text = `📢 Sent "Wada karapan! 📖" nudge to ${partnerName}!`;
    } else if (reactionType === 'water') {
      text = `💧 Sent "Water break reminder 🥤" to ${partnerName}!`;
    } else if (reactionType === 'proud') {
      soundManager.playSuccess();
      try {
        confetti({ particleCount: 50, spread: 70 });
      } catch (e) {}
      text = `💖 Sent "Proud of you babe! 🌟" boost to ${partnerName}!`;
    } else if (reactionType === 'coffee') {
      text = `☕ Sent "Coffee break? ☕" to ${partnerName}!`;
    }

    if (onBroadcastEvent) {
      onBroadcastEvent('study_reaction', myName, { type: reactionType });
    }
    if (showToast) showToast(text);
  };

  // ----------------------------------------------------
  // 2. A/L QUIZ BATTLE
  // ----------------------------------------------------
  const [quizFilter, setQuizFilter] = useState('all');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [quizTimer, setQuizTimer] = useState(45);
  const [isQuizTimerActive, setIsQuizTimerActive] = useState(true);

  const filteredQuestions = quizFilter === 'all'
    ? AL_QUESTIONS
    : AL_QUESTIONS.filter((q) => q.subject === quizFilter);

  const activeQ = filteredQuestions[currentQIndex % filteredQuestions.length];

  // Quiz Countdown Timer
  useEffect(() => {
    let t = null;
    if (isQuizTimerActive && !hasAnsweredCurrent) {
      t = setInterval(() => {
        setQuizTimer((prev) => {
          if (prev <= 1) {
            setHasAnsweredCurrent(true);
            setSelectedOption(-1); // Timeout
            soundManager.playKissPop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isQuizTimerActive, hasAnsweredCurrent, currentQIndex]);

  const handleSelectOption = (index) => {
    if (hasAnsweredCurrent) return;
    setSelectedOption(index);
    setHasAnsweredCurrent(true);
    setIsQuizTimerActive(false);

    const isCorrect = index === activeQ.correct;
    if (isCorrect) {
      soundManager.playSuccess();
      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch (e) {}
      const currentScore = alData.quizScores?.[currentUserId] || 0;
      const updatedScores = {
        ...alData.quizScores,
        [currentUserId]: currentScore + 10,
      };
      handleUpdateStudyData({
        ...alData,
        quizScores: updatedScores,
      });
      if (showToast) showToast('✅ Correct! +10 Points added to your score!');
    } else {
      soundManager.playKissPop();
      if (showToast) showToast('❌ Incorrect! Review the explanation below.');
    }
  };

  const handleNextQuestion = () => {
    soundManager.playChime();
    setSelectedOption(null);
    setHasAnsweredCurrent(false);
    setQuizTimer(45);
    setIsQuizTimerActive(true);
    setCurrentQIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  // ----------------------------------------------------
  // 3. CHALLENGE PARTNER (SEND CUSTOM QUESTIONS)
  // ----------------------------------------------------
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newSubj, setNewSubj] = useState('physics');
  const [newTopic, setNewTopic] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);

  const challenges = alData.customChallenges || [];
  const mySentChallenges = challenges.filter((c) => c.from === myName);
  const partnerChallenges = challenges.filter((c) => c.from !== myName);

  const handleOptionChange = (idx, val) => {
    const updated = [...newOptions];
    updated[idx] = val;
    setNewOptions(updated);
  };

  const handleSendChallenge = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim() || newOptions.some((opt) => !opt.trim())) {
      if (showToast) showToast('⚠️ Please fill out the question and all 4 options!');
      return;
    }

    const challengeObj = {
      id: `chal_${Date.now()}`,
      from: myName,
      subject: newSubj,
      topic: newTopic.trim() || 'General Revision',
      question: newQuestionText.trim(),
      options: newOptions.map((o) => o.trim()),
      correctIndex: parseInt(newCorrectIdx, 10),
      partnerAnswer: null,
      createdDate: 'Today',
    };

    const nextChallenges = [challengeObj, ...challenges];
    handleUpdateStudyData({
      ...alData,
      customChallenges: nextChallenges,
    });

    soundManager.playSuccess();
    try {
      confetti({ particleCount: 70, spread: 80 });
    } catch (e) {}

    if (onBroadcastEvent) {
      onBroadcastEvent('study_challenge', myName, {
        subject: newSubj,
        question: newQuestionText.trim(),
      });
    }
    if (showToast) showToast(`🚀 A/L Challenge sent to ${partnerName}!`);

    // Reset Form
    setNewQuestionText('');
    setNewTopic('');
    setNewOptions(['', '', '', '']);
    setShowCreateChallenge(false);
  };

  const handleSolveChallenge = (challengeId, optionIdx) => {
    soundManager.playKissPop();
    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        return {
          ...c,
          partnerAnswer: optionIdx,
          isAnswerCorrect: optionIdx === c.correctIndex,
        };
      }
      return c;
    });

    handleUpdateStudyData({
      ...alData,
      customChallenges: updated,
    });

    const solvedChal = challenges.find((c) => c.id === challengeId);
    if (solvedChal && optionIdx === solvedChal.correctIndex) {
      soundManager.playSuccess();
      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch (e) {}
      if (showToast) showToast('🎉 You solved the challenge correctly!');
    } else {
      if (showToast) showToast('❌ Oops! Better luck on the next challenge.');
    }
  };

  // ----------------------------------------------------
  // 4. SHARED DAILY TARGETS & CHECKLIST
  // ----------------------------------------------------
  const [newTargetTitle, setNewTargetTitle] = useState('');
  const [newTargetSubject, setNewTargetSubject] = useState('physics');

  const targets = alData.sharedTargets || [];
  const completedTargetsCount = targets.filter((t) => t.completed).length;
  const progressPercent = targets.length > 0 ? Math.round((completedTargetsCount / targets.length) * 100) : 0;

  const handleToggleTarget = (targetId) => {
    soundManager.playKissPop();
    const updated = targets.map((t) => {
      if (t.id === targetId) {
        const nextState = !t.completed;
        if (nextState) {
          soundManager.playSuccess();
          try {
            confetti({ particleCount: 40, spread: 50 });
          } catch (e) {}
        }
        return { ...t, completed: nextState, completedBy: nextState ? myName : null };
      }
      return t;
    });

    handleUpdateStudyData({
      ...alData,
      sharedTargets: updated,
    });
  };

  const handleAddTarget = (titleToAdd, subjectToAdd = 'physics') => {
    const finalTitle = (titleToAdd || newTargetTitle).trim();
    if (!finalTitle) return;

    soundManager.playChime();
    const newTarget = {
      id: `target_${Date.now()}`,
      title: finalTitle,
      subject: subjectToAdd,
      completed: false,
      addedBy: myName,
    };

    handleUpdateStudyData({
      ...alData,
      sharedTargets: [...targets, newTarget],
    });

    setNewTargetTitle('');
    if (showToast) showToast('📋 Target added to shared list!');
  };

  const handleDeleteTarget = (targetId) => {
    soundManager.playKissPop();
    const updated = targets.filter((t) => t.id !== targetId);
    handleUpdateStudyData({
      ...alData,
      sharedTargets: updated,
    });
  };

  // ----------------------------------------------------
  // 5. FORMULA FLASH DECK
  // ----------------------------------------------------
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardSubjectFilter, setCardSubjectFilter] = useState('all');

  const filteredCards = cardSubjectFilter === 'all'
    ? AL_FORMULA_CARDS
    : AL_FORMULA_CARDS.filter((c) => c.subject === cardSubjectFilter);

  const activeCard = filteredCards[cardIndex % filteredCards.length];

  const handleNextCard = () => {
    soundManager.playChime();
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrevCard = () => {
    soundManager.playChime();
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  // ----------------------------------------------------
  // COMMON STATE SYNC DISPATCH
  // ----------------------------------------------------
  const handleUpdateStudyData = (updatedAlStudy) => {
    if (!onUpdateState) return;
    onUpdateState((prev) => ({
      ...prev,
      alStudy: updatedAlStudy,
    }));
  };

  // Format MM:SS
  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-28 pt-3 px-3 transition-colors duration-200">
      <div className="max-w-md mx-auto space-y-4">

        {/* ========================================================
            TOP BANNER: A/L 2026 COUNTDOWN & COUPLE GOAL
        ======================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-950 p-4 shadow-xl border border-indigo-500/30 text-white">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <GraduationCap size={22} className="text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight flex items-center gap-1.5">
                  A/L Study & Quiz Hub
                  <span className="text-[10px] bg-rose-500/80 text-white px-1.5 py-0.5 rounded-full font-bold">2026</span>
                </h1>
                <p className="text-[11px] text-indigo-200 font-medium">
                  {myName} & {partnerName} • එකට මහන්සි වෙමු! 👫
                </p>
              </div>
            </div>

            {/* Streak & Score */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <Flame size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300">{alData.streakDays || 4}d Streak</span>
            </div>
          </div>

          {/* Countdown Blocks */}
          <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl py-1.5 px-2 border border-white/10">
              <div className="text-lg font-black text-white">{timeLeft.days}</div>
              <div className="text-[9px] uppercase tracking-wider text-indigo-200 font-semibold">Days Left</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl py-1.5 px-2 border border-white/10">
              <div className="text-lg font-black text-amber-300">{timeLeft.hours}</div>
              <div className="text-[9px] uppercase tracking-wider text-indigo-200 font-semibold">Hours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl py-1.5 px-2 border border-white/10">
              <div className="text-lg font-black text-rose-300">{timeLeft.minutes}</div>
              <div className="text-[9px] uppercase tracking-wider text-indigo-200 font-semibold">Minutes</div>
            </div>
          </div>

          {/* Live Partner Studying Notice */}
          {isPartnerStudying ? (
            <div className="mt-3 bg-rose-500/30 border border-rose-400/50 rounded-2xl p-2.5 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-white">
                  🔥 {partnerName} is studying {remoteSession.subject?.toUpperCase()} right now!
                </span>
              </div>
              <button
                onClick={handleJoinPartnerSession}
                className="bg-white text-slate-900 font-black text-[11px] px-3 py-1 rounded-xl shadow hover:bg-rose-100 transition-all active:scale-95"
              >
                Join In 🤝
              </button>
            </div>
          ) : (
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-indigo-200/80 px-1">
              <span>📖 Today's Study: You ({alData.todayMinutes?.[currentUserId] || 0}m)</span>
              <span>{partnerName} ({alData.todayMinutes?.[isPartnerA ? 'partnerB' : 'partnerA'] || 0}m)</span>
            </div>
          )}
        </div>

        {/* ========================================================
            SUB-NAVIGATION TABS
        ======================================================== */}
        <div className="grid grid-cols-5 gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          {[
            { id: 'room', label: 'Study Room', icon: Timer },
            { id: 'quiz', label: 'Quiz Battle', icon: Swords },
            { id: 'challenge', label: 'Challenge', icon: Send },
            { id: 'targets', label: 'Targets', icon: ListTodo },
            { id: 'formulas', label: 'Formulas', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playKissPop();
                  setActiveSubTab(tab.id);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30 scale-102'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={16} className="mb-0.5" />
                <span className="text-[10px] truncate max-w-full">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: LIVE STUDY ROOM (POMODORO & FOCUS)
        ======================================================== */}
        {activeSubTab === 'room' && (
          <div className="space-y-4 animate-fade-in">
            {/* Subject Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 block">
                Select A/L Subject:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'maths', name: 'Combined Maths', icon: '📐' },
                  { id: 'physics', name: 'Physics', icon: '⚡' },
                  { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
                  { id: 'biology', name: 'Biology', icon: '🧬' },
                  { id: 'ict', name: 'ICT', icon: '💻' },
                  { id: 'commerce', name: 'Commerce / Econ', icon: '📊' },
                ].map((subj) => (
                  <button
                    key={subj.id}
                    onClick={() => {
                      soundManager.playKissPop();
                      setSelectedSubject(subj.id);
                    }}
                    className={`py-2 px-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedSubject === subj.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-102'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{subj.icon}</span>
                    <span className="truncate">{subj.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pomodoro Timer Circle */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
              {isTimerRunning && (
                <div className="absolute inset-0 bg-rose-500/5 dark:bg-rose-500/10 animate-pulse pointer-events-none" />
              )}

              {/* Duration Presets */}
              <div className="flex justify-center gap-2 mb-4">
                {[
                  { label: '25m 🍅', val: 25 },
                  { label: '45m ⚡', val: 45 },
                  { label: '60m ⏳', val: 60 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    disabled={isTimerRunning}
                    onClick={() => {
                      setSelectedDuration(preset.val);
                      handleResetTimer(preset.val);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                      selectedDuration === preset.val
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Large Digital Clock */}
              <div className="my-6">
                <div className="text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {formatTime(secondsRemaining)}
                </div>
                <div className="text-xs font-semibold text-rose-500 dark:text-rose-400 mt-2 flex items-center justify-center gap-1">
                  <span>{selectedSubject.toUpperCase()}</span>
                  <span>•</span>
                  <span>{isTimerRunning ? '🔥 Studying in Focus' : 'Paused / Ready'}</span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                {!isTimerRunning ? (
                  <button
                    onClick={handleStartTimer}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                  >
                    <Play size={18} fill="currentColor" />
                    <span>Start Studying</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTimer}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-amber-500/30 transition-all active:scale-95"
                  >
                    <Pause size={18} fill="currentColor" />
                    <span>Pause Session</span>
                  </button>
                )}

                <button
                  onClick={() => handleResetTimer(selectedDuration)}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  title="Reset Timer"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              {/* Study Ambience Sounds */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 flex items-center justify-center gap-1.5">
                  <Volume2 size={14} />
                  <span>Peaceful Study Ambience (Web Audio)</span>
                </div>
                <div className="flex justify-center gap-2">
                  {[
                    { id: 'rain', label: '🌧️ Rain' },
                    { id: 'whitenoise', label: '📖 Library' },
                    { id: 'lofi', label: '🎧 Lo-Fi' },
                  ].map((amb) => (
                    <button
                      key={amb.id}
                      onClick={() => handleToggleAmbient(amb.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                        activeAmbient === amb.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {amb.label}
                    </button>
                  ))}
                  {activeAmbient && (
                    <button
                      onClick={() => handleToggleAmbient(activeAmbient)}
                      className="text-xs font-bold px-2 py-1.5 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500/30"
                      title="Turn off sound"
                    >
                      <VolumeX size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Romantic Study Interactions & Nudges */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 block">
                Nudge {partnerName} to Study:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => sendStudyReaction('nudge')}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all active:scale-95"
                >
                  <Bell size={16} className="text-rose-500" />
                  <span>Wada karapan! 📖</span>
                </button>
                <button
                  onClick={() => sendStudyReaction('water')}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold text-xs hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-all active:scale-95"
                >
                  <Droplets size={16} className="text-cyan-500" />
                  <span>Drink Water! 🥤</span>
                </button>
                <button
                  onClick={() => sendStudyReaction('proud')}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all active:scale-95"
                >
                  <Sparkles size={16} className="text-amber-500" />
                  <span>Proud of you! 💖</span>
                </button>
                <button
                  onClick={() => sendStudyReaction('coffee')}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all active:scale-95"
                >
                  <Coffee size={16} className="text-purple-500" />
                  <span>Coffee Break? ☕</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: A/L QUIZ BATTLE (MCQ PRACTICE)
        ======================================================== */}
        {activeSubTab === 'quiz' && (
          <div className="space-y-4 animate-fade-in">
            {/* Subject Filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {AL_SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => {
                    soundManager.playKissPop();
                    setQuizFilter(subj.id);
                    setCurrentQIndex(0);
                    setSelectedOption(null);
                    setHasAnsweredCurrent(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    quizFilter === subj.id
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <span>{subj.icon} {subj.name}</span>
                </button>
              ))}
            </div>

            {/* Scoreboard */}
            <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 backdrop-blur-md rounded-2xl p-3 border border-purple-500/20 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                <span className="text-xs font-bold">Quiz Points</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-black">
                <span className="text-rose-300">{myName}: {alData.quizScores?.[currentUserId] || 0} pts</span>
                <span className="text-slate-400">vs</span>
                <span className="text-indigo-300">{partnerName}: {alData.quizScores?.[isPartnerA ? 'partnerB' : 'partnerA'] || 0} pts</span>
              </div>
            </div>

            {/* Active Question Card */}
            {activeQ ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                {/* Meta info & Timer */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[10px]">
                      {activeQ.subject}
                    </span>
                    <span className="text-slate-400 font-medium">• {activeQ.topic}</span>
                  </div>

                  <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-500">
                    <Clock size={14} />
                    <span>{quizTimer}s</span>
                  </div>
                </div>

                {/* Question Statement */}
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  {activeQ.question}
                </h2>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {activeQ.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === activeQ.correct;

                    let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';

                    if (hasAnsweredCurrent) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 font-bold';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={hasAnsweredCurrent}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span className="flex-1 leading-normal">{option}</span>
                        {hasAnsweredCurrent && isCorrect && (
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {hasAnsweredCurrent && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                      <HelpCircle size={14} />
                      <span>විවරණය (Explanation):</span>
                    </div>
                    <p className="leading-relaxed">{activeQ.explanation}</p>
                  </div>
                )}

                {/* Next Button */}
                {hasAnsweredCurrent && (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-xs shadow-md shadow-rose-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <span>Next Question</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No questions found for this subject.
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: CHALLENGE PARTNER (SEND CUSTOM QUESTIONS)
        ======================================================== */}
        {activeSubTab === 'challenge' && (
          <div className="space-y-4 animate-fade-in">
            {/* Create New Challenge Card Toggle */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Send a Challenge to {partnerName}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Write a question to test your partner! 🎯
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundManager.playKissPop();
                    setShowCreateChallenge(!showCreateChallenge);
                  }}
                  className="p-2 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/30 hover:bg-rose-600 transition-all"
                >
                  <Plus size={18} className={showCreateChallenge ? 'rotate-45' : ''} />
                </button>
              </div>

              {/* Challenge Form */}
              {showCreateChallenge && (
                <form onSubmit={handleSendChallenge} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label>
                      <select
                        value={newSubj}
                        onChange={(e) => setNewSubj(e.target.value)}
                        className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      >
                        <option value="physics">Physics ⚡</option>
                        <option value="maths">Combined Maths 📐</option>
                        <option value="chemistry">Chemistry 🧪</option>
                        <option value="biology">Biology 🧬</option>
                        <option value="ict">ICT 💻</option>
                        <option value="commerce">Commerce 📊</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Topic</label>
                      <input
                        type="text"
                        placeholder="e.g. Mechanics"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Question Text</label>
                    <textarea
                      rows={2}
                      placeholder="Type your A/L question here..."
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">4 Options & Select Correct (⚪)</label>
                    {newOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newCorrectIdx === i}
                          onChange={() => setNewCorrectIdx(i)}
                          className="w-4 h-4 text-rose-500 accent-rose-500"
                        />
                        <input
                          type="text"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-rose-500/30 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Send size={14} />
                    <span>Send Challenge to {partnerName}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Incoming Challenges from Partner */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                Challenges from {partnerName}
              </h3>
              {partnerChallenges.length === 0 ? (
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  No challenges received from {partnerName} yet.
                </div>
              ) : (
                partnerChallenges.map((chal) => (
                  <div
                    key={chal.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-500 uppercase text-[10px] bg-rose-50 dark:bg-rose-500/15 px-2 py-0.5 rounded-full">
                        {chal.subject} • {chal.topic}
                      </span>
                      <span className="text-slate-400 text-[11px]">{chal.createdDate}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                      {chal.question}
                    </h4>

                    {/* Options to solve */}
                    <div className="space-y-1.5 pt-1">
                      {chal.options.map((opt, i) => {
                        const isChosen = chal.partnerAnswer === i;
                        const hasSolved = chal.partnerAnswer !== null && chal.partnerAnswer !== undefined;
                        const isCorrect = i === chal.correctIndex;

                        let style = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200';
                        if (hasSolved) {
                          if (isCorrect) style = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 font-bold';
                          else if (isChosen) style = 'bg-rose-500/15 border-rose-500 text-rose-600 font-bold';
                        }

                        return (
                          <button
                            key={i}
                            disabled={hasSolved}
                            onClick={() => handleSolveChallenge(chal.id, i)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${style}`}
                          >
                            <span>{opt}</span>
                            {hasSolved && isCorrect && <CheckCircle2 size={14} className="text-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Challenges You Sent */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                Challenges You Sent ({mySentChallenges.length})
              </h3>
              {mySentChallenges.map((chal) => (
                <div
                  key={chal.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 shadow-sm border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-500 text-[10px]">{chal.subject.toUpperCase()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      chal.partnerAnswer !== null
                        ? chal.isAnswerCorrect
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : 'bg-rose-500/20 text-rose-500'
                        : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {chal.partnerAnswer !== null
                        ? chal.isAnswerCorrect ? `✅ ${partnerName} Solved Correctly!` : `❌ ${partnerName} Missed!`
                        : `⏳ Waiting for ${partnerName}`}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{chal.question}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: SHARED DAILY TARGETS & CHECKLIST
        ======================================================== */}
        {activeSubTab === 'targets' && (
          <div className="space-y-4 animate-fade-in">
            {/* Progress Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Today's Study Progress</span>
                <span className="font-black text-rose-500">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {completedTargetsCount} of {targets.length} targets completed today!
              </p>
            </div>

            {/* Add Target Input */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add target (e.g. Physics 2020 Past Paper)..."
                  value={newTargetTitle}
                  onChange={(e) => setNewTargetTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTarget()}
                  className="flex-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                />
                <button
                  onClick={() => handleAddTarget()}
                  className="px-4 py-2.5 rounded-2xl bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/30 hover:bg-rose-600 active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <button
                  onClick={() => handleAddTarget('Physics 2022 Past Paper MCQs', 'physics')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 whitespace-nowrap hover:bg-slate-200"
                >
                  + Physics 2022 MCQs ⚡
                </button>
                <button
                  onClick={() => handleAddTarget('Combined Maths Integration 10 Qs', 'maths')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 whitespace-nowrap hover:bg-slate-200"
                >
                  + Maths Integration 📐
                </button>
                <button
                  onClick={() => handleAddTarget('Organic Reactions Mind Map', 'chemistry')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 whitespace-nowrap hover:bg-slate-200"
                >
                  + Organic Mind Map 🧪
                </button>
              </div>
            </div>

            {/* Target List */}
            <div className="space-y-2">
              {targets.map((target) => (
                <div
                  key={target.id}
                  className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex items-center justify-between gap-3 ${
                    target.completed
                      ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/5'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTarget(target.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      target.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {target.completed && <CheckCircle2 size={14} />}
                    </div>
                    <div>
                      <span className={`text-xs font-bold leading-snug block ${
                        target.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {target.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Added by {target.addedBy}
                        {target.completed && target.completedBy && ` • Done by ${target.completedBy}`}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDeleteTarget(target.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: FORMULA FLASH DECK
        ======================================================== */}
        {activeSubTab === 'formulas' && (
          <div className="space-y-4 animate-fade-in">
            {/* Subject Filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['all', 'physics', 'maths', 'chemistry', 'biology'].map((sId) => (
                <button
                  key={sId}
                  onClick={() => {
                    soundManager.playKissPop();
                    setCardSubjectFilter(sId);
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    cardSubjectFilter === sId
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {sId}
                </button>
              ))}
            </div>

            {/* 3D Flip Card */}
            {activeCard && (
              <div
                onClick={() => {
                  soundManager.playKissPop();
                  setIsFlipped(!isFlipped);
                }}
                className="cursor-pointer min-h-[260px] bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-500 uppercase tracking-wider text-[10px] bg-rose-50 dark:bg-rose-500/15 px-2.5 py-0.5 rounded-full">
                    {activeCard.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <RotateCw size={12} />
                    <span>Tap to {isFlipped ? 'see question' : 'flip formula'}</span>
                  </span>
                </div>

                <div className="my-auto py-4">
                  {!isFlipped ? (
                    <div className="space-y-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {activeCard.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {activeCard.front}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-fade-in">
                      <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase">
                        Formulas & Key Points:
                      </h4>
                      <div className="space-y-1 font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                        {activeCard.back.map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                      {activeCard.tip && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium italic mt-2">
                          💡 Exam Tip: {activeCard.tip}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
                  Card {(cardIndex % filteredCards.length) + 1} of {filteredCards.length}
                </div>
              </div>
            )}

            {/* Prev / Next Card Controls */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevCard}
                className="flex-1 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1 active:scale-95"
              >
                <ChevronLeft size={16} />
                <span>Previous Card</span>
              </button>
              <button
                onClick={handleNextCard}
                className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/30 hover:bg-rose-600 flex items-center justify-center gap-1 active:scale-95"
              >
                <span>Next Card</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
