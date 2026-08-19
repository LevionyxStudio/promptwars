/**
 * Guardian Location Service
 * Requests real browser coordinates via navigator.geolocation,
 * triggering the browser's native location permission prompt when available.
 */

export const getDeviceLocation = async () => {
  return new Promise((resolve) => {
    if (!navigator || !navigator.geolocation) {
      resolve(getFallbackLocation('Geolocation API not supported by browser'));
      return;
    }

    const requestPosition = (highAccuracy = true) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          const accuracy = Math.round(position.coords.accuracy || 10);

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
          if (highAccuracy && err.code !== 1) {
            // Try standard accuracy if high accuracy timed out or failed
            requestPosition(false);
            return;
          }

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
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 8000 : 15000,
          maximumAge: 0
        }
      );
    };

    requestPosition(true);
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
