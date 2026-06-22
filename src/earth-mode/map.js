import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Earth Mode - Map Module
 * Initializes Leaflet with CartoDB Dark Matter tiles and cyberpunk filter.
 */

let map = null;
let currentTileLayer = null;

const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  }
};

export function initMap(containerId = 'map-container') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Clear any existing map
  if (map) {
    map.remove();
    map = null;
  }

  map = L.map(containerId, {
    center: [20, 0],
    zoom: 2,
    minZoom: 1,
    maxZoom: 10,
    zoomControl: false,
    attributionControl: false,
    worldCopyJump: true
  });

  // Add CartoDB Dark Matter tiles
  currentTileLayer = L.tileLayer(TILE_LAYERS.dark.url, {
    attribution: TILE_LAYERS.dark.attribution,
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Apply cyberpunk CSS filter for cyan/green tint
  applyMapFilter();

  return map;
}

function applyMapFilter() {
  const container = document.getElementById('map-container');
  if (container) {
    const tilePane = container.querySelector('.leaflet-tile-pane');
    if (tilePane) {
      tilePane.style.filter = 'brightness(1.1) saturate(1.3) hue-rotate(140deg)';
    }
  }
}

export function switchTileLayer(layerName) {
  if (!map || !TILE_LAYERS[layerName]) return;

  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }

  currentTileLayer = L.tileLayer(TILE_LAYERS[layerName].url, {
    attribution: TILE_LAYERS[layerName].attribution,
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Re-apply filter after tile switch
  setTimeout(applyMapFilter, 100);
}

export function getMap() {
  return map;
}

export function destroyMap() {
  if (map) {
    map.remove();
    map = null;
    currentTileLayer = null;
  }
}
