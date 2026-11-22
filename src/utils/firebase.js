// Official Google Firebase Realtime Database Integration for Love8 Ultra / Love32
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, update, onValue, off } from 'firebase/database';

const FIREBASE_CONFIG_STORAGE_KEY = 'love8_firebase_official_config';
const FIREBASE_ROOM_STORAGE_KEY = 'love8_firebase_room_code';

export const DEFAULT_ROOM_CODE = 'LOVE-6344';

// Real Google Firebase Configuration from Firebase Console
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC1fwiVaQ-yp5fXwz17ZLMVHxdJ4E0pXKI",
  authDomain: "love-32-78b8a.firebaseapp.com",
  databaseURL: "https://love-32-78b8a-default-rtdb.firebaseio.com",
  projectId: "love-32-78b8a",
  storageBucket: "love-32-78b8a.firebasestorage.app",
  messagingSenderId: "549336218968",
  appId: "1:549336218968:web:bfcf8fe7ac2e6eff43f92d",
  measurementId: "G-B705SM47XQ"
};

export const getFirebaseConfig = () => {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_FIREBASE_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config) => {
  try {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {}
};

export const getSavedRoomCode = () => {
  try {
    const raw = localStorage.getItem(FIREBASE_ROOM_STORAGE_KEY);
    if (raw && raw.trim()) return raw.trim().toUpperCase();
  } catch (e) {}
  return DEFAULT_ROOM_CODE;
};

export const saveRoomCode = (code) => {
  try {
    localStorage.setItem(FIREBASE_ROOM_STORAGE_KEY, code.trim().toUpperCase());
  } catch (e) {}
};

// Initialize Firebase App
let firebaseApp = null;
let firebaseDb = null;

export const initFirebase = (customConfig) => {
  const config = customConfig || getFirebaseConfig();
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firebaseDb = getDatabase(firebaseApp, config.databaseURL);
    return { app: firebaseApp, db: firebaseDb };
  } catch (err) {
    console.warn('[Firebase] Init notice:', err.message);
    return null;
  }
};

// Real-Time Firebase Sync Service
class FirebaseSyncService {
  constructor() {
    this.roomCode = getSavedRoomCode();
    this.stateRef = null;
    this.eventRef = null;
    this.isConnected = false;
    this.init();
  }

  init(customConfig) {
    initFirebase(customConfig);
    this.isConnected = Boolean(firebaseDb);
  }

  // Subscribe to real-time couple state in Firebase
  subscribeState(roomCode, onStateChange) {
    this.roomCode = (roomCode || this.roomCode).toUpperCase();
    saveRoomCode(this.roomCode);

    if (!firebaseDb) {
      this.init();
    }

    if (!firebaseDb) {
      console.warn('[Firebase] Database not initialized');
      return () => {};
    }

    try {
      this.stateRef = ref(firebaseDb, `couples/${this.roomCode}/state`);
      const unsubscribe = onValue(this.stateRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            onStateChange(val);
          }
        }
      }, (error) => {
        console.warn('[Firebase] State subscription warning:', error.message);
      });

      return () => {
        if (this.stateRef) {
          off(this.stateRef);
        }
      };
    } catch (e) {
      console.warn('[Firebase] Subscribe failed:', e);
      return () => {};
    }
  }

  // Subscribe to real-time live events (Heartbeat, Kiss, Screen Bomb)
  subscribeEvents(roomCode, onEvent) {
    this.roomCode = (roomCode || this.roomCode).toUpperCase();

    if (!firebaseDb) {
      this.init();
    }
    if (!firebaseDb) return () => {};

    try {
      this.eventRef = ref(firebaseDb, `couples/${this.roomCode}/latestEvent`);
      const unsubscribe = onValue(this.eventRef, (snapshot) => {
        if (snapshot.exists()) {
          const event = snapshot.val();
          if (event && event.timestamp && Date.now() - event.timestamp < 5000) {
            onEvent(event);
          }
        }
      });

      return () => {
        if (this.eventRef) {
          off(this.eventRef);
        }
      };
    } catch (e) {
      return () => {};
    }
  }

  // Push complete or partial state update to Firebase Realtime Database
  async updateState(newState) {
    if (!firebaseDb) this.init();
    if (!firebaseDb) return;

    try {
      const stateRef = ref(firebaseDb, `couples/${this.roomCode}/state`);
      await set(stateRef, newState);
    } catch (err) {
      console.warn('[Firebase] UpdateState warning:', err.message);
    }
  }

  // Send real-time event to Firebase (Heartbeat, Kiss, Screen Bomb)
  async pushEvent(type, senderName, payload = {}) {
    if (!firebaseDb) this.init();
    if (!firebaseDb) return;

    try {
      const eventRef = ref(firebaseDb, `couples/${this.roomCode}/latestEvent`);
      await set(eventRef, {
        type,
        senderName,
        payload,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn('[Firebase] PushEvent warning:', err.message);
    }
  }
}

export const firebaseSync = new FirebaseSyncService();
