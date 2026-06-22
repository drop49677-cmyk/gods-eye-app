import * as THREE from 'three';

/**
 * Creates the asteroid belt particle system between Mars and Jupiter orbits.
 */
export function createAsteroidBelt(scene) {
  const particleCount = 3000;
  const innerRadius = 24; // Just outside Mars orbit (21)
  const outerRadius = 30; // Just inside Jupiter orbit (32)

  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const theta = Math.random() * Math.PI * 2;
    // Slight vertical spread
    const y = (Math.random() - 0.5) * 1.5;

    positions[i3] = Math.cos(theta) * radius;
    positions[i3 + 1] = y;
    positions[i3 + 2] = Math.sin(theta) * radius;

    sizes[i] = 0.05 + Math.random() * 0.15;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0x665544,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    depthWrite: false
  });

  const asteroids = new THREE.Points(geometry, material);
  asteroids.name = 'asteroid-belt';
  scene.add(asteroids);

  return {
    mesh: asteroids,
    rotationSpeed: 0.02
  };
}

/**
 * Slowly rotates the asteroid belt.
 */
export function animateAsteroidBelt(beltState, delta, paused) {
  if (!paused) {
    beltState.mesh.rotation.y += beltState.rotationSpeed * delta;
  }
}
