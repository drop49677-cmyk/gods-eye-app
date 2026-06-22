import gsap from 'gsap';

/**
 * Manages cinematic transitions between Mode 1 (Solar System) and Mode 2 (Earth).
 */

let transitioning = false;

/**
 * Transitions from Mode 1 (solar system) to Mode 2 (earth monitoring).
 * Zooms camera toward Earth, applies glitch, then swaps views.
 */
export function transitionToEarth(camera, earthPosition, onComplete) {
  if (transitioning) return;
  transitioning = true;

  const glitchOverlay = document.getElementById('glitch-overlay');
  const sceneContainer = document.getElementById('scene-container');
  const mapContainer = document.getElementById('map-container');
  const resetButton = document.getElementById('reset-view');
  const pauseIndicator = document.getElementById('pause-indicator');
  const backButton = document.getElementById('back-button');
  const planetInfo = document.getElementById('planet-info');

  // Hide UI elements
  resetButton.style.display = 'none';
  pauseIndicator.classList.add('hidden');
  planetInfo.classList.add('hidden');

  // Timeline for the transition
  const tl = gsap.timeline({
    onComplete: () => {
      // Switch views
      sceneContainer.style.display = 'none';
      mapContainer.style.display = 'block';
      backButton.classList.remove('hidden');
      transitioning = false;

      if (onComplete) onComplete();
    }
  });

  // Zoom camera toward Earth
  tl.to(camera.position, {
    x: earthPosition.x + 2,
    y: earthPosition.y + 1,
    z: earthPosition.z + 2,
    duration: 2,
    ease: 'power3.inOut'
  });

  // Apply glitch effect midway
  tl.call(() => {
    glitchOverlay.classList.remove('hidden');
    glitchOverlay.classList.add('active');
  }, [], '-=0.5');

  // Fade out scene
  tl.to(sceneContainer, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.in'
  }, '-=0.3');

  // Remove glitch after transition
  tl.call(() => {
    glitchOverlay.classList.remove('active');
    glitchOverlay.classList.add('hidden');
  });
}

/**
 * Transitions from Mode 2 back to Mode 1.
 */
export function transitionToSolarSystem(camera, defaultPosition, onComplete) {
  if (transitioning) return;
  transitioning = true;

  const glitchOverlay = document.getElementById('glitch-overlay');
  const sceneContainer = document.getElementById('scene-container');
  const mapContainer = document.getElementById('map-container');
  const resetButton = document.getElementById('reset-view');
  const backButton = document.getElementById('back-button');

  const tl = gsap.timeline({
    onComplete: () => {
      transitioning = false;
      if (onComplete) onComplete();
    }
  });

  // Glitch effect
  tl.call(() => {
    glitchOverlay.classList.remove('hidden');
    glitchOverlay.classList.add('active');
  });

  // Fade out map
  tl.to(mapContainer, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.in'
  });

  // Switch views
  tl.call(() => {
    mapContainer.style.display = 'none';
    mapContainer.style.opacity = '1';
    sceneContainer.style.display = 'block';
    sceneContainer.style.opacity = '1';
    backButton.classList.add('hidden');
    resetButton.style.display = 'block';
  });

  // Remove glitch
  tl.call(() => {
    glitchOverlay.classList.remove('active');
    glitchOverlay.classList.add('hidden');
  });

  // Animate camera back to default
  tl.to(camera.position, {
    x: defaultPosition.x,
    y: defaultPosition.y,
    z: defaultPosition.z,
    duration: 1.5,
    ease: 'power2.inOut'
  });
}
