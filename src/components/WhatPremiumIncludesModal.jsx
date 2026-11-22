import React from 'react';
import { X, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function WhatPremiumIncludesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const benefits = [
    { title: 'View shared live location', icon: '📍', free: false, pro: true },
    { title: 'Check travel speed & stops', icon: '🚗', free: false, pro: true },
    { title: 'View battery & network status', icon: '📱', free: false, pro: true },
    { title: 'Sync phone status', icon: '🔄', free: false, pro: true },
    { title: 'Sync sleep status & duration', icon: '🌙', free: false, pro: true },
    { title: 'Unlock all widget styles', icon: '🧩', free: false, pro: true },
    { title: 'Enable location & safety alerts', icon: '🛡️', free: false, pro: true },
    { title: 'Access Satellite & Street View maps', icon: '🛰️', free: false, pro: true },
    { title: 'Claim daily pet rewards', icon: '🎁', free: false, pro: true },
    { title: 'Enjoy an ad-light experience', icon: '✨', free: false, pro: true },
    { title: 'Customer service', icon: '💬', free: false, pro: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              soundManager.playKissPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white text-center flex-1 pr-8">
            What Premium includes
          </h2>
        </div>

        {/* Benefits Table */}
        <div className="overflow-y-auto p-4 space-y-1">
          {/* Table Column Titles */}
          <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400">
            <span className="flex-1">Benefits</span>
            <span className="w-14 text-center font-bold text-slate-400">FREE</span>
            <span className="w-20 text-center px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider">
              Premium
            </span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition text-xs"
              >
                <div className="flex items-center gap-2.5 flex-1 pr-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    {item.title}
                  </span>
                </div>
                {/* FREE check/cross */}
                <div className="w-14 flex justify-center text-slate-300 dark:text-slate-600">
                  <X size={16} className="stroke-[2.5]" />
                </div>
                {/* Premium check */}
                <div className="w-20 flex justify-center">
                  <div className="w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-500 dark:text-pink-400 flex items-center justify-center">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-center">
          <button
            onClick={() => {
              soundManager.playSuccess();
              alert('🎉 You already have Love32 PRO Unlocked for lifetime!');
              onClose();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-sm shadow-xl hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck size={14} />
            <span>Secure with Google Play. Cancel anytime.</span>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-3">
            <span className="hover:underline cursor-pointer">Terms of service</span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">Privacy policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
