// State and synchronization management for Love8 Ultra

const STORAGE_KEY = 'love8_ultra_app_state';
const CHANNEL_NAME = 'love8_sync_channel';

export const initialCoupleState = {
  // Couple profile
  relationshipStartDate: '2023-08-14T00:00:00',
  partnerA: {
    id: 'partnerA',
    name: 'Kasun',
    avatar: '👨‍💻',
    battery: 88,
    isCharging: false,
    status: 'Driving to meet you 🚗',
    weather: '29°C Sunny',
    location: 'Colombo, Sri Lanka',
    mood: '🥰 In Love',
    lastActive: 'Just now',
    speedKmH: 48,
    activity: 'Driving 🚗',
    durationAtPlace: 'Moving for 15m',
    isMoving: true,
  },
  partnerB: {
    id: 'partnerB',
    name: 'Nethmi',
    avatar: '🌸',
    battery: 42,
    isCharging: true,
    status: 'Walking in the park 🚶‍♀️',
    weather: '26°C Cozy Breeze',
    location: 'Kandy, Sri Lanka',
    mood: '🥺 Missing You',
    lastActive: '1m ago',
    speedKmH: 4.5,
    activity: 'Walking 🚶‍♀️',
    durationAtPlace: 'Walking for 12m',
    isMoving: true,
  },
  distanceKm: 114.5,
  currentUserId: 'partnerA', // Active viewer

  // Virtual Pet State
  pet: {
    type: 'bunny', // 'bunny' | 'kitty' | 'dragon'
    name: 'Mochi',
    level: 5,
    exp: 65,
    maxExp: 100,
    hunger: 80, // 0-100
    happiness: 95, // 0-100
    energy: 85, // 0-100
    costume: 'angel_wings', // 'crown' | 'angel_wings' | 'ribbon' | 'none'
    roomTheme: 'sakura_garden', // 'sakura_garden' | 'cozy_bedroom' | 'cloud_kingdom'
    lastFedBy: 'Kasun',
  },

  // Daily Question State
  dailyQuestion: {
    id: 1,
    question: "What is your single favorite memory of us together?",
    date: 'Today',
    partnerAAnswer: "The evening we sat by the beach watching the sunset and talked for 5 hours straight without noticing the time.",
    partnerBAnswer: "When you surprised me on my birthday with handmade origami hearts and my favorite iced latte 💖",
  },

  // Secret Love Letters
  loveLetters: [
    {
      id: 1,
      sender: 'Kasun',
      recipient: 'Nethmi',
      title: 'Open when you feel lonely or tired',
      preview: 'Whenever you feel like the world is too loud...',
      body: 'Whenever you feel like the world is too loud or tiring, close your eyes and remember: you have someone right here whose heart beats only for you. You are the strongest, sweetest person I know. Sending you a million hugs and kisses!',
      unlockCondition: 'Always Open',
      isUnlocked: true,
      createdDate: '2026-10-12',
      tag: 'comfort',
    },
    {
      id: 2,
      sender: 'Nethmi',
      recipient: 'Kasun',
      title: 'Our Next 1-Year Dream',
      preview: 'Locked until our next milestone...',
      body: 'I want us to travel to Nuwara Eliya together, stay in a cozy cottage with fireplace, drink hot chocolate under a warm blanket, and dream about our future home. You make every ordinary day magical.',
      unlockCondition: 'Unlocked for you',
      isUnlocked: true,
      createdDate: '2026-11-01',
      tag: 'romantic',
    },
    {
      id: 3,
      sender: 'Kasun',
      recipient: 'Nethmi',
      title: 'Why I fell in love with you',
      preview: 'A quiet secret from my heart...',
      body: 'It wasn’t just your beautiful smile. It was the way your eyes crinkle with genuine warmth when you laugh, and how deeply you care for everyone around you. I knew from that day that I wanted to protect that smile forever.',
      unlockCondition: 'Special Surprise',
      isUnlocked: true,
      createdDate: '2026-11-15',
      tag: 'secret',
    }
  ],

  // Shared Memory Photos / Scrapbook
  memories: [
    {
      id: 1,
      title: 'First Coffee Date ☕',
      date: 'Aug 14, 2023',
      location: 'Java Lounge, Colombo',
      note: 'We spilled sugar on the table laughing so hard, and neither of us wanted the date to end.',
      likes: 12,
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: 'Sunset by the Coast 🌅',
      date: 'Jan 01, 2026',
      location: 'Mount Lavinia Beach',
      note: 'Welcomed the new year with waves kissing our feet and your hand warm in mine.',
      likes: 24,
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Rainy Day Road Trip 🌧️',
      date: 'Sep 20, 2026',
      location: 'Ella Hills',
      note: 'Shared one headset listening to our playlist while mist rolled over the mountains.',
      likes: 18,
      imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
    }
  ],

  // Couple Quiz Questions
  quizScore: { partnerA: 92, partnerB: 95 },

  // Shared Couple Bucket List & Goals (Love32 Pro)
  bucketList: [
    { id: 1, title: '🌅 Watch the sunrise and sunset on the beach together', completed: true, completedBy: 'Both' },
    { id: 2, title: '🚗 Late night drive with hot chocolate & our favorite songs', completed: true, completedBy: 'Lakee' },
    { id: 3, title: '⛺ Camping under a starry night sky with campfires', completed: false },
    { id: 4, title: '🍕 Bake homemade pizza and desserts from scratch together', completed: false },
    { id: 5, title: '✈️ Go on our dream overseas vacation trip', completed: false },
    { id: 6, title: '📸 Recreate our very first anniversary photo', completed: false },
  ],

  // Live Screen Bomb notification to trigger
  incomingScreenBomb: null,
};

export const loadSavedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...initialCoupleState,
        ...parsed,
        partnerA: { ...initialCoupleState.partnerA, ...(parsed.partnerA || {}) },
        partnerB: { ...initialCoupleState.partnerB, ...(parsed.partnerB || {}) },
      };
    }
  } catch (e) {
    console.error('Failed to load saved couple state', e);
  }
  return initialCoupleState;
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save couple state', e);
  }
};

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

export const broadcastUpdate = (action, payload) => {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ action, payload, timestamp: Date.now() });
  }
};

export const subscribeToBroadcast = (callback) => {
  if (!broadcastChannel) return () => {};
  const handler = (event) => {
    callback(event.data);
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel.removeEventListener('message', handler);
  };
};
