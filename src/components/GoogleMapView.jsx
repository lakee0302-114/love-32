import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Hexagon,
  Bell,
  Layers,
  Crosshair,
  Sparkles,
  Heart,
  Battery,
  BatteryCharging,
  Gauge,
  Send,
  Share2,
  KeyRound,
  Gift,
  ChevronUp,
  ChevronDown,
  Plus,
  CheckCircle2,
  Circle,
  Navigation as NavIcon,
  Crown,
  Activity,
  Smile,
  Zap,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

// Default coordinates matching user's screenshot (Galle, Sri Lanka - Wiskam Rd / Sanghamitta Balika area)
const DEFAULT_GALLE_LAT = 6.0535;
const DEFAULT_GALLE_LNG = 80.2150;

const TILE_LAYERS = {
  roadmap: {
    name: 'Standard Roadmap',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
  },
  satellite: {
    name: 'Google Satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
  },
  hybrid: {
    name: 'Satellite + Streets',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
  },
  terrain: {
    name: 'Google Terrain',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
  },
};

export default function GoogleMapView({
  state = {},
  currentUserId = 'partnerA',
  onOpenSettings,
  onOpenAnniversary,
  onOpenPremium,
  onOpenPhoneStatus,
  onSendHeartbeat,
  onSendQuickKiss,
  onSendNudge,
  onOpenMissYou,
  onUpdateMyStatus,
  onUpdateDistance,
  onUpdateSpeed,
  onToggleBucketItem,
  onAddBucketItem,
  partnerCode,
  theme = 'light',
}) {
  const currentUser = currentUserId === 'partnerA' ? state.partnerA : state.partnerB;
  const partnerUser = currentUserId === 'partnerA' ? state.partnerB : state.partnerA;

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activeTileLayerRef = useRef(null);

  const userMarkerRef = useRef(null);
  const userAccuracyCircleRef = useRef(null);
  const partnerMarkerRef = useRef(null);
  const partnerAccuracyCircleRef = useRef(null);
  const connectingLineRef = useRef(null);

  const [mapType, setMapType] = useState('roadmap');
  const [showLayerPicker, setShowLayerPicker] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusText, setStatusText] = useState(currentUser?.status || 'View Status');
  const [moodEmoji, setMoodEmoji] = useState(currentUser?.mood || '😴');
  const [newBucketDream, setNewBucketDream] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Anniversary days calculation
  const calculateDaysTogether = () => {
    if (!state.relationshipStartDate) return 1;
    const start = new Date(state.relationshipStartDate).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };
  const daysTogether = calculateDaysTogether();

  // Determine current active coordinates
  const userLat = currentUser?.coords?.lat || DEFAULT_GALLE_LAT;
  const userLng = currentUser?.coords?.lng || DEFAULT_GALLE_LNG;

  const isPartnerJoined = Boolean(partnerUser && partnerUser.isJoined && partnerUser.name);
  const partnerLat = partnerUser?.coords?.lat || (DEFAULT_GALLE_LAT + 0.005);
  const partnerLng = partnerUser?.coords?.lng || (DEFAULT_GALLE_LNG + 0.006);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLat, userLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    const cfg = TILE_LAYERS[mapType];
    const tileLayer = L.tileLayer(cfg.url, {
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom,
      attribution: '&copy; Google Maps',
    }).addTo(map);

    activeTileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    const cfg = TILE_LAYERS[mapType];
    const newLayer = L.tileLayer(cfg.url, {
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom,
      attribution: '&copy; Google Maps',
    }).addTo(map);

    activeTileLayerRef.current = newLayer;
  }, [mapType]);

  // Create Marker HTML helper
  const createPinHtml = (user, isSelf) => {
    const avatar = user?.avatar || (isSelf ? '🤴' : '🌸');
    const mood = user?.mood?.split(' ')[0] || (isSelf ? '😴' : '💕');
    const displayStatus = user?.status || 'View Status';
    const ringColor = isSelf ? 'ring-purple-500/50' : 'ring-pink-500/50';
    const badgeColor = isSelf ? 'bg-purple-600' : 'bg-pink-600';

    return `
      <div class="relative flex flex-col items-center pointer-events-auto cursor-pointer group" style="transform: translate3d(0,0,0);">
        <!-- Floating Status Pill (Matches Screenshot: 😴 View Status >) -->
        <div class="mb-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-white whitespace-nowrap active:scale-95 transition">
          <span>${mood}</span>
          <span class="max-w-[110px] truncate">${displayStatus}</span>
          <span class="text-slate-400 font-bold text-[10px] ml-0.5">&gt;</span>
        </div>

        <!-- Avatar Pin Circle -->
        <div class="relative flex items-center justify-center">
          <div class="w-14 h-14 rounded-full bg-white dark:bg-slate-900 p-0.5 shadow-2xl border-2 border-white dark:border-slate-700 flex items-center justify-center ring-4 ${ringColor}">
            <div class="w-full h-full rounded-full bg-gradient-to-tr from-amber-100 to-rose-100 dark:from-slate-800 dark:to-purple-950 flex items-center justify-center text-3xl shadow-inner">
              ${avatar}
            </div>
          </div>
          <!-- Pointer Arrow Tip -->
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-slate-900 rotate-45 rounded-sm shadow-md border-r-2 border-b-2 border-slate-200 dark:border-slate-700"></div>
          <!-- Bottom badge -->
          <span class="absolute -bottom-1 -right-1 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${badgeColor} text-white shadow">
            ${isSelf ? 'You' : 'Love'}
          </span>
        </div>
      </div>
    `;
  };

  // Update Markers & Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Current User Marker
    const userPinIcon = L.divIcon({
      className: 'love-user-pin',
      html: createPinHtml(currentUser, true),
      iconSize: [120, 95],
      iconAnchor: [60, 95],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLat, userLng], { icon: userPinIcon }).addTo(map);
      userMarkerRef.current.on('click', () => {
        soundManager.playKissPop();
        setShowStatusModal(true);
      });
    } else {
      userMarkerRef.current.setLatLng([userLat, userLng]);
      userMarkerRef.current.setIcon(userPinIcon);
    }

    // Accuracy Circle for current user (Translucent Purple circle matching screenshot)
    if (!userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current = L.circle([userLat, userLng], {
        radius: 140,
        color: '#a855f7',
        fillColor: '#c084fc',
        fillOpacity: 0.25,
        weight: 1.5,
      }).addTo(map);
    } else {
      userAccuracyCircleRef.current.setLatLng([userLat, userLng]);
    }

    // 2. Partner Marker (If joined)
    if (isPartnerJoined) {
      const partnerPinIcon = L.divIcon({
        className: 'love-partner-pin',
        html: createPinHtml(partnerUser, false),
        iconSize: [120, 95],
        iconAnchor: [60, 95],
      });

      if (!partnerMarkerRef.current) {
        partnerMarkerRef.current = L.marker([partnerLat, partnerLng], { icon: partnerPinIcon }).addTo(map);
      } else {
        partnerMarkerRef.current.setLatLng([partnerLat, partnerLng]);
        partnerMarkerRef.current.setIcon(partnerPinIcon);
      }

      // Partner accuracy circle (Pink)
      if (!partnerAccuracyCircleRef.current) {
        partnerAccuracyCircleRef.current = L.circle([partnerLat, partnerLng], {
          radius: 140,
          color: '#ec4899',
          fillColor: '#f472b6',
          fillOpacity: 0.22,
          weight: 1.5,
        }).addTo(map);
      } else {
        partnerAccuracyCircleRef.current.setLatLng([partnerLat, partnerLng]);
      }

      // Connection line between lovers
      const lineCoords = [
        [userLat, userLng],
        [partnerLat, partnerLng],
      ];
      if (!connectingLineRef.current) {
        connectingLineRef.current = L.polyline(lineCoords, {
          color: '#ec4899',
          dashArray: '6, 8',
          weight: 3,
          opacity: 0.8,
        }).addTo(map);
      } else {
        connectingLineRef.current.setLatLngs(lineCoords);
      }
    } else {
      if (partnerMarkerRef.current) {
        map.removeLayer(partnerMarkerRef.current);
        partnerMarkerRef.current = null;
      }
      if (partnerAccuracyCircleRef.current) {
        map.removeLayer(partnerAccuracyCircleRef.current);
        partnerAccuracyCircleRef.current = null;
      }
      if (connectingLineRef.current) {
        map.removeLayer(connectingLineRef.current);
        connectingLineRef.current = null;
      }
    }
  }, [userLat, userLng, partnerLat, partnerLng, isPartnerJoined, currentUser, partnerUser]);

  // Recenter GPS Action
  const handleRecenter = () => {
    soundManager.playKissPop();
    const map = mapInstanceRef.current;
    if (!map) return;

    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
          if (onUpdateSpeed) {
            onUpdateSpeed(speed, speed > 10 ? 'In Vehicle 🚗' : speed > 2 ? 'Walking 🚶' : 'Resting 🛋️');
          }
          map.flyTo([lat, lng], 16, { duration: 1.2 });
        },
        () => {
          setIsLocating(false);
          map.flyTo([userLat, userLng], 16, { duration: 1.2 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      map.flyTo([userLat, userLng], 16, { duration: 1.2 });
    }
  };

  // Gift Box Click
  const handleGiftClick = () => {
    soundManager.playKissPop();
    try {
      confetti({ particleCount: 70, spread: 80, origin: { x: 0.2, y: 0.8 } });
    } catch (e) {}
    if (onSendQuickKiss) onSendQuickKiss();
    alert('🎁 Surprise Gift Claimed! You sent an Ultra Love Kiss with sparkling hearts! 💖');
  };

  // Sale / Promo Click
  const handleSaleClick = () => {
    soundManager.playKissPop();
    if (onOpenPremium) onOpenPremium();
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden select-none bg-slate-100 dark:bg-slate-900">
      
      {/* 1. Full-screen Google Maps Leaflet Container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* 2. Top Floating Navigation Bar (Matches Screenshot) */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Hexagon Settings Icon ⬡ */}
        <button
          type="button"
          onClick={() => {
            soundManager.playKissPop();
            if (onOpenSettings) onOpenSettings();
          }}
          className="w-11 h-11 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center justify-center text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition pointer-events-auto"
          title="Open Settings"
        >
          <Hexagon size={20} className="stroke-[2.5]" />
        </button>

        {/* Center: "Add Your Special Days" Pink Ribbon Card */}
        <button
          type="button"
          onClick={() => {
            soundManager.playKissPop();
            if (onOpenAnniversary) onOpenAnniversary();
          }}
          className="relative px-5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-pink-200/90 dark:border-pink-900/70 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition pointer-events-auto group"
        >
          {/* Pink Ribbon / Bow on Top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg filter drop-shadow">
            🎀
          </div>
          <div className="text-xs font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
            {state.relationshipStartDate ? (
              <>
                <span className="text-pink-500 font-extrabold">Day #{daysTogether}</span>
                <span className="text-slate-400 font-medium">Together 💕</span>
              </>
            ) : (
              <span>Add Your Special Days</span>
            )}
          </div>
        </button>

        {/* Right: Notification Bell Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playKissPop();
            if (onOpenSettings) onOpenSettings();
          }}
          className="w-11 h-11 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center justify-center text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition pointer-events-auto"
          title="Notifications"
        >
          <Bell size={20} className="stroke-[2.5]" />
        </button>
      </div>

      {/* 3. Floating Right Action Controls */}
      <div className="absolute right-3.5 top-1/2 -translate-y-12 z-20 flex flex-col items-center gap-3">
        {/* Layer Picker Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              soundManager.playKissPop();
              setShowLayerPicker(!showLayerPicker);
            }}
            className="w-10 h-10 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 transition"
            title="Switch Map Layers"
          >
            <Layers size={18} />
          </button>

          {/* Layer Options Dropdown */}
          {showLayerPicker && (
            <div className="absolute right-12 top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 w-44 space-y-1 animate-fadeIn">
              {Object.entries(TILE_LAYERS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    soundManager.playKissPop();
                    setMapType(key);
                    setShowLayerPicker(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    mapType === key
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{item.name}</span>
                  {mapType === key && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Recenter Target */}
        <button
          type="button"
          onClick={handleRecenter}
          disabled={isLocating}
          className="w-10 h-10 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 transition"
          title="Recenter GPS Location"
        >
          <Crosshair size={18} className={isLocating ? 'animate-spin text-rose-500' : ''} />
        </button>

        {/* Promo / Pumpkin Badge (Matches Screenshot) */}
        <button
          type="button"
          onClick={handleSaleClick}
          className="relative flex flex-col items-center hover:scale-110 active:scale-95 transition pt-1"
          title="Claim Daily VIP Sale"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl flex items-center justify-center text-2xl border-2 border-white dark:border-slate-800 animate-bounce-subtle">
            🎃
          </div>
          <span className="mt-[-8px] px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-[9px] uppercase shadow tracking-wider">
            SALE
          </span>
        </button>
      </div>

      {/* 4. Bottom-Left Gift Box (Matches Screenshot) */}
      <button
        type="button"
        onClick={handleGiftClick}
        className="absolute bottom-28 left-4 z-20 flex flex-col items-center hover:scale-110 active:scale-95 transition group"
        title="Open Daily Surprise Gift"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-purple-500 shadow-2xl flex items-center justify-center text-2xl border-2 border-white dark:border-slate-800 animate-pulse-heart">
          🎁
        </div>
        <span className="text-[10px] font-extrabold text-white bg-slate-900/80 px-1.5 py-0.2 rounded-full mt-1 backdrop-blur shadow">
          Gift
        </span>
      </button>

      {/* 5. Authentic Google Maps Logo (Bottom Left - Matches Screenshot) */}
      <div className="absolute bottom-24 left-4 z-10 flex items-center pointer-events-none select-none opacity-85">
        <span className="text-xs font-black tracking-tighter" style={{ fontFamily: 'Product Sans, Roboto, sans-serif' }}>
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </span>
      </div>

      {/* 6. Interactive Bottom Sheet / Drawer */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-t-3xl transition-all duration-300 flex flex-col ${
          drawerExpanded ? 'h-[65vh]' : 'h-24'
        }`}
      >
        {/* Drag Handle Bar */}
        <div
          onClick={() => {
            soundManager.playKissPop();
            setDrawerExpanded(!drawerExpanded);
          }}
          className="w-full pt-2 pb-1.5 flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-rose-500 transition-colors" />
        </div>

        {/* Collapsed Bar View (Speed, Distance, Battery, Quick Love Actions) */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-100 to-rose-100 dark:from-slate-800 dark:to-purple-950 flex items-center justify-center text-xl shadow border border-slate-200 dark:border-slate-700">
                {currentUser?.avatar || '🤴'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {currentUser?.name || 'Lakee'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
                  🔋 {currentUser?.battery ?? 88}%
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-2 mt-0.5">
                <span>🚗 {currentUser?.speedKmH ?? 0} km/h</span>
                <span>•</span>
                <span>{state.distanceKm ? `${state.distanceKm} km apart` : 'Live Satellite GPS'}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundManager.playKissPop();
                if (onSendQuickKiss) onSendQuickKiss();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-extrabold text-xs shadow-md hover:bg-rose-600 active:scale-95 transition flex items-center gap-1"
            >
              <span>💋 Kiss</span>
            </button>
            <button
              type="button"
              onClick={() => setDrawerExpanded(!drawerExpanded)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              {drawerExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {/* Expanded Drawer Details */}
        {drawerExpanded && (
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3.5">
            {/* Couple Telemetry Cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Partner Card */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Partner Status</span>
                  <span className="text-[10px] text-pink-500 font-bold">
                    {isPartnerJoined ? 'Connected 💕' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{partnerUser?.avatar || '🌸'}</span>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {isPartnerJoined ? partnerUser.name : 'Waiting...'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      🔋 {partnerUser?.battery ?? '--'}% • 🚗 {partnerUser?.speedKmH ?? 0} km/h
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Distance Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-900/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Distance Apart</span>
                <div className="text-xl font-black bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                  {isPartnerJoined && state.distanceKm ? `${state.distanceKm} km` : '1-on-1 GPS Sync'}
                </div>
                <span className="text-[10px] text-slate-400">Real-time Radar</span>
              </div>
            </div>

            {/* Quick Interactions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playKissPop();
                  if (onSendQuickKiss) onSendQuickKiss();
                }}
                className="py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition flex flex-col items-center gap-0.5"
              >
                <span className="text-lg">💋</span>
                <span>Send Kiss</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playHeartbeat();
                  if (onSendHeartbeat) onSendHeartbeat();
                }}
                className="py-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 font-bold text-xs border border-pink-200 dark:border-pink-900 hover:bg-pink-100 transition flex flex-col items-center gap-0.5"
              >
                <span className="text-lg">💓</span>
                <span>Heartbeat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playKissPop();
                  if (onSendNudge) onSendNudge();
                }}
                className="py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-900 hover:bg-purple-100 transition flex flex-col items-center gap-0.5"
              >
                <span className="text-lg">📳</span>
                <span>Nudge Phone</span>
              </button>
            </div>

            {/* Partner Connection Banner if pending */}
            {!isPartnerJoined && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border-2 border-dashed border-rose-400 dark:border-rose-700 text-center space-y-2">
                <div className="text-xs font-bold text-slate-800 dark:text-white">
                  Pair with Your Partner to View on Map
                </div>
                <div className="text-sm font-black font-mono text-rose-600 dark:text-rose-400">
                  Partner Code: {partnerCode}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}?code=${partnerCode}`;
                    const text = `Connect with me on Love32 Ultra! Partner Code: ${partnerCode} 💕\n${shareUrl}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition inline-flex items-center gap-1.5"
                >
                  <Share2 size={13} />
                  <span>Share Code via WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Status / Mood Edit Modal (Triggered by tapping the pin status pill) */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Edit Map Status Pill</span>
                <span>😴</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Status Tagline (Displayed Above Your Pin)
              </label>
              <input
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="e.g. Sleeping 😴 or Working 💻"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['😴 Sleeping', '🥰 In Love', '🚗 Driving', '💻 Busy Working', '🍕 Eating', '📚 Studying', '🌸 Thinking of You'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    const [emoji, ...rest] = preset.split(' ');
                    setMoodEmoji(emoji);
                    setStatusText(rest.join(' '));
                  }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition"
                >
                  {preset}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playKissPop();
                if (onUpdateMyStatus) {
                  onUpdateMyStatus(statusText, moodEmoji);
                }
                setShowStatusModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow transition"
            >
              Update Map Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
