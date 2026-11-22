import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomeScreen from './components/HomeScreen';
import PetGarden from './components/PetGarden';
import MissYouHub from './components/MissYouHub';
import MemoriesTimeline from './components/MemoriesTimeline';
import CoupleGames from './components/CoupleGames';
import WidgetStudio from './components/WidgetStudio';
import ScreenBombOverlay from './components/ScreenBombOverlay';
import AuthScreen from './components/AuthScreen';

import {
  initialCoupleState,
  loadSavedState,
  saveState,
  broadcastUpdate,
  subscribeToBroadcast,
} from './utils/storage';
import { cloudSync } from './utils/cloudSync';
import { getSavedRoomCode, saveRoomCode } from './utils/firebase';
import { monitorPhoneBattery, monitorLiveLocationAndSpeed, calculateDistanceKm } from './utils/deviceSensors';
import { soundManager } from './utils/audio';
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

  // Handle Login & Pairing Completion
  const handleLoginSuccess = (authData) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setSession(authData);
    const assignedRole = authData.role || 'partnerA';
    const isHost = assignedRole === 'partnerA';
    const otherRole = isHost ? 'partnerB' : 'partnerA';
    setCurrentUserId(assignedRole);
    setRoomCode(authData.partnerCode);
    saveRoomCode(authData.partnerCode);

    // Update active user profile and initialize partner as unjoined until they connect
    let nextState;
    setState((prev) => {
      nextState = {
        ...prev,
        [assignedRole]: {
          ...prev[assignedRole],
          name: authData.userName || prev[assignedRole].name,
          avatar: authData.userAvatar || prev[assignedRole].avatar,
          isJoined: true,
        },
        [otherRole]: prev[otherRole]?.isJoined
          ? prev[otherRole]
          : {
              ...prev[otherRole],
              name: '',
              isJoined: false,
              battery: null,
              status: 'Waiting to connect... ⏳',
              speedKmH: 0,
              activity: 'Not connected',
              coords: null,
            },
        distanceKm: prev[otherRole]?.isJoined ? prev.distanceKm : null,
      };
      return nextState;
    });

    // Connect to room and announce presence
    cloudSync.subscribeRoom(authData.partnerCode);
    cloudSync.pushEvent('PARTNER_JOINED', authData.userName, {
      role: assignedRole,
      name: authData.userName,
      avatar: authData.userAvatar,
    });

    if (nextState) {
      cloudSync.updateState(nextState);
    }

    showToast(`Welcome ${authData.userName}! Connected to Room ${authData.partnerCode} 💖`);
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
        setState((prev) => ({
          ...prev,
          partnerA: { ...prev.partnerA, ...(remoteState.partnerA || {}) },
          partnerB: { ...prev.partnerB, ...(remoteState.partnerB || {}) },
          distanceKm: remoteState.distanceKm ?? prev.distanceKm,
          pet: remoteState.pet ? { ...prev.pet, ...remoteState.pet } : prev.pet,
          memories: remoteState.memories || prev.memories,
          loveLetters: remoteState.loveLetters || prev.loveLetters,
          dailyQuestion: remoteState.dailyQuestion ? { ...prev.dailyQuestion, ...remoteState.dailyQuestion } : prev.dailyQuestion,
          bucketList: remoteState.bucketList || prev.bucketList,
        }));
      }
    });

    // 2. Subscribe to Live Events (Heartbeat, Kiss, Screen Bomb, Partner Joined)
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
          cloudSync.updateState(next);
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
      }
    });

    return () => {
      if (typeof unsubState === 'function') unsubState();
      if (typeof unsubEvents === 'function') unsubEvents();
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
        cloudSync.updateState(nextState);
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
        cloudSync.updateState(nextState);
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
    cloudSync.pushEvent('HEARTBEAT', currentName, {});
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
    cloudSync.pushEvent('KISS', currentName, {});
  };

  // 3. Send Screen Bomb (Cloud Realtime Push)
  const handleSendScreenBomb = (bombData) => {
    setTimeout(() => {
      setActiveScreenBomb(bombData);
    }, 500);

    broadcastUpdate('SCREEN_BOMB', bombData);
    cloudSync.pushEvent('SCREEN_BOMB', bombData.senderName, bombData);
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
      cloudSync.updateState(nextState);
    }
    showToast('✨ Status updated!');
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
      cloudSync.updateState(nextState);
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
      cloudSync.updateState(nextState);
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
      cloudSync.updateState(nextState);
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
      cloudSync.updateState(nextState);
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
      cloudSync.updateState(nextState);
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
      cloudSync.updateState(nextState);
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
      cloudSync.updateState(nextState);
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
      cloudSync.updateState(nextState);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start relative selection:bg-rose-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Container - Mobile First Frame */}
      <div className="relative z-10 w-full max-w-md min-h-screen flex flex-col border-x border-slate-900 bg-slate-950/90 shadow-2xl">
        {/* Header - Firebase Live button removed as requested */}
        <Header
          state={state}
          currentUserId={currentUserId}
          onSwitchUser={handleSwitchUser}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          partnerCode={roomCode}
          onLogout={handleLogout}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 overflow-y-auto">
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
        </main>

        {/* Bottom Tab Bar */}
        <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* Full-screen Romantic Screen Bomb Alert */}
      {activeScreenBomb && (
        <ScreenBombOverlay
          bombData={activeScreenBomb}
          onClose={() => setActiveScreenBomb(null)}
        />
      )}

      {/* Floating Action Toast Notification */}
      {quickToast && (
        <div className="fixed top-14 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 border border-rose-500/40 text-white font-medium text-xs shadow-2xl backdrop-blur-md animate-bounce-subtle flex items-center gap-2">
          <span>{quickToast}</span>
        </div>
      )}
    </div>
  );
}
