import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  Lock,
  Unlock,
  Plus,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  Mail,
  Send,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

export default function MemoriesTimeline({
  state,
  currentUserName,
  partnerUserName,
  onAddMemory,
  onAddLoveLetter,
}) {
  const [activeSubTab, setActiveSubTab] = useState('photos'); // 'photos' | 'letters' | 'milestones'
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showAddLetterModal, setShowAddLetterModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);

  // New letter form
  const [letterTitle, setLetterTitle] = useState('');
  const [letterBody, setLetterBody] = useState('');
  const [letterUnlock, setLetterUnlock] = useState('Open anytime');

  // New photo memory form
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoLocation, setPhotoLocation] = useState('');
  const [photoDate, setPhotoDate] = useState('Today');
  const [photoNote, setPhotoNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&auto=format&fit=crop&q=80'
  );

  const handleCreateLetter = (e) => {
    e.preventDefault();
    if (!letterTitle || !letterBody) return;

    onAddLoveLetter({
      id: Date.now(),
      sender: currentUserName,
      recipient: partnerUserName,
      title: letterTitle,
      preview: letterBody.substring(0, 45) + '...',
      body: letterBody,
      unlockCondition: letterUnlock,
      isUnlocked: true,
      createdDate: new Date().toISOString().split('T')[0],
      tag: 'love',
    });

    setLetterTitle('');
    setLetterBody('');
    setShowAddLetterModal(false);
    soundManager.playChime();
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
  };

  const handleCreatePhoto = (e) => {
    e.preventDefault();
    if (!photoTitle) return;

    onAddMemory({
      id: Date.now(),
      title: photoTitle,
      date: photoDate,
      location: photoLocation || 'Special Place',
      note: photoNote,
      imageUrl: photoUrl,
      likes: 1,
    });

    setPhotoTitle('');
    setPhotoNote('');
    setShowAddPhotoModal(false);
    soundManager.playChime();
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Sub tabs */}
      <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1 text-xs">
        <button
          onClick={() => {
            setActiveSubTab('photos');
            soundManager.playKissPop();
          }}
          className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'photos'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera size={13} /> Photo Scrapbook
        </button>
        <button
          onClick={() => {
            setActiveSubTab('letters');
            soundManager.playKissPop();
          }}
          className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'letters'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mail size={13} /> Secret Letters <span className="text-[9px] px-1 bg-amber-400 text-slate-950 font-black rounded-full">PRO</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab('milestones');
            soundManager.playKissPop();
          }}
          className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'milestones'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar size={13} /> Milestones
        </button>
      </div>

      {/* 1. PHOTO SCRAPBOOK */}
      {activeSubTab === 'photos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-bold text-white text-base">Couple Memory Polaroid Wall</h3>
              <p className="text-xs text-slate-400">Cherished moments frozen in time</p>
            </div>
            <button
              onClick={() => setShowAddPhotoModal(true)}
              className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white text-xs font-semibold flex items-center gap-1 shadow-md active:scale-95 transition"
            >
              <Plus size={14} /> Add Memory
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.memories.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 shadow-xl hover:border-rose-500/40 transition group"
              >
                {/* Image Polaroid Style */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 mb-3">
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[10px] text-white flex items-center gap-1">
                    <Heart size={10} className="text-rose-400 fill-rose-400" />
                    <span>{m.likes}</span>
                  </div>
                </div>

                <div className="px-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm">{m.title}</h4>
                    <span className="text-[10px] text-rose-300 font-medium">{m.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                    <MapPin size={11} className="text-rose-400" />
                    <span>{m.location}</span>
                  </div>
                  <p className="text-xs text-slate-300/90 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                    "{m.note}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SECRET LOVE LETTERS */}
      {activeSubTab === 'letters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-bold text-white text-base">Secret Love Vault</h3>
              <p className="text-xs text-slate-400">Encrypted letters to open at special times</p>
            </div>
            <button
              onClick={() => setShowAddLetterModal(true)}
              className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white text-xs font-semibold flex items-center gap-1 shadow-md active:scale-95 transition"
            >
              <Plus size={14} /> Write Letter
            </button>
          </div>

          <div className="space-y-3">
            {state.loveLetters.map((letter) => (
              <div
                key={letter.id}
                onClick={() => {
                  setSelectedLetter(letter);
                  soundManager.playChime();
                }}
                className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition shadow-lg group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Mail size={15} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-rose-300 transition">
                        {letter.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        From {letter.sender} to {letter.recipient} • {letter.createdDate}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <Unlock size={10} /> Open
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 italic px-1">
                  "{letter.preview}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MILESTONES LIST */}
      {activeSubTab === 'milestones' && (
        <div className="space-y-4">
          <div className="rounded-3xl p-5 bg-gradient-to-br from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/30">
            <h3 className="font-bold text-white text-base mb-1">Relationship Milestones</h3>
            <p className="text-xs text-slate-400 mb-4">Every journey milestone celebrated forever</p>

            <div className="space-y-3">
              {[
                { title: 'First Met & Began Dating', days: 'Day 1', date: 'Aug 14, 2023', status: 'Completed', icon: '💖' },
                { title: '100 Days of Us', days: 'Day 100', date: 'Nov 22, 2023', status: 'Celebrated', icon: '🎉' },
                { title: '1 Year Anniversary', days: 'Day 365', date: 'Aug 14, 2024', status: 'Celebrated', icon: '💍' },
                { title: '500 Days Milestone', days: 'Day 500', date: 'Dec 26, 2024', status: 'Celebrated', icon: '✨' },
                { title: '2 Years Together', days: 'Day 730', date: 'Aug 14, 2025', status: 'Celebrated', icon: '🥂' },
                { title: '1,000 Days Milestone', days: 'Day 1,000', date: 'May 10, 2026', status: 'Celebrated', icon: '👑' },
                { title: '1,200 Days Milestone', days: 'Day 1,200', date: 'Nov 26, 2026', status: 'Upcoming in 4 days! 🔥', icon: '⏳' },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <h4 className="font-bold text-white text-xs">{m.title}</h4>
                      <span className="text-[10px] text-slate-400">{m.date} ({m.days})</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      m.status.includes('Upcoming')
                        ? 'bg-amber-400 text-slate-950 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Love Letter View Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative max-w-md w-full bg-gradient-to-br from-rose-950 via-slate-900 to-pink-950 border border-rose-500/40 rounded-3xl p-6 text-left shadow-2xl">
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
                💌 Secret Love Letter
              </span>
              <span className="text-xs text-slate-400">To {selectedLetter.recipient}</span>
            </div>

            <h3 className="font-bold text-white text-lg mb-2">{selectedLetter.title}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Written with love by <span className="text-white font-medium">{selectedLetter.sender}</span> on {selectedLetter.createdDate}
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/20 text-pink-100 text-sm leading-relaxed whitespace-pre-line font-serif italic mb-6">
              "{selectedLetter.body}"
            </div>

            <button
              onClick={() => {
                soundManager.playHeartbeat();
                setSelectedLetter(null);
              }}
              className="w-full py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <Heart size={14} className="fill-current" /> Keep Deep in Heart
            </button>
          </div>
        </div>
      )}

      {/* Add Letter Modal */}
      {showAddLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateLetter}
            className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-md w-full space-y-3.5"
          >
            <h4 className="font-bold text-white text-base">Write a Secret Love Letter</h4>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Letter Title / When to open</label>
              <input
                type="text"
                required
                placeholder="E.g. Open when you feel stressed, Open on our next date..."
                value={letterTitle}
                onChange={(e) => setLetterTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Your Romantic Words</label>
              <textarea
                required
                rows={5}
                placeholder="Pour your sweetest thoughts here..."
                value={letterBody}
                onChange={(e) => setLetterBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddLetterModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow"
              >
                Seal & Store in Vault 💌
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Photo Memory Modal */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreatePhoto}
            className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-md w-full space-y-3.5"
          >
            <h4 className="font-bold text-white text-base">Add New Sweet Memory</h4>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Title</label>
              <input
                type="text"
                required
                placeholder="E.g. Ice cream in the park 🍦"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Location</label>
              <input
                type="text"
                placeholder="E.g. Ella, Sri Lanka"
                value={photoLocation}
                onChange={(e) => setPhotoLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Short Note / Caption</label>
              <textarea
                rows={2}
                placeholder="What made this moment unforgettable?"
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddPhotoModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow"
              >
                Add to Scrapbook ✨
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
