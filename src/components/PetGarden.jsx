import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Utensils,
  Bath,
  Moon,
  Smile,
  Crown,
  Shirt,
  Trophy,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

export default function PetGarden({
  pet,
  currentUserName,
  partnerUserName,
  onUpdatePet,
}) {
  const [selectedPetType, setSelectedPetType] = useState(pet.type || 'bunny');
  const [activeAnimation, setActiveAnimation] = useState('');
  const [bubbleText, setBubbleText] = useState('I love both of you so much! 💕');
  const [selectedTab, setSelectedTab] = useState('care'); // 'care' | 'dress' | 'room'

  const petsConfig = {
    bunny: {
      name: 'Mochi',
      emoji: '🐰',
      species: 'Sweet Cloud Bunny',
      sounds: ['Squeak! 🥰', 'Hop hop! ✨', 'Yummy strawberries! 🍓'],
    },
    kitty: {
      name: 'Boba',
      emoji: '🐱',
      species: 'Cuddle Kitten',
      sounds: ['Purrr... 💖', 'Meow meow! 🐾', 'Give chin scratches! 😻'],
    },
    dragon: {
      name: 'Puff',
      emoji: '🐲',
      species: 'Tiny Love Dragon',
      sounds: ['Little sparks of love! 🔥', 'Rawr means I love you! 💖', 'Fly high! ☁️'],
    },
    corgi: {
      name: 'Waffles',
      emoji: '🐶',
      species: 'Fluffy Corgi Pup',
      sounds: ['Woof woof! 🐾', 'Tail wagging for you! 💖', 'Let us play fetch! 🎾'],
    },
  };

  const currentPetMeta = petsConfig[selectedPetType] || petsConfig.bunny;

  const handleAction = (actionType) => {
    soundManager.playPetAction();
    setActiveAnimation(actionType);

    let hunger = pet.hunger;
    let happiness = pet.happiness;
    let energy = pet.energy;
    let exp = pet.exp + 15;
    let level = pet.level;
    let msg = '';

    if (actionType === 'feed') {
      hunger = Math.min(100, hunger + 25);
      happiness = Math.min(100, happiness + 10);
      msg = `${currentUserName} fed ${currentPetMeta.name} delicious treats! 🍓`;
      setBubbleText('Om nom nom! That was delicious! 😋');
    } else if (actionType === 'bathe') {
      happiness = Math.min(100, happiness + 20);
      energy = Math.max(10, energy - 5);
      msg = `${currentUserName} gave ${currentPetMeta.name} a warm bubble bath! 🛁`;
      setBubbleText('Splish splash! All squeaky clean & sparkling! ✨');
    } else if (actionType === 'cuddle') {
      happiness = Math.min(100, happiness + 25);
      soundManager.playHeartbeat();
      msg = `${currentUserName} cuddled ${currentPetMeta.name}! 💖`;
      setBubbleText('Purrr! Best cuddles in the whole universe! 🥰');
    } else if (actionType === 'sleep') {
      energy = Math.min(100, energy + 35);
      msg = `${currentUserName} tucked ${currentPetMeta.name} into bed! 🌙`;
      setBubbleText('Zzz... dreaming of sweet candies & hugs 😴');
    }

    if (exp >= pet.maxExp) {
      level += 1;
      exp = exp - pet.maxExp;
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
      setBubbleText(`LEVEL UP! ${currentPetMeta.name} reached Level ${level}! 🎉`);
    }

    onUpdatePet({
      ...pet,
      type: selectedPetType,
      name: currentPetMeta.name,
      hunger,
      happiness,
      energy,
      exp,
      level,
      lastFedBy: currentUserName,
    });

    setTimeout(() => {
      setActiveAnimation('');
    }, 2500);
  };

  const handleCostumeChange = (costume) => {
    soundManager.playChime();
    onUpdatePet({
      ...pet,
      costume,
    });
    setBubbleText(`Look at my new outfit! Do you like it? ✨`);
  };

  const handleRoomChange = (roomTheme) => {
    soundManager.playChime();
    onUpdatePet({
      ...pet,
      roomTheme,
    });
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Pet Status Bar */}
      <div className="rounded-3xl p-4 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900/60 border border-pink-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              Lv.{pet.level || 5}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-base">{currentPetMeta.name}</h3>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                  {currentPetMeta.species}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Care partner: <span className="text-white font-medium">{currentUserName}</span> & <span className="text-white font-medium">{partnerUserName}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">XP Progress</span>
            <div className="w-24 bg-slate-800 rounded-full h-2 mt-1 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-400 to-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(pet.exp / (pet.maxExp || 100)) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-rose-300 font-mono mt-0.5 block">{pet.exp} / {pet.maxExp || 100} XP</span>
          </div>
        </div>

        {/* Pet Switcher Buttons */}
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
          {Object.entries(petsConfig).map(([key, item]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedPetType(key);
                soundManager.playKissPop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition ${
                selectedPetType === key
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Pet Room Stage */}
      <div
        className={`relative h-64 rounded-3xl p-5 border overflow-hidden flex flex-col items-center justify-between transition-all duration-500 ${
          pet.roomTheme === 'cozy_bedroom'
            ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-amber-950/40 border-indigo-500/30'
            : pet.roomTheme === 'cloud_kingdom'
            ? 'bg-gradient-to-b from-sky-950 via-purple-950 to-slate-900 border-sky-500/30'
            : 'bg-gradient-to-b from-rose-950/60 via-pink-950/40 to-slate-950 border-rose-500/30'
        }`}
      >
        {/* Room Ambient details */}
        <div className="absolute top-3 left-4 text-[10px] text-rose-300/80 flex items-center gap-1">
          <Sparkles size={11} />
          <span>Theme: {pet.roomTheme?.replace('_', ' ') || 'Sakura Garden'}</span>
        </div>

        <div className="absolute top-3 right-4 text-[10px] text-slate-400">
          Last cared by: <span className="text-white font-medium">{pet.lastFedBy || currentUserName}</span>
        </div>

        {/* Speech Bubble */}
        <div className="relative mt-5 z-10 max-w-[260px] bg-white/95 text-slate-900 rounded-2xl px-3.5 py-2 text-xs font-medium shadow-xl text-center animate-bounce-subtle">
          {bubbleText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45" />
        </div>

        {/* The Pet Character & Accessories */}
        <div className="relative flex items-center justify-center my-auto cursor-pointer select-none" onClick={() => handleAction('cuddle')}>
          {/* Costume Overlay */}
          {pet.costume === 'crown' && (
            <div className="absolute -top-7 text-2xl z-20 animate-bounce">👑</div>
          )}
          {pet.costume === 'angel_wings' && (
            <div className="absolute -left-7 -top-2 text-3xl z-0 transform -scale-x-100">🪽</div>
          )}
          {pet.costume === 'angel_wings' && (
            <div className="absolute -right-7 -top-2 text-3xl z-0">🪽</div>
          )}
          {pet.costume === 'ribbon' && (
            <div className="absolute -top-5 text-2xl z-20">🎀</div>
          )}
          {pet.costume === 'glasses' && (
            <div className="absolute top-1 text-2xl z-20">🕶️</div>
          )}

          {/* Pet Animated Avatar */}
          <div
            className={`text-7xl transition-transform duration-300 select-none ${
              activeAnimation === 'feed'
                ? 'scale-125 rotate-6'
                : activeAnimation === 'bathe'
                ? 'scale-110 -rotate-6'
                : activeAnimation === 'cuddle'
                ? 'scale-130 animate-pulse-heart'
                : 'hover:scale-110 animate-float-gentle'
            }`}
          >
            {currentPetMeta.emoji}
          </div>

          {/* Action Visual Splash */}
          {activeAnimation === 'feed' && (
            <div className="absolute -right-6 top-0 text-3xl animate-bounce">🍓✨</div>
          )}
          {activeAnimation === 'bathe' && (
            <div className="absolute -left-6 top-0 text-3xl animate-bounce">🫧🛁</div>
          )}
          {activeAnimation === 'cuddle' && (
            <div className="absolute -top-6 text-3xl animate-ping">💖</div>
          )}
          {activeAnimation === 'sleep' && (
            <div className="absolute -right-6 -top-4 text-3xl animate-pulse">💤🌙</div>
          )}
        </div>

        {/* Floor Shadow */}
        <div className="w-32 h-3.5 bg-black/40 rounded-full blur-[2px] mb-2" />
      </div>

      {/* Pet Stats Meter */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Utensils size={12} className="text-amber-400" /> Hunger
            </span>
            <span className="text-amber-400 font-bold">{pet.hunger || 80}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${pet.hunger || 80}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Smile size={12} className="text-pink-400" /> Happiness
            </span>
            <span className="text-pink-400 font-bold">{pet.happiness || 95}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-pink-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${pet.happiness || 95}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Moon size={12} className="text-indigo-400" /> Energy
            </span>
            <span className="text-indigo-400 font-bold">{pet.energy || 85}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${pet.energy || 85}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs for Action / Wardrobe / Room */}
      <div className="flex rounded-2xl bg-slate-900/80 p-1 border border-slate-800">
        <button
          onClick={() => setSelectedTab('care')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
            selectedTab === 'care'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Care Actions
        </button>
        <button
          onClick={() => setSelectedTab('dress')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${
            selectedTab === 'dress'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shirt size={12} /> Outfits <span className="text-[9px] px-1 bg-amber-400 text-slate-950 font-black rounded-full">PRO</span>
        </button>
        <button
          onClick={() => setSelectedTab('room')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
            selectedTab === 'room'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Room Themes
        </button>
      </div>

      {/* Tab 1: Care Actions */}
      {selectedTab === 'care' && (
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleAction('feed')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition active:scale-95"
          >
            <span className="text-2xl mb-1">🍓</span>
            <span className="text-xs font-bold">Feed Treat</span>
            <span className="text-[9px] text-amber-400/80">+25 Hunger</span>
          </button>

          <button
            onClick={() => handleAction('bathe')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 transition active:scale-95"
          >
            <span className="text-2xl mb-1">🛁</span>
            <span className="text-xs font-bold">Bubble Bath</span>
            <span className="text-[9px] text-sky-400/80">+20 Happy</span>
          </button>

          <button
            onClick={() => handleAction('cuddle')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition active:scale-95"
          >
            <span className="text-2xl mb-1">💖</span>
            <span className="text-xs font-bold">Cuddle</span>
            <span className="text-[9px] text-rose-400/80">+Love XP</span>
          </button>

          <button
            onClick={() => handleAction('sleep')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition active:scale-95"
          >
            <span className="text-2xl mb-1">🌙</span>
            <span className="text-xs font-bold">Tuck in Bed</span>
            <span className="text-[9px] text-indigo-400/80">+Energy</span>
          </button>
        </div>
      )}

      {/* Tab 2: Outfits */}
      {selectedTab === 'dress' && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'none', label: 'Default', icon: '✨' },
            { id: 'crown', label: 'Royal Crown', icon: '👑' },
            { id: 'angel_wings', label: 'Angel Wings', icon: '🪽' },
            { id: 'ribbon', label: 'Cute Ribbon', icon: '🎀' },
            { id: 'glasses', label: 'Cool Shades', icon: '🕶️' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => handleCostumeChange(c.id)}
              className={`flex flex-col items-center p-2.5 rounded-2xl border transition ${
                pet.costume === c.id
                  ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-2xl mb-1">{c.icon}</span>
              <span className="text-[11px] truncate">{c.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tab 3: Room Themes */}
      {selectedTab === 'room' && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'sakura_garden', label: 'Sakura Garden', icon: '🌸' },
            { id: 'cozy_bedroom', label: 'Cozy Bedroom', icon: '🛏️' },
            { id: 'cloud_kingdom', label: 'Cloud Dream', icon: '☁️' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => handleRoomChange(r.id)}
              className={`flex flex-col items-center p-3 rounded-2xl border transition ${
                pet.roomTheme === r.id
                  ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-2xl mb-1">{r.icon}</span>
              <span className="text-xs font-semibold">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
