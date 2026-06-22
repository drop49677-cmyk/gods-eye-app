import L from 'leaflet';

/**
 * Ships Layer - Simulated AIS Data
 * Displays vessel positions along major shipping lanes.
 */

let layerGroup = null;
let updateInterval = null;
let ships = [];

const SHIPPING_LANES = [
  { name: 'Trans-Atlantic', points: [[40, -74], [50, -30], [51, -5], [51, 3]] },
  { name: 'Suez Route', points: [[30, 32], [12, 43], [5, 55], [-5, 70]] },
  { name: 'Panama Approach', points: [[30, -80], [20, -79], [9, -79.5]] },
  { name: 'Trans-Pacific N', points: [[35, 140], [40, 170], [45, -170], [48, -125]] },
  { name: 'Trans-Pacific S', points: [[-5, 110], [-10, 140], [-15, 170], [-20, -160]] },
  { name: 'Cape Route', points: [[-15, 40], [-30, 25], [-35, 18], [-34, 10]] },
  { name: 'Malacca Strait', points: [[1, 104], [4, 100], [6, 96]] },
  { name: 'Med East-West', points: [[35, 30], [36, 15], [37, 5], [36, -5]] },
];

const SHIP_TYPES = ['CARGO', 'TANKER', 'CONTAINER', 'BULK', 'LNG', 'RORO'];

function generateShips() {
  const result = [];
  SHIPPING_LANES.forEach(lane => {
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const segIdx = Math.floor(Math.random() * (lane.points.length - 1));
      const progress = Math.random();
      const p1 = lane.points[segIdx];
      const p2 = lane.points[segIdx + 1];
      const lat = p1[0] + (p2[0] - p1[0]) * progress + (Math.random() - 0.5) * 2;
      const lng = p1[1] + (p2[1] - p1[1]) * progress + (Math.random() - 0.5) * 2;
      const heading = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * (180 / Math.PI);

      result.push({
        id: `MMSI${Math.floor(Math.random() * 999999999)}`,
        name: `${SHIP_TYPES[Math.floor(Math.random() * SHIP_TYPES.length)]}-${Math.floor(Math.random() * 999)}`,
        type: SHIP_TYPES[Math.floor(Math.random() * SHIP_TYPES.length)],
        lat, lng, heading,
        speed: 8 + Math.random() * 14,
        lane: lane.name
      });
    }
  });
  return result;
}

function createShipIcon() {
  return L.divIcon({
    className: 'ship-marker',
    html: '<div class="ship-icon">&#9670;</div>',
    iconSize: [8, 8],
    iconAnchor: [4, 4]
  });
}

function renderShips() {
  if (!layerGroup) return;
  layerGroup.clearLayers();

  ships.forEach(ship => {
    const marker = L.marker([ship.lat, ship.lng], {
      icon: createShipIcon()
    });

    marker.bindPopup(`
      <div class="cyber-popup">
        <strong>${ship.name}</strong><br>
        TYPE: ${ship.type}<br>
        SPD: ${ship.speed.toFixed(1)} kn<br>
        HDG: ${ship.heading.toFixed(0)}&deg;<br>
        ROUTE: ${ship.lane}
      </div>
    `);

    layerGroup.addLayer(marker);
  });
}

function moveShips() {
  ships.forEach(ship => {
    const rad = ship.heading * (Math.PI / 180);
    ship.lat += Math.cos(rad) * 0.01 * (ship.speed / 20);
    ship.lng += Math.sin(rad) * 0.01 * (ship.speed / 20);
    ship.heading += (Math.random() - 0.5) * 2;
  });
  renderShips();
}

export function initShipLayer(map) {
  layerGroup = L.layerGroup().addTo(map);
  ships = generateShips();
  renderShips();
  updateInterval = setInterval(moveShips, 5000);
  return layerGroup;
}

export function destroyShipLayer(map) {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (layerGroup) {
    map.removeLayer(layerGroup);
    layerGroup = null;
  }
  ships = [];
}

export function toggleShipLayer(map, visible) {
  if (!layerGroup) {
    if (visible) initShipLayer(map);
    return;
  }
  if (visible) {
    map.addLayer(layerGroup);
    if (!updateInterval) updateInterval = setInterval(moveShips, 5000);
  } else {
    map.removeLayer(layerGroup);
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }
}
