import * as THREE from 'three';

function buildTyreStack() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.95 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xcfd3d8, metalness: 0.6, roughness: 0.3 });
  for (let i = 0; i < 3; i++) {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.24, 10, 20), mat);
    torus.position.y = 0.3 + i * 0.5;
    torus.castShadow = true;
    torus.receiveShadow = true;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 12), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = torus.position.y;
    g.add(torus, rim);
  }
  g.userData.halfSize = new THREE.Vector3(0.65, 0.9, 0.65);
  g.userData.type = 'tyre';
  return g;
}

function buildBarrier() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xff6a1a, roughness: 0.6 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.6 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.5), mat);
  base.position.y = 0.55;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);
  for (let i = -1; i <= 1; i += 2) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.52), stripeMat);
    stripe.position.set(i * 0.85, 0.55, 0);
    g.add(stripe);
  }
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.7), legMat);
    leg.position.set(side * 1.1, 0.2, 0);
    g.add(leg);
  }
  g.userData.halfSize = new THREE.Vector3(1.3, 0.95, 0.4);
  g.userData.type = 'barrier';
  return g;
}

function buildParkedCar() {
  const g = new THREE.Group();
  const colors = [0x5566aa, 0x999999, 0x445566, 0x8a6d3b, 0x3a5c3a];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1c2733, metalness: 0.2, roughness: 0.2 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 3.6), bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  body.receiveShadow = true;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 2), bodyMat);
  cabin.position.set(0, 0.95, -0.1);
  cabin.castShadow = true;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.1), glassMat);
  glass.position.set(0, 0.98, 0.5);
  g.add(body, cabin, glass);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111114 });
  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.28, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  for (const [x, z] of [[-0.9, 1.1], [0.9, 1.1], [-0.9, -1.1], [0.9, -1.1]]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(x, 0.34, z);
    g.add(w);
  }

  const tailMat = new THREE.MeshStandardMaterial({ color: 0xff2233, emissive: 0xff0022, emissiveIntensity: 1 });
  const tl = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.15, 0.06), tailMat);
  tl.position.set(0, 0.55, -1.82);
  g.add(tl);

  g.userData.halfSize = new THREE.Vector3(0.95, 1.1, 1.85);
  g.userData.type = 'car';
  return g;
}

const BUILDERS = [buildTyreStack, buildBarrier, buildParkedCar];

export class ObstacleField {
  constructor(scene, laneWidth) {
    this.scene = scene;
    this.laneWidth = laneWidth;
    this.active = [];
    this.spawnCooldown = 0;
    this.lastLanePattern = null;
  }

  spawnWave(z) {
    // Choose a pattern of which lanes get an obstacle, always leaving >=1 lane free.
    const patterns = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 0],
      [0, 1, 1],
      [1, 0, 1],
    ];
    let pattern = patterns[Math.floor(Math.random() * patterns.length)];
    // avoid repeating an identical fully-blocking-feel pattern twice in a row
    if (this.lastLanePattern && pattern.join() === this.lastLanePattern.join() && Math.random() < 0.6) {
      pattern = patterns[Math.floor(Math.random() * patterns.length)];
    }
    this.lastLanePattern = pattern;

    for (let lane = 0; lane < 3; lane++) {
      if (!pattern[lane]) continue;
      const builderIndex = Math.floor(Math.random() * BUILDERS.length);
      const mesh = BUILDERS[builderIndex]();
      mesh.position.set((lane - 1) * this.laneWidth, 0, z + (Math.random() - 0.5) * 2);
      mesh.userData.lane = lane;
      mesh.userData.passed = false;
      this.scene.add(mesh);
      this.active.push(mesh);
    }
  }

  update(dt, distanceDelta, speed, carZ, spawnAheadZ, difficultyGapScale) {
    this.spawnCooldown -= dt;
    if (this.spawnCooldown <= 0) {
      this.spawnWave(spawnAheadZ);
      // gap shrinks (more frequent waves) as difficulty scales up, clamps to keep fair
      const baseGap = THREE.MathUtils.clamp(2.1 / difficultyGapScale, 0.85, 2.1);
      this.spawnCooldown = baseGap + Math.random() * 0.5;
    }

    for (let i = this.active.length - 1; i >= 0; i--) {
      const obj = this.active[i];
      obj.position.z += distanceDelta;
      if (obj.position.z > carZ + 12) {
        this.scene.remove(obj);
        this.active.splice(i, 1);
      }
    }
  }

  checkCollision(carX, carZ, carHalfSize) {
    for (const obj of this.active) {
      const hs = obj.userData.halfSize;
      const dz = Math.abs(obj.position.z - carZ);
      const dx = Math.abs(obj.position.x - carX);
      if (dz < hs.z + carHalfSize.z && dx < hs.x + carHalfSize.x) {
        return obj;
      }
    }
    return null;
  }

  reset() {
    for (const obj of this.active) this.scene.remove(obj);
    this.active = [];
    this.spawnCooldown = 0.6;
    this.lastLanePattern = null;
  }
}
