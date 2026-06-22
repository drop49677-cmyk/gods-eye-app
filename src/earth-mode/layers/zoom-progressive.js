import L from 'leaflet';

/**
 * Zoom-Progressive Content Layers
 * - Zoom 1-3: Country outline GeoJSON (continental view)
 * - Zoom 4-6: Major city markers (regional view)
 * - Zoom 7+: OSM tile layer switching (street-level detail)
 */

let countryOutlineLayer = null;
let cityMarkersLayer = null;
let osmTileLayer = null;
let darkTileLayer = null;
let zoomHandler = null;
let mapRef = null;
let currentZoomLevel = null;

// Simplified country outlines as GeoJSON (continental boundaries)
const COUNTRY_OUTLINES_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    // North America
    { type: 'Feature', properties: { name: 'North America' }, geometry: { type: 'Polygon', coordinates: [[[-170, 15], [-170, 72], [-50, 72], [-50, 15], [-170, 15]]] } },
    // South America
    { type: 'Feature', properties: { name: 'South America' }, geometry: { type: 'Polygon', coordinates: [[[-82, -56], [-82, 13], [-34, 13], [-34, -56], [-82, -56]]] } },
    // Europe
    { type: 'Feature', properties: { name: 'Europe' }, geometry: { type: 'Polygon', coordinates: [[[-10, 35], [-10, 72], [40, 72], [40, 35], [-10, 35]]] } },
    // Africa
    { type: 'Feature', properties: { name: 'Africa' }, geometry: { type: 'Polygon', coordinates: [[[-18, -35], [-18, 37], [52, 37], [52, -35], [-18, -35]]] } },
    // Asia
    { type: 'Feature', properties: { name: 'Asia' }, geometry: { type: 'Polygon', coordinates: [[[40, 1], [40, 75], [180, 75], [180, 1], [40, 1]]] } },
    // Oceania
    { type: 'Feature', properties: { name: 'Oceania' }, geometry: { type: 'Polygon', coordinates: [[[110, -47], [110, 0], [180, 0], [180, -47], [110, -47]]] } },
  ]
};

// Major world cities for zoom 4-6
const MAJOR_CITIES = [
  { name: 'New York', lat: 40.7128, lng: -74.0060, pop: '8.3M' },
  { name: 'London', lat: 51.5074, lng: -0.1278, pop: '9.0M' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, pop: '13.9M' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, pop: '2.2M' },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, pop: '21.5M' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, pop: '20.7M' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, pop: '12.3M' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, pop: '10.1M' },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, pop: '12.5M' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, pop: '4.0M' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, pop: '5.3M' },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, pop: '15.4M' },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, pop: '24.9M' },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, pop: '15.5M' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, pop: '9.2M' },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, pop: '3.1M' },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780, pop: '9.7M' },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, pop: '10.6M' },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, pop: '3.6M' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, pop: '3.4M' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, pop: '5.7M' },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, pop: '7.5M' },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018, pop: '10.5M' },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832, pop: '2.9M' },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219, pop: '4.7M' },
];

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function createCountryOutlineLayer() {
  return L.geoJSON(COUNTRY_OUTLINES_GEOJSON, {
    style: {
      color: '#00FFB2',
      weight: 1.5,
      opacity: 0.6,
      fillColor: '#00FFB2',
      fillOpacity: 0.03,
      dashArray: '4 2'
    },
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.name, {
        className: 'cyber-tooltip',
        direction: 'center',
        permanent: false
      });
    }
  });
}

function createCityMarkersLayer() {
  const layerGroup = L.layerGroup();

  MAJOR_CITIES.forEach(city => {
    const marker = L.circleMarker([city.lat, city.lng], {
      radius: 4,
      color: '#0AF0FF',
      fillColor: '#0AF0FF',
      fillOpacity: 0.7,
      weight: 1
    });

    marker.bindTooltip(
      `<div class="city-tooltip"><strong>${city.name}</strong><br>POP: ${city.pop}</div>`,
      { className: 'cyber-tooltip', direction: 'top', offset: [0, -6] }
    );

    layerGroup.addLayer(marker);
  });

  return layerGroup;
}

function getZoomBand(zoom) {
  if (zoom <= 3) return 'continental';
  if (zoom <= 6) return 'regional';
  return 'street';
}

