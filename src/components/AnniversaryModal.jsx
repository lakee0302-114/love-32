import React, { useState } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, Heart, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function AnniversaryModal({
  isOpen,
  onClose,
  currentStartDate,
  onSaveAnniversary,
  partnerA,
  partnerB,
}) {
  if (!isOpen) return null;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const initialDate = currentStartDate ? new Date(currentStartDate) : new Date();
  const [selectedMonth, setSelectedMonth] = useState(months[initialDate.getMonth()] || 'Nov');
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate() || 22);
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear() || 2026);

  const handleSave = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const dateObj = new Date(selectedYear, monthIndex, selectedDay);
    const isoString = dateObj.toISOString().split('T')[0];
    onSaveAnniversary(isoString);
    soundManager.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-purple-50/90 via-pink-50/70 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 rounded-3xl border border-rose-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col p-5">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => {
              soundManager.playKissPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm transition"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Couple avatar bubbles */}
          <div className="flex items-center -space-x-1.5">
            <span className="w-7 h-7 rounded-full bg-rose-200 dark:bg-rose-950 flex items-center justify-center text-xs border border-white dark:border-slate-800 shadow-sm">
              {partnerA?.avatar || '🤴'}
            </span>
            <span className="w-7 h-7 rounded-full bg-pink-200 dark:bg-pink-950 flex items-center justify-center text-xs border border-white dark:border-slate-800 shadow-sm">
              {partnerB?.avatar || '🌸'}
            </span>
          </div>
        </div>

        {/* 3D Winged Heart Calendar Icon Graphic */}
        <div className="text-center my-4">
          <div className="relative inline-block">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-pink-400 via-rose-400 to-purple-500 shadow-xl shadow-pink-500/25 flex items-center justify-center text-white transform hover:scale-105 transition duration-300">
              <CalendarIcon size={36} className="stroke-[2.2]" />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
                <Heart size={14} className="fill-rose-500 text-rose-500" />
              </div>
            </div>
            {/* Wing decoration effects */}
            <div className="absolute top-3 -left-4 text-pink-300 dark:text-pink-600 text-lg animate-bounce-subtle">
              🕊️
            </div>
            <div className="absolute top-3 -right-4 text-purple-300 dark:text-purple-600 text-lg animate-bounce-subtle">
              ✨
            </div>
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
            When is your anniversary?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pick the day you two officially started your story
          </p>
        </div>

        {/* Date Wheels Selector Container */}
        <div className="my-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-950/70 border border-purple-100 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Month column */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Month</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-purple-50 dark:bg-slate-900 border border-purple-200 dark:border-slate-700 rounded-xl py-2 px-1 text-center font-bold text-slate-800 dark:text-white text-sm focus:outline-none focus:border-rose-500"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Day column */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Day</span>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full bg-purple-50 dark:bg-slate-900 border border-purple-200 dark:border-slate-700 rounded-xl py-2 px-1 text-center font-bold text-slate-800 dark:text-white text-sm focus:outline-none focus:border-rose-500"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Year column */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Year</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-purple-50 dark:bg-slate-900 border border-purple-200 dark:border-slate-700 rounded-xl py-2 px-1 text-center font-bold text-slate-800 dark:text-white text-sm focus:outline-none focus:border-rose-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Explanatory text */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center px-3 mb-4 leading-relaxed">
          Save your anniversary to unlock full-screen effects and reminders. Never miss a single special moment.
        </p>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
        >
          <Sparkles size={16} />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}
