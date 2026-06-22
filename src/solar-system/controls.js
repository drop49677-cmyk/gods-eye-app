import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

/**
 * Sets up OrbitControls for camera interaction.
 * Handles SPACE pause, RESET VIEW button.
 */
export function setupControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = true;
  controls.minDistance = 10;
  controls.maxDistance = 150;
  controls.autoRotate = false;
  controls.enableZoom = true;

  // Default camera state for reset
  const defaultPosition = { x: 30, y: 40, z: 60 };
  const defaultTarget = { x: 0, y: 0, z: 0 };

  // Pause state
  let paused = false;
  const pauseIndicator = document.getElementById('pause-indicator');

  // SPACE key handler
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      paused = !paused;
      if (paused) {
        pauseIndicator.classList.remove('hidden');
      } else {
        pauseIndicator.classList.add('hidden');
      }
    }
  });

  // Reset View button
  const resetButton = document.getElementById('reset-view');
  resetButton.addEventListener('click', () => {
    gsap.to(camera.position, {
      x: defaultPosition.x,
      y: defaultPosition.y,
      z: defaultPosition.z,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        controls.update();
      }
    });
    gsap.to(controls.target, {
      x: defaultTarget.x,
      y: defaultTarget.y,
      z: defaultTarget.z,
      duration: 1.5,
      ease: 'power2.inOut'
    });
  });

  return {
    controls,
    isPaused: () => paused,
    setPaused: (val) => {
      paused = val;
      if (paused) pauseIndicator.classList.remove('hidden');
      else pauseIndicator.classList.add('hidden');
    }
  };
}
