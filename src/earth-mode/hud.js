/**
 * HUD Module - Heads-Up Display Overlay
 * Corner brackets, GPS, UTC clock, radar, signal bar, matrix rain
 */

let hudContainer = null;
let clockInterval = null;
let radarCanvas = null;
let radarCtx = null;
let radarAngle = 0;
let radarAnimId = null;
let matrixInterval = null;
let activeSystems = 7;
let gpsMouseMoveHandler = null;

export function initHUD(map) {
  hudContainer = document.getElementById('earth-hud');
  if (!hudContainer) return;

  hudContainer.classList.remove('hidden');
  startClock();
  startRadar();
  startMatrixRain();
  setupGPSTracker(map);
  updateActiveSystems(activeSystems);
}

function startClock() {
  const clockEl = document.getElementById('hud-clock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s} UTC`;
  }

  update();
  clockInterval = setInterval(update, 1000);
}

function setupGPSTracker(map) {
  const gpsEl = document.getElementById('hud-gps');
  if (!gpsEl || !map) return;

  gpsMouseMoveHandler = (e) => {
    const lat = e.latlng.lat.toFixed(4);
    const lng = e.latlng.lng.toFixed(4);
    const latDir = e.latlng.lat >= 0 ? 'N' : 'S';
    const lngDir = e.latlng.lng >= 0 ? 'E' : 'W';
    gpsEl.textContent = `${Math.abs(lat)}${latDir} ${Math.abs(lng)}${lngDir}`;
  };

  map.on('mousemove', gpsMouseMoveHandler);
}

function startRadar() {
  radarCanvas = document.getElementById('hud-radar-canvas');
  if (!radarCanvas) return;

  radarCtx = radarCanvas.getContext('2d');
  radarCanvas.width = 80;
  radarCanvas.height = 80;
  animateRadar();
}

function animateRadar() {
  if (!radarCtx) return;

  const cx = 40;
  const cy = 40;
  const r = 35;

  radarCtx.fillStyle = 'rgba(0, 4, 8, 0.2)';
  radarCtx.fillRect(0, 0, 80, 80);

  // Circle
  radarCtx.strokeStyle = '#00FFB2';
  radarCtx.lineWidth = 0.5;
  radarCtx.beginPath();
  radarCtx.arc(cx, cy, r, 0, Math.PI * 2);
  radarCtx.stroke();

  // Inner circles
  radarCtx.beginPath();
  radarCtx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
  radarCtx.stroke();

  // Cross hairs
  radarCtx.beginPath();
  radarCtx.moveTo(cx - r, cy);
  radarCtx.lineTo(cx + r, cy);
  radarCtx.moveTo(cx, cy - r);
  radarCtx.lineTo(cx, cy + r);
  radarCtx.stroke();

  // Sweep
  radarAngle += 0.04;
  const sweepX = cx + r * Math.cos(radarAngle);
  const sweepY = cy + r * Math.sin(radarAngle);

  const gradient = radarCtx.createLinearGradient(cx, cy, sweepX, sweepY);
  gradient.addColorStop(0, 'rgba(0, 255, 178, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 255, 178, 0)');

  radarCtx.strokeStyle = gradient;
  radarCtx.lineWidth = 2;
  radarCtx.beginPath();
  radarCtx.moveTo(cx, cy);
  radarCtx.lineTo(sweepX, sweepY);
  radarCtx.stroke();

  // Random blips
  if (Math.random() > 0.95) {
    const blipAngle = Math.random() * Math.PI * 2;
    const blipDist = Math.random() * r;
    radarCtx.fillStyle = '#00FFB2';
    radarCtx.fillRect(
      cx + blipDist * Math.cos(blipAngle) - 1,
      cy + blipDist * Math.sin(blipAngle) - 1,
      2, 2
    );
  }

  radarAnimId = requestAnimationFrame(animateRadar);
}

function startMatrixRain() {
  const leftRain = document.getElementById('matrix-rain-left');
  const rightRain = document.getElementById('matrix-rain-right');
  if (!leftRain || !rightRain) return;

  function generateColumn() {
    let col = '';
    for (let i = 0; i < 30; i++) {
      col += Math.random() > 0.5 ? '1' : '0';
      col += '\n';
    }
    return col;
  }

  function updateRain() {
    leftRain.textContent = generateColumn();
    rightRain.textContent = generateColumn();
  }

  updateRain();
  matrixInterval = setInterval(updateRain, 150);
}

export function updateActiveSystems(count) {
  activeSystems = count;
  const el = document.getElementById('hud-systems');
  if (el) {
    el.textContent = `SISTEMAS ACTIVOS: ${count}`;
  }
}

export function destroyHUD(map) {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
  if (radarAnimId) {
    cancelAnimationFrame(radarAnimId);
    radarAnimId = null;
  }
  if (matrixInterval) {
    clearInterval(matrixInterval);
    matrixInterval = null;
  }
  if (map) {
    if (gpsMouseMoveHandler) {
      map.off('mousemove', gpsMouseMoveHandler);
      gpsMouseMoveHandler = null;
    }
  }
  if (hudContainer) {
    hudContainer.classList.add('hidden');
  }
  radarCtx = null;
  radarCanvas = null;
}
