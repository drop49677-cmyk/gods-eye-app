import './styles/main.css';
import * as THREE from 'three';
import { createScene } from './solar-system/scene.js';
import { createSun, animateSun } from './solar-system/sun.js';
import { createPlanets, animatePlanets } from './solar-system/planets.js';
import { createAsteroidBelt, animateAsteroidBelt } from './solar-system/asteroid-belt.js';
import { setupControls } from './solar-system/controls.js';
import { setupInteractions, disableInteractions, enableInteractions } from './solar-system/interactions.js';
import { transitionToEarth, transitionToSolarSystem } from './transition.js';
import { initEarthMode, destroyEarthMode } from './earth-mode/index.js';

/**
 * GOD'S EYE - Main Application Entry Point
 * Mode 1: Interactive 3D Solar System
 * Mode 2: Real-Time Earth Monitoring (handled in FEAT-002)
 */

let currentMode = 'solar-system';

// Initialize the application
function init() {
  // Create Three.js scene, camera, renderer
  const { scene, camera, renderer } = createScene();

  // Create sun with glow effect
  const sunState = createSun(scene);

  // Create all planets with procedural textures
  const planets = createPlanets(scene);

  // Create asteroid belt between Mars and Jupiter
  const beltState = createAsteroidBelt(scene);

  // Setup orbit controls (drag, zoom, pan)
  const { controls, isPaused } = setupControls(camera, renderer);

  // Setup planet interactions (hover, click, info panel)
  setupInteractions(camera, scene, planets, handleEarthClick);

  // Back button handler (Mode 2 -> Mode 1)
  const backButton = document.getElementById('back-button');
  backButton.addEventListener('click', () => {
    destroyEarthMode();
    enableInteractions();
    transitionToSolarSystem(camera, { x: 30, y: 40, z: 60 }, () => {
      currentMode = 'solar-system';
      controls.enabled = true;
    });
  });

  /**
   * Handle Earth click - transition to Mode 2
   */
  function handleEarthClick() {
    const earthPlanet = planets.find(p => p.data.isEarth);
    if (!earthPlanet) return;

    const earthPos = earthPlanet.group.position;
    controls.enabled = false;
    disableInteractions();

    transitionToEarth(camera, earthPos, () => {
      currentMode = 'earth';
      initEarthMode();
    });
  }

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const paused = isPaused();

    // Update controls
    controls.update();

    // Animate sun glow
    animateSun(sunState, delta);

    // Animate planet orbits and rotations
    animatePlanets(planets, delta, paused);

    // Animate asteroid belt
    animateAsteroidBelt(beltState, delta, paused);

    // Render
    renderer.render(scene, camera);
  }

  animate();
}

// Start the application
init();
