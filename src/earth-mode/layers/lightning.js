import L from 'leaflet';

/**
 * Lightning Layer - Simulated Lightning Strikes
 * Uses realistic distribution patterns in storm-prone areas.
 */

let layerGroup = null;
let flashInterval = null;
let activeFlashes = [];

// Storm-prone regions with higher probability
const STORM_ZONES = [
  { lat: 0, lng: 25, radius: 15, intensity: 1.0 },     // Congo Basin
  { lat: 5, lng: -75, radius: 10, intensity: 0.9 },     // Colombia
  { lat: -3, lng: 107, radius: 12, intensity: 0.8 },    // Maritime Continent
  { lat: 28, lng: -82, radius: 5, intensity: 0.7 },     // Florida
  { lat: 35, lng: -95, radius: 8, intensity: 0.6 },     // Central US
  { lat: 22, lng: 80, radius: 10, intensity: 0.7 },     // India
  { lat: -15, lng: -50, radius: 8, intensity: 0.6 },    // Brazil
  { lat: -12, lng: 130, radius: 6, intensity: 0.5 },    // Northern Australia
];

function generateStrike() {
  // Pick a storm zone weighted by intensity
  const totalIntensity = STORM_ZONES.reduce((s, z) => s + z.intensity, 0);
  let rand = Math.random() * totalIntensity;
  let zone = STORM_ZONES[0];

  for (const z of STORM_ZONES) {
    rand -= z.intensity;
    if (rand <= 0) {
      zone = z;
      break;
    }
  }

  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * zone.radius;
  const lat = zone.lat + dist * Math.cos(angle);
  const lng = zone.lng + dist * Math.sin(angle);

  return { lat, lng };
}

function createFlash(strike) {
  if (!layerGroup) return;

  const flash = L.circleMarker([strike.lat, strike.lng], {
    radius: 3,
    color: '#FFFFFF',
    fillColor: '#E0E0FF',
    fillOpacity: 1,
    weight: 2,
    className: 'lightning-flash'
  });

  layerGroup.addLayer(flash);
  activeFlashes.push(flash);

  // Remove flash after short delay
  setTimeout(() => {
    if (layerGroup) {
      layerGroup.removeLayer(flash);
    }
    activeFlashes = activeFlashes.filter(f => f !== flash);
  }, 300 + Math.random() * 200);
}

function generateFlashes() {
  // Generate 1-3 flashes per tick
  const count = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const strike = generateStrike();
    createFlash(strike);
  }
}

export function initLightningLayer(map) {
  layerGroup = L.layerGroup().addTo(map);
  flashInterval = setInterval(generateFlashes, 800);
  return layerGroup;
}

export function destroyLightningLayer(map) {
  if (flashInterval) {
    clearInterval(flashInterval);
    flashInterval = null;
  }
  if (layerGroup) {
    map.removeLayer(layerGroup);
    layerGroup = null;
  }
  activeFlashes = [];
}

export function toggleLightningLayer(map, visible) {
  if (!layerGroup) {
    if (visible) initLightningLayer(map);
    return;
  }
  if (visible) {
    map.addLayer(layerGroup);
    if (!flashInterval) flashInterval = setInterval(generateFlashes, 800);
  } else {
    map.removeLayer(layerGroup);
    if (flashInterval) {
      clearInterval(flashInterval);
      flashInterval = null;
    }
  }
}
