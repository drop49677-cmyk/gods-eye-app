import * as THREE from 'three';

/**
 * Handles raycasting for planet hover/click interactions.
 * - Hover: highlights orbit in cyan, shows planet name label
 * - Click: shows info panel with typewriter effect
 * - Earth click: triggers Mode 2 transition
 */
let interactionsEnabled = true;
let mouseMoveHandler = null;
let clickHandler = null;

/**
 * Disable interactions (e.g., when switching to Earth mode).
 */
export function disableInteractions() {
  interactionsEnabled = false;
}

/**
 * Re-enable interactions (e.g., when returning to solar system mode).
 */
export function enableInteractions() {
  interactionsEnabled = true;
}

/**
 * Remove interaction event listeners entirely for full cleanup.
 */
export function removeInteractionListeners() {
  if (mouseMoveHandler) {
    document.removeEventListener('mousemove', mouseMoveHandler);
    mouseMoveHandler = null;
  }
  if (clickHandler) {
    document.removeEventListener('click', clickHandler);
    clickHandler = null;
  }
}

export function setupInteractions(camera, scene, planets, onEarthClick) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const planetLabel = document.getElementById('planet-label');
  const planetInfo = document.getElementById('planet-info');
  const planetName = document.getElementById('planet-name');
  const planetDetails = document.getElementById('planet-details');
  const panelClose = document.getElementById('panel-close');

  let hoveredPlanet = null;
  let typewriterInterval = null;

  // Get all planet meshes for raycasting
  const planetMeshes = planets.map(p => p.mesh);

  // Mouse move handler for hover detection
  mouseMoveHandler = (e) => {
    if (!interactionsEnabled) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetMeshes, false);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      const planet = planets.find(p => p.mesh === intersected);

      if (planet && planet !== hoveredPlanet) {
        // Unhighlight previous
        if (hoveredPlanet) {
          unhighlightPlanet(hoveredPlanet);
        }

        hoveredPlanet = planet;
        highlightPlanet(planet);

        // Show label
        planetLabel.textContent = planet.data.name.toUpperCase();
        planetLabel.classList.remove('hidden');
      }

      // Update label position
      if (hoveredPlanet) {
        planetLabel.style.left = `${e.clientX + 15}px`;
        planetLabel.style.top = `${e.clientY - 10}px`;
      }

      document.body.style.cursor = 'pointer';
    } else {
      if (hoveredPlanet) {
        unhighlightPlanet(hoveredPlanet);
        hoveredPlanet = null;
      }
      planetLabel.classList.add('hidden');
      document.body.style.cursor = 'crosshair';
    }
  };

  document.addEventListener('mousemove', mouseMoveHandler);

  // Click handler
  clickHandler = (e) => {
    if (!interactionsEnabled) return;
    // Ignore clicks on UI elements
    if (e.target.closest('#planet-info') || e.target.closest('#reset-view') || e.target.closest('#back-button')) {
      return;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetMeshes, false);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      const planet = planets.find(p => p.mesh === intersected);

      if (planet) {
        if (planet.data.isEarth) {
          // Trigger Mode 2 transition
          if (onEarthClick) {
            onEarthClick();
          }
        } else {
          // Show info panel
          showPlanetInfo(planet.data);
        }
      }
    }
  };

  document.addEventListener('click', clickHandler);

  // Close panel
  panelClose.addEventListener('click', () => {
    planetInfo.classList.add('hidden');
    clearTypewriter();
  });

  /**
   * Highlights planet orbit path in cyan.
   */
  function highlightPlanet(planet) {
    if (planet.orbitPath) {
      planet.orbitPath.material.color.setHex(0x00FFB2);
      planet.orbitPath.material.opacity = 0.9;
    }
  }

  /**
   * Removes highlight from planet orbit path.
   */
  function unhighlightPlanet(planet) {
    if (planet.orbitPath) {
      planet.orbitPath.material.color.setHex(0x0A2A2A);
      planet.orbitPath.material.opacity = 0.4;
    }
  }

  /**
   * Shows the planet info panel with typewriter animation.
   */
  function showPlanetInfo(data) {
    clearTypewriter();
    planetName.textContent = data.name.toUpperCase();
    planetDetails.innerHTML = '';
    planetInfo.classList.remove('hidden');

    const lines = [
      { label: 'DIAMETER', value: data.diameter },
      { label: 'MASS', value: data.mass },
      { label: 'DISTANCE', value: data.distanceFromSun },
      { label: 'TEMPERATURE', value: data.surfaceTemperature },
      { label: 'MOONS', value: String(data.moons) },
      { label: 'GRAVITY', value: data.surfaceGravity },
      { label: 'ATMOSPHERE', value: data.atmosphere }
    ];

    typewriterDisplay(lines, planetDetails);
  }

  /**
   * Typewriter effect for displaying planet data line by line.
   */
  function typewriterDisplay(lines, container) {
    let lineIndex = 0;
    let charIndex = 0;
    let currentElement = null;

    function createRow(line) {
      const row = document.createElement('div');
      row.className = 'data-row';
      row.innerHTML = `<span class="data-label">${line.label}</span><span class="data-value"></span>`;
      container.appendChild(row);
      return row.querySelector('.data-value');
    }

    function typeNextChar() {
      if (lineIndex >= lines.length) {
        // Remove cursor when done
        const cursor = container.querySelector('.typewriter-cursor');
        if (cursor) cursor.remove();
        return;
      }

      if (charIndex === 0) {
        currentElement = createRow(lines[lineIndex]);
      }

      const text = lines[lineIndex].value;
      if (charIndex < text.length) {
        currentElement.textContent = text.substring(0, charIndex + 1);
        // Add blinking cursor
        const existingCursor = container.querySelector('.typewriter-cursor');
        if (existingCursor) existingCursor.remove();
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        currentElement.appendChild(cursor);

        charIndex++;
      } else {
        // Move to next line
        const existingCursor = container.querySelector('.typewriter-cursor');
        if (existingCursor) existingCursor.remove();
        lineIndex++;
        charIndex = 0;
      }
    }

    typewriterInterval = setInterval(typeNextChar, 25);
  }

  function clearTypewriter() {
    if (typewriterInterval) {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
    }
  }
}
