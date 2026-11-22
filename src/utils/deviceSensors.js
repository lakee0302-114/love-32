// Real Hardware Device Sensor Telemetry for Love32
// Reads actual Phone Battery & Live GPS Speed/Location

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

// 1. Phone Battery Status Monitoring (Supported on Android Chrome/Edge/Samsung Internet)
export function monitorPhoneBattery(onChange) {
  if (typeof navigator === 'undefined') return () => {};

  let batteryRef = null;

  const update = () => {
    if (!batteryRef) return;
    const level = Math.round(batteryRef.level * 100);
    const isCharging = Boolean(batteryRef.charging);
    onChange({ battery: level, isCharging });
  };

  if ('getBattery' in navigator) {
    navigator.getBattery().then((battery) => {
      batteryRef = battery;
      update();
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
    }).catch(() => {});
  }

  return () => {
    if (batteryRef) {
      batteryRef.removeEventListener('levelchange', update);
      batteryRef.removeEventListener('chargingchange', update);
    }
  };
}

// 2. Real-Time GPS Location & Travel Speed Telemetry
export function monitorLiveLocationAndSpeed(onChange) {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return () => {};
  }

  let lastPos = null;
  let lastTime = null;

  const handlePosition = (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = Math.round(pos.coords.accuracy || 10);
    const now = Date.now();

    // 1. Read speed directly if device GPS hardware reports it (m/s -> km/h)
    let speedKmH = 0;
    if (pos.coords.speed !== null && pos.coords.speed !== undefined && !isNaN(pos.coords.speed) && pos.coords.speed > 0) {
      speedKmH = Math.round(pos.coords.speed * 3.6);
    } else if (lastPos && lastTime && now - lastTime > 2000) {
      // 2. Compute delta distance over delta time if speed is not reported directly
      const distMeters = calculateDistanceKm(lastPos.lat, lastPos.lng, lat, lng) * 1000;
      const elapsedSeconds = (now - lastTime) / 1000;
      if (elapsedSeconds > 0 && distMeters > 5) {
        const calculatedSpeed = Math.round((distMeters / elapsedSeconds) * 3.6);
        if (calculatedSpeed < 180) { // filter out GPS jitter spikes
          speedKmH = calculatedSpeed;
        }
      }
    }

    lastPos = { lat, lng };
    lastTime = now;

    // Automatic activity detection from speed
    let activity = 'Resting 🛋️';
    if (speedKmH > 65) activity = 'Expressway Driving ⚡';
    else if (speedKmH > 18) activity = 'Driving 🚗';
    else if (speedKmH > 7) activity = 'Cycling / Jogging 🏃';
    else if (speedKmH >= 1.5) activity = 'Walking 🚶';

    onChange({
      lat,
      lng,
      accuracy,
      speedKmH,
      activity,
      isMoving: speedKmH >= 1.5,
      timestamp: now,
    });
  };

  const handleError = (err) => {
    console.warn('[GPS Telemetry] Notice:', err.message);
  };

  const watchId = navigator.geolocation.watchPosition(
    handlePosition,
    handleError,
    {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 12000,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}
