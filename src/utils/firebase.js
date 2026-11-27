// Official Google Firebase Realtime Database Integration for Love8 Ultra / Love32
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, update, onValue, off, get } from 'firebase/database';

const FIREBASE_CONFIG_STORAGE_KEY = 'love8_firebase_official_config';
const FIREBASE_ROOM_STORAGE_KEY = 'love8_firebase_room_code';

export const DEFAULT_ROOM_CODE = 'LOVE-6344';

// Real Google Firebase Configuration from Firebase Console
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAw5BtnkyUlCWzc3u3mLudMWe_s77CUgWU",
  authDomain: "love32-ultra-cloud.firebaseapp.com",
  databaseURL: "https://love32-ultra-cloud-default-rtdb.firebaseio.com",
  projectId: "love32-ultra-cloud",
  storageBucket: "love32-ultra-cloud.firebasestorage.app",
  messagingSenderId: "639422743580",
  appId: "1:639422743580:web:6842f838f07b90b8664bd9"
};

export const getFirebaseConfig = () => {
  let config = DEFAULT_FIREBASE_CONFIG;
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (raw) {
      config = { ...DEFAULT_FIREBASE_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {}
  config.databaseURL = 'https://love32-ultra-cloud-default-rtdb.firebaseio.com';
  return config;
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

// Cloud Account Management across multiple devices
export const encodeEmailKey = (email) => {
  return (email || '').toLowerCase().trim().replace(/[\.\#\$\[\]]/g, '_');
};

export const saveAccountToFirebase = async (account) => {
  if (!account || !account.email) return;
  const key = encodeEmailKey(account.email);
  const payload = {
    email: account.email.toLowerCase().trim(),
    password: account.password,
    name: account.name || 'Partner',
    avatar: account.avatar || '🤴',
    updatedAt: Date.now(),
  };
  const config = getFirebaseConfig();
  const baseUrl = config.databaseURL || 'https://love32-ultra-cloud-default-rtdb.firebaseio.com';

  // 1. Direct REST PUT (instant cross-device cloud persistence)
  try {
    await fetch(`${baseUrl}/accounts/${key}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('[Firebase REST] Save account notice:', err.message);
  }

  // 2. Firebase SDK
  if (!firebaseDb) initFirebase();
  if (firebaseDb) {
    try {
      const accountRef = ref(firebaseDb, `accounts/${key}`);
      await set(accountRef, payload);
    } catch (err) {
      console.warn('[Firebase SDK] Save account notice:', err.message);
    }
  }
};

export const fetchAccountFromFirebase = async (email) => {
  if (!email) return null;
  const key1 = encodeEmailKey(email);
  const key2 = (email || '').toLowerCase().trim().replace(/[\.\#\$\[\]\@]/g, '_');
  const config = getFirebaseConfig();
  const baseUrl = config.databaseURL || 'https://love32-ultra-cloud-default-rtdb.firebaseio.com';

  // 1. Direct REST query (fastest, ultra-reliable cross-device HTTP GET)
  for (const k of [key1, key2]) {
    try {
      const res = await fetch(`${baseUrl}/accounts/${encodeURIComponent(k)}.json`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && data.email) {
          return data;
        }
      }
    } catch (err) {
      console.warn('[Firebase REST] Fetch account notice:', err.message);
    }
  }

  // 2. Firebase SDK fallback
  if (!firebaseDb) initFirebase();
  if (firebaseDb) {
    for (const k of [key1, key2]) {
      try {
        const accountRef = ref(firebaseDb, `accounts/${k}`);
        const snapshot = await get(accountRef);
        if (snapshot.exists()) {
          return snapshot.val();
        }
      } catch (err) {
        console.warn('[Firebase SDK] Fetch account notice:', err.message);
      }
    }
  }
  return null;
};

export const updatePasswordInFirebase = async (email, newPassword) => {
  if (!email || !newPassword) return;
  const key = encodeEmailKey(email);
  const config = getFirebaseConfig();
  const baseUrl = config.databaseURL || 'https://love32-ultra-cloud-default-rtdb.firebaseio.com';

  try {
    await fetch(`${baseUrl}/accounts/${key}/password.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPassword)
    });
  } catch (e) {}

  if (!firebaseDb) initFirebase();
  if (firebaseDb) {
    try {
      const passRef = ref(firebaseDb, `accounts/${key}/password`);
      await set(passRef, newPassword);
    } catch (err) {
      console.warn('[Firebase SDK] Update password notice:', err.message);
    }
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
