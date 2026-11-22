import React, { useState } from 'react';
import { ChevronLeft, Check, X, Crown, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function AboutPhoneStatusModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [advancedMode, setAdvancedMode] = useState(true);

  const statuses = [
    { title: 'In App', desc: 'User is active on Love32', standard: true, advanced: true, icon: '💜' },
    { title: 'Now', desc: 'Last updated within 10 mins', standard: true, advanced: false, icon: '📱' },
    { title: 'Active', desc: 'Active Phone Use (Duration)', standard: false, advanced: true, icon: '🤳' },
    { title: 'X mins ago', desc: 'Last location update', standard: true, advanced: false, icon: '📍' },
    { title: 'X mins ago', desc: 'Last phone active time', standard: false, advanced: true, icon: '⏱️' },
    { title: 'Network Status', desc: 'Wi-Fi or cellular', standard: true, advanced: true, icon: '📶' },
    { title: 'Battery status', desc: 'Battery level and charging status', standard: true, advanced: true, icon: '🔋' },
    { title: 'Nighttime Activity', desc: 'Staying up late or using the phone at night', standard: false, advanced: true, icon: '🌙' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              soundManager.playKissPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition mr-2"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            About Phone Status
          </h2>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-4">
          {/* Table Container */}
          <div className="bg-slate-50/70 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold">
              <span className="text-slate-800 dark:text-slate-200 flex-1">Live Statuses</span>
              <div className="flex items-center">
                <span className="w-16 text-center text-purple-600 dark:text-purple-400 font-bold">
                  Standard
                </span>
                <span className="w-16 text-center text-slate-800 dark:text-slate-200 font-bold">
                  Advanced
                </span>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
              {statuses.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 px-3.5 text-xs">
                  <div className="flex items-center gap-2.5 flex-1 pr-2">
                    <span className="text-sm">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  {/* Standard Column */}
                  <div className="w-16 flex justify-center bg-purple-50/40 dark:bg-purple-950/20 py-2 rounded-lg">
                    {item.standard ? (
                      <Check size={15} className="text-pink-500 stroke-[3]" />
                    ) : (
                      <X size={15} className="text-slate-300 dark:text-slate-600 stroke-[2.5]" />
                    )}
                  </div>

                  {/* Advanced Column */}
                  <div className="w-16 flex justify-center py-2">
                    {item.advanced ? (
                      <Check size={15} className="text-pink-500 stroke-[3]" />
                    ) : (
                      <X size={15} className="text-slate-300 dark:text-slate-600 stroke-[2.5]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Mode Toggle Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <span>Advanced Mode</span>
                <Crown size={14} className="text-amber-500 fill-amber-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Real-time status sync even in the background—including phone unlock status and late-night activity. (Slightly increases battery usage)
              </p>
            </div>
            <button
              onClick={() => {
                soundManager.playKissPop();
                setAdvancedMode(!advancedMode);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                advancedMode ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  advancedMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* FAQ Accordion Item */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold flex items-center gap-1.5">
              <HelpCircle size={15} className="text-rose-500" />
              <span>FAQ about Status</span>
            </span>
            <span className="text-slate-400">›</span>
          </div>
        </div>
      </div>
    </div>
  );
}
