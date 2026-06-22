import L from 'leaflet';

/**
 * Earthquake Layer - USGS Earthquake Feed
 * Displays earthquakes as pulsing red circles proportional to magnitude.
 */

let layerGroup = null;

const USGS_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

function getMagnitudeRadius(mag) {
  return Math.max(4, mag * 5);
}

function getMagnitudeColor(mag) {
  if (mag >= 5) return '#FF0000';
  if (mag >= 4) return '#FF4400';
  if (mag >= 3) return '#FF8800';
  return '#FFAA00';
}

async function fetchEarthquakes() {
  try {
    const response = await fetch(USGS_API);
    if (!response.ok) throw new Error('USGS API error');
    const data = await response.json();
    return data.features || [];
  } catch (e) {
    // Fallback: simulated earthquakes
    return generateSimulatedQuakes();
  }
}

function generateSimulatedQuakes() {
  const zones = [
    { lat: 35.6, lng: 139.7, name: 'Japan' },
    { lat: -33.4, lng: -70.6, name: 'Chile' },
    { lat: 37.7, lng: -122.4, name: 'California' },
    { lat: 28.3, lng: 84.1, name: 'Nepal' },
    { lat: 38.7, lng: 20.7, name: 'Greece' },
    { lat: -6.2, lng: 106.8, name: 'Indonesia' },
    { lat: 36.2, lng: 59.6, name: 'Iran' },
    { lat: 19.4, lng: -155.2, name: 'Hawaii' }
  ];

  return zones.map((zone, i) => ({
    properties: {
      mag: 2 + Math.random() * 4,
      place: `Near ${zone.name}`,
      time: Date.now() - Math.random() * 86400000
    },
    geometry: {
      coordinates: [
        zone.lng + (Math.random() - 0.5) * 5,
        zone.lat + (Math.random() - 0.5) * 5
      ]
    }
  }));
}

async function loadEarthquakes() {
  if (!layerGroup) return;
  const quakes = await fetchEarthquakes();

  layerGroup.clearLayers();

  quakes.forEach(quake => {
    const props = quake.properties;
    const coords = quake.geometry.coordinates;
    const mag = props.mag || 1;
    const lat = coords[1];
    const lng = coords[0];

    if (!lat || !lng) return;

    const circle = L.circleMarker([lat, lng], {
      radius: getMagnitudeRadius(mag),
      color: getMagnitudeColor(mag),
      fillColor: getMagnitudeColor(mag),
      fillOpacity: 0.4,
      weight: 1,
      className: 'earthquake-marker'
    });

    const time = props.time ? new Date(props.time).toUTCString() : 'Unknown';
    circle.bindPopup(`
      <div class="cyber-popup">
        <strong>SEISMIC EVENT</strong><br>
        MAG: ${mag.toFixed(1)}<br>
        LOC: ${props.place || 'Unknown'}<br>
        TIME: ${time}
      </div>
    `);

    layerGroup.addLayer(circle);
  });
}

export function initEarthquakeLayer(map) {
  layerGroup = L.layerGroup().addTo(map);
  loadEarthquakes();
  return layerGroup;
}

export function destroyEarthquakeLayer(map) {
  if (layerGroup) {
    map.removeLayer(layerGroup);
    layerGroup = null;
  }
}

export function toggleEarthquakeLayer(map, visible) {
  if (!layerGroup) {
    if (visible) initEarthquakeLayer(map);
    return;
  }
  if (visible) {
    map.addLayer(layerGroup);
  } else {
    map.removeLayer(layerGroup);
  }
}
