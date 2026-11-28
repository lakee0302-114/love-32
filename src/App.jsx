import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomeScreen from './components/HomeScreen';
import PetGarden from './components/PetGarden';
import MissYouHub from './components/MissYouHub';
import MemoriesTimeline from './components/MemoriesTimeline';
import CoupleGames from './components/CoupleGames';
import WidgetStudio from './components/WidgetStudio';
import ProfileScreen from './components/ProfileScreen';
import SettingsModal from './components/SettingsModal';
import WhatPremiumIncludesModal from './components/WhatPremiumIncludesModal';
import AboutPhoneStatusModal from './components/AboutPhoneStatusModal';
import AnniversaryModal from './components/AnniversaryModal';
import ScreenBombOverlay from './components/ScreenBombOverlay';
import AuthScreen from './components/AuthScreen';
import ALStudyHub from './components/ALStudyHub';
import LiveScreenShareModal from './components/LiveScreenShareModal';
import RemoteControlModal from './components/RemoteControlModal';
import { BellRing, Moon, BookOpen, VolumeX, Zap } from 'lucide-react';

import {
  initialCoupleState,
  loadSavedState,
  saveState,
  broadcastUpdate,
  subscribeToBroadcast,
} from './utils/storage';
import { cloudSync } from './utils/cloudSync';
import { firebaseSync, getSavedRoomCode, saveRoomCode, normalizePartnerCode, fetchRoomStateFromFirebase } from './utils/firebase';
import { monitorPhoneBattery, monitorLiveLocationAndSpeed, calculateDistanceKm } from './utils/deviceSensors';
import { soundManager } from './utils/audio';
import { CURRENT_APP_VERSION, startAutoUpdateWatcher, applyUpdateNow } from './utils/autoUpdater';
import confetti from 'canvas-confetti';

