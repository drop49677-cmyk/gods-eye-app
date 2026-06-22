import L from 'leaflet';

/**
 * Aircraft Layer - OpenSky Network API
 * Displays aircraft positions with heading-rotated triangle markers.
 */

let layerGroup = null;
let updateInterval = null;
let mapRef = null;

const OPENSKY_API = 'https://opensky-network.org/api/states/all';

function createPlaneIcon(heading) {
  const rotation = heading || 0;
  return L.divIcon({
    className: 'aircraft-marker',
    html: `<div class="plane-icon" style="transform: rotate(${rotation}deg)">&#9650;</div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
}

async function fetchAircraft() {
  try {
    // Derive bounding box from current map bounds
    let lamin = 20, lomin = -30, lamax = 60, lomax = 40; // defaults
    if (mapRef) {
      const bounds = mapRef.getBounds();
      lamin = bounds.getSouth().toFixed(2);
      lomin = bounds.getWest().toFixed(2);
      lamax = bounds.getNorth().toFixed(2);
      lomax = bounds.getEast().toFixed(2);
    }
    const response = await fetch(`${OPENSKY_API}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`);
    if (!response.ok) throw new Error('OpenSky API error');
    const data = await response.json();

    if (!data.states) return [];

    return data.states.slice(0, 100).map(state => ({
      callsign: (state[1] || '').trim(),
      lat: state[6],
      lng: state[5],
      altitude: state[7],
      velocity: state[9],
      heading: state[10],
      origin: state[2]
    })).filter(a => a.lat && a.lng);
  } catch (e) {
    // Fallback: simulate aircraft
    return generateSimulatedAircraft();
  }
}

function generateSimulatedAircraft() {
  const aircraft = [];
  const routes = [
    { from: [40.6, -73.8], to: [51.5, -0.1] },
    { from: [35.7, 139.7], to: [33.9, -118.4] },
    { from: [1.3, 103.8], to: [22.3, 114.1] },
    { from: [25.2, 55.3], to: [28.5, 77.1] },
    { from: [-33.9, 151.2], to: [1.3, 103.8] },
    { from: [48.8, 2.3], to: [40.4, -3.7] },
    { from: [55.7, 37.6], to: [39.9, 116.4] },
    { from: [51.5, -0.1], to: [40.6, -73.8] },
  ];

  for (let i = 0; i < 40; i++) {
    const route = routes[i % routes.length];
    const progress = Math.random();
    const lat = route.from[0] + (route.to[0] - route.from[0]) * progress + (Math.random() - 0.5) * 5;
    const lng = route.from[1] + (route.to[1] - route.from[1]) * progress + (Math.random() - 0.5) * 5;
    const heading = Math.atan2(route.to[1] - route.from[1], route.to[0] - route.from[0]) * (180 / Math.PI);

    aircraft.push({
      callsign: `SIM${String(i).padStart(3, '0')}`,
      lat,
      lng,
      altitude: 9000 + Math.random() * 4000,
      velocity: 800 + Math.random() * 200,
      heading: heading + (Math.random() - 0.5) * 20,
      origin: 'SIM'
    });
  }
  return aircraft;
}

async function updateAircraft() {
  if (!layerGroup) return;
  const aircraft = await fetchAircraft();

  layerGroup.clearLayers();

  aircraft.forEach(plane => {
    const marker = L.marker([plane.lat, plane.lng], {
      icon: createPlaneIcon(plane.heading)
    });

    marker.bindPopup(`
      <div class="cyber-popup">
        <strong>${plane.callsign || 'UNKNOWN'}</strong><br>
        ALT: ${plane.altitude ? Math.round(plane.altitude) + 'm' : 'N/A'}<br>
        SPD: ${plane.velocity ? Math.round(plane.velocity) + ' km/h' : 'N/A'}<br>
        HDG: ${plane.heading ? Math.round(plane.heading) + '&deg;' : 'N/A'}
      </div>
    `);

    layerGroup.addLayer(marker);
  });
}

export function initAircraftLayer(map) {
  mapRef = map;
  layerGroup = L.layerGroup().addTo(map);
  updateAircraft();
  updateInterval = setInterval(updateAircraft, 10000);
  return layerGroup;
}

export function destroyAircraftLayer(map) {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (layerGroup) {
    map.removeLayer(layerGroup);
    layerGroup = null;
  }
  mapRef = null;
}

export function toggleAircraftLayer(map, visible) {
  if (!layerGroup) {
    if (visible) initAircraftLayer(map);
    return;
  }
  if (visible) {
    map.addLayer(layerGroup);
    if (!updateInterval) updateInterval = setInterval(updateAircraft, 10000);
  } else {
    map.removeLayer(layerGroup);
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }
}
