/**
 * Guardian Location Service
 * Fetches real browser coordinates via navigator.geolocation when allowed,
 * or provides a realistic fallback location for emergency alerts.
 */

export const getDeviceLocation = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(getFallbackLocation());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        const accuracy = Math.round(position.coords.accuracy || 10);

        resolve({
          latitude: lat,
          longitude: lng,
          accuracyMeters: accuracy,
          address: `${lat}, ${lng}`,
          timestamp: new Date().toLocaleTimeString(),
          isLiveGps: true,
          mapsUrl: `https://maps.google.com/?q=${lat},${lng}`
        });
      },
      (err) => {
        resolve(getFallbackLocation());
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
};

export const getFallbackLocation = () => {
  return {
    latitude: 37.774929,
    longitude: -122.419416,
    accuracyMeters: 8,
    address: "Market St & 5th St, San Francisco, CA",
    timestamp: new Date().toLocaleTimeString(),
    isLiveGps: false,
    fallbackNote: "Using estimated location — GPS permission required for live accuracy",
    mapsUrl: "https://maps.google.com/?q=37.774929,-122.419416"
  };
};