function updateLayersForZoom(zoom) {
  if (!mapRef) return;

  const band = getZoomBand(zoom);
  if (band === currentZoomLevel) return;
  currentZoomLevel = band;

  // Remove all progressive layers first
  if (countryOutlineLayer && mapRef.hasLayer(countryOutlineLayer)) {
    mapRef.removeLayer(countryOutlineLayer);
  }
  if (cityMarkersLayer && mapRef.hasLayer(cityMarkersLayer)) {
    mapRef.removeLayer(cityMarkersLayer);
  }

  switch (band) {
    case 'continental':
      // Show country outlines at zoom 1-3
      if (countryOutlineLayer) {
        countryOutlineLayer.addTo(mapRef);
      }
      // Ensure dark tiles are active
      switchToTiles('dark');
      break;

    case 'regional':
      // Show city markers at zoom 4-6
      if (cityMarkersLayer) {
        cityMarkersLayer.addTo(mapRef);
      }
      // Keep dark tiles
      switchToTiles('dark');
      break;

    case 'street':
      // Switch to OSM tiles for detailed street-level view at zoom 7+
      switchToTiles('osm');
      break;
  }
}

function switchToTiles(type) {
  if (!mapRef) return;

  if (type === 'osm') {
    if (darkTileLayer && mapRef.hasLayer(darkTileLayer)) {
      mapRef.removeLayer(darkTileLayer);
    }
    if (!osmTileLayer) {
      osmTileLayer = L.tileLayer(OSM_TILE_URL, {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        className: 'osm-cyberpunk-tiles'
      });
    }
    if (!mapRef.hasLayer(osmTileLayer)) {
      osmTileLayer.addTo(mapRef);
      // Apply cyberpunk filter to OSM tiles
      setTimeout(() => {
        const container = document.getElementById('map-container');
        if (container) {
          const tilePane = container.querySelector('.leaflet-tile-pane');
          if (tilePane) {
            tilePane.style.filter = 'brightness(0.7) saturate(0.5) hue-rotate(140deg) contrast(1.3)';
          }
        }
      }, 100);
    }
  } else {
    if (osmTileLayer && mapRef.hasLayer(osmTileLayer)) {
      mapRef.removeLayer(osmTileLayer);
    }
    if (!darkTileLayer) {
      darkTileLayer = L.tileLayer(DARK_TILE_URL, {
        subdomains: 'abcd',
        maxZoom: 19
      });
    }
    if (!mapRef.hasLayer(darkTileLayer)) {
      darkTileLayer.addTo(mapRef);
      // Restore cyberpunk filter for dark tiles
      setTimeout(() => {
        const container = document.getElementById('map-container');
        if (container) {
          const tilePane = container.querySelector('.leaflet-tile-pane');
          if (tilePane) {
            tilePane.style.filter = 'brightness(1.1) saturate(1.3) hue-rotate(140deg)';
          }
        }
      }, 100);
    }
  }
}

export function initZoomLayers(map) {
  mapRef = map;
  currentZoomLevel = null;

  // Create layers
  countryOutlineLayer = createCountryOutlineLayer();
  cityMarkersLayer = createCityMarkersLayer();

  // Set initial state based on current zoom
  const initialZoom = map.getZoom();
  updateLayersForZoom(initialZoom);

  // Listen for zoom changes
  zoomHandler = () => {
    const zoom = map.getZoom();
    updateLayersForZoom(zoom);
  };
  map.on('zoomend', zoomHandler);
}

export function destroyZoomLayers(map) {
  if (zoomHandler && map) {
    map.off('zoomend', zoomHandler);
    zoomHandler = null;
  }
  if (countryOutlineLayer && map) {
    map.removeLayer(countryOutlineLayer);
    countryOutlineLayer = null;
  }
  if (cityMarkersLayer && map) {
    map.removeLayer(cityMarkersLayer);
    cityMarkersLayer = null;
  }
  if (osmTileLayer && map) {
    map.removeLayer(osmTileLayer);
    osmTileLayer = null;
  }
  if (darkTileLayer && map) {
    map.removeLayer(darkTileLayer);
    darkTileLayer = null;
  }
  mapRef = null;
  currentZoomLevel = null;
}
