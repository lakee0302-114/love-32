// Real-Time Online Cloud Synchronization Engine for Love32
// Powered by High-Speed Secure WebSockets (EMQX Public Cloud Broker)
// Works globally across all devices, zero configuration required!

import mqtt from 'mqtt';

const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

class CloudSyncService {
  constructor() {
    this.client = null;
    this.currentRoom = null;
    this.stateListeners = new Set();
    this.eventListeners = new Set();
    this.isConnected = false;
    this.clientId = 'love32_' + Math.random().toString(16).substring(2, 10);
  }

  connect() {
    if (this.client && this.client.connected) return;

    try {
      this.client = mqtt.connect(BROKER_URL, {
        clientId: this.clientId,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 3000,
        keepalive: 30,
      });

      this.client.on('connect', () => {
        console.log('[CloudSync] Connected to Global Realtime Broker');
        this.isConnected = true;
        if (this.currentRoom) {
          this.subscribeRoom(this.currentRoom);
        }
      });

      this.client.on('message', (topic, payload) => {
        try {
          const data = JSON.parse(payload.toString());
          if (topic.endsWith('/state')) {
            this.stateListeners.forEach((fn) => fn(data));
          } else if (topic.endsWith('/events')) {
            this.eventListeners.forEach((fn) => fn(data));
          }
        } catch (e) {
          console.warn('[CloudSync] Message parse warning:', e);
        }
      });

      this.client.on('error', (err) => {
        console.warn('[CloudSync] Broker connection notice:', err.message);
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });
    } catch (e) {
      console.warn('[CloudSync] Init error:', e);
    }
  }

  subscribeRoom(roomCode) {
    if (!roomCode) return;
    this.currentRoom = roomCode.toUpperCase();
    if (!this.client || !this.client.connected) {
      this.connect();
      return;
    }

    const stateTopic = `love32/rooms/${this.currentRoom}/state`;
    const eventTopic = `love32/rooms/${this.currentRoom}/events`;

    this.client.subscribe([stateTopic, eventTopic], { qos: 1 }, (err) => {
      if (err) {
        console.warn('[CloudSync] Subscription error:', err);
      } else {
        console.log(`[CloudSync] Subscribed to room: ${this.currentRoom}`);
      }
    });
  }

  subscribeState(roomCode, callback) {
    this.subscribeRoom(roomCode);
    this.stateListeners.add(callback);
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  subscribeEvents(roomCode, callback) {
    this.subscribeRoom(roomCode);
    this.eventListeners.add(callback);
    return () => {
      this.eventListeners.delete(callback);
    };
  }

  updateState(newState) {
    if (!this.currentRoom || !this.client || !this.client.connected) {
      this.connect();
      return;
    }

    const stateTopic = `love32/rooms/${this.currentRoom}/state`;
    try {
      // Retain: true so when the partner opens the app, they immediately receive the latest state!
      this.client.publish(stateTopic, JSON.stringify(newState), { qos: 1, retain: true });
    } catch (e) {
      console.warn('[CloudSync] Publish state error:', e);
    }
  }

  pushEvent(type, senderName, payload = {}) {
    if (!this.currentRoom || !this.client || !this.client.connected) {
      this.connect();
      return;
    }

    const eventTopic = `love32/rooms/${this.currentRoom}/events`;
    const eventObj = {
      type,
      senderName,
      payload,
      timestamp: Date.now(),
      senderClientId: this.clientId,
    };

    try {
      this.client.publish(eventTopic, JSON.stringify(eventObj), { qos: 1, retain: false });
    } catch (e) {
      console.warn('[CloudSync] Publish event error:', e);
    }
  }
}

export const cloudSync = new CloudSyncService();