const AUTH_STORAGE_KEY = 'love8_user_auth_session';

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const [state, setState] = useState(() => loadSavedState());
  const [activeTab, setActiveTab] = useState('home');
  const [currentUserId, setCurrentUserId] = useState(() => session?.role || 'partnerA');
  const [isMuted, setIsMuted] = useState(false);
  const [activeScreenBomb, setActiveScreenBomb] = useState(null);
  const [quickToast, setQuickToast] = useState(null);
  const [roomCode, setRoomCode] = useState(() => session?.partnerCode || getSavedRoomCode());

  // Theme & Appearance Settings (5 Luxury Romantic Themes: midnight, sakura, cosmic, sunset, light)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('love32_theme');
      if (saved === 'dark') return 'midnight';
      return saved || 'midnight';
    } catch (e) {
      return 'midnight';
    }
  });

  // Modal Dialog States
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPhoneStatusModal, setShowPhoneStatusModal] = useState(false);
  const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);
  const [showScreenShareModal, setShowScreenShareModal] = useState(false);
  const [incomingScreenShareOffer, setIncomingScreenShareOffer] = useState(null);
  const [incomingScreenShareAnswer, setIncomingScreenShareAnswer] = useState(null);
  const [incomingScreenShareIce, setIncomingScreenShareIce] = useState(null);
  const [isPartnerScreenSharing, setIsPartnerScreenSharing] = useState(false);

  // Couple Remote Control States
  const [showRemoteControlModal, setShowRemoteControlModal] = useState(false);
  const [incomingSiren, setIncomingSiren] = useState(null); // { senderName, timestamp }
  const [incomingFlash, setIncomingFlash] = useState(false);
  const [incomingBedtimeLock, setIncomingBedtimeLock] = useState(null); // { senderName, message, type }
  const [incomingPointer, setIncomingPointer] = useState(null);

  // Real-Time Cloud Auto-Update Engine
  const [updateAvailable, setUpdateAvailable] = useState(null);

  useEffect(() => {
    const unsub = startAutoUpdateWatcher((updateInfo) => {
      setUpdateAvailable(updateInfo);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleToggleTheme = (newTheme) => {
    const target = newTheme || (theme === 'midnight' ? 'sakura' : 'midnight');
    setTheme(target);
    try {
      localStorage.setItem('love32_theme', target);
    } catch (e) {}
    const themeLabels = {
      midnight: 'Midnight Romance 🖤',
      sakura: 'Sakura Blossom 🌸',
      cosmic: 'Cosmic Galaxy 🌌',
      sunset: 'Sunset Golden Hour 🍯',
      light: 'Porcelain Clean ☀️',
    };
    showToast(`Switched to ${themeLabels[target] || target}`);
  };

  // Dual Sync Engine: High-speed WebSocket relay + Official Google Firebase Realtime Database
  const broadcastSyncState = (nextState, targetRoom) => {
    if (!nextState) return;
    const room = normalizePartnerCode(targetRoom || roomCode);
    try {
      cloudSync.updateState(nextState);
    } catch (e) {}
    try {
      firebaseSync.updateState(nextState, room);
    } catch (e) {}
  };

  const broadcastSyncEvent = (type, senderName, payload = {}, targetRoom) => {
    const room = normalizePartnerCode(targetRoom || roomCode);
    try {
      cloudSync.pushEvent(type, senderName, payload);
    } catch (e) {}
    try {
      firebaseSync.pushEvent(type, senderName, payload, room);
    } catch (e) {}
  };

  // Connect or switch to a Partner Code seamlessly in real time
  const handleConnectPartnerCode = async (rawCode) => {
    const code = normalizePartnerCode(rawCode);
    if (!code || code.length < 5) {
      showToast('⚠️ Please enter a valid Partner Code (e.g. LOVE-4634 or 4634)');
      return false;
    }

    showToast(`🔄 Connecting to Partner Code ${code}...`);
    try {
      // 1. Update room code references
      setRoomCode(code);
      saveRoomCode(code);
      firebaseSync.setRoom(code);
      cloudSync.subscribeRoom(code);

      // 2. Fetch existing room data from Firebase
      const existing = await fetchRoomStateFromFirebase(code);
      let assignedRole = currentUserId || 'partnerB';
      let nextState;

      if (existing && typeof existing === 'object') {
        const pAJoined = Boolean(existing.partnerA?.isJoined && existing.partnerA?.name);
        const pBJoined = Boolean(existing.partnerB?.isJoined && existing.partnerB?.name);

        if (pAJoined && !pBJoined) {
          // Room host is partnerA, we join as partnerB
          assignedRole = 'partnerB';
          setCurrentUserId('partnerB');
          nextState = {
            ...existing,
            isPartnerConnected: true,
            partnerA: existing.partnerA,
            partnerB: {
              ...(existing.partnerB || {}),
              name: session?.userName || state.partnerB?.name || 'Partner',
              avatar: session?.userAvatar || state.partnerB?.avatar || '💖',
              isJoined: true,
              status: 'Connected with partner 💕',
              lastActive: 'Just now',
            },
          };
        } else if (!pAJoined && pBJoined) {
          // partnerB is host, we join as partnerA
          assignedRole = 'partnerA';
          setCurrentUserId('partnerA');
          nextState = {
            ...existing,
            isPartnerConnected: true,
            partnerB: existing.partnerB,
            partnerA: {
              ...(existing.partnerA || {}),
              name: session?.userName || state.partnerA?.name || 'Partner',
              avatar: session?.userAvatar || state.partnerA?.avatar || '🤴',
              isJoined: true,
              status: 'Connected with partner 💕',
              lastActive: 'Just now',
            },
          };
        } else {
          // Both or custom
          nextState = {
            ...existing,
            isPartnerConnected: Boolean(existing.partnerA?.isJoined || existing.partnerB?.isJoined),
            [assignedRole]: {
              ...(existing[assignedRole] || {}),
              name: session?.userName || state[assignedRole]?.name || 'Partner',
              avatar: session?.userAvatar || state[assignedRole]?.avatar || (assignedRole === 'partnerA' ? '🤴' : '💖'),
              isJoined: true,
              status: 'Connected with partner 💕',
              lastActive: 'Just now',
            },
          };
        }
      } else {
        // Fresh room
        nextState = {
          ...state,
          [assignedRole]: {
            ...state[assignedRole],
            name: session?.userName || state[assignedRole]?.name || 'Lakee',
            avatar: session?.userAvatar || state[assignedRole]?.avatar || '🤴',
            isJoined: true,
            status: 'Host joined ✨',
          },
        };
      }

      // 3. Update session in storage
      if (session) {
        const updatedSession = { ...session, partnerCode: code, role: assignedRole };
        setSession(updatedSession);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
      }

      // 4. Update local state
      setState(nextState);

      // 5. Broadcast to Firebase and MQTT
      await firebaseSync.updateState(nextState, code);
      cloudSync.updateState(nextState);

      const myName = nextState[assignedRole]?.name || session?.userName || 'Partner';
      broadcastSyncEvent('PARTNER_JOINED', myName, {
        role: assignedRole,
        name: myName,
        avatar: nextState[assignedRole]?.avatar || '💖',
      }, code);

      soundManager.playChime();
      soundManager.triggerVibration([100, 50, 100, 50, 200]);
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      const otherRole = assignedRole === 'partnerA' ? 'partnerB' : 'partnerA';
      const otherName = nextState[otherRole]?.name;
      if (otherName) {
        showToast(`🎉 Connected to ${otherName} in Room ${code}! 💖`);
      } else {
        showToast(`💖 Connected to Room ${code}! Waiting for partner... ⏳`);
      }
      return true;
    } catch (err) {
      console.error('[handleConnectPartnerCode] error:', err);
      showToast('⚠️ Error connecting to room');
      return false;
    }
  };

  const handleSaveAnniversary = (dateStr) => {
    let nextState;
    setState((prev) => {
      nextState = {
        ...prev,
        relationshipStartDate: dateStr,
      };
      saveState(nextState);
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });
    if (nextState) {
      broadcastSyncState(nextState);
    }
    showToast(`Anniversary set to ${dateStr} 💖`);
  };

  // Handle Login & Pairing Completion
  const handleLoginSuccess = async (authData) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setSession(authData);
    let assignedRole = authData.role || 'partnerA';
    setCurrentUserId(assignedRole);
    const code = normalizePartnerCode(authData.partnerCode);
    setRoomCode(code);
    saveRoomCode(code);
    firebaseSync.setRoom(code);
    cloudSync.subscribeRoom(code);

    let nextState = { ...state };
    try {
      const existing = await fetchRoomStateFromFirebase(code);
      if (existing && typeof existing === 'object') {
        const pAJoined = Boolean(existing.partnerA?.isJoined && existing.partnerA?.name);
        const pBJoined = Boolean(existing.partnerB?.isJoined && existing.partnerB?.name);

        if (pAJoined && !pBJoined && assignedRole === 'partnerB') {
          nextState = {
            ...existing,
            isPartnerConnected: true,
            partnerA: existing.partnerA,
            partnerB: {
              ...(existing.partnerB || {}),
              name: authData.userName || 'Partner',
              avatar: authData.userAvatar || '💖',
              isJoined: true,
              status: 'Just connected ✨',
            },
          };
        } else if (!pAJoined && pBJoined && assignedRole === 'partnerA') {
          nextState = {
            ...existing,
            isPartnerConnected: true,
            partnerB: existing.partnerB,
            partnerA: {
              ...(existing.partnerA || {}),
              name: authData.userName || 'Host',
              avatar: authData.userAvatar || '🤴',
              isJoined: true,
              status: 'Just connected ✨',
            },
          };
        } else {
          nextState = {
            ...existing,
            [assignedRole]: {
              ...(existing[assignedRole] || {}),
              name: authData.userName || 'You',
              avatar: authData.userAvatar || (assignedRole === 'partnerA' ? '🤴' : '💖'),
              isJoined: true,
              status: 'Online 💕',
            },
          };
        }
      } else {
        nextState = {
          ...state,
          [assignedRole]: {
            ...state[assignedRole],
            name: authData.userName || 'You',
            avatar: authData.userAvatar || (assignedRole === 'partnerA' ? '🤴' : '💖'),
            isJoined: true,
          },
        };
      }
    } catch (e) {}

    setState(nextState);
    await firebaseSync.updateState(nextState, code);
    cloudSync.updateState(nextState);

    broadcastSyncEvent('PARTNER_JOINED', authData.userName, {
      role: assignedRole,
      name: authData.userName,
      avatar: authData.userAvatar,
    }, code);

    showToast(`Welcome ${authData.userName}! Connected to Room ${code} 💖`);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
    showToast('Logged out');
  };

  // Global Realtime Cloud Sync: Subscribe to real-time couple state & live events
  useEffect(() => {
    if (!session) return;

    // Check if partner shared an invite link with ?code=CODE or ?room=CODE
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('code') || params.get('room');
    const activeRoom = (roomParam || roomCode || 'LOVE-7788').toUpperCase();

    if (roomParam && roomParam.toUpperCase() !== roomCode) {
      setRoomCode(activeRoom);
      saveRoomCode(activeRoom);
      showToast(`Connected to Partner Code: ${activeRoom} 💖`);
    }

    cloudSync.subscribeRoom(activeRoom);

    // 1. Subscribe to Cloud State Updates
    const unsubState = cloudSync.subscribeState(activeRoom, (remoteState) => {
      if (remoteState && typeof remoteState === 'object') {
        setState((prev) => {
          const incomingPartnerA = remoteState.partnerA || {};
          const incomingPartnerB = remoteState.partnerB || {};

          // Filter out legacy dummy Kasun / Nethmi from older sessions
          const cleanPartnerA =
            incomingPartnerA.name === 'Kasun'
              ? { ...incomingPartnerA, name: '', isJoined: false }
              : incomingPartnerA;
          const cleanPartnerB =
            incomingPartnerB.name === 'Nethmi' || !incomingPartnerB.isJoined
              ? { ...incomingPartnerB, name: '', isJoined: false, battery: null, speedKmH: 0 }
              : incomingPartnerB;

          const isBothJoined = Boolean(cleanPartnerA.isJoined && cleanPartnerB.isJoined);

          return {
            ...prev,
            partnerA: { ...prev.partnerA, ...cleanPartnerA },
            partnerB: { ...prev.partnerB, ...cleanPartnerB },
            distanceKm: isBothJoined ? (remoteState.distanceKm ?? prev.distanceKm) : null,
            pet: remoteState.pet ? { ...prev.pet, ...remoteState.pet } : prev.pet,
            memories: remoteState.memories || prev.memories,
            loveLetters: remoteState.loveLetters || prev.loveLetters,
            dailyQuestion: remoteState.dailyQuestion ? { ...prev.dailyQuestion, ...remoteState.dailyQuestion } : prev.dailyQuestion,
            bucketList: remoteState.bucketList || prev.bucketList,
            alStudy: remoteState.alStudy ? { ...prev.alStudy, ...remoteState.alStudy } : prev.alStudy,
          };
        });
      }
    });

    // 2. Subscribe to Live Events (Heartbeat, Kiss, Screen Bomb, Partner Joined, Study Nudges)
    const unsubEvents = cloudSync.subscribeEvents(activeRoom, (event) => {
      if (!event || !event.type) return;
      if (event.senderClientId === cloudSync.clientId) return; // Skip own events

      if (event.type === 'PARTNER_JOINED') {
        soundManager.playChime();
        soundManager.triggerVibration([100, 50, 100, 50, 200]);
        try {
          confetti({ particleCount: 90, spread: 80 });
        } catch (e) {}
        showToast(`🎉 ${event.senderName} just connected with your Partner Code! 💖`);

        // Update the opposite partner profile in our view
        const otherRole = event.payload?.role || (currentUserId === 'partnerA' ? 'partnerB' : 'partnerA');
        setState((prev) => {
          const next = {
            ...prev,
            isPartnerConnected: true,
            relationshipStartDate: prev.relationshipStartDate || new Date().toISOString(),
            [otherRole]: {
              ...prev[otherRole],
              name: event.payload?.name || event.senderName,
              avatar: event.payload?.avatar || prev[otherRole].avatar,
              isJoined: true,
              status: 'Just joined the room 💕',
            },
          };
          // Broadcast our state back so the newly joined partner receives it immediately
          broadcastSyncState(next);
          return next;
        });
      } else if (event.type === 'HEARTBEAT') {
        soundManager.playHeartbeat();
        showToast(`💓 ${event.senderName} sent you a heartbeat!`);
      } else if (event.type === 'KISS') {
        soundManager.playKissPop();
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch (e) {}
        showToast(`💋 ${event.senderName} blew you a sweet kiss!`);
      } else if (event.type === 'SCREEN_BOMB') {
        setActiveScreenBomb(event.payload);
      } else if (event.type === 'study_reaction') {
        const rType = event.payload?.type;
        if (rType === 'nudge') {
          soundManager.playNudge();
          showToast(`📢 ${event.senderName}: "Wada karapan! 📖" Nudge received!`);
        } else if (rType === 'water') {
          soundManager.playChime();
          showToast(`💧 ${event.senderName} says: "Drink water & stay hydrated! 🥤"`);
        } else if (rType === 'proud') {
          soundManager.playSuccess();
          try { confetti({ particleCount: 60, spread: 70 }); } catch (e) {}
          showToast(`🌟 ${event.senderName} is super proud of your studying! 💖`);
        } else if (rType === 'coffee') {
          soundManager.playChime();
          showToast(`☕ ${event.senderName}: "How about a coffee break? ☕"`);
        }
      } else if (event.type === 'study_session_start') {
        soundManager.playChime();
        showToast(`🔥 ${event.senderName} started a ${event.payload?.duration}m ${event.payload?.subject?.toUpperCase()} session!`);
      } else if (event.type === 'study_challenge') {
        soundManager.playSuccess();
        try { confetti({ particleCount: 50, spread: 60 }); } catch (e) {}
        showToast(`⚔️ ${event.senderName} sent you an A/L Challenge! Can you solve it?`);
      } else if (event.type === 'SCREEN_SHARE_OFFER') {
        soundManager.playChime();
        setIncomingScreenShareOffer(event.payload);
        setIsPartnerScreenSharing(true);
        setShowScreenShareModal(true);
        showToast(`📺 ${event.senderName} is sharing their screen with you!`);
      } else if (event.type === 'SCREEN_SHARE_ANSWER') {
        setIncomingScreenShareAnswer(event.payload);
      } else if (event.type === 'SCREEN_SHARE_ICE') {
        setIncomingScreenShareIce(event.payload);
      } else if (event.type === 'SCREEN_SHARE_STOP') {
        setIsPartnerScreenSharing(false);
        setIncomingScreenShareOffer(null);
        showToast(`🛑 ${event.senderName} stopped screen sharing.`);
      } else if (event.type === 'REMOTE_RING_ALERT') {
        soundManager.playRemoteSiren();
        setIncomingSiren({ senderName: event.senderName, timestamp: Date.now() });
      } else if (event.type === 'REMOTE_RING_ACK') {
        soundManager.stopRemoteSiren();
        setIncomingSiren(null);
        showToast(`✅ ${event.senderName} acknowledged and stopped the siren!`);
      } else if (event.type === 'REMOTE_VIBRATE_ALERT') {
        const pattern = event.payload?.pattern || [120, 80, 150];
        soundManager.triggerVibration(pattern);
        soundManager.playKissPop();
        showToast(`📳 ${event.senderName} sent a "${event.payload?.name || 'Haptic'}" buzz!`);
      } else if (event.type === 'REMOTE_FLASH_ALERT') {
        setIncomingFlash(true);
        soundManager.playStrobePing();
        setTimeout(() => setIncomingFlash(false), event.payload?.duration || 3500);
      } else if (event.type === 'REMOTE_BEDTIME_TAKEOVER') {
        setIncomingBedtimeLock({
          senderName: event.senderName,
          message: event.payload?.message,
          type: event.payload?.type || 'bedtime',
        });
        if (event.payload?.type === 'bedtime') {
          soundManager.playSleepLullaby();
        } else {
          soundManager.playNudge();
        }
      } else if (event.type === 'REMOTE_PING_STATUS') {
        soundManager.playLaserClick();
        showToast(`📡 ${event.senderName} pinged your device status!`);
        monitorPhoneBattery(({ battery, isCharging }) => {
          setState((prev) => {
            const next = {
              ...prev,
              [currentUserId]: {
                ...prev[currentUserId],
                battery,
                isCharging,
              },
            };
            broadcastSyncState(next);
            return next;
          });
        });
      } else if (event.type === 'REMOTE_POINTER_CLICK') {
        setIncomingPointer(event.payload);
      }
    });

    // 3. Subscribe to Google Firebase Realtime Database
    const unsubFirebaseState = firebaseSync.subscribeState(activeRoom, (remoteState) => {
      if (remoteState && typeof remoteState === 'object') {
        setState((prev) => {
          const myRole = currentUserId || 'partnerA';
          const partnerRole = myRole === 'partnerA' ? 'partnerB' : 'partnerA';

          const remoteMy = remoteState[myRole] || {};
          const remotePartner = remoteState[partnerRole] || {};

          // Never unjoin or wipe our own active user profile
          const mergedMy = {
            ...prev[myRole],
            ...remoteMy,
            name: prev[myRole]?.name || remoteMy.name || 'You',
            avatar: prev[myRole]?.avatar || remoteMy.avatar || (myRole === 'partnerA' ? '🤴' : '💖'),
            isJoined: prev[myRole]?.isJoined ?? true,
          };

          // Filter legacy Kasun/Nethmi names if they ever come from old rooms
          const cleanPartnerName = (remotePartner.name === 'Nethmi' || remotePartner.name === 'Kasun')
            ? (prev[partnerRole]?.name || '')
            : (remotePartner.name || prev[partnerRole]?.name || '');

          const mergedPartner = {
            ...prev[partnerRole],
            ...remotePartner,
            name: cleanPartnerName,
            avatar: remotePartner.avatar || prev[partnerRole]?.avatar || (partnerRole === 'partnerA' ? '🤴' : '💖'),
            isJoined: Boolean(remotePartner.isJoined && cleanPartnerName),
          };

          const isBothJoined = Boolean(mergedMy.isJoined && mergedPartner.isJoined && mergedPartner.name);

          return {
            ...prev,
            [myRole]: mergedMy,
            [partnerRole]: mergedPartner,
            isPartnerConnected: isBothJoined,
            distanceKm: isBothJoined ? (remoteState.distanceKm ?? prev.distanceKm) : null,
            pet: remoteState.pet ? { ...prev.pet, ...remoteState.pet } : prev.pet,
            memories: remoteState.memories || prev.memories,
            loveLetters: remoteState.loveLetters || prev.loveLetters,
            dailyQuestion: remoteState.dailyQuestion ? { ...prev.dailyQuestion, ...remoteState.dailyQuestion } : prev.dailyQuestion,
            bucketList: remoteState.bucketList || prev.bucketList,
            alStudy: remoteState.alStudy ? { ...prev.alStudy, ...remoteState.alStudy } : prev.alStudy,
          };
        });
      }
    });

    const unsubFirebaseEvents = firebaseSync.subscribeEvents(activeRoom, (event) => {
      if (!event || !event.type) return;
      const currentName = currentUserId === 'partnerA' ? state.partnerA.name : state.partnerB.name;
      if (event.senderName === currentName) return;

      if (event.type === 'PARTNER_JOINED') {
        soundManager.playChime();
        soundManager.triggerVibration([100, 50, 100, 50, 200]);
        try {
          confetti({ particleCount: 90, spread: 80 });
        } catch (e) {}
        showToast(`🎉 ${event.senderName} just connected with your Partner Code! 💖`);

        const otherRole = event.payload?.role || (currentUserId === 'partnerA' ? 'partnerB' : 'partnerA');
        setState((prev) => ({
          ...prev,
          isPartnerConnected: true,
          relationshipStartDate: prev.relationshipStartDate || new Date().toISOString(),
          [otherRole]: {
            ...prev[otherRole],
            name: event.payload?.name || event.senderName,
            avatar: event.payload?.avatar || prev[otherRole].avatar,
            isJoined: true,
            status: 'Connected 💕',
            lastActive: 'Just now',
          },
        }));
      } else if (event.type === 'HEARTBEAT') {
        soundManager.playHeartbeat();
        showToast(`💓 ${event.senderName} sent you a heartbeat!`);
      } else if (event.type === 'KISS') {
        soundManager.playKissPop();
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch (e) {}
        showToast(`💋 ${event.senderName} blew you a sweet kiss!`);
      } else if (event.type === 'SCREEN_BOMB') {
        setActiveScreenBomb(event.payload);
      } else if (event.type === 'study_reaction') {
        const rType = event.payload?.type;
        if (rType === 'nudge') {
          soundManager.playNudge();
          showToast(`📢 ${event.senderName}: "Wada karapan! 📖" Nudge received!`);
        } else if (rType === 'water') {
          soundManager.playChime();
          showToast(`💧 ${event.senderName} says: "Drink water & stay hydrated! 🥤"`);
        } else if (rType === 'proud') {
          soundManager.playSuccess();
          try { confetti({ particleCount: 60, spread: 70 }); } catch (e) {}
          showToast(`🌟 ${event.senderName} is super proud of your studying! 💖`);
        } else if (rType === 'coffee') {
          soundManager.playChime();
          showToast(`☕ ${event.senderName}: "How about a coffee break? ☕"`);
        }
      } else if (event.type === 'study_session_start') {
        soundManager.playChime();
        showToast(`🔥 ${event.senderName} started a ${event.payload?.duration}m ${event.payload?.subject?.toUpperCase()} session!`);
      } else if (event.type === 'study_challenge') {
        soundManager.playSuccess();
        try { confetti({ particleCount: 50, spread: 60 }); } catch (e) {}
        showToast(`⚔️ ${event.senderName} sent you an A/L Challenge! Can you solve it?`);
      } else if (event.type === 'SCREEN_SHARE_OFFER') {
        soundManager.playChime();
        setIncomingScreenShareOffer(event.payload);
        setIsPartnerScreenSharing(true);
        setShowScreenShareModal(true);
        showToast(`📺 ${event.senderName} is sharing their screen with you!`);
      } else if (event.type === 'SCREEN_SHARE_ANSWER') {
        setIncomingScreenShareAnswer(event.payload);
      } else if (event.type === 'SCREEN_SHARE_ICE') {
        setIncomingScreenShareIce(event.payload);
      } else if (event.type === 'SCREEN_SHARE_STOP') {
        setIsPartnerScreenSharing(false);
        setIncomingScreenShareOffer(null);
        showToast(`🛑 ${event.senderName} stopped screen sharing.`);
      } else if (event.type === 'REMOTE_RING_ALERT') {
        soundManager.playRemoteSiren();
        setIncomingSiren({ senderName: event.senderName, timestamp: Date.now() });
      } else if (event.type === 'REMOTE_RING_ACK') {
        soundManager.stopRemoteSiren();
        setIncomingSiren(null);
        showToast(`✅ ${event.senderName} acknowledged and stopped the siren!`);
      } else if (event.type === 'REMOTE_VIBRATE_ALERT') {
        const pattern = event.payload?.pattern || [120, 80, 150];
        soundManager.triggerVibration(pattern);
        soundManager.playKissPop();
        showToast(`📳 ${event.senderName} sent a "${event.payload?.name || 'Haptic'}" buzz!`);
      } else if (event.type === 'REMOTE_FLASH_ALERT') {
        setIncomingFlash(true);
        soundManager.playStrobePing();
        setTimeout(() => setIncomingFlash(false), event.payload?.duration || 3500);
      } else if (event.type === 'REMOTE_BEDTIME_TAKEOVER') {
        setIncomingBedtimeLock({
          senderName: event.senderName,
          message: event.payload?.message,
          type: event.payload?.type || 'bedtime',
        });
        if (event.payload?.type === 'bedtime') {
          soundManager.playSleepLullaby();
        } else {
          soundManager.playNudge();
        }
      } else if (event.type === 'REMOTE_PING_STATUS') {
        soundManager.playLaserClick();
        showToast(`📡 ${event.senderName} pinged your device status!`);
        monitorPhoneBattery(({ battery, isCharging }) => {
          setState((prev) => {
            const next = {
              ...prev,
              [currentUserId]: {
                ...prev[currentUserId],
                battery,
                isCharging,
              },
            };
            broadcastSyncState(next);
            return next;
          });
        });
      } else if (event.type === 'REMOTE_POINTER_CLICK') {
        setIncomingPointer(event.payload);
      }
    });

    return () => {
      if (typeof unsubState === 'function') unsubState();
      if (typeof unsubEvents === 'function') unsubEvents();
      if (typeof unsubFirebaseState === 'function') unsubFirebaseState();
      if (typeof unsubFirebaseEvents === 'function') unsubFirebaseEvents();
    };
  }, [session, roomCode, currentUserId]);

  // Real-Time Hardware Sensor Telemetry (Phone Battery + Live GPS Speed & Location)
  useEffect(() => {
    if (!session) return;

    // 1. Monitor actual phone battery level and charging state
    const unsubBattery = monitorPhoneBattery(({ battery, isCharging }) => {
      let nextState;
      setState((prev) => {
        nextState = {
          ...prev,
          [currentUserId]: {
            ...prev[currentUserId],
            battery,
            isCharging,
          },
        };
        return nextState;
      });
      if (nextState) {
        broadcastSyncState(nextState);
      }
    });

    // 2. Monitor live device GPS location and travel speed automatically
    const unsubLocation = monitorLiveLocationAndSpeed((geoData) => {
      let nextState;
      setState((prev) => {
        const partnerRole = currentUserId === 'partnerA' ? 'partnerB' : 'partnerA';
        const partnerCoords = prev[partnerRole]?.coords;
        let distanceKm = prev.distanceKm;

        // If partner's real GPS is available, calculate exact live distance!
        if (partnerCoords && partnerCoords.lat && partnerCoords.lng) {
          const calculatedDist = calculateDistanceKm(
            geoData.lat,
            geoData.lng,
            partnerCoords.lat,
            partnerCoords.lng
          );
          if (calculatedDist !== null) {
            distanceKm = calculatedDist;
          }
        }

        nextState = {
          ...prev,
          distanceKm,
          [currentUserId]: {
            ...prev[currentUserId],
            speedKmH: geoData.speedKmH,
            activity: geoData.activity,
            isMoving: geoData.isMoving,
            coords: {
              lat: geoData.lat,
              lng: geoData.lng,
              accuracy: geoData.accuracy,
            },
          },
        };
        return nextState;
      });

      if (nextState) {
        broadcastSyncState(nextState);
      }
    });

    return () => {
      unsubBattery();
      unsubLocation();
    };
  }, [session, currentUserId]);

  // Sync state to local storage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Also sync across local browser tabs instantly using BroadcastChannel
  useEffect(() => {
    const unsubscribe = subscribeToBroadcast((data) => {
      if (!data) return;
      const { action, payload } = data;

      if (action === 'SCREEN_BOMB') {
        setActiveScreenBomb(payload);
      } else if (action === 'HEARTBEAT') {
        soundManager.playHeartbeat();
        showToast(`💓 ${payload.senderName} sent you a heartbeat!`);
      } else if (action === 'KISS') {
        soundManager.playKissPop();
        try {
          confetti({ particleCount: 40, spread: 50 });
        } catch (e) {}
        showToast(`💋 ${payload.senderName} blew you a sweet kiss!`);
      } else if (action === 'STATE_UPDATE') {
        setState((prev) => ({ ...prev, ...payload }));
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message) => {
    setQuickToast(message);
    setTimeout(() => {
      setQuickToast(null);
    }, 3200);
  };

  const handleSwitchUser = (newUserId) => {
    setCurrentUserId(newUserId);
    const name = newUserId === 'partnerA' ? state.partnerA.name : state.partnerB.name;
    showToast(`Switched view to ${name}!`);
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    showToast(muted ? 'Sound Muted' : 'Sound Enabled 🔔');
  };

  // 1. Send Heartbeat (Cloud Realtime Push)
  const handleSendHeartbeat = () => {
    const currentName = currentUserId === 'partnerA' ? state.partnerA.name : state.partnerB.name;
    const partnerName = currentUserId === 'partnerA' ? state.partnerB.name : state.partnerA.name;
    soundManager.playHeartbeat();
    showToast(`💓 Heartbeat sent to ${partnerName}!`);

    broadcastUpdate('HEARTBEAT', { senderName: currentName });
    broadcastSyncEvent('HEARTBEAT', currentName, {});
  };

  // 2. Send Kiss (Cloud Realtime Push)
  const handleSendQuickKiss = () => {
    const currentName = currentUserId === 'partnerA' ? state.partnerA.name : state.partnerB.name;
    const partnerName = currentUserId === 'partnerA' ? state.partnerB.name : state.partnerA.name;
    soundManager.playKissPop();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}
    showToast(`💋 Kiss sent to ${partnerName}!`);

    broadcastUpdate('KISS', { senderName: currentName });
    broadcastSyncEvent('KISS', currentName, {});
  };

  // 3. Send Screen Bomb (Cloud Realtime Push)
  const handleSendScreenBomb = (bombData) => {
    setTimeout(() => {
      setActiveScreenBomb(bombData);
    }, 500);

    broadcastUpdate('SCREEN_BOMB', bombData);
    broadcastSyncEvent('SCREEN_BOMB', bombData.senderName, bombData);
  };

  // 4. Update Status & Mood (Cloud Realtime Update)
  const handleUpdateMyStatus = (newStatus, newMood) => {
    let nextState;
    setState((prev) => {
      nextState = {
        ...prev,
        [currentUserId]: {
          ...prev[currentUserId],
          status: newStatus,
          mood: newMood,
        },
      };
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
    }
    showToast('✨ Status updated!');
  };

  // 4b. Update Profile (Name, Avatar, Mood, Status)
  const handleUpdateProfile = (updates) => {
    let nextState;
    setState((prev) => {
      nextState = {
        ...prev,
        [currentUserId]: {
          ...prev[currentUserId],
          ...updates,
        },
      };
      saveState(nextState);
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
      broadcastSyncEvent('PROFILE_UPDATED', updates.name || currentUser.name, updates);
    }

    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (updates.name) parsed.userName = updates.name;
        if (updates.avatar) parsed.userAvatar = updates.avatar;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
        setSession(parsed);
      }
    } catch (e) {}

    showToast('✨ Profile updated successfully!');
  };

  // 5. Update Pet (Cloud Realtime Update)
  const handleUpdatePet = (updatedPet) => {
    let nextState;
    setState((prev) => {
      nextState = { ...prev, pet: updatedPet };
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
    }
  };

  // 6. Update Distance (Cloud Realtime Update)
  const handleUpdateDistance = (km) => {
    let nextState;
    setState((prev) => {
      nextState = { ...prev, distanceKm: km };
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
    }
    showToast(`Distance updated to ${km} km!`);
  };

  // 7. Update Travel Speed & Activity (Cloud Realtime Update)
  const handleUpdateSpeed = (speedKmH, activity) => {
    const targetUser = currentUserId;
    const currentName = targetUser === 'partnerA' ? state.partnerA.name : state.partnerB.name;
    let nextState;

    setState((prev) => {
      nextState = {
        ...prev,
        [targetUser]: {
          ...prev[targetUser],
          speedKmH,
          activity,
          isMoving: speedKmH > 0,
        },
      };
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
    }
    showToast(`🚀 ${currentName}'s speed updated: ${speedKmH} km/h (${activity})`);
  };

  // 8. Add Memory (Cloud Realtime Update)
  const handleAddMemory = (newMem) => {
    let nextState;
    setState((prev) => {
      nextState = {
        ...prev,
        memories: [newMem, ...prev.memories],
      };
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
    }
    showToast('📸 Memory photo saved in Scrapbook!');
  };

  // 9. Add Love Letter (Cloud Realtime Update)
  const handleAddLoveLetter = (newLetter) => {
    let nextState;
    setState((prev) => {
      nextState = {
        ...prev,
        loveLetters: [newLetter, ...prev.loveLetters],
      };
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
    }
    showToast('💌 Secret Love Letter locked in Vault!');
  };

  // 10. Save Daily Question Answer (Cloud Realtime Update)
  const handleSaveAnswer = (answer, userId) => {
    let nextState;
    setState((prev) => {
      const field = userId === 'partnerA' ? 'partnerAAnswer' : 'partnerBAnswer';
      nextState = {
        ...prev,
        dailyQuestion: {
          ...prev.dailyQuestion,
          [field]: answer,
        },
      };
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
    }
    showToast('💖 Your answer saved! Partner unlocked!');
  };

  // 11. Couple Bucket List Item Toggle & Add (Love32 Pro Feature)
  const handleToggleBucketItem = (itemId) => {
    let nextState;
    setState((prev) => {
      const updatedList = (prev.bucketList || []).map((item) => {
        if (item.id === itemId) {
          const nextVal = !item.completed;
          if (nextVal) {
            soundManager.playSuccess();
            try {
              confetti({ particleCount: 70, spread: 80 });
            } catch (e) {}
          }
          return {
            ...item,
            completed: nextVal,
            completedBy: nextVal ? (currentUserId === 'partnerA' ? prev.partnerA.name : prev.partnerB.name) : undefined,
          };
        }
        return item;
      });
      nextState = { ...prev, bucketList: updatedList };
      saveState(nextState);
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
    }
  };

  const handleAddBucketItem = (title) => {
    if (!title || !title.trim()) return;
    const newItem = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
    };
    let nextState;
    setState((prev) => {
      nextState = {
        ...prev,
        bucketList: [...(prev.bucketList || []), newItem],
      };
      saveState(nextState);
      broadcastUpdate('STATE_UPDATE', nextState);
      return nextState;
    });

    if (nextState) {
      broadcastSyncState(nextState);
    }
    soundManager.playKissPop();
    showToast('✨ Added new dream to Couple Bucket List!');
  };

  // If not logged in or paired yet, show the Login & Partner Code Onboarding Screen
  if (!session) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const currentUser = currentUserId === 'partnerA' ? state.partnerA : state.partnerB;
  const partnerUser = currentUserId === 'partnerA' ? state.partnerB : state.partnerA;

  return (
    <div
      className={`min-h-screen min-h-[100dvh] theme-${theme || 'midnight'} ${
        theme === 'light' || theme === 'sakura'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-slate-950 text-slate-100'
      } flex flex-col items-center justify-start relative selection:bg-rose-500 selection:text-white transition-colors duration-300 w-full overflow-x-hidden`}
    >
      {/* Background ambient lighting customized by selected theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {theme === 'sakura' ? (
          <>
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-pink-300/25 rounded-full blur-[100px]" />
            <div className="absolute top-1/3 -right-32 w-80 h-80 bg-rose-300/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full blur-[100px]" />
          </>
        ) : theme === 'cosmic' ? (
          <>
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute top-1/3 -right-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />
          </>
        ) : theme === 'sunset' ? (
          <>
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px]" />
            <div className="absolute top-1/3 -right-32 w-80 h-80 bg-orange-600/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-rose-500/15 rounded-full blur-[100px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/15 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px]" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />
          </>
        )}
      </div>

      {/* Main Container - Mobile Edge-to-Edge with Desktop Phone Frame */}
      <div className="relative z-10 w-full md:max-w-md h-[100dvh] max-h-[100dvh] flex flex-col md:border-x md:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 shadow-2xl overflow-hidden">
        {/* Real-time Cloud Auto-Update Banner */}
        {updateAvailable && (
          <div className="relative z-50 p-2.5 mx-2.5 mt-2 rounded-2xl bg-gradient-to-r from-purple-900/95 via-rose-950/95 to-slate-900/95 border border-rose-400/50 shadow-2xl backdrop-blur-xl flex items-center justify-between animate-fadeIn text-white pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="text-base animate-pulse">🚀</span>
              <div>
                <div className="text-[11px] font-black">
                  New Update v{updateAvailable.version || '1.0.5'} Ready!
                </div>
                <div className="text-[9px] text-slate-300">
                  Auto Cloud Update • Tap to reload
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => applyUpdateNow()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-extrabold text-[11px] shadow hover:opacity-95 active:scale-95 transition cursor-pointer touch-manipulation"
            >
              Update Now ✨
            </button>
          </div>
        )}

        {/* Header with Settings Button (Shown on non-map tabs; Home tab uses Google Map floating top bar) */}
        {activeTab !== 'home' && (
          <Header
            state={state}
            currentUserId={currentUserId}
            onSwitchUser={handleSwitchUser}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            partnerCode={roomCode}
            onLogout={handleLogout}
            onOpenSettings={() => setShowSettingsModal(true)}
            onConnectPartnerCode={handleConnectPartnerCode}
          />
        )}

        {/* Dynamic View Content with Mobile Bottom Padding */}
        <main
          className={`flex-1 min-h-0 w-full ${
            activeTab === 'home'
              ? 'p-0 overflow-hidden relative'
              : 'p-3.5 sm:p-4 pb-28 overflow-y-auto overscroll-contain'
          }`}
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {activeTab === 'home' && (
            <HomeScreen
              state={state}
              currentUserId={currentUserId}
              onSendHeartbeat={handleSendHeartbeat}
              onSendQuickKiss={handleSendQuickKiss}
              onSendNudge={() => {
                soundManager.playKissPop();
                showToast(`📳 Nudged ${partnerUser.name}'s phone!`);
              }}
              onOpenMissYou={() => setActiveTab('missYou')}
              onUpdateMyStatus={handleUpdateMyStatus}
              onUpdateDistance={handleUpdateDistance}
              onUpdateSpeed={handleUpdateSpeed}
              onToggleBucketItem={handleToggleBucketItem}
              onAddBucketItem={handleAddBucketItem}
              partnerCode={roomCode}
              onOpenSettings={() => setShowSettingsModal(true)}
              onOpenAnniversary={() => setShowAnniversaryModal(true)}
              onOpenPremium={() => setShowPremiumModal(true)}
              onOpenPhoneStatus={() => setShowPhoneStatusModal(true)}
              onOpenStudyHub={() => setActiveTab('study')}
              onOpenScreenShare={() => setShowScreenShareModal(true)}
              onOpenRemoteControl={() => setShowRemoteControlModal(true)}
              theme={theme}
              onConnectPartnerCode={handleConnectPartnerCode}
            />
          )}

          {activeTab === 'study' && (
            <ALStudyHub
              state={state}
              currentUserId={currentUserId}
              currentUserName={currentUser.name}
              partnerUserName={partnerUser.name}
              onUpdateState={(updater) => {
                let next;
                setState((prev) => {
                  next = typeof updater === 'function' ? updater(prev) : updater;
                  return next;
                });
                broadcastSyncState(next);
              }}
              onBroadcastEvent={broadcastSyncEvent}
              onOpenScreenShare={() => setShowScreenShareModal(true)}
              showToast={showToast}
            />
          )}

          {activeTab === 'pet' && (
            <PetGarden
              pet={state.pet}
              currentUserName={currentUser.name}
              partnerUserName={partnerUser.name}
              onUpdatePet={handleUpdatePet}
            />
          )}

          {activeTab === 'missYou' && (
            <MissYouHub
              currentUserName={currentUser.name}
              partnerUserName={partnerUser.name}
              onSendScreenBomb={handleSendScreenBomb}
              onSaveDoodleToMemories={handleAddMemory}
            />
          )}

          {activeTab === 'memories' && (
            <MemoriesTimeline
              state={state}
              currentUserName={currentUser.name}
              partnerUserName={partnerUser.name}
              onAddMemory={handleAddMemory}
              onAddLoveLetter={handleAddLoveLetter}
            />
          )}

          {activeTab === 'games' && (
            <CoupleGames
              dailyQuestion={state.dailyQuestion}
              currentUserName={currentUser.name}
              partnerUserName={partnerUser.name}
              currentUserId={currentUserId}
              onSaveAnswer={handleSaveAnswer}
            />
          )}

          {activeTab === 'widgets' && (
            <WidgetStudio
              state={state}
              currentUserName={currentUser.name}
              partnerUserName={partnerUser.name}
              onSendHeartbeat={handleSendHeartbeat}
              onSendQuickKiss={handleSendQuickKiss}
            />
          )}

          {/* Profile & Couple Summary View (Matches Image 4) */}
          {activeTab === 'profile' && (
            <ProfileScreen
              state={state}
              currentUserId={currentUserId}
              onOpenSettings={() => setShowSettingsModal(true)}
              onOpenPremium={() => setShowPremiumModal(true)}
              onOpenAnniversary={() => setShowAnniversaryModal(true)}
              partnerCode={roomCode}
              onConnectPartnerCode={handleConnectPartnerCode}
            />
          )}
        </main>

        {/* Bottom Tab Bar */}
        <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* Settings Drawer / Modal (Dark Mode / Light Mode Selector - Matches Image 3) */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentUser={currentUser}
        partnerUser={partnerUser}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAnniversary={() => {
          setShowSettingsModal(false);
          setShowAnniversaryModal(true);
        }}
        onOpenPhoneStatus={() => {
          setShowSettingsModal(false);
          setShowPhoneStatusModal(true);
        }}
        onOpenPremium={() => {
          setShowSettingsModal(false);
          setShowPremiumModal(true);
        }}
        onLogout={handleLogout}
        partnerCode={roomCode}
        userEmail={session?.email || 'lakee0302@gmail.com'}
        onUpdateProfile={handleUpdateProfile}
        onSendHeartbeat={handleSendHeartbeat}
        onSendQuickKiss={handleSendQuickKiss}
        showToast={showToast}
        state={state}
        onConnectPartnerCode={handleConnectPartnerCode}
      />

      {/* What Premium Includes Modal (Matches Image 1) */}
      <WhatPremiumIncludesModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

      {/* About Phone Status Modal (Matches Image 2) */}
      <AboutPhoneStatusModal
        isOpen={showPhoneStatusModal}
        onClose={() => setShowPhoneStatusModal(false)}
      />

      {/* Anniversary Date Picker Modal (Matches Image 5) */}
      <AnniversaryModal
        isOpen={showAnniversaryModal}
        onClose={() => setShowAnniversaryModal(false)}
        currentStartDate={state.relationshipStartDate}
        onSaveAnniversary={handleSaveAnniversary}
        partnerA={state.partnerA}
        partnerB={state.partnerB}
      />

      {/* Full-screen Romantic Screen Bomb Alert */}
      {activeScreenBomb && (
        <ScreenBombOverlay
          bombData={activeScreenBomb}
          onClose={() => setActiveScreenBomb(null)}
        />
      )}

      {/* Live WebRTC Screen Share Modal */}
      <LiveScreenShareModal
        isOpen={showScreenShareModal}
        onClose={() => setShowScreenShareModal(false)}
        currentUserName={currentUser.name}
        partnerUserName={partnerUser.isJoined && partnerUser.name ? partnerUser.name : ''}
        currentUserId={currentUserId}
        onBroadcastEvent={broadcastSyncEvent}
        incomingOffer={incomingScreenShareOffer}
        incomingAnswer={incomingScreenShareAnswer}
        incomingIce={incomingScreenShareIce}
        isPartnerSharing={isPartnerScreenSharing}
        incomingPointer={incomingPointer}
        showToast={showToast}
        isPartnerJoined={Boolean(partnerUser.isJoined && partnerUser.name)}
        partnerCode={roomCode}
      />

      {/* Couple Remote Control Modal */}
      <RemoteControlModal
        isOpen={showRemoteControlModal}
        onClose={() => setShowRemoteControlModal(false)}
        currentUserName={currentUser.name}
        partnerUserName={partnerUser.name}
        partnerUser={partnerUser}
        onBroadcastEvent={broadcastSyncEvent}
        onOpenScreenShare={() => {
          setShowRemoteControlModal(false);
          setShowScreenShareModal(true);
        }}
        showToast={showToast}
      />

      {/* Emergency Remote Siren Full-Screen Alarm Overlay */}
      {incomingSiren && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-b from-red-950 via-rose-950 to-black text-white flex flex-col items-center justify-center p-6 text-center backdrop-blur-2xl animate-pulse">
          <div className="w-24 h-24 rounded-full bg-red-600/30 border-4 border-red-500 flex items-center justify-center animate-bounce mb-5 shadow-[0_0_50px_rgba(239,68,68,0.6)]">
            <BellRing size={52} className="text-white" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-red-500 text-white font-black text-xs uppercase tracking-widest mb-3 animate-pulse">
            🚨 EMERGENCY FIND PHONE SIREN
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-wide">
            {incomingSiren.senderName} is Ringing Your Phone!
          </h1>
          <p className="text-xs text-red-200 max-w-xs mb-8 leading-relaxed">
            Your partner is calling to locate you or urgently wake you up. Tap below to acknowledge and silence the alarm.
          </p>
          <button
            onClick={() => {
              soundManager.stopRemoteSiren();
              setIncomingSiren(null);
              broadcastSyncEvent('REMOTE_RING_ACK', currentUser.name, {});
              showToast('Siren silenced 🔕');
            }}
            className="px-8 py-4 rounded-3xl bg-white hover:bg-slate-100 text-red-600 font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition flex items-center gap-2"
          >
            <VolumeX size={18} />
            <span>I AM HERE! SILENCE SIREN 🔕</span>
          </button>
        </div>
      )}

      {/* Remote Strobe Screen Flash Overlay */}
      {incomingFlash && (
        <div className="fixed inset-0 z-[98] pointer-events-none flex items-center justify-center bg-white/90 animate-pulse">
          <div className="p-4 rounded-3xl bg-black/85 backdrop-blur-md text-white font-black text-sm flex items-center gap-2 shadow-2xl border border-white/20">
            <Zap size={22} className="text-amber-400 animate-spin" />
            <span>⚡ PARTNER FLASH BEACON ACTIVE!</span>
          </div>
        </div>
      )}

      {/* Remote Bedtime / Study Takeover Screen Lock */}
      {incomingBedtimeLock && (
        <div className="fixed inset-0 z-[95] bg-gradient-to-b from-slate-950 via-purple-950/90 to-slate-950 text-white flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-400/40 flex items-center justify-center mb-4 shadow-xl">
            {incomingBedtimeLock.type === 'bedtime' ? (
              <Moon size={40} className="text-purple-300 animate-pulse" />
            ) : (
              <BookOpen size={40} className="text-amber-300 animate-pulse" />
            )}
          </div>
          <h2 className="text-xl font-black mb-1">
            {incomingBedtimeLock.type === 'bedtime' ? '🌙 Bedtime Mode Activated' : '📖 Study Focus Mode'}
          </h2>
          <p className="text-xs text-purple-200 mb-4 font-semibold">
            Sent with love by <span className="text-rose-400 font-bold">{incomingBedtimeLock.senderName}</span>
          </p>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 max-w-xs text-xs text-slate-200 mb-8 leading-relaxed shadow-inner">
            "{incomingBedtimeLock.message}"
          </div>
          <button
            onClick={() => {
              soundManager.playKissPop();
              setIncomingBedtimeLock(null);
              showToast('Screen unlocked 🔓');
            }}
            className="px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/40 text-white font-black text-xs active:scale-95 transition flex items-center gap-2 shadow-lg"
          >
            <span>Unlock Screen 🔓</span>
          </button>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {quickToast && (
        <div className="fixed top-14 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-white font-medium text-xs shadow-2xl backdrop-blur-md animate-bounce-subtle flex items-center gap-2 border border-rose-500/40">
          <span>{quickToast}</span>
        </div>
      )}
    </div>
  );
}
