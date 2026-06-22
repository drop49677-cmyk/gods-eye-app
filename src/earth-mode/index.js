/**
 * Earth Mode - Main Orchestrator
 * Initializes map, layers, HUD, toolbar, and country interactions.
 */

import { initMap, destroyMap, getMap, switchTileLayer } from './map.js';
import { initSatelliteLayer, destroySatelliteLayer, toggleSatelliteLayer } from './layers/satellites.js';
import { initAircraftLayer, destroyAircraftLayer, toggleAircraftLayer } from './layers/aircraft.js';
import { initEarthquakeLayer, destroyEarthquakeLayer, toggleEarthquakeLayer } from './layers/earthquakes.js';
import { initWeatherLayer, destroyWeatherLayer, toggleWeatherLayer } from './layers/weather.js';
import { initFireLayer, destroyFireLayer, toggleFireLayer } from './layers/fires.js';
import { initLightningLayer, destroyLightningLayer, toggleLightningLayer } from './layers/lightning.js';
import { initShipLayer, destroyShipLayer, toggleShipLayer } from './layers/ships.js';
import { initCountryInteractions, destroyCountryInteractions } from './countries.js';
import { initHUD, destroyHUD, updateActiveSystems } from './hud.js';
import { initToolbar, destroyToolbar, getActiveCount } from './toolbar.js';
import { initZoomLayers, destroyZoomLayers } from './layers/zoom-progressive.js';

let map = null;
let initialized = false;

const layerToggleHandlers = {
  satellites: (map, visible) => toggleSatelliteLayer(map, visible),
  aircraft: (map, visible) => toggleAircraftLayer(map, visible),
  earthquakes: (map, visible) => toggleEarthquakeLayer(map, visible),
  weather: (map, visible) => toggleWeatherLayer(map, visible),
  fires: (map, visible) => toggleFireLayer(map, visible),
  lightning: (map, visible) => toggleLightningLayer(map, visible),
  ships: (map, visible) => toggleShipLayer(map, visible),
};

function handleLayerToggle(layer, active) {
  if (!map) return;
  const handler = layerToggleHandlers[layer];
  if (handler) {
    handler(map, active);
    updateActiveSystems(getActiveCount());
  }
}

function setupZoomBehavior() {
  if (!map) return;

  map.on('zoomend', () => {
    const zoom = map.getZoom();
    const container = document.getElementById('map-container');
    if (!container) return;

    // Update zoom level indicator
    const zoomIndicator = document.getElementById('hud-zoom');
    if (zoomIndicator) {
      let label = 'CONTINENTAL';
      if (zoom >= 7) label = 'STREET';
      else if (zoom >= 4) label = 'REGIONAL';
      zoomIndicator.textContent = `ZOOM: ${zoom} [${label}]`;
    }
  });
}

export function initEarthMode() {
  if (initialized) return;

  // Set flag immediately to prevent double-init race condition
  initialized = true;

  // Small delay to ensure container is visible
  setTimeout(() => {
    map = initMap('map-container');
    if (!map) {
      initialized = false;
      return;
    }

    // Initialize all layers
    initSatelliteLayer(map);
    initAircraftLayer(map);
    initEarthquakeLayer(map);
    initFireLayer(map);
    initLightningLayer(map);
    initShipLayer(map);

    // Initialize interactions
    initCountryInteractions(map);

    // Initialize zoom-progressive content layers
    initZoomLayers(map);

    // Initialize HUD
    initHUD(map);

    // Initialize toolbar with toggle callback
    initToolbar(handleLayerToggle);

    // Setup zoom behavior
    setupZoomBehavior();

    // Force map to recalculate size
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);
  }, 100);
}

export function destroyEarthMode() {
  if (!initialized || !map) return;

  destroySatelliteLayer(map);
  destroyAircraftLayer(map);
  destroyEarthquakeLayer(map);
  destroyWeatherLayer(map);
  destroyFireLayer(map);
  destroyLightningLayer(map);
  destroyShipLayer(map);
  destroyZoomLayers(map);
  destroyCountryInteractions(map);
  destroyHUD(map);
  destroyToolbar();
  destroyMap();

  map = null;
  initialized = false;
}
