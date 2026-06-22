import L from 'leaflet';

/**
 * Satellite Layer - ISS Position Tracking
 * Fetches ISS position from api.wheretheiss.at every 5 seconds.
 */

let issMarker = null;
let issTrail = [];
let issPath = null;
let updateInterval = null;
let layerGroup = null;

const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';

function createISSIcon() {
  return L.divIcon({
    className: 'iss-marker',
    html: `<div class="iss-dot"><div class="iss-pulse"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

async function fetchISSPosition() {
  try {
    const response = await fetch(ISS_API);
    if (!response.ok) throw new Error('ISS API error');
    const data = await response.json();
    return { lat: data.latitude, lng: data.longitude, altitude: data.altitude, velocity: data.velocity };
  } catch (e) {
    // Fallback: simulate position
    const now = Date.now() / 1000;
    const lat = 51.5 * Math.sin(now / 2700);
    const lng = ((now / 15) % 360) - 180;
    return { lat, lng, altitude: 408, velocity: 27600 };
  }
}

async function updateISS() {
  const pos = await fetchISSPosition();
  if (!pos || !layerGroup) return;

  const latlng = L.latLng(pos.lat, pos.lng);

  if (issMarker) {
    issMarker.setLatLng(latlng);
  } else {
    issMarker = L.marker(latlng, { icon: createISSIcon() })
      .bindPopup(`
        <div class="cyber-popup">
          <strong>ISS - ZARYA</strong><br>
          ALT: ${pos.altitude.toFixed(1)} km<br>
          VEL: ${pos.velocity.toFixed(0)} km/h
        </div>
      `);
    layerGroup.addLayer(issMarker);
  }

  // Update trail
  issTrail.push(latlng);
  if (issTrail.length > 50) issTrail.shift();

  if (issPath) {
    layerGroup.removeLayer(issPath);
  }
  issPath = L.polyline(issTrail, {
    color: '#00FFB2',
    weight: 1.5,
    opacity: 0.6,
    dashArray: '4, 6'
  });
  layerGroup.addLayer(issPath);
}

export function initSatelliteLayer(map) {
  layerGroup = L.layerGroup().addTo(map);
  updateISS();
  updateInterval = setInterval(updateISS, 5000);
  return layerGroup;
}

export function destroySatelliteLayer(map) {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (layerGroup) {
    map.removeLayer(layerGroup);
    layerGroup = null;
  }
  issMarker = null;
  issTrail = [];
  issPath = null;
}

export function toggleSatelliteLayer(map, visible) {
  if (!layerGroup) {
    if (visible) initSatelliteLayer(map);
    return;
  }
  if (visible) {
    map.addLayer(layerGroup);
    if (!updateInterval) updateInterval = setInterval(updateISS, 5000);
  } else {
    map.removeLayer(layerGroup);
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }
}
