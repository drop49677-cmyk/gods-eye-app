/**
 * Toolbar Module - Layer Toggle Buttons
 * Cyberpunk aesthetic toggle buttons for map layers.
 */

let toolbarContainer = null;
let buttons = {};
let layerStates = {};
let onToggleCallback = null;
let handlerRefs = {};

const TOOLBAR_ITEMS = [
  { id: 'sat', label: 'SAT', icon: '&#9675;', layer: 'satellites' },
  { id: 'air', label: 'AIR', icon: '&#9650;', layer: 'aircraft' },
  { id: 'storm', label: 'STORM', icon: '&#9889;', layer: 'lightning' },
  { id: 'globe', label: 'GLOBE', icon: '&#9793;', layer: 'earthquakes' },
  { id: 'flat', label: 'FLAT', icon: '&#9670;', layer: 'ships' },
  { id: 'night', label: 'NIGHT', icon: '&#9790;', layer: 'weather' },
  { id: 'heat', label: 'HEAT', icon: '&#9632;', layer: 'fires' },
];

export function initToolbar(toggleCallback) {
  toolbarContainer = document.getElementById('earth-toolbar');
  if (!toolbarContainer) return;

  onToggleCallback = toggleCallback;
  toolbarContainer.classList.remove('hidden');

  // Initialize all layers as active
  TOOLBAR_ITEMS.forEach(item => {
    layerStates[item.id] = true;
    const btn = document.getElementById(`toolbar-btn-${item.id}`);
    if (btn) {
      buttons[item.id] = btn;
      btn.classList.add('active');
      // Store handler reference for proper removal later
      const handler = () => handleToggle(item.id, item.layer);
      handlerRefs[item.id] = handler;
      btn.addEventListener('click', handler);
    }
  });
}

function handleToggle(id, layer) {
  const btn = buttons[id];
  if (!btn) return;

  layerStates[id] = !layerStates[id];
  const active = layerStates[id];

  if (active) {
    btn.classList.add('active');
    btn.classList.add('activating');
    setTimeout(() => btn.classList.remove('activating'), 600);
  } else {
    btn.classList.remove('active');
  }

  if (onToggleCallback) {
    onToggleCallback(layer, active);
  }
}

export function getActiveCount() {
  return Object.values(layerStates).filter(Boolean).length;
}

export function destroyToolbar() {
  if (toolbarContainer) {
    toolbarContainer.classList.add('hidden');
  }
  TOOLBAR_ITEMS.forEach(item => {
    const btn = buttons[item.id];
    if (btn && handlerRefs[item.id]) {
      btn.removeEventListener('click', handlerRefs[item.id]);
      btn.classList.remove('active', 'activating');
    }
  });
  buttons = {};
  layerStates = {};
  handlerRefs = {};
  onToggleCallback = null;
}
