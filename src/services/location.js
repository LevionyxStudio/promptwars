/**
 * Guardian Location Service
 * Requests real browser coordinates via navigator.geolocation.
 */

export const getDeviceLocation = async () => {
  console.log('[Guardian Location] 🛰️ Requesting browser geolocation via navigator.geolocation.getCurrentPosition()...');
  
  return new Promise((resolve) => {
    if (!navigator || !navigator.geolocation) {
      console.warn('[Guardian Location] ❌ Geolocation API is not supported by this browser.');
      resolve(getFallbackLocation('Geolocation API not supported by browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // Allow recent location cache for fast response
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
          timestamp: new Date().toLocaleTimeString()
        });

        resolve({
          latitude: lat,
          longitude: lng,
          accuracyMeters: accuracy,
          address: `${lat}, ${lng} (Live GPS)`,
          timestamp: new Date().toLocaleTimeString(),
          isLiveGps: true,
          mapsUrl: `https://maps.google.com/?q=${lat},${lng}`
        });
      },
      (err) => {
        const errorNames = {
          1: 'PERMISSION_DENIED',
          2: 'POSITION_UNAVAILABLE',
          3: 'TIMEOUT'
        };
        const errorType = errorNames[err.code] || `UNKNOWN_ERROR_${err.code}`;

        console.warn(`[Guardian Location] ❌ Geolocation FAILED (${errorType}): ${err.message || 'No message provided'}`);

        let note = "Location permission denied — showing default location";
        if (err.code === 1) {
          note = "Location permission denied — showing default location";
        } else if (err.code === 2) {
          note = "GPS signal unavailable — showing default location";
        } else if (err.code === 3) {
          note = "Location request timed out — showing default location";
        }

        resolve(getFallbackLocation(note));
      },
      options
    );
  });
};

export const getFallbackLocation = (reasonNote = "Location permission denied — showing default location") => {
  return {
    latitude: 28.613939,
    longitude: 77.209021,
    accuracyMeters: 25,
    address: "Connaught Place, New Delhi, India",
    timestamp: new Date().toLocaleTimeString(),
    isLiveGps: false,
    fallbackNote: reasonNote,
    mapsUrl: "https://maps.google.com/?q=28.613939,77.209021"
  };
};
