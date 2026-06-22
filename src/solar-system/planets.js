import * as THREE from 'three';
import { planetData } from './planet-data.js';

/**
 * Creates all 8 planets with procedural textures, orbit paths, and rings for Saturn.
 * Returns array of planet objects for animation and interaction.
 */
export function createPlanets(scene) {
  const planets = [];

  planetData.forEach((data, index) => {
    const planetGroup = new THREE.Group();
    planetGroup.name = `planet-group-${data.name}`;

    // Create procedural texture
    const texture = generateProceduralTexture(data);

    // Planet mesh
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = data.name;
    mesh.userData = { planetIndex: index, isPlanet: true, planetName: data.name };

    // Apply axial tilt
    mesh.rotation.z = data.axialTilt;

    planetGroup.add(mesh);

    // Atmospheric glow for planets that have it
    if (data.hasAtmosphere) {
      const atmosGeometry = new THREE.SphereGeometry(data.size * 1.12, 32, 32);
      const atmosMaterial = new THREE.MeshBasicMaterial({
        color: data.atmosphereColor,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
      });
      const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
      planetGroup.add(atmosphere);
    }

    // Saturn's rings
    if (data.hasRings) {
      const ringGeometry = new THREE.RingGeometry(data.size * 1.4, data.size * 2.4, 64);
      const ringTexture = generateRingTexture();
      const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        depthWrite: false
      });
      const rings = new THREE.Mesh(ringGeometry, ringMaterial);
      rings.rotation.x = -Math.PI / 2.5;
      planetGroup.add(rings);
    }

    // Set initial position on orbit
    const angle = Math.random() * Math.PI * 2;
    planetGroup.position.x = Math.cos(angle) * data.orbitRadius;
    planetGroup.position.z = Math.sin(angle) * data.orbitRadius;

    scene.add(planetGroup);

    // Create orbit path (ring line)
    const orbitPath = createOrbitPath(data.orbitRadius, scene);

    planets.push({
      data,
      group: planetGroup,
      mesh,
      orbitPath,
      angle,
      orbitRadius: data.orbitRadius,
      orbitSpeed: data.orbitSpeed,
      rotationSpeed: data.rotationSpeed
    });
  });

  return planets;
}

/**
 * Creates a visible orbit path circle.
 */
function createOrbitPath(radius, scene) {
  const segments = 128;
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(theta) * radius,
      0,
      Math.sin(theta) * radius
    ));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x0A2A2A,
    transparent: true,
    opacity: 0.4
  });
  const line = new THREE.Line(geometry, material);
  line.name = `orbit-path-${radius}`;
  scene.add(line);

  return line;
}

/**
 * Generates a procedural planet texture using canvas.
 */
function generateProceduralTexture(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const config = data.textureConfig;

  // Base color fill
  ctx.fillStyle = config.base;
  ctx.fillRect(0, 0, 256, 128);

  if (config.bands) {
    // Gas giant bands
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * 128;
      const height = 8 + Math.random() * 6;
      ctx.fillStyle = i % 2 === 0 ? config.detail : config.base;
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      ctx.fillRect(0, y, 256, height);
    }
    ctx.globalAlpha = 1;
  }

  if (config.spots) {
    // Rocky planet craters/spots
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 128;
      const r = 2 + Math.random() * 8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = config.detail;
      ctx.globalAlpha = 0.2 + Math.random() * 0.3;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (config.swirls) {
    // Cloud swirls for Venus/Neptune
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 128;
      ctx.beginPath();
      ctx.ellipse(x, y, 20 + Math.random() * 30, 5 + Math.random() * 10, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fillStyle = config.detail;
      ctx.globalAlpha = 0.2 + Math.random() * 0.2;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (config.continents) {
    // Earth-like continents
    ctx.fillStyle = config.detail;
    ctx.globalAlpha = 0.8;
    // Simplified continent shapes
    drawContinent(ctx, 60, 40, 30, 25);
    drawContinent(ctx, 140, 50, 25, 20);
    drawContinent(ctx, 180, 35, 35, 30);
    drawContinent(ctx, 100, 80, 20, 15);
    drawContinent(ctx, 200, 70, 15, 25);

    // Ice caps
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0, 0, 256, 8);
    ctx.fillRect(0, 120, 256, 8);
    ctx.globalAlpha = 1;

    // Clouds
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 128;
      ctx.beginPath();
      ctx.ellipse(x, y, 15 + Math.random() * 25, 3 + Math.random() * 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (config.subtle) {
    // Uranus-like subtle banding
    for (let i = 0; i < 5; i++) {
      const y = (i / 5) * 128;
      ctx.fillStyle = config.detail;
      ctx.globalAlpha = 0.1 + Math.random() * 0.1;
      ctx.fillRect(0, y, 256, 20);
    }
    ctx.globalAlpha = 1;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Helper to draw blob-like continent shapes.
 */
function drawContinent(ctx, cx, cy, w, h) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const rx = w / 2 + (Math.random() - 0.5) * w * 0.4;
    const ry = h / 2 + (Math.random() - 0.5) * h * 0.4;
    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Generates a ring texture for Saturn.
 */
function generateRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Create ring bands with varying opacity
  for (let x = 0; x < 256; x++) {
    const t = x / 256;
    const opacity = 0.3 + Math.sin(t * 20) * 0.2 + Math.random() * 0.1;
    const brightness = 180 + Math.sin(t * 15) * 40;
    ctx.fillStyle = `rgba(${brightness}, ${brightness - 30}, ${brightness - 60}, ${opacity})`;
    ctx.fillRect(x, 0, 1, 32);
  }

  // Gap in rings (Cassini division)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(100, 0, 8, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Animates planets in their orbits and spins.
 */
export function animatePlanets(planets, delta, paused) {
  planets.forEach(planet => {
    if (!paused) {
      planet.angle += planet.orbitSpeed * delta * 0.5;
      planet.group.position.x = Math.cos(planet.angle) * planet.orbitRadius;
      planet.group.position.z = Math.sin(planet.angle) * planet.orbitRadius;
    }
    // Rotation continues even when "paused" for visual interest
    planet.mesh.rotation.y += planet.rotationSpeed * delta * 2;
  });
}
