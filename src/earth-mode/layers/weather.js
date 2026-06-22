import L from 'leaflet';

/**
 * Weather Layer - OpenWeatherMap Cloud Tiles with simulated fallback
 * Note: Requires a free API key from openweathermap.org
 * When the API key is not configured, displays a simulated cloud overlay.
 */

let tileLayer = null;
let simulatedLayer = null;

// Placeholder API key - replace with your own from openweathermap.org
const OWM_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const CLOUD_TILE_URL = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`;

function isApiKeyConfigured() {
  return OWM_API_KEY && OWM_API_KEY !== 'YOUR_OPENWEATHERMAP_API_KEY';
}

/**
 * Creates a simulated cloud overlay using semi-transparent circle markers
 * in regions where clouds typically form (ITCZ, mid-latitudes, storm zones).
 */
function createSimulatedCloudLayer() {
  const layerGroup = L.layerGroup();

  // Simulated cloud regions (lat, lng, radius in meters, opacity)
  const cloudRegions = [
    // ITCZ band (equatorial)
    { lat: 5, lng: -30, radius: 800000, opacity: 0.25 },
    { lat: 3, lng: 10, radius: 600000, opacity: 0.2 },
    { lat: 7, lng: 80, radius: 700000, opacity: 0.22 },
    { lat: 2, lng: 130, radius: 500000, opacity: 0.18 },
    { lat: -2, lng: -60, radius: 650000, opacity: 0.2 },
    // North Atlantic storm track
    { lat: 55, lng: -30, radius: 900000, opacity: 0.3 },
    { lat: 50, lng: -15, radius: 700000, opacity: 0.25 },
    { lat: 58, lng: -45, radius: 600000, opacity: 0.2 },
    // North Pacific
    { lat: 45, lng: -170, radius: 800000, opacity: 0.28 },
    { lat: 50, lng: 160, radius: 750000, opacity: 0.25 },
    // Southern Ocean
    { lat: -50, lng: 0, radius: 1000000, opacity: 0.3 },
    { lat: -55, lng: 90, radius: 900000, opacity: 0.28 },
    { lat: -48, lng: -90, radius: 850000, opacity: 0.25 },
    // Southeast Asia monsoon
    { lat: 15, lng: 105, radius: 500000, opacity: 0.22 },
    { lat: 20, lng: 115, radius: 450000, opacity: 0.18 },
    // Amazon basin
    { lat: -5, lng: -60, radius: 700000, opacity: 0.2 },
    { lat: -3, lng: -50, radius: 550000, opacity: 0.18 },
    // European fronts
    { lat: 52, lng: 5, radius: 400000, opacity: 0.2 },
    { lat: 48, lng: -5, radius: 500000, opacity: 0.22 },
  ];

  cloudRegions.forEach(region => {
    const circle = L.circle([region.lat, region.lng], {
      radius: region.radius,
      color: 'transparent',
      fillColor: '#a0c8e0',
      fillOpacity: region.opacity,
      interactive: false
    });
    layerGroup.addLayer(circle);
  });

  return layerGroup;
}

export function initWeatherLayer(map) {
  if (isApiKeyConfigured()) {
    tileLayer = L.tileLayer(CLOUD_TILE_URL, {
      opacity: 0.4,
      maxZoom: 10
    });
  } else {
    // Use simulated cloud overlay as fallback
    simulatedLayer = createSimulatedCloudLayer();
  }
  // Don't add by default - toggled via toolbar
  return tileLayer || simulatedLayer;
}

export function destroyWeatherLayer(map) {
  if (tileLayer) {
    map.removeLayer(tileLayer);
    tileLayer = null;
  }
  if (simulatedLayer) {
    map.removeLayer(simulatedLayer);
    simulatedLayer = null;
  }
}

export function toggleWeatherLayer(map, visible) {
  if (!tileLayer && !simulatedLayer) {
    initWeatherLayer(map);
  }

  const layer = tileLayer || simulatedLayer;
  if (!layer) return;

  if (visible) {
    layer.addTo(map);
  } else {
    map.removeLayer(layer);
  }
}
