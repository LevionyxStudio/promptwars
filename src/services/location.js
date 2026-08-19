/**
 * Guardian Location Service
 * Requests real browser coordinates via navigator.geolocation.
 * Attempts high accuracy first, falling back to standard Wi-Fi/IP accuracy if needed.
 */

export const getDeviceLocation = async () => {
  console.log('[Guardian Location] 🛰️ Initiating browser geolocation lookup via navigator.geolocation.getCurrentPosition()...');
  
  return new Promise((resolve) => {
    if (!navigator || !navigator.geolocation) {
      const errorMsg = 'Geolocation API not supported by this browser';
      console.warn(`[Guardian Location] ❌ ${errorMsg}`);
      resolve(getFallbackLocation(errorMsg, { code: 0, codeName: 'UNSUPPORTED', message: errorMsg }));
      return;
    }

    const tryFetchPosition = (enableHighAccuracy) => {
      console.log(`[Guardian Location] Attempting position fetch (enableHighAccuracy: ${enableHighAccuracy})...`);

      const options = {
        enableHighAccuracy: enableHighAccuracy,
        timeout: enableHighAccuracy ? 8000 : 15000,
        maximumAge: 60000 // 1 minute cached location allowed for quick resolution
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          const accuracy = Math.round(position.coords.accuracy || 10);

          console.log('[Guardian Location] ✅ Geolocation SUCCESS! Real coordinates acquired:', {
            latitude: lat,
            longitude: lng,
            accuracyMeters: accuracy,
            highAccuracyUsed: enableHighAccuracy,
            timestamp: new Date().toLocaleTimeString()
          });

          resolve({
            latitude: lat,
            longitude: lng,
            accuracyMeters: accuracy,
            address: `${lat}, ${lng} (Live GPS)`,
            timestamp: new Date().toLocaleTimeString(),
            isLiveGps: true,
            mapsUrl: `https://maps.google.com/?q=${lat},${lng}`,
            rawError: null
          });
        },
        (err) => {
          const errorNames = {
            1: 'PERMISSION_DENIED',
            2: 'POSITION_UNAVAILABLE',
            3: 'TIMEOUT'
          };
          const codeName = errorNames[err.code] || `UNKNOWN_ERROR_${err.code}`;
          console.warn(`[Guardian Location] ⚠️ Geolocation attempt failed (enableHighAccuracy: ${enableHighAccuracy}) - Code ${err.code} (${codeName}): ${err.message}`);

          // If high accuracy failed (e.g. POSITION_UNAVAILABLE or TIMEOUT) and permission was NOT explicitly denied, retry with standard accuracy (Wi-Fi/IP location)
          if (enableHighAccuracy && err.code !== 1) {
            console.log('[Guardian Location] Retrying position fetch with standard accuracy (enableHighAccuracy: false)...');
            tryFetchPosition(false);
            return;
          }

          let note = "Location permission denied — showing default location";
          if (err.code === 1) {
            note = "Location permission denied in browser — showing default location";
          } else if (err.code === 2) {
            note = "Position unavailable (Code 2: Check OS/Network Location) — showing default location";
          } else if (err.code === 3) {
            note = "Location request timed out (Code 3) — showing default location";
          }

          const rawError = {
            code: err.code,
            codeName: codeName,
            message: err.message || 'No error message provided by browser'
          };

          resolve(getFallbackLocation(note, rawError));
        },
        options
      );
    };

    tryFetchPosition(true);
  });
};

export const getFallbackLocation = (
  reasonNote = "Location permission denied — showing default location", 
  rawError = null
) => {
  return {
    latitude: 28.613939,
    longitude: 77.209021,
    accuracyMeters: 25,
    address: "Connaught Place, New Delhi, India",
    timestamp: new Date().toLocaleTimeString(),
    isLiveGps: false,
    fallbackNote: reasonNote,
    rawError: rawError,
    mapsUrl: "https://maps.google.com/?q=28.613939,77.209021"
  };
};
