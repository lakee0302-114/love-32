import React from 'react';
import { Heart, Compass, Sparkles, BookHeart, LayoutGrid, Gamepad2, Users } from 'lucide-react';

export default function Navigation({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'home', label: 'Distance', icon: Compass },
    { id: 'pet', label: 'Pet Garden', icon: Sparkles, badge: 'PRO' },
    { id: 'missYou', label: 'Love Hub', icon: Heart, badge: 'HOT' },
    { id: 'memories', label: 'Memories', icon: BookHeart },
    { id: 'widgets', label: 'Widgets', icon: LayoutGrid },
    { id: 'profile', label: 'Profile', icon: Users, badge: 'NEW' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl border-t border-slate-200 dark:border-rose-500/20 px-2 py-2">
      <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 font-normal'
              }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[8px] font-black tracking-tighter px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-rose-500 dark:bg-rose-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

