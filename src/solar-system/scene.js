import * as THREE from 'three';

/**
 * Sets up the Three.js scene, camera, renderer, and starfield background.
 */
export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000408);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(30, 40, 60);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const container = document.getElementById('scene-container');
  container.appendChild(renderer.domElement);

  // Ambient light (dim)
  const ambientLight = new THREE.AmbientLight(0x111122, 0.3);
  scene.add(ambientLight);

  // Point light at sun position
  const sunLight = new THREE.PointLight(0xffffff, 2.5, 200, 0.5);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Create starfield (10000+ stars)
  createStarfield(scene);

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}

/**
 * Creates a starfield background with 12000 points for parallax depth.
 */
function createStarfield(scene) {
  const starCount = 12000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    // Distribute stars in a large sphere
    const radius = 400 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Slight color variation (white to blue-white to warm)
    const colorChoice = Math.random();
    if (colorChoice < 0.6) {
      // White
      colors[i3] = 0.9 + Math.random() * 0.1;
      colors[i3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i3 + 2] = 1.0;
    } else if (colorChoice < 0.8) {
      // Blue-white
      colors[i3] = 0.7;
      colors[i3 + 1] = 0.8;
      colors[i3 + 2] = 1.0;
    } else {
      // Warm
      colors[i3] = 1.0;
      colors[i3 + 1] = 0.85;
      colors[i3 + 2] = 0.7;
    }

    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const stars = new THREE.Points(geometry, material);
  stars.name = 'starfield';
  scene.add(stars);

  // Add a second layer for depth/parallax
  const nearStarCount = 2000;
  const nearPositions = new Float32Array(nearStarCount * 3);
  const nearSizes = new Float32Array(nearStarCount);

  for (let i = 0; i < nearStarCount; i++) {
    const i3 = i * 3;
    const radius = 150 + Math.random() * 250;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    nearPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    nearPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    nearPositions[i3 + 2] = radius * Math.cos(phi);
    nearSizes[i] = 0.3 + Math.random() * 0.5;
  }

  const nearGeometry = new THREE.BufferGeometry();
  nearGeometry.setAttribute('position', new THREE.BufferAttribute(nearPositions, 3));

  const nearMaterial = new THREE.PointsMaterial({
    size: 0.4,
    color: 0x666688,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const nearStars = new THREE.Points(nearGeometry, nearMaterial);
  nearStars.name = 'nearStarfield';
  scene.add(nearStars);
}
