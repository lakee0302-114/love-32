import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  HelpCircle,
  Dices,
  RotateCw,
  Eye,
  EyeOff,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

export default function CoupleGames({
  dailyQuestion,
  currentUserName,
  partnerUserName,
  currentUserId,
  onSaveAnswer,
}) {
  const [activeGame, setActiveGame] = useState('question'); // 'question' | 'wheel' | 'quiz'

  // Daily Question State
  const isPartnerA = currentUserId === 'partnerA';
  const myAnswer = isPartnerA ? dailyQuestion.partnerAAnswer : dailyQuestion.partnerBAnswer;
  const partnerAnswer = isPartnerA ? dailyQuestion.partnerBAnswer : dailyQuestion.partnerAAnswer;
  
  const [answerInput, setAnswerInput] = useState(myAnswer || '');
  const hasAnswered = Boolean(myAnswer && myAnswer.trim().length > 0);
  const partnerHasAnswered = Boolean(partnerAnswer && partnerAnswer.trim().length > 0);

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!answerInput.trim()) return;
    onSaveAnswer(answerInput.trim(), currentUserId);
    soundManager.playChime();
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
  };

  // Decision Wheel State
  const wheelCategories = {
    food: {
      title: 'What should we eat? 🍽️',
      options: ['Pizza 🍕', 'Sushi 🍣', 'Burgers 🍔', 'Cook Together 🍳', 'Thai Food 🍜', 'Ice Cream Date 🍦'],
    },
    date: {
      title: 'Weekend Date Idea 💑',
      options: ['Cozy Movie Night 🍿', 'Beach Sunset Walk 🌅', 'Try New Cafe ☕', 'Picnic in Park 🧺', 'Arcade Games 🕹️', 'Cook a Feast 🍝'],
    },
    chores: {
      title: 'Who does the chore? 🧹',
      options: [`${currentUserName} washes dishes`, `${partnerUserName} washes dishes`, 'Order Takeout!', 'Do it together! 💖', 'Rock Paper Scissors ✊', 'Skip it today 😴'],
    },
  };

  const [selectedCategory, setSelectedCategory] = useState('food');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelResult(null);
    soundManager.playKissPop();

    const currentOptions = wheelCategories[selectedCategory].options;
    const randomTurns = 5 + Math.floor(Math.random() * 4);
    const chosenIndex = Math.floor(Math.random() * currentOptions.length);
    const degreesPerSlice = 360 / currentOptions.length;
    const targetDeg = wheelRotation + randomTurns * 360 + (360 - chosenIndex * degreesPerSlice);

    setWheelRotation(targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      setWheelResult(currentOptions[chosenIndex]);
      soundManager.playChime();
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }, 3000);
  };

  // Quiz State
  const quizQuestions = [
    {
      q: 'Where was our dream travel destination?',
      options: ['Japan in Cherry Blossom season 🌸', 'Swiss Alps in Snow ❄️', 'Bali beach villa 🌴', 'Paris night lights ✨'],
      correct: 0,
    },
    {
      q: 'What is my favorite comfort food?',
      options: ['Warm chocolate brownies 🍫', 'Cheesy spicy pasta 🍝', 'Hot bubble tea 🧋', 'Crispy fries & burger 🍟'],
      correct: 1,
    },
    {
      q: 'What time did we usually stay up talking on the phone?',
      options: ['Until 10 PM', 'Until 1 AM', 'Until 3:30 AM sunrise 🌙', 'All night without sleep!'],
      correct: 2,
    },
  ];

  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleSelectQuiz = (optIdx) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(optIdx);

    if (optIdx === quizQuestions[currentQuizIdx].correct) {
      soundManager.playChime();
      setQuizScore((s) => s + 1);
    } else {
      soundManager.playKissPop();
    }

    setTimeout(() => {
      if (currentQuizIdx + 1 < quizQuestions.length) {
        setCurrentQuizIdx((i) => i + 1);
        setSelectedQuizOption(null);
      } else {
        setQuizFinished(true);
        try {
          confetti({ particleCount: 80, spread: 90 });
        } catch (e) {}
      }
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Game navigation tabs */}
      <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1 text-xs">
        <button
          onClick={() => {
            setActiveGame('question');
            soundManager.playKissPop();
          }}
          className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
            activeGame === 'question'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle size={13} /> Daily Deep Talk
        </button>
        <button
          onClick={() => {
            setActiveGame('wheel');
            soundManager.playKissPop();
          }}
          className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
            activeGame === 'wheel'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dices size={13} /> Decision Wheel
        </button>
        <button
          onClick={() => {
            setActiveGame('quiz');
            soundManager.playKissPop();
          }}
          className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
            activeGame === 'quiz'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy size={13} /> Love Quiz
        </button>
      </div>

      {/* 1. DAILY DEEP TALK QUESTION */}
      {activeGame === 'question' && (
        <div className="space-y-4">
          <div className="rounded-3xl p-5 bg-gradient-to-br from-rose-950/60 via-purple-950/40 to-slate-900 border border-rose-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold tracking-wider uppercase">
                Daily Couple Prompt
              </span>
              <span className="text-xs text-slate-400">{dailyQuestion.date}</span>
            </div>

            <h3 className="text-base font-bold text-white mb-4 leading-snug">
              "{dailyQuestion.question}"
            </h3>

            {/* Your Answer Section */}
            <div className="mb-4">
              <div className="text-xs text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                <span>Your Answer ({currentUserName}):</span>
                {hasAnswered && (
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                    <CheckCircle2 size={11} /> Answered
                  </span>
                )}
              </div>

              {hasAnswered ? (
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-pink-100 text-xs italic">
                  "{myAnswer}"
                </div>
              ) : (
                <form onSubmit={handleSubmitAnswer} className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Type your honest heart answer here..."
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-md transition"
                  >
                    Submit Answer & Unlock Partner's 💖
                  </button>
                </form>
              )}
            </div>

            {/* Partner's Answer (Locked until current user answers!) */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                <span>{partnerUserName}'s Answer:</span>
                {partnerHasAnswered ? (
                  <span className="text-rose-400 text-[10px]">Ready to reveal</span>
                ) : (
                  <span className="text-slate-500 text-[10px]">Waiting for response...</span>
                )}
              </div>

              {hasAnswered ? (
                partnerHasAnswered ? (
                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs italic">
                    "{partnerAnswer}"
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs italic text-center">
                    {partnerUserName} hasn't answered today's question yet. Nudge them!
                  </div>
                )
              ) : (
                <div className="relative p-4 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden text-center">
                  <div className="blur-sm filter select-none text-slate-400 text-xs">
                    This answer is hidden with love encryption. You must submit your own answer first to reveal it!
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full border border-amber-400/40">
                      <EyeOff size={12} /> Answer to reveal {partnerUserName}'s response
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DECISION WHEEL */}
      {activeGame === 'wheel' && (
        <div className="rounded-3xl p-5 bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center">
          <h3 className="font-bold text-white text-base mb-1">Couple Decision Wheel</h3>
          <p className="text-xs text-slate-400 mb-4">No more arguing over "I don't know, you choose!" 😜</p>

          {/* Category Selector */}
          <div className="flex gap-1.5 mb-6">
            {Object.entries(wheelCategories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedCategory(key);
                  setWheelResult(null);
                  soundManager.playKissPop();
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                  selectedCategory === key
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.title.split(' ')[0]} {cat.title.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* The Spinning Wheel */}
          <div className="relative my-2 w-52 h-52 flex items-center justify-center">
            {/* Pointer arrow */}
            <div className="absolute -top-3 z-20 text-rose-500 text-2xl font-bold animate-bounce">
              ▼
            </div>

            <div
              className="w-full h-full rounded-full border-4 border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.3)] bg-gradient-to-tr from-rose-900 via-pink-900 to-purple-950 flex items-center justify-center overflow-hidden transition-transform duration-[3000ms] ease-out"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              <div className="grid grid-cols-2 grid-rows-2 w-full h-full divide-x-2 divide-y-2 divide-rose-500/40 text-center text-[10px] font-bold text-white/90">
                {wheelCategories[selectedCategory].options.slice(0, 4).map((opt, i) => (
                  <div key={i} className="flex items-center justify-center p-2 text-center">
                    {opt}
                  </div>
                ))}
              </div>
            </div>

            {/* Center Hub */}
            <div className="absolute w-12 h-12 rounded-full bg-slate-950 border-2 border-rose-400 flex items-center justify-center text-sm shadow">
              💖
            </div>
          </div>

          {/* Result Card */}
          {wheelResult && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-white font-bold text-sm animate-scaleUp">
              🎉 The Wheel has decided: <span className="text-amber-300">{wheelResult}</span>
            </div>
          )}

          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="mt-5 w-48 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RotateCw size={14} className={isSpinning ? 'animate-spin' : ''} />
            {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
          </button>
        </div>
      )}

      {/* 3. LOVE TRIVIA QUIZ */}
      {activeGame === 'quiz' && (
        <div className="rounded-3xl p-5 bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-base">"How Well Do You Know Me?"</h3>
            <span className="text-xs text-rose-400 font-mono">
              Question {currentQuizIdx + 1} of {quizQuestions.length}
            </span>
          </div>

          {!quizFinished ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="text-sm font-semibold text-white">
                  {quizQuestions[currentQuizIdx].q}
                </p>
              </div>

              <div className="space-y-2">
                {quizQuestions[currentQuizIdx].options.map((option, idx) => {
                  const isCorrect = idx === quizQuestions[currentQuizIdx].correct;
                  const isSelected = selectedQuizOption === idx;
                  let btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700';

                  if (selectedQuizOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuiz(idx)}
                      disabled={selectedQuizOption !== null}
                      className={`w-full text-left p-3 rounded-2xl border text-xs transition duration-200 ${btnStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="text-5xl">🏆</div>
              <h4 className="font-bold text-white text-lg">Quiz Complete!</h4>
              <p className="text-xs text-rose-300">
                You scored <span className="font-black text-amber-300 text-base">{quizScore} / {quizQuestions.length}</span>!
                You know your partner from inside out!
              </p>
              <button
                onClick={() => {
                  setCurrentQuizIdx(0);
                  setQuizScore(0);
                  setSelectedQuizOption(null);
                  setQuizFinished(false);
                }}
                className="mt-2 py-2 px-5 rounded-xl bg-rose-500 text-white font-semibold text-xs shadow"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
