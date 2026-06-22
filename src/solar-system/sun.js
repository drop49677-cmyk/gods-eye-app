import * as THREE from 'three';

/**
 * Creates the sun with glow/corona effect using multiple layers and additive blending.
 */
export function createSun(scene) {
  const sunGroup = new THREE.Group();
  sunGroup.name = 'sun';

  // Core sun sphere
  const sunGeometry = new THREE.SphereGeometry(3, 64, 64);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: false
  });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunGroup.add(sunMesh);

  // Inner glow layer
  const innerGlowGeometry = new THREE.SphereGeometry(3.3, 32, 32);
  const innerGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff8800,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    depthWrite: false
  });
  const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
  sunGroup.add(innerGlow);

  // Outer corona glow
  const coronaGeometry = new THREE.SphereGeometry(4.5, 32, 32);
  const coronaMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });
  const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
  sunGroup.add(corona);

  // Large atmospheric glow (lens flare effect)
  const flareGeometry = new THREE.SphereGeometry(6, 16, 16);
  const flareMaterial = new THREE.MeshBasicMaterial({
    color: 0xff4400,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });
  const flare = new THREE.Mesh(flareGeometry, flareMaterial);
  sunGroup.add(flare);

  // Sprite-based glow for soft radial falloff
  const spriteMaterial = new THREE.SpriteMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(16, 16, 1);
  sunGroup.add(sprite);

  scene.add(sunGroup);

  // Animation state
  const sunState = {
    time: 0,
    innerGlow,
    corona,
    flare,
    sprite
  };

  return sunState;
}

/**
 * Animate the sun's glow with oscillating intensity.
 */
export function animateSun(sunState, delta) {
  sunState.time += delta;
  const t = sunState.time;

  // Oscillating inner glow
  sunState.innerGlow.material.opacity = 0.3 + Math.sin(t * 2) * 0.1;
  sunState.innerGlow.scale.setScalar(1 + Math.sin(t * 1.5) * 0.02);

  // Pulsing corona
  sunState.corona.material.opacity = 0.12 + Math.sin(t * 0.8) * 0.05;
  sunState.corona.scale.setScalar(1 + Math.sin(t * 0.5) * 0.03);

  // Flare intensity variation
  sunState.flare.material.opacity = 0.05 + Math.sin(t * 1.2) * 0.02;

  // Sprite pulse
  const spriteScale = 16 + Math.sin(t * 0.7) * 1.5;
  sunState.sprite.scale.set(spriteScale, spriteScale, 1);
  sunState.sprite.material.opacity = 0.25 + Math.sin(t * 1.8) * 0.08;
}
