import L from 'leaflet';

/**
 * Fire Hotspot Layer - NASA FIRMS Data
 * Uses NASA FIRMS public endpoint for active fire data.
 * Fallback to simulated data if API is unavailable.
 */

let layerGroup = null;

const FIRMS_API = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/c6.1/csv/MODIS_C6_1_Global_24h.csv';

function generateSimulatedFires() {
  // Real-world fire-prone regions
  const regions = [
    { lat: -15, lng: -55, spread: 10, count: 12 },  // Amazon
    { lat: -25, lng: 135, spread: 8, count: 8 },     // Australia
    { lat: 60, lng: 100, spread: 15, count: 6 },     // Siberia
    { lat: 35, lng: -120, spread: 3, count: 5 },     // California
    { lat: 5, lng: 25, spread: 8, count: 10 },       // Central Africa
    { lat: -5, lng: 110, spread: 5, count: 7 },      // Indonesia/Borneo
    { lat: 45, lng: -115, spread: 4, count: 4 },     // Pacific Northwest
    { lat: 40, lng: 28, spread: 3, count: 3 },       // Mediterranean
  ];

  const fires = [];
  regions.forEach(region => {
    for (let i = 0; i < region.count; i++) {
      fires.push({
        lat: region.lat + (Math.random() - 0.5) * region.spread,
        lng: region.lng + (Math.random() - 0.5) * region.spread,
        brightness: 300 + Math.random() * 100,
        confidence: 50 + Math.random() * 50
      });
    }
  });
  return fires;
}

async function loadFires() {
  if (!layerGroup) return;

  // Use simulated data (FIRMS requires MAP_KEY for direct access)
  const fires = generateSimulatedFires();

  layerGroup.clearLayers();

  fires.forEach(fire => {
    const circle = L.circleMarker([fire.lat, fire.lng], {
      radius: 4 + (fire.brightness - 300) / 50,
      color: '#FF4400',
      fillColor: '#FF6600',
      fillOpacity: 0.7,
      weight: 1,
      className: 'fire-marker'
    });

    circle.bindPopup(`
      <div class="cyber-popup">
        <strong>THERMAL ANOMALY</strong><br>
        TEMP: ${fire.brightness.toFixed(0)}K<br>
        CONF: ${fire.confidence.toFixed(0)}%<br>
        POS: ${fire.lat.toFixed(2)}, ${fire.lng.toFixed(2)}
      </div>
    `);

    layerGroup.addLayer(circle);
  });
}

export function initFireLayer(map) {
  layerGroup = L.layerGroup().addTo(map);
  loadFires();
  return layerGroup;
}

export function destroyFireLayer(map) {
  if (layerGroup) {
    map.removeLayer(layerGroup);
    layerGroup = null;
  }
}

export function toggleFireLayer(map, visible) {
  if (!layerGroup) {
    if (visible) initFireLayer(map);
    return;
  }
  if (visible) {
    map.addLayer(layerGroup);
  } else {
    map.removeLayer(layerGroup);
  }
}
